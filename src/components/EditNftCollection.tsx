import { Queries } from '@/contracts/getgemsCollection/NftCollection.data'
import BN from 'bn.js'
import { useEffect, useMemo, useState } from 'react'
import { Address } from 'ton-core'
import { ResultContainer } from './ResultContainer'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Button } from './ui/button'
import {
  useCollectionRoyaltyParams,
  useCollectionInfo,
  useCollectionBaseContent,
} from '@/hooks/collection'
import { useTonAddress } from '@tonconnect/ui-react'

export function EditNftCollection() {
  const connectedAddress = useTonAddress(true)

  const [collectionAddress, setCollectionAddress] = useState('')
  const [parsedAddress, setParsedAddress] = useState<Address | null>(null)

  useEffect(() => {
    try {
      setParsedAddress(Address.parse(collectionAddress))
    } catch (e) {
      setParsedAddress(null)
    }
  }, [collectionAddress])

  const royalty = useCollectionRoyaltyParams(parsedAddress)
  const { content } = useCollectionInfo(parsedAddress)
  const baseContent = useCollectionBaseContent(parsedAddress)

  const [collectionInfo, setCollectionInfo] = useState(() => ({
    content: '',
    base: '',
    royalty: {
      royaltyFactor: 0,
      royaltyBase: 0,
      royaltyAddress: new Address(0, Buffer.from([])),
    },
  }))

  const { owner } = useCollectionInfo(parsedAddress)

  useEffect(() => {
    if (content && baseContent && royalty) {
      setCollectionInfo({
        content,
        base: baseContent,
        royalty,
      })
    } else {
      setCollectionInfo({
        content: '',
        base: '',
        royalty: {
          royaltyFactor: 0,
          royaltyBase: 0,
          royaltyAddress: new Address(0, Buffer.from([])),
        },
      })
    }
  }, [content, baseContent, royalty])

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

  const updateInfo = () => {
    setParsedAddress(null)
    setParsedAddress(Address.parse(collectionAddress))
  }

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

            {owner && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="collectionOwner">Collection Owner</Label>
                  <Input
                    id="collectionOwner"
                    type="text"
                    value={owner.toString({
                      bounceable: true,
                      urlSafe: true,
                    })}
                    disabled={true}
                  />
                </div>

                {connectedAddress &&
                  owner?.toString({ urlSafe: true, bounceable: true }) !==
                    Address.parse(connectedAddress).toString({
                      urlSafe: true,
                      bounceable: true,
                    }) && (
                    <div className="space-y-2">
                      <Label htmlFor="collectionOwner">Your Address</Label>
                      <Input
                        id="collectionOwner"
                        type="text"
                        value={Address.parse(connectedAddress).toString({
                          urlSafe: true,
                          bounceable: true,
                        })}
                        disabled={true}
                      />

                      <Label htmlFor="" className="text-red-500 mt-2">
                        You're not the owner of this collection. You can't edit it.
                      </Label>
                    </div>
                  )}
              </>
            )}

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
