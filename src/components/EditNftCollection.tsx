import { Queries, RoyaltyParams } from '@/contracts/getgemsCollection/NftCollection.data'
import { decodeOffChainContent } from '@/contracts/nft-content/nftContent'
import { useTonClient } from '@/store/tonClient'
import BN from 'bn.js'
import { useEffect, useMemo, useState } from 'react'
import { Address, Cell, TupleItemInt } from 'ton-core'
import { TupleItemCell, TupleItemSlice } from 'ton-core/dist/tuple/tuple'
import { ResultContainer } from './ResultContainer'

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
      TupleItemSlice // slice
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
    <div className="container mx-auto">
      <div className="">
        <div>
          <label htmlFor="collectionAddress">Collection Address:</label>
          <input
            className="w-full px-2 py-2 bg-gray-200 rounded"
            type="text"
            id="collectionAddress"
            value={collectionAddress}
            onChange={(e) => setCollectionAddress(e.target.value)}
          />
        </div>
      </div>
      {collectionInfo.base && (
        <>
          <div className="py-2">
            <div>Collection Info:</div>
            <div>
              <label htmlFor="collectionContent">Collection Content:</label>
              <input
                className="w-full px-2 py-2 bg-gray-200 rounded"
                type="text"
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
            <div>
              <label htmlFor="collectionBase">Collection Base:</label>
              <input
                className="w-full px-2 py-2 bg-gray-200 rounded"
                type="text"
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

            {/* Royalty */}
            <div>
              <label htmlFor="royaltyFactor">Collection Royalty Factor:</label>
              <input
                className="w-full px-2 py-2 bg-gray-200 rounded"
                type="text"
                id="royaltyFactor"
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
            <div>
              <label htmlFor="royaltyBase">Collection Royalty Base:</label>
              <input
                className="w-full px-2 py-2 bg-gray-200 rounded"
                type="text"
                id="royaltyBase"
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
            <div>
              <label htmlFor="royaltyResult">Collection Resulting Royalty(Factor/Base):</label>
              <input
                className="w-full px-2 py-2 bg-gray-200 rounded"
                type="text"
                id="royaltyResult"
                value={`${
                  collectionInfo.royalty.royaltyFactor / collectionInfo.royalty.royaltyBase
                } (${
                  (collectionInfo.royalty.royaltyFactor / collectionInfo.royalty.royaltyBase) * 100
                }%)`}
                disabled
              />
            </div>
            {/* /Royalty */}

            <div>
              <label htmlFor="royaltyAddress">Collection Royalty Address:</label>
              <input
                className="w-full px-2 py-2 bg-gray-200 rounded"
                type="text"
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
          </div>
        </>
      )}
      <div className="my-2">
        <button onClick={updateInfo} className="px-4 py-2 rounded text-white bg-blue-600">
          Refresh
        </button>
      </div>

      <ResultContainer address={collectionAddress} cell={editContent} amount={new BN('10000000')} />
    </div>
  )
}
