import { Queries } from '@/contracts/getgemsCollection/NftCollection.data'
import BN from 'bn.js'
import { useEffect, useMemo, useState } from 'react'
import { Address } from 'ton-core'
import { ResultContainer } from './ResultContainer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { Separator } from './ui/separator'
import { useCollectionInfo } from '@/hooks/collection'

const zeroAddress = new Address(0, Buffer.from([]))

export function EditNftCollectionOwner() {
  const [collectionAddress, setCollectionAddress] = useState('')
  const [parsedAddress, setParsedAddress] = useState<Address | null>(null)

  useEffect(() => {
    try {
      setParsedAddress(Address.parse(collectionAddress))
    } catch (e) {
      setParsedAddress(null)
    }
  }, [collectionAddress])

  const { owner } = useCollectionInfo(parsedAddress)

  const [newOwner, setNewOwner] = useState<Address>(zeroAddress)

  useEffect(() => {
    if (owner) {
      setNewOwner(owner)
    }
  }, [owner])

  const editContent = useMemo(() => {
    if (!newOwner || newOwner.equals(zeroAddress)) {
      return null
    }
    return Queries.changeOwner({
      newOwner,
    })
  }, [newOwner])

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
              value={newOwner.toString({
                bounceable: true,
                urlSafe: true,
              })}
              onChange={(e) => {
                try {
                  setNewOwner(Address.parse(e.target.value))
                } catch (error) {
                  // Handle invalid address input
                }
              }}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              onClick={() => setParsedAddress(Address.parse(collectionAddress))}
              variant="outline"
            >
              Refresh
            </Button>
            <Button disabled={!editContent}>Update Owner</Button>
          </div>
        </CardContent>
      </Card>

      {editContent && (
        <ResultContainer
          address={collectionAddress}
          cell={editContent}
          amount={new BN('10000000')}
        />
      )}
    </div>
  )
}
