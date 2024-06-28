import { Queries } from '@/contracts/getgemsCollection/NftCollection.data'
import { useTonClient } from '@/store/tonClient'
import BN from 'bn.js'
import { useEffect, useMemo, useState } from 'react'
import { Address, Cell, TupleItemCell, TupleItemInt } from 'ton'
import { TupleItemSlice } from 'ton-core/dist/tuple/tuple'
import { ResultContainer } from './ResultContainer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { Separator } from './ui/separator'

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
    const [, , ownerAddress] = [
      contentInfo.stack.pop(),
      contentInfo.stack.pop(),
      contentInfo.stack.pop(),
    ] as [TupleItemInt, TupleItemCell, TupleItemSlice]

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
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Edit NFT Collection Owner</CardTitle>
          <CardDescription>Update the owner of an NFT collection</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="collectionAddress">Collection Address</Label>
            <Input
              id="collectionAddress"
              type="text"
              value={collectionAddress}
              onChange={(e) => setCollectionAddress(e.target.value)}
              placeholder="Enter collection address"
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="collectionOwner">Collection Owner</Label>
            <Input
              id="collectionOwner"
              type="text"
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

          <div className="flex justify-end space-x-2">
            <Button onClick={updateInfo} variant="outline">
              Refresh
            </Button>
            <Button>Update Owner</Button>
          </div>
        </CardContent>
      </Card>

      <ResultContainer address={collectionAddress} cell={editContent} amount={new BN('10000000')} />
    </div>
  )
}
