import {
  buildNftCollectionStateInit,
  RoyaltyParams,
} from '@/contracts/getgemsCollection/NftCollection.data'
import { NftItemCodeCell, NftItemEditableCodeCell } from '@/contracts/nftItem/NftItem.source'
import BN from 'bn.js'
import { useMemo, useState } from 'react'
import { Address, Cell } from 'ton-core'
import { ResultContainer } from './ResultContainer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Switch } from './ui/switch'

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
    console.log('address', init.address.toRawString())

    return init
  }, [collectionInfo])

  const collectionAddress = useMemo(() => {
    return collectionInit ? collectionInit.address : new Address(0, Buffer.from([]))
  }, [collectionInit])

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Deploy Collection</CardTitle>
        <CardDescription>Create a new NFT collection on the TON blockchain.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="collectionAddress">Collection Address</Label>
          <Input
            id="collectionAddress"
            value={collectionAddress.toString({ bounceable: true, urlSafe: true })}
            readOnly
          />
          <p className="text-sm text-muted-foreground">
            This is the address of your new collection contract.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="collectionEditable"
            checked={collectionInfo.nftEditable}
            onCheckedChange={(checked) =>
              setCollectionInfo({ ...collectionInfo, nftEditable: checked })
            }
          />
          <Label htmlFor="collectionEditable">Collection NFTs Editable</Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="collectionContent">Collection Content</Label>
          <Input
            id="collectionContent"
            value={collectionInfo.content}
            onChange={(e) => setCollectionInfo({ ...collectionInfo, content: e.target.value })}
          />
          <p className="text-sm text-muted-foreground">
            The content for your collection (e.g., IPFS hash or URL).
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="collectionBase">Collection Base</Label>
          <Input
            id="collectionBase"
            value={collectionInfo.base}
            onChange={(e) => setCollectionInfo({ ...collectionInfo, base: e.target.value })}
          />
          <p className="text-sm text-muted-foreground">The base URI for your NFT metadata.</p>
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
          <p className="text-sm text-muted-foreground">
            The royalty factor for secondary sales (e.g., 50 for 5%).
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="royaltyResult">Resulting Royalty</Label>
          <Input
            id="royaltyResult"
            value={`${collectionInfo.royalty.royaltyFactor / collectionInfo.royalty.royaltyBase} (${
              (collectionInfo.royalty.royaltyFactor / collectionInfo.royalty.royaltyBase) * 100
            }%)`}
            readOnly
          />
          <p className="text-sm text-muted-foreground">
            The calculated royalty percentage for this collection.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="royaltyAddress">Royalty Address</Label>
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
          <p className="text-sm text-muted-foreground">
            The address that will receive the royalties.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ownerAddress">Collection Owner</Label>
          <Input
            id="ownerAddress"
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
          <p className="text-sm text-muted-foreground">
            The address that will own and manage this collection.
          </p>
        </div>

        <ResultContainer
          address={collectionAddress.toRawString()}
          cell={new Cell()}
          amount={new BN('10000000')}
          init={collectionInit.stateInit}
        />
      </CardContent>
    </Card>
  )
}
