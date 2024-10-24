import { useState, useEffect, useMemo } from 'react'
import { Address } from 'ton-core'
import BN from 'bn.js'
import { useTonClient } from '@/store/tonClient'
import { parseJettonContent } from '@/contracts/nft-content/nftContent'
import {
  buildJettonOnchainMetadata,
  updateMetadataBodyJetton,
} from '@/contracts/jetton/jetton-minter'
import { ResultContainer } from './ResultContainer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export function EditJetton() {
  const [jettonContractAddress, setJettonContractAddress] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [name, setName] = useState('')
  const [symbol, setSymbol] = useState('')
  const [decimals, setDecimals] = useState('')
  const [description, setDescription] = useState('')

  const tonClient = useTonClient()

  const updateInfo = async () => {
    let address: Address
    try {
      address = Address.parse(jettonContractAddress)
    } catch (e) {
      return
    }

    const info = await tonClient.value.runMethod(address, 'get_jetton_data')
    info.stack.readNumber() // supply
    info.stack.readNumber() // ??
    info.stack.readCell() // admin
    const content = info.stack.readCell()
    const parsedContent = parseJettonContent(content)

    if (parsedContent.image) setImageUrl(parsedContent.image)
    if (parsedContent.symbol) setSymbol(parsedContent.symbol)
    if (parsedContent.decimals) setDecimals(parsedContent.decimals)
    if (parsedContent.description) setDescription(parsedContent.description)
    if (parsedContent.name) setName(parsedContent.name)
    console.log('jetton info', parsedContent)
  }

  useEffect(() => {
    updateInfo()
  }, [jettonContractAddress, tonClient])

  const deployParams = useMemo(() => {
    const newData = buildJettonOnchainMetadata({
      name,
      symbol,
      decimals,
      description,
      image: imageUrl,
    })
    const message = updateMetadataBodyJetton(newData)

    return message
  }, [name, symbol, decimals, description, imageUrl])

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Edit Jetton</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="jettonContractAddress">Jetton Contract Address</Label>
              <Input
                id="jettonContractAddress"
                value={jettonContractAddress}
                onChange={(e) => setJettonContractAddress(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol</Label>
              <Input id="symbol" value={symbol} onChange={(e) => setSymbol(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="decimals">Decimals</Label>
              <Input id="decimals" value={decimals} onChange={(e) => setDecimals(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <Button onClick={updateInfo}>Refresh</Button>
          </div>
        </CardContent>
      </Card>

      <ResultContainer
        address={jettonContractAddress}
        cell={deployParams}
        amount={new BN(100000000)}
      />
    </div>
  )
}
