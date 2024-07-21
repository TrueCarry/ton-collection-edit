import { useState, useEffect, useMemo } from 'react'
import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react'
import { useTonapiClient } from '@/store/tonClient'
import { Address } from 'ton-core'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { transferJetton } from '@/contracts/jetton/jetton-minter'
import { formatUnits } from '@/lib/formatUnits'

interface Jetton {
  address: string
  balance: bigint
  symbol: string
  decimals: number
  smallBalance: number
  price: number
  usdAmount: number
  verified: boolean
  image: string
  walletAddress: string
}

export function UserJettons() {
  const [jettons, setJettons] = useState<Jetton[]>([])
  const [selectedJettons, setSelectedJettons] = useState<string[]>([])
  const [destinationAddress, setDestinationAddress] = useState('')
  const [transferAmount, setTransferAmount] = useState<bigint>(0n)
  const [useEntireBalance, setUseEntireBalance] = useState(false)
  const [tonConnectUI] = useTonConnectUI()
  const userAddress = useTonAddress()
  const tonapi = useTonapiClient()

  const sortedJettons = useMemo(() => {
    return [...jettons].sort((a, b) => b.usdAmount - a.usdAmount)
  }, [jettons])

  useEffect(() => {
    const fetchJettons = async () => {
      if (!userAddress) return

      try {
        const response = await tonapi.get().accounts.getAccountJettonsBalances(userAddress, {
          currencies: ['usd'],
        })
        console.log(response)
        const fetchedJettons: Jetton[] = response.balances.map((jetton) => ({
          address: jetton.jetton.address,
          balance: BigInt(jetton.balance),
          symbol: jetton.jetton.symbol,
          decimals: jetton.jetton.decimals,
          smallBalance: parseFloat(formatUnits(BigInt(jetton.balance), jetton.jetton.decimals)),
          price: jetton.price?.prices?.USD ?? 0,
          usdAmount:
            (jetton.price?.prices?.USD ?? 0) *
            parseFloat(formatUnits(BigInt(jetton.balance), jetton.jetton.decimals)),
          verified: jetton.jetton.verification === 'whitelist',
          image: jetton.jetton.image,
          walletAddress: jetton.wallet_address.address,
        }))
        setJettons(fetchedJettons)
      } catch (error) {
        console.error('Error fetching jettons:', error)
      }
    }

    fetchJettons()
  }, [userAddress, tonapi])

  const handleJettonSelection = (address: string) => {
    setSelectedJettons((prev) =>
      prev.includes(address) ? prev.filter((a) => a !== address) : [...prev, address]
    )
  }

  const handleTransfer = () => {
    if (!destinationAddress || selectedJettons.length === 0) return

    const messages = selectedJettons
      .map((jettonAddress) => {
        const jetton = jettons.find((j) => j.address === jettonAddress)
        if (!jetton) return null

        const amount = useEntireBalance ? jetton.balance : transferAmount
        if (amount <= 0n) return null

        const message = transferJetton(
          Address.parse(destinationAddress),
          Address.parse(userAddress),
          amount
        )

        return {
          address: jetton.walletAddress,
          amount: '50000000', // 0.05 TON for fees
          payload: message.toBoc().toString('base64'),
        }
      })
      .filter(Boolean) as { address: string; amount: string; payload: string }[]

    if (messages.length === 0) return

    tonConnectUI.sendTransaction({
      messages,
      validUntil: Math.floor(Date.now() / 1000) + 60,
    })
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Destination Address"
              value={destinationAddress}
              onChange={(e) => setDestinationAddress(e.target.value)}
            />

            <div className="flex items-center space-x-2">
              <Checkbox
                id="useEntireBalance"
                checked={useEntireBalance}
                onCheckedChange={(checked) => setUseEntireBalance(checked === true)}
              />
              <label htmlFor="useEntireBalance" className="text-sm">
                Use entire jetton balance
              </label>
            </div>

            <div className="flex items-center space-x-2">
              {!useEntireBalance && (
                <Input
                  type="number"
                  placeholder="Amount to transfer"
                  onChange={(e) => setTransferAmount(BigInt(e.target.value))}
                />
              )}
            </div>

            <Button onClick={handleTransfer}>Transfer Selected Jettons</Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Your Jettons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedJettons.map((jetton) => (
              <div key={jetton.address} className="flex items-center space-x-4 mb-4">
                <Checkbox
                  id={jetton.address}
                  checked={selectedJettons.includes(jetton.address)}
                  onCheckedChange={() => handleJettonSelection(jetton.address)}
                />
                <div className="flex-shrink-0">
                  <img src={jetton.image} alt={jetton.symbol} className="w-10 h-10 rounded-full" />
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-center">
                    <label
                      htmlFor={jetton.address}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {jetton.symbol} {jetton.verified && '✓'}
                    </label>
                    <span className="text-sm text-gray-500">${jetton.usdAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Balance: {jetton.smallBalance.toFixed(2)}</span>
                    <span>Price: ${jetton.price.toFixed(4)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
