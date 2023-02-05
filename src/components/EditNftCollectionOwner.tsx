import { Queries } from '@/contracts/getgemsCollection/NftCollection.data'
import { useTonClient } from '@/store/tonClient'
import BN from 'bn.js'
import { useEffect, useMemo, useState } from 'react'
import { Address, Cell, TupleItemCell, TupleItemInt } from 'ton'
import { TupleItemSlice } from 'ton-core/dist/tuple/tuple'
import { ResultContainer } from './ResultContainer'

interface CollectionInfo {
  owner: Address
}

const zeroAddress = new Address(0, Buffer.from([]))

export function EditNftCollectionOwner() {
  const [collectionAddress, setCollectionAddress] = useState('')
  const [collectionInfo, setCollectionInfo] = useState<CollectionInfo>({
    owner: new Address(0, Buffer.from([])),
  })

  const tonClient = useTonClient()

  const updateInfo = async () => {
    setCollectionInfo({
      owner: new Address(0, Buffer.from([])),
    })

    let address: Address
    try {
      address = Address.parse(collectionAddress)
    } catch (e) {
      return
    }

    const contentInfo = await tonClient.value.callGetMethod(address, 'get_collection_data')
    const [, , /* collectionContent */ ownerAddress] = [
      contentInfo.stack.pop(),
      contentInfo.stack.pop(),
      contentInfo.stack.pop(),
    ] as [
      TupleItemInt, // bn
      TupleItemCell, // cell
      TupleItemSlice // slice
    ]

    const owner = ownerAddress.cell.beginParse().loadAddress()
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
    if (!collectionInfo || !collectionInfo.owner || collectionInfo.owner.equals(zeroAddress)) {
      return new Cell()
    }
    const query = Queries.changeOwner({
      newOwner: collectionInfo.owner,
    })
    return query
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
      <div className="my-2">
        <button onClick={updateInfo} className="px-4 py-2 rounded  text-white bg-blue-600">
          Refresh
        </button>
      </div>

      <ResultContainer address={collectionAddress} cell={editContent} amount={new BN('10000000')} />
    </div>
  )
}
