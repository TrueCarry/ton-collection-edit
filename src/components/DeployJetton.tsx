import BN from 'bn.js'
import { useMemo, useState } from 'react'
import { Address, beginCell, contractAddress, storeStateInit } from 'ton-core'
import { ResultContainer } from './ResultContainer'

import { createJettonDeployParams } from '@/contracts/jetton/jetton-minter'

export function DeployJetton() {
  const [imageUrl, setImageUrl] = useState('')
  const [name, setName] = useState('')
  const [symbol, setSymbol] = useState('')
  const [decimals, setDecimals] = useState('')
  const [initAmount, setInitAmount] = useState('')
  const [description, setDescription] = useState('')
  const [adminAddress, setAdminAddress] = useState('')

  const deployParams = useMemo(() => {
    if (!adminAddress) {
      return
    }
    const params = createJettonDeployParams(
      {
        amountToMint: BigInt(initAmount) * 10n ** BigInt(decimals),
        owner: Address.parse(adminAddress),
        onchainMetaData: {
          name,
          symbol,
          decimals,
          description,
          image: imageUrl,
        },
      },
      undefined
    )

    return {
      ...params,
      stateInit: beginCell().store(storeStateInit(params)).endCell(),
    }
  }, [name, symbol, decimals, description, imageUrl, adminAddress, initAmount])

  const jettonAddress = useMemo(() => {
    if (!deployParams) {
      return
    }
    const address = contractAddress(0, deployParams)

    return address
  }, [deployParams])

  return (
    <div className="container mx-auto">
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

      {jettonAddress && deployParams && (
        <>
          <div>Address: {jettonAddress.toString({ urlSafe: true, bounceable: true })}</div>
          <ResultContainer
            address={jettonAddress.toString({ urlSafe: true, bounceable: true })}
            cell={deployParams.message}
            amount={new BN(deployParams.value.toString())}
            init={deployParams.stateInit}
          />
        </>
      )}
    </div>
  )
}
