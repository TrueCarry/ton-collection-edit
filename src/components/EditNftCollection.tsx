import { Queries, RoyaltyParams } from '@/contracts/getgemsCollection/NftCollection.data'
import { decodeOffChainContent } from '@/contracts/nft-content/nftContent'
import { useTonClient } from '@/store/tonClient'
import BN from 'bn.js'
import { useEffect, useMemo, useState } from 'react'
import { Address, Cell, TupleItemInt } from 'ton-core'
import { TupleItemCell, TupleItemSlice } from 'ton-core/dist/tuple/tuple'
import { ResultContainer } from './ResultContainer'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Button } from './ui/button'

interface CollectionInfo {
  content: string
  base: string
  royalty: RoyaltyParams
}

export function EditNftCollection() {
  const [collectionAddress, setCollectionAddress] = useState('')
  const [collectionInfo, setCollectionInfo] = useState<CollectionInfo>({
    content: '',
    base: '',
    royalty: {
      royaltyFactor: 0,
      royaltyBase: 0,
      royaltyAddress: new Address(0, Buffer.from([])),
    },
  })

  const tonClient = useTonClient()

  const updateInfo = async () => {
    setCollectionInfo({
      content: '',
      base: '',
      royalty: {
        royaltyFactor: 0,
        royaltyBase: 0,
        royaltyAddress: new Address(0, Buffer.from([])),
      },
    })

    let address: Address
    try {
      address = Address.parse(collectionAddress)
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
    const royaltyOwner = royaltyAddress.cell.beginParse().loadAddress()
    if (!royaltyOwner) {
      return
    }

    const royalty = {
      royaltyFactor: Number(royaltyFactor.value),
      royaltyBase: Number(royaltyBase.value),
      royaltyAddress: royaltyOwner,
    }

    const contentInfo = await tonClient.value.callGetMethod(address, 'get_collection_data')
    const [, collectionContent] = [
      contentInfo.stack.pop(),
      contentInfo.stack.pop(),
      contentInfo.stack.pop(),
    ] as [
      TupleItemInt, // bn
      TupleItemCell, // cell
      TupleItemSlice, // slice
    ]
    const content = decodeOffChainContent(collectionContent.cell)

    const baseInfo = await tonClient.value.callGetMethod(address, 'get_nft_content', [
      {
        type: 'int',
        value: 0n,
      },
      { type: 'cell', cell: new Cell() },
      // ['num', '0'],
      // ['tvm.Cell', new Cell().toBoc({ idx: false }).toString('base64')],
    ])
    const baseContent = decodeOffChainContent((baseInfo.stack.pop() as TupleItemCell).cell)
    console.log('baseInfo', baseInfo, baseContent)

    setCollectionInfo({
      content,
      base: baseContent,
      royalty,
    })
  }

  useEffect(() => {
    updateInfo()
  }, [collectionAddress])

  const editContent = useMemo(() => {
    return Queries.editContent({
      collectionContent: collectionInfo.content,
      commonContent: collectionInfo.base,
      royaltyParams: {
        royaltyAddress: collectionInfo.royalty.royaltyAddress,
        royaltyBase: collectionInfo.royalty.royaltyBase,
        royaltyFactor: collectionInfo.royalty.royaltyFactor,
      },
    })
  }, [collectionInfo])

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-4">
      <Card className="">
        <CardHeader>
          <CardTitle>Edit NFT Collection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="collectionAddress">Collection Address</Label>
              <Input
                id="collectionAddress"
                value={collectionAddress}
                onChange={(e) => setCollectionAddress(e.target.value)}
                placeholder="Enter collection address"
              />
            </div>

            {collectionInfo.base && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="collectionContent">Collection Content</Label>
                  <Input
                    id="collectionContent"
                    value={collectionInfo?.content}
                    onChange={(e) =>
                      setCollectionInfo({
                        ...collectionInfo,
                        content: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="collectionBase">Collection Base</Label>
                  <Input
                    id="collectionBase"
                    value={collectionInfo?.base}
                    onChange={(e) =>
                      setCollectionInfo({
                        ...collectionInfo,
                        base: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="royaltyFactor">Collection Royalty Factor</Label>
                  <Input
                    id="royaltyFactor"
                    type="number"
                    value={collectionInfo.royalty.royaltyFactor}
                    onChange={(e) =>
                      setCollectionInfo({
                        ...collectionInfo,
                        royalty: {
                          ...collectionInfo.royalty,
                          royaltyFactor: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="royaltyBase">Collection Royalty Base</Label>
                  <Input
                    id="royaltyBase"
                    type="number"
                    value={collectionInfo.royalty.royaltyBase}
                    onChange={(e) =>
                      setCollectionInfo({
                        ...collectionInfo,
                        royalty: {
                          ...collectionInfo.royalty,
                          royaltyBase: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="royaltyResult">Collection Resulting Royalty (Factor/Base)</Label>
                  <Input
                    id="royaltyResult"
                    value={`${
                      collectionInfo.royalty.royaltyFactor / collectionInfo.royalty.royaltyBase
                    } (${
                      (collectionInfo.royalty.royaltyFactor / collectionInfo.royalty.royaltyBase) *
                      100
                    }%)`}
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="royaltyAddress">Collection Royalty Address</Label>
                  <Input
                    id="royaltyAddress"
                    value={collectionInfo.royalty.royaltyAddress.toString({
                      bounceable: true,
                      urlSafe: true,
                    })}
                    onChange={(e) =>
                      setCollectionInfo({
                        ...collectionInfo,
                        royalty: {
                          ...collectionInfo.royalty,
                          royaltyAddress: Address.parse(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              </>
            )}

            <Button onClick={updateInfo}>Refresh</Button>
          </div>
        </CardContent>
      </Card>

      <ResultContainer address={collectionAddress} cell={editContent} amount={new BN('10000000')} />
    </div>
  )
}
