import {
  isNftCollectionNftEditable,
  Queries,
} from '@/contracts/getgemsCollection/NftCollection.data'
import { useTonClient } from '@/store/tonClient'
import { useTonConnectUI } from '@tonconnect/ui-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Address, Cell, toNano } from 'ton-core'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { Switch } from './ui/switch'
import { useCollectionInfo, useCollectionBaseContent } from '@/hooks/collection'

const useContractState = (
  address: Address | null
): {
  code: Buffer | null
  data: Buffer | null
} | null => {
  const [account, setAccount] = useState<{
    code: Buffer | null
    data: Buffer | null
  } | null>(null)
  const tonClient = useTonClient()

  useEffect(() => {
    const fetchContractState = async () => {
      if (address) {
        try {
          const state = await CallForSuccess(() => tonClient.value.getContractState(address))
          setAccount(state)
        } catch (error) {
          console.error('Error fetching contract state:', error)
          setAccount(null)
        }
      } else {
        setAccount(null)
      }
    }

    fetchContractState()
  }, [address, tonClient.value])

  return account
}

export function DeployNfts() {
  const tonClient = useTonClient()
  const [collectionAddress, setCollectionAddress] = useState('')
  const [parsedAddress, setParsedAddress] = useState<Address | null>(null)

  useEffect(() => {
    try {
      setParsedAddress(Address.parse(collectionAddress))
    } catch (e) {
      setParsedAddress(null)
    }
  }, [collectionAddress])

  const { nextItemIndex } = useCollectionInfo(parsedAddress)
  const baseContent = useCollectionBaseContent(parsedAddress)

  const [start, setStart] = useState<number>(0)
  const [count, setCount] = useState<number>(1)
  const [batchSize, setBatchSize] = useState<number>(50)
  const [template, setTemplate] = useState<string>('{id}.json')
  const [mintGram, setMintGram] = useState<string>('0.05')

  const account = useContractState(parsedAddress)

  useEffect(() => {
    if (nextItemIndex) {
      setStart(Number(nextItemIndex))
    }
  }, [nextItemIndex])

  const [tonConnectUI] = useTonConnectUI()

  const replaceId = (template: string, id: number) => {
    return template.replace(/{id}/g, id.toString())
  }

  const mintContent = useMemo(() => {
    // const start = 0
    // const count = 400

    if (!count || count < 1) {
      return []
    }

    if (!tonConnectUI.account?.address) {
      return []
    }

    // if (!collectionInfo.base) {
    //   return
    // }

    const messages: {
      address: string

      amount: string

      stateInit?: string

      payload?: string
    }[] = []

    const ids = [...Array(count)].map((_, i) => start + i)
    while (ids.length > 0) {
      const nftIds = ids.splice(0, batchSize)
      console.log('nftIds len', nftIds.length)

      const isEditable = account?.data
        ? isNftCollectionNftEditable(Cell.fromBoc(account.data)[0])
        : false
      const mintBody = isEditable
        ? Queries.batchMintEditable({
            items: nftIds.map((i) => {
              return {
                passAmount: toNano(mintGram),
                content: replaceId(template || '', i),
                index: i,
                ownerAddress: Address.parse(tonConnectUI.account?.address || ''),
                editorAddress: Address.parse(tonConnectUI.account?.address || ''),
              }
            }),
          })
        : Queries.batchMint({
            items: nftIds.map((i) => {
              return {
                passAmount: toNano(mintGram),
                content: replaceId(template || '', i),
                index: i,
                ownerAddress: Address.parse(tonConnectUI.account?.address || ''),
              }
            }),
          })

      const messageValue = (toNano(mintGram) + 17500000n) * BigInt(nftIds.length)
      messages.push({
        address: collectionAddress,
        amount: messageValue.toString(),
        payload: mintBody.toBoc().toString('base64'),
      })
    }

    return messages
  }, [start, count, template, parsedAddress, tonConnectUI.account, tonClient, mintGram])

  const sendTx = useCallback(() => {
    tonConnectUI.sendTransaction({
      messages: mintContent,
      validUntil: Math.floor(Date.now() / 1000) + 300,
    })
    console.log('send message', mintContent)
  }, [mintContent])

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Deploy NFTs</CardTitle>
        <CardDescription>
          Mint NFTs using batch mint function. You can mint up to 400 NFTs per transaction.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="collectionAddress">Collection Address</Label>
          <Input
            id="collectionAddress"
            value={collectionAddress}
            onChange={(e) => setCollectionAddress(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Enter the TON address of your NFT collection contract.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="collectionEditable"
            checked={
              account?.data ? isNftCollectionNftEditable(Cell.fromBoc(account.data)[0]) : false
            }
            disabled
          />
          <Label htmlFor="collectionEditable">Collection NFTs Editable</Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="collectionBase">Collection Base</Label>
          <Input id="collectionBase" value={baseContent || ''} readOnly />
          <p className="text-sm text-muted-foreground">
            The base URI for your NFT metadata, automatically fetched from the collection.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="collectionIndex">Next Item Index</Label>
          <Input id="collectionIndex" value={nextItemIndex || ''} readOnly />
          <p className="text-sm text-muted-foreground">
            The index of the next NFT to be minted in this collection.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="mintGram">Initial NFT Balance</Label>
          <Input
            id="mintGram"
            type="number"
            value={mintGram}
            onChange={(e) => setMintGram(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Amount of TON to be stored in each NFT. 0.05 TON is recommended for normal NFTs, but you
            can use 0.01 TON for testing.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="mintStart">Start from</Label>
          <Input
            id="mintStart"
            type="number"
            value={start}
            onChange={(e) => setStart(parseInt(e.target.value, 10) || 0)}
          />
          <p className="text-sm text-muted-foreground">
            The index to start minting from. Automatically set to the next available index in the
            collection.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="batchSize">Batch size</Label>
          <Input
            id="batchSize"
            type="number"
            value={batchSize}
            onChange={(e) => setBatchSize(parseInt(e.target.value, 10) || 0)}
          />
          <p className="text-sm text-muted-foreground">
            Number of NFTs to mint per message. 100 should work for the network, but some wallets
            only allow 50.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="mintCount">NFTs to mint</Label>
          <Input
            id="mintCount"
            type="number"
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value, 10) || 0)}
          />
          <p className="text-sm text-muted-foreground">
            Total number of NFTs to mint in this transaction. Maximum is 4 * batch size (
            {4 * batchSize}). Some wallets may support more.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="mintTemplate">NFT content template</Label>
          <Input
            id="mintTemplate"
            value={template || ''}
            onChange={(e) => setTemplate(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Template for individual NFT content. Use {'{id}'} as a placeholder for the NFT's index.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Resulting url:</Label>
          <a
            href={`${baseContent}${replaceId(template, start + count - 1)}`}
            target="_blank"
            className="text-blue-600 underline ml-2"
          >
            {replaceId(template, start + count - 1)}
          </a>
          <p className="text-sm text-muted-foreground">
            If you click on that url, valid nft metadata should be opened in your browser. If you
            see a 404, make sure you have the right base url and template.
          </p>
        </div>

        <Button onClick={sendTx}>Send Transaction</Button>
      </CardContent>
    </Card>
  )
}

// Function to call ton api untill we get response.
// Because testnet is pretty unstable we need to make sure response is final
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function CallForSuccess<T extends (...args: any[]) => any>(
  toCall: T,
  attempts = 20,
  delayMs = 100
): Promise<ReturnType<T>> {
  if (typeof toCall !== 'function') {
    throw new Error('unknown input')
  }

  let i = 0
  let lastError: unknown

  while (i < attempts) {
    try {
      const res = await toCall()
      return res
    } catch (err) {
      lastError = err
      i++
      await delay(delayMs)
    }
  }

  console.log('error after attempts', i)
  throw lastError
}

export function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
