import { useMemo, useState } from 'react'
import { beginCell, toNano } from 'ton'
import { ResultContainer } from './ResultContainer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'

function ChangeNftSalePriceBody(params: {
  price: bigint
  marketplaceFee: bigint
  royaltyAmount: bigint
}) {
  const msgBody = beginCell()
  msgBody.storeUint(0x6c6c2080, 32)
  msgBody.storeUint(0, 64) // query id
  msgBody.storeCoins(params.price)
  msgBody.storeCoins(params.marketplaceFee)
  msgBody.storeCoins(params.royaltyAmount)

  return msgBody.endCell()
}

export function EditNftSalePrice() {
  const [nftSaleAddress, setNftSaleAddress] = useState('')
  const [newPrice, setNewPrice] = useState('0')
  const [newMarketplaceFee, setNewMarketplaceFee] = useState('0')
  const [newRoyaltyAmount, setNewRoyaltyAmount] = useState('0')

  const updateMessageCell = useMemo(() => {
    try {
      return ChangeNftSalePriceBody({
        price: toNano(newPrice),
        marketplaceFee: toNano(newMarketplaceFee),
        royaltyAmount: toNano(newRoyaltyAmount),
      })
    } catch (e) {
      return beginCell().endCell()
    }
  }, [nftSaleAddress, newPrice, newMarketplaceFee, newRoyaltyAmount])

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Edit NFT Sale Price</CardTitle>
        <CardDescription>
          Nft Sale V3R3 allows changing the price without redeployment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nftSaleAddress">NFT Sale Address</Label>
          <p className="text-sm text-muted-foreground">
            Enter the address of the NFT sale contract to be edited.
          </p>
          <Input
            id="nftSaleAddress"
            value={nftSaleAddress}
            onChange={(e) => setNftSaleAddress(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPrice">New Price</Label>
          <p className="text-sm text-muted-foreground">
            Enter the new price for the NFT sale in TON.
          </p>
          <Input
            id="newPrice"
            type="number"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="newMarketplaceFee">New Marketplace Fee</Label>
          <p className="text-sm text-muted-foreground">
            Enter the new fee for the marketplace in TON.
          </p>
          <Input
            id="newMarketplaceFee"
            type="number"
            value={newMarketplaceFee}
            onChange={(e) => setNewMarketplaceFee(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="newRoyaltyAmount">New Royalty Amount</Label>
          <p className="text-sm text-muted-foreground">
            Enter the new royalty amount for the NFT creator in TON.
          </p>
          <Input
            id="newRoyaltyAmount"
            type="number"
            value={newRoyaltyAmount}
            onChange={(e) => setNewRoyaltyAmount(e.target.value)}
          />
        </div>

        <ResultContainer address={nftSaleAddress} cell={updateMessageCell} amount={10000000n} />
      </CardContent>
    </Card>
  )
}
