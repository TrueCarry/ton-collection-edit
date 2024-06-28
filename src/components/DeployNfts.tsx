import {
  isNftCollectionNftEditable,
  Queries,
  RoyaltyParams,
} from '@/contracts/getgemsCollection/NftCollection.data'
import { decodeOffChainContent } from '@/contracts/nft-content/nftContent'
import { useTonClient } from '@/store/tonClient'
import { useTonConnectUI } from '@tonconnect/ui-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Address, Cell, toNano, TupleItemCell, TupleItemInt } from 'ton-core'
import { TupleItemSlice } from 'ton-core/dist/tuple/tuple'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { Switch } from './ui/switch'

interface CollectionInfo {
  content: string
  base: string
  royalty: RoyaltyParams
  owner: Address
  nftEditable: boolean
  nextItemIndex: string
}

interface CollectionInfo {
  content: string
  base: string
  royalty: RoyaltyParams
  owner: Address
  nftEditable: boolean
  nextItemIndex: string
}

export function DeployNfts() {
  const tonClient = useTonClient()

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
    nextItemIndex: '-1',
  })

  const [collectionAddress, setCollectionAddress] = useState('')
  const [start, setStart] = useState<number>(0)
  const [count, setCount] = useState<number>(1)
  const [batchSize, setBatchSize] = useState<number>(50)
  const [template, setTemplate] = useState<string>('{id}.json')
  const [mintGram, setMintGram] = useState<string>('0.05')

  const replaceId = (template: string, id: number) => {
    return template.replace(/{id}/g, id.toString())
  }

  const updateInfo = async () => {
    setCollectionInfo({
      content: '',
      base: '',
      royalty: {
        royaltyFactor: 0,
        royaltyBase: 0,
        royaltyAddress: new Address(0, Buffer.from([])),
      },
      owner: new Address(0, Buffer.from([])),
      nftEditable: false,
      nextItemIndex: '-1',
    })

    let address: Address
    try {
      address = Address.parse(collectionAddress)
    } catch (e) {
      return
    }
    const account = await tonClient.value.getContractState(address)
    const info = await tonClient.value.callGetMethod(address, 'royalty_params')

    const [royaltyFactor, royaltyBase, royaltyAddress] = [
      info.stack.pop(),
      info.stack.pop(),
      info.stack.pop(),
    ] as [TupleItemInt, TupleItemInt, TupleItemSlice]
    console.log('info', info, royaltyAddress[1])
    const royaltyOwner = royaltyAddress.cell.beginParse().loadAddress()
    if (!royaltyOwner) {
      return
    }

    const royalty = {
      royaltyFactor: Number(royaltyFactor.value),
      royaltyBase: Number(royaltyBase.value),
      royaltyAddress: royaltyOwner,
    }

    const contentInfo = await tonClient.value.callGetMethod(address, 'get_collection_data')
    const [nextItemIndex, collectionContent, collectionOwner] = [
      contentInfo.stack.pop(),
      contentInfo.stack.pop(),
      contentInfo.stack.pop(),
    ] as [
      TupleItemInt, // bn
      TupleItemCell, // cell
      TupleItemSlice, // slice
    ]
    const content = decodeOffChainContent(collectionContent.cell)

    const baseInfo = await tonClient.value.callGetMethod(address, 'get_nft_content', [
      {
        type: 'int',
        value: 0n,
      },
      { type: 'cell', cell: new Cell() },
    ])

    const cell = (baseInfo.stack.pop() as TupleItemCell).cell
    const baseContent = decodeOffChainContent(cell)

    setCollectionInfo({
      nextItemIndex: nextItemIndex.value.toString(),
      content,
      base: baseContent,
      royalty,
      owner: collectionOwner.cell.asSlice().loadAddress(),
      nftEditable: isNftCollectionNftEditable(Cell.fromBoc(account.data || Buffer.from([]))[0]),
    })
    setStart(Number(nextItemIndex.value))
  }

  useEffect(() => {
    updateInfo()
  }, [collectionAddress, tonClient])

  const [tonConnectUI] = useTonConnectUI()

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

      const mintBody = collectionInfo.nftEditable
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
  }, [start, count, template, collectionInfo, tonConnectUI.account, tonClient, mintGram])

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
          <Switch id="collectionEditable" checked={collectionInfo?.nftEditable} disabled />
          <Label htmlFor="collectionEditable">Collection NFTs Editable</Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="collectionBase">Collection Base</Label>
          <Input id="collectionBase" value={collectionInfo?.base} readOnly />
          <p className="text-sm text-muted-foreground">
            The base URI for your NFT metadata, automatically fetched from the collection.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="collectionIndex">Next Item Index</Label>
          <Input id="collectionIndex" value={collectionInfo?.nextItemIndex} readOnly />
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
            href={`${collectionInfo.base}${replaceId(template, start + count - 1)}`}
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
