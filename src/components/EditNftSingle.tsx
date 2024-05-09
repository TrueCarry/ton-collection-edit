import { RoyaltyParams } from '@/contracts/getgemsCollection/NftCollection.data'
import { decodeOffChainContent, encodeOffChainContent } from '@/contracts/nft-content/nftContent'
import { useTonClient } from '@/store/tonClient'
import BN from 'bn.js'
import { useEffect, useMemo, useState } from 'react'
import { Address, beginCell, Cell, TupleItemInt } from 'ton'
import { TupleItemCell, TupleItemSlice } from 'ton-core/dist/tuple/tuple'
import { ResultContainer } from './ResultContainer'

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
    <div>
      <div>
        Single NFT is nft without collection, meaning it has it's own royalty settings{' '}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/getgems-io/nft-contracts/blob/main/packages/contracts/sources/nft-single.fc"
        >
          nft-single.fc
        </a>
      </div>
      <div className="py-2">
        <div>
          <label htmlFor="nftAddress">Nft Address:</label>
          <input
            className="w-full px-2 py-2 bg-gray-200 rounded"
            type="text"
            id="nftAddress"
            value={nftAddress}
            onChange={(e) => setNftAddress(e.target.value)}
          />
        </div>
      </div>

      <div className="py-2">
        <div>
          <label htmlFor="newContent">New Content:</label>
          <input
            className="w-full px-2 py-2 bg-gray-200 rounded"
            type="text"
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

        {/* Royalty */}
        <div>
          <label htmlFor="royaltyFactor">Collection Royalty Factor:</label>
          <input
            className="w-full px-2 py-2 bg-gray-200 rounded"
            type="text"
            id="royaltyFactor"
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
          <label htmlFor="royaltyBase">Collection Royalty Base:</label>
          <input
            className="w-full px-2 py-2 bg-gray-200 rounded"
            type="text"
            id="royaltyBase"
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
          <label htmlFor="royaltyResult">Collection Resulting Royalty(Factor/Base):</label>
          <input
            className="w-full px-2 py-2 bg-gray-200 rounded"
            type="text"
            id="royaltyResult"
            value={`${nftInfo.royalty.royaltyFactor / nftInfo.royalty.royaltyBase} (${
              (nftInfo.royalty.royaltyFactor / nftInfo.royalty.royaltyBase) * 100
            }%)`}
            disabled
          />
        </div>

        <div>
          <label htmlFor="royaltyAddress">Collection Royalty Address:</label>
          <input
            className="w-full px-2 py-2 bg-gray-200 rounded"
            type="text"
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
        {/* /Royalty */}
      </div>

      <div className="my-2">
        <button onClick={updateInfo} className="px-4 py-2 rounded text-white bg-blue-600">
          Refresh
        </button>
      </div>

      <ResultContainer address={nftAddress} cell={editContent} amount={new BN('10000000')} />
    </div>
  )
}
