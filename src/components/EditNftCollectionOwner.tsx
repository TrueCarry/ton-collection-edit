import { Queries } from '@/contracts/getgemsCollection/NftCollection.data'
import { useTonClient } from '@/store/tonClient'
import BN from 'bn.js'
import { useEffect, useMemo, useState } from 'react'
import { Address, Cell } from 'ton'
import { ResultContainer } from './ResultContainer'

interface CollectionInfo {
  owner: Address
}
export function EditNftCollectionOwner() {
  const [collectionAddress, setCollectionAddress] = useState('')
  const [collectionInfo, setCollectionInfo] = useState<CollectionInfo>({
    owner: Address.parse('0:0'),
  })

  const tonClient = useTonClient()

  const updateInfo = async () => {
    setCollectionInfo({
      owner: Address.parse('0:0'),
    })

    const address = Address.parse(collectionAddress)

    const contentInfo = await tonClient.value.callGetMethod(address, 'get_collection_data')
    const [, , /* collectionContent */ ownerAddress] = contentInfo.stack as [
      string[], // bn
      any[], // cell
      any[] // slice
    ]

    const addressCell = Cell.fromBoc(Buffer.from(ownerAddress[1].bytes, 'base64'))[0]
    const owner = addressCell.beginParse().readAddress()
    if (!owner) {
      throw new Error('unknown owner')
    }

    setCollectionInfo({
      owner,
    })
  }

  useEffect(() => {
    updateInfo()
  }, [collectionAddress])

  const editContent = useMemo(() => {
    return Queries.changeOwner({
      newOwner: collectionInfo.owner,
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
      <>
        <div className="py-2">
          <div>Collection Info:</div>

          <div>
            <label htmlFor="royaltyAddress">Collection Owner:</label>
            <input
              className="w-full px-2 py-2 bg-gray-200 rounded"
              type="text"
              id="royaltyAddress"
              value={collectionInfo.owner.toFriendly({
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
      <div className="my-2">
        <button onClick={updateInfo} className="px-4 py-2 rounded  text-white bg-blue-600">
          Refresh
        </button>
      </div>

      <ResultContainer address={collectionAddress} cell={editContent} amount={new BN('10000000')} />
    </div>
  )
}
