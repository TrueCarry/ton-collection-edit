import { buildSingleNftStateInit, RoyaltyParams } from '@/contracts/nftItem/NftItem'
import { useMemo, useState } from 'react'
import { Address, beginCell } from 'ton-core'
import { ResultContainer } from './ResultContainer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'

interface NftSingleInfo {
  content: string
  ownerAddress: Address
  editorAddress: Address
  royaltyParams: RoyaltyParams
}

export function DeployNftSingle() {
  const [nftInfo, setNftInfo] = useState<NftSingleInfo>({
    content: '',
    ownerAddress: new Address(0, Buffer.from([])),
    editorAddress: new Address(0, Buffer.from([])),
    royaltyParams: {
      royaltyFactor: 0,
      royaltyBase: 1000,
      royaltyAddress: new Address(0, Buffer.from([])),
    },
  })

  const nftInit = useMemo(() => {
    return buildSingleNftStateInit({
      ...nftInfo,
    })
  }, [nftInfo])

  const nftAddress = useMemo(() => {
    return nftInit ? nftInit.address : new Address(0, Buffer.from([]))
  }, [nftInit])

  return (
    <div className="w-full max-w-3xl mx-auto gap-4 flex flex-col">
      <Card className="">
        <CardHeader>
          <CardTitle>Deploy Single NFT</CardTitle>
          <CardDescription>Create a standalone NFT on the TON blockchain.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nftAddress">NFT Address</Label>
            <Input
              id="nftAddress"
              value={nftAddress.toString({ bounceable: true, urlSafe: true })}
              readOnly
            />
            <p className="text-sm text-muted-foreground">
              This is the address where your NFT will be deployed.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nftContent">NFT Content</Label>
            <Input
              id="nftContent"
              value={nftInfo.content}
              onChange={(e) => setNftInfo({ ...nftInfo, content: e.target.value })}
            />
            <p className="text-sm text-muted-foreground">
              The content for your NFT (e.g., IPFS hash or URL).
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ownerAddress">Owner Address</Label>
            <Input
              id="ownerAddress"
              value={nftInfo.ownerAddress.toString({ bounceable: true, urlSafe: true })}
              onChange={(e) =>
                setNftInfo({
                  ...nftInfo,
                  ownerAddress: Address.parse(e.target.value),
                })
              }
            />
            <p className="text-sm text-muted-foreground">The address that will own this NFT.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="editorAddress">Editor Address</Label>
            <Input
              id="editorAddress"
              value={nftInfo.editorAddress.toString({ bounceable: true, urlSafe: true })}
              onChange={(e) =>
                setNftInfo({
                  ...nftInfo,
                  editorAddress: Address.parse(e.target.value),
                })
              }
            />
            <p className="text-sm text-muted-foreground">
              The address that will have permission to edit this NFT.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="royaltyFactor">Royalty Factor</Label>
            <Input
              id="royaltyFactor"
              type="number"
              value={nftInfo.royaltyParams.royaltyFactor}
              onChange={(e) =>
                setNftInfo({
                  ...nftInfo,
                  royaltyParams: {
                    ...nftInfo.royaltyParams,
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
              value={`${nftInfo.royaltyParams.royaltyFactor / nftInfo.royaltyParams.royaltyBase} (${
                (nftInfo.royaltyParams.royaltyFactor / nftInfo.royaltyParams.royaltyBase) * 100
              }%)`}
              readOnly
            />
            <p className="text-sm text-muted-foreground">The calculated royalty percentage.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="royaltyAddress">Royalty Address</Label>
            <Input
              id="royaltyAddress"
              value={nftInfo.royaltyParams.royaltyAddress.toString({
                bounceable: true,
                urlSafe: true,
              })}
              onChange={(e) =>
                setNftInfo({
                  ...nftInfo,
                  royaltyParams: {
                    ...nftInfo.royaltyParams,
                    royaltyAddress: Address.parse(e.target.value),
                  },
                })
              }
            />
            <p className="text-sm text-muted-foreground">
              The address that will receive the royalties.
            </p>
          </div>
        </CardContent>
      </Card>

      <ResultContainer
        address={nftAddress.toRawString()}
        cell={beginCell().endCell()}
        amount={100000000n} // 0.1 TON
        init={nftInit.stateInit}
      />
    </div>
  )
}
