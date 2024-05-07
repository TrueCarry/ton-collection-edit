import { storeJettonTransferMessage } from '@/contracts/jetton/jetton-wallet'
import { useTonClient } from '@/store/tonClient'
import { useTonAddress } from '@tonconnect/ui-react'
import BN from 'bn.js'
import { useEffect, useMemo, useState } from 'react'
import { Address, beginCell, Cell, TupleBuilder } from 'ton-core'
import { ResultContainer } from './ResultContainer'

export function TransferJetton() {
  const senderAddress = useTonAddress()
  const [jettonContractAddress, setJettonContractAddress] = useState('')
  const [jettonWalletAddress, setJettonWalletAddress] = useState('')
  const [queryId, setQueryId] = useState('0')
  const [destinationAddress, setDestinationAddress] = useState('')
  const [responseDestinationAddress, setResponseDestinationAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [customPayload, setCustomPayload] = useState('')
  const [forwardAmount, setForwardAmount] = useState('')
  const [forwardPayload, setForwardPayload] = useState('')

  const tonClient = useTonClient()

  const updateInfo = async () => {
    let address: Address
    try {
      address = Address.parse(jettonContractAddress)
    } catch (e) {
      return
    }

    let sender: Address
    try {
      sender = Address.parse(senderAddress)
    } catch (e) {
      return
    }

    const builder = new TupleBuilder()
    builder.writeAddress(sender)
    const info = await tonClient.value.runMethod(address, 'get_wallet_address', builder.build())

    const jettonWalletAddress = info.stack.readAddress()

    setJettonWalletAddress(jettonWalletAddress.toString({ bounceable: true, urlSafe: true }))
    console.log('jetton wallet address', jettonWalletAddress)
  }
  useEffect(() => {
    updateInfo()
  }, [jettonContractAddress, tonClient, senderAddress])

  useEffect(() => {
    try {
      Address.parse(responseDestinationAddress)
      return
    } catch (e) {}

    let sender: Address
    try {
      sender = Address.parse(senderAddress)
    } catch (e) {
      return
    }

    setResponseDestinationAddress(sender.toString({ bounceable: false, urlSafe: true }))
  }, [senderAddress, responseDestinationAddress])

  useEffect(() => {
    let destination: ReturnType<typeof Address.parseFriendly>
    try {
      destination = Address.parseFriendly(destinationAddress)
    } catch (e) {
      return
    }

    if (!destination.isBounceable) {
      return
    }

    setDestinationAddress(destination.address.toString({ bounceable: false, urlSafe: true }))
  }, [destinationAddress])

  useEffect(() => {
    let destination: ReturnType<typeof Address.parseFriendly>
    try {
      destination = Address.parseFriendly(responseDestinationAddress)
    } catch (e) {
      return
    }

    if (!destination.isBounceable) {
      return
    }

    setResponseDestinationAddress(
      destination.address.toString({ bounceable: false, urlSafe: true })
    )
  }, [responseDestinationAddress])

  const deployParams = useMemo(() => {
    if (!jettonWalletAddress || !destinationAddress || !amount || !senderAddress) {
      return
    }

    let message: Cell | null = null
    try {
      message = beginCell()
        .store(
          storeJettonTransferMessage({
            queryId: queryId ? BigInt(queryId) : 0n,
            amount: BigInt(amount),
            destination: Address.parse(destinationAddress),
            responseDestination: responseDestinationAddress
              ? Address.parse(responseDestinationAddress)
              : Address.parse(senderAddress),
            customPayload: customPayload ? Cell.fromBase64(customPayload) : null,
            forwardAmount: BigInt(forwardAmount),
            forwardPayload: forwardPayload ? Cell.fromBase64(forwardPayload) : null,
          })
        )
        .endCell()
    } catch (e) {}

    return message
  }, [
    queryId,
    senderAddress,
    jettonWalletAddress,
    destinationAddress,
    amount,
    customPayload,
    forwardAmount,
    forwardPayload,
  ])

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
        <label htmlFor="imageUrl">jettonWalletAddress:</label>
        <input
          disabled={true}
          className="w-full px-2 py-2 bg-gray-200 rounded"
          type="text"
          id="jettonWalletAddress"
          value={jettonWalletAddress}
          onChange={(e) => setJettonWalletAddress(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="name">queryId:</label>
        <input
          className="w-full px-2 py-2 bg-gray-200 rounded"
          type="text"
          id="queryId"
          value={queryId}
          onChange={(e) => setQueryId(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="name">destinationAddress:</label>
        <input
          className="w-full px-2 py-2 bg-gray-200 rounded"
          type="text"
          id="destinationAddress"
          value={destinationAddress}
          onChange={(e) => setDestinationAddress(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="name">responseDestinationAddress:</label>
        <input
          className="w-full px-2 py-2 bg-gray-200 rounded"
          type="text"
          id="responseDestinationAddress"
          value={responseDestinationAddress}
          onChange={(e) => setResponseDestinationAddress(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="name">amount (in units):</label>
        <input
          className="w-full px-2 py-2 bg-gray-200 rounded"
          type="text"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="name">customPayload (base64):</label>
        <input
          className="w-full px-2 py-2 bg-gray-200 rounded"
          type="text"
          id="customPayload"
          value={customPayload}
          onChange={(e) => setCustomPayload(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="name">forwardAmount (in nano):</label>
        <input
          className="w-full px-2 py-2 bg-gray-200 rounded"
          type="text"
          id="forwardAmount"
          value={forwardAmount}
          onChange={(e) => setForwardAmount(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="name">forwardPayload (base64):</label>
        <input
          className="w-full px-2 py-2 bg-gray-200 rounded"
          type="text"
          id="forwardPayload"
          value={forwardPayload}
          onChange={(e) => setForwardPayload(e.target.value)}
        />
      </div>

      {deployParams && (
        <>
          <ResultContainer
            address={jettonWalletAddress}
            cell={deployParams}
            amount={new BN(100000000)}
          />
        </>
      )}
    </div>
  )
}
