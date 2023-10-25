import {
  buildNftCollectionStateInit,
  RoyaltyParams,
} from '@/contracts/getgemsCollection/NftCollection.data'
import { NftItemCodeCell, NftItemEditableCodeCell } from '@/contracts/nftItem/NftItem.source'
import BN from 'bn.js'
import { useMemo, useState } from 'react'
import { Address, Cell } from 'ton-core'
import { ResultContainer } from './ResultContainer'

interface CollectionInfo {
  content: string
  base: string
  royalty: RoyaltyParams
  owner: Address
  nftEditable: boolean
}
export function DeployCollection() {
  const [collectionInfo, setCollectionInfo] = useState<CollectionInfo>({
    content: '',
    base: '',
    royalty: {
      royaltyFactor: 0,
      royaltyBase: 1000,
      royaltyAddress: new Address(0, Buffer.from([])),
    },
    owner: new Address(0, Buffer.from([])),
    nftEditable: false,
  })

  const collectionInit = useMemo(() => {
    const init = buildNftCollectionStateInit({
      collectionContent: collectionInfo.content,
      commonContent: collectionInfo.base,
      nextItemIndex: 0n,
      nftItemCode: collectionInfo.nftEditable ? NftItemEditableCodeCell : NftItemCodeCell,
      ownerAddress: collectionInfo.owner,
      royaltyParams: {
        royaltyAddress: collectionInfo.royalty.royaltyAddress,
        royaltyBase: collectionInfo.royalty.royaltyBase,
        royaltyFactor: collectionInfo.royalty.royaltyFactor,
      },
    })
    console.log('addres', init.address.toRawString())

    return init
  }, [collectionInfo])

  const collectionAddress = useMemo(() => {
    return collectionInit ? collectionInit.address : new Address(0, Buffer.from([]))
  }, [collectionInit])

  return (
    <div className="container mx-auto">
      <div className="">
        <div>
          <label htmlFor="collectionAddress">Collection Address:</label>
          <input
            className="w-full px-2 py-2 bg-gray-200 rounded"
            type="text"
            id="collectionAddress"
            value={collectionAddress.toString({ bounceable: true, urlSafe: true })}
            readOnly
          />
        </div>
      </div>
      {
        <>
          <div className="py-2">
            <div className="flex">
              <div>
                <label htmlFor="collectionEditable">Collection Nfts Editable:</label>
                <input
                  className="ml-2 bg-gray-200 rounded"
                  type="checkbox"
                  id="collectionEditable"
                  checked={collectionInfo?.nftEditable}
                  onChange={(e) =>
                    setCollectionInfo({
                      ...collectionInfo,
                      nftEditable: e.target.checked,
                    })
                  }
                />
              </div>
            </div>

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
            {/* <div>
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
            </div> */}
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
            <div>
              <label htmlFor="royaltyAddress">Collection Owner:</label>
              <input
                className="w-full px-2 py-2 bg-gray-200 rounded"
                type="text"
                id="royaltyAddress"
                value={collectionInfo.owner.toString({
                  bounceable: true,
                  urlSafe: true,
                })}
                onChange={(e) =>
                  setCollectionInfo({
                    ...collectionInfo,
                    owner: Address.parse(e.target.value),
                  })
                }
              />
            </div>
          </div>
        </>
      }

      <ResultContainer
        address={collectionAddress.toRawString()}
        cell={new Cell()}
        amount={new BN('10000000')}
        init={collectionInit.stateInit}
      />
    </div>
  )
}
