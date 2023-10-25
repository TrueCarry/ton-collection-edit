import BN from 'bn.js'
import { useEffect, useMemo, useState } from 'react'
import { Address } from 'ton-core'
import { ResultContainer } from './ResultContainer'

import {
  buildJettonOnchainMetadata,
  updateMetadataBodyJetton,
} from '@/contracts/jetton/jetton-minter'
import { useTonClient } from '@/store/tonClient'
import { parseJettonContent } from '@/contracts/nft-content/nftContent'

export function EditJetton() {
  const [jettonContractAddress, setJettonContractAddress] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [name, setName] = useState('')
  const [symbol, setSymbol] = useState('')
  const [decimals, setDecimals] = useState('')
  const [initAmount, setInitAmount] = useState('')
  const [description, setDescription] = useState('')
  const [adminAddress, setAdminAddress] = useState('')

  const tonClient = useTonClient()

  const updateInfo = async () => {
    let address: Address
    try {
      address = Address.parse(jettonContractAddress)
    } catch (e) {
      return
    }

    const info = await tonClient.value.runMethod(address, 'get_jetton_data')

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
    if (!adminAddress) {
      return
    }

    const newData = buildJettonOnchainMetadata({
      name,
      symbol,
      decimals,
      description,
      image: imageUrl,
    })
    const message = updateMetadataBodyJetton(newData)

    return message
  }, [name, symbol, decimals, description, imageUrl, adminAddress, initAmount])

  return (
    <div className="container mx-auto">
      <div>
        <label htmlFor="jettonContractAddress">jettonContractAddress:</label>
        <input
          className="w-full px-2 py-2 bg-gray-200 rounded"
          type="text"
          id="jettonContractAddress"
          value={jettonContractAddress}
          onChange={(e) => setJettonContractAddress(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="imageUrl">imageUrl:</label>
        <input
          className="w-full px-2 py-2 bg-gray-200 rounded"
          type="text"
          id="imageUrl"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="name">name:</label>
        <input
          className="w-full px-2 py-2 bg-gray-200 rounded"
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="salt">symbol:</label>
        <input
          className="w-full px-2 py-2 bg-gray-200 rounded"
          type="text"
          id="symbol"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="salt">decimals:</label>
        <input
          className="w-full px-2 py-2 bg-gray-200 rounded"
          type="text"
          id="decimals"
          value={decimals}
          onChange={(e) => setDecimals(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="salt">initAmount:</label>
        <input
          className="w-full px-2 py-2 bg-gray-200 rounded"
          type="text"
          id="initAmount"
          value={initAmount}
          onChange={(e) => setInitAmount(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="salt">description:</label>
        <input
          className="w-full px-2 py-2 bg-gray-200 rounded"
          type="text"
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="adminAddress">Admin adress:</label>
        <input
          className="w-full px-2 py-2 bg-gray-200 rounded"
          type="text"
          id="adminAddress"
          value={adminAddress}
          onChange={(e) => setAdminAddress(e.target.value)}
        />
      </div>

      {deployParams && (
        <>
          <ResultContainer
            address={jettonContractAddress}
            cell={deployParams}
            amount={new BN(100000000)}
          />
        </>
      )}
    </div>
  )
}
