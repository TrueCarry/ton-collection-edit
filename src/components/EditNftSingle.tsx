import { RoyaltyParams } from '@/contracts/getgemsCollection/NftCollection.data'
import { decodeOffChainContent, encodeOffChainContent } from '@/contracts/nft-content/nftContent'
import { useTonClient } from '@/store/tonClient'
import BN from 'bn.js'
import { useEffect, useMemo, useState } from 'react'
import { Address, beginCell, Cell, TupleItemInt } from 'ton'
import { TupleItemCell, TupleItemSlice } from 'ton-core/dist/tuple/tuple'
import { ResultContainer } from './ResultContainer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Button } from './ui/button'

interface NftInfo {
  content: string
  royalty: RoyaltyParams
}

function CreateNftEditBody(
  itemContentUri: string,
  royaltyFactor: number,
  royaltyBase: number,
  royaltyAddress: Address,
  queryId?: number
) {
  const msgBody = beginCell()
  msgBody.storeUint(0x1a0b9d51, 32)
  msgBody.storeUint(queryId || 0, 64)

  const royaltyCell = beginCell()
  royaltyCell.storeUint(royaltyFactor, 16)
  royaltyCell.storeUint(royaltyBase, 16)
  royaltyCell.storeAddress(royaltyAddress)

  const contentCell = encodeOffChainContent(itemContentUri)

  msgBody.storeRef(contentCell)
  msgBody.storeRef(royaltyCell)

  return msgBody.endCell()
}

export function EditNftSingle() {
  const [nftAddress, setNftAddress] = useState('')
  const tonClient = useTonClient()

  const [nftInfo, setNftInfo] = useState<NftInfo>({
    content: '',
    royalty: {
      royaltyFactor: 0,
      royaltyBase: 0,
      royaltyAddress: new Address(0, Buffer.from([])),
    },
  })

  const updateInfo = async () => {
    setNftInfo({
      content: '',
      royalty: {
        royaltyFactor: 0,
        royaltyBase: 0,
        royaltyAddress: new Address(0, Buffer.from([])),
      },
    })

    let address: Address
    try {
      address = Address.parse(nftAddress)
    } catch (e) {
      return
    }

    const info = await tonClient.value.callGetMethod(address, 'royalty_params')

    const [royaltyFactor, royaltyBase, royaltyAddress] = [
      info.stack.pop(),
      info.stack.pop(),
      info.stack.pop(),
    ] as [TupleItemInt, TupleItemInt, TupleItemSlice]
    console.log('info', info, royaltyAddress[1])
    const royaltyOwner = royaltyAddress.cell.asSlice().loadAddress()
    if (!royaltyOwner) {
      return
    }

    const royalty = {
      royaltyFactor: Number(royaltyFactor.value),
      royaltyBase: Number(royaltyBase.value),
      royaltyAddress: royaltyOwner,
    }

    const contentInfo = await tonClient.value.callGetMethod(address, 'get_nft_data')
    const [, , , , nftContent] = [
      contentInfo.stack.pop(),
      contentInfo.stack.pop(),
      contentInfo.stack.pop(),
      contentInfo.stack.pop(),
      contentInfo.stack.pop(),
    ] as [
      TupleItemInt,
      TupleItemInt,
      TupleItemInt,
      TupleItemCell, // cell
      TupleItemSlice, // slice
    ]
    const content = decodeOffChainContent(nftContent.cell)

    setNftInfo({
      content,
      royalty,
    })
  }

  useEffect(() => {
    updateInfo()
  }, [nftAddress])

  const [editContent, setEditContent] = useState(new Cell())
  useMemo(async () => {
    const data = CreateNftEditBody(
      nftInfo.content,
      nftInfo.royalty.royaltyFactor,
      nftInfo.royalty.royaltyBase,
      nftInfo.royalty.royaltyAddress
    )
    setEditContent(data)
  }, [nftAddress, nftInfo])

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Edit Single NFT</CardTitle>
          <CardDescription>
            Single NFT is nft without collection, meaning it has its own royalty settings{' '}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/getgems-io/nft-contracts/blob/main/packages/contracts/sources/nft-single.fc"
            >
              nft-single.fc
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="nftAddress">NFT Address</Label>
              <Input
                id="nftAddress"
                value={nftAddress}
                onChange={(e) => setNftAddress(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="newContent">New Content</Label>
              <Input
                id="newContent"
                value={nftInfo.content}
                onChange={(e) =>
                  setNftInfo({
                    ...nftInfo,
                    content: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="royaltyFactor">Royalty Factor</Label>
              <Input
                id="royaltyFactor"
                type="number"
                value={nftInfo.royalty.royaltyFactor}
                onChange={(e) =>
                  setNftInfo({
                    ...nftInfo,
                    royalty: {
                      ...nftInfo.royalty,
                      royaltyFactor: parseInt(e.target.value) || 0,
                    },
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="royaltyBase">Royalty Base</Label>
              <Input
                id="royaltyBase"
                type="number"
                value={nftInfo.royalty.royaltyBase}
                onChange={(e) =>
                  setNftInfo({
                    ...nftInfo,
                    royalty: {
                      ...nftInfo.royalty,
                      royaltyBase: parseInt(e.target.value) || 0,
                    },
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="royaltyResult">Resulting Royalty (Factor/Base)</Label>
              <Input
                id="royaltyResult"
                value={`${nftInfo.royalty.royaltyFactor / nftInfo.royalty.royaltyBase} (${
                  (nftInfo.royalty.royaltyFactor / nftInfo.royalty.royaltyBase) * 100
                }%)`}
                disabled
              />
            </div>

            <div>
              <Label htmlFor="royaltyAddress">Royalty Address</Label>
              <Input
                id="royaltyAddress"
                value={nftInfo.royalty.royaltyAddress.toString({
                  bounceable: true,
                  urlSafe: true,
                })}
                onChange={(e) =>
                  setNftInfo({
                    ...nftInfo,
                    royalty: {
                      ...nftInfo.royalty,
                      royaltyAddress: Address.parse(e.target.value),
                    },
                  })
                }
              />
            </div>

            <Button onClick={updateInfo}>Refresh</Button>
          </div>
        </CardContent>
      </Card>
      <ResultContainer address={nftAddress} cell={editContent} amount={new BN('10000000')} />
    </div>
  )
}
