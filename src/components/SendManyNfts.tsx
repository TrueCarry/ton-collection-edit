import { useCallback, useMemo, useState } from 'react'
import { Address, toNano } from 'ton-core'

import { useTonAddress, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react'
import { BuildTransferNftBody } from '@/contracts/nftItem/NftItem'

interface SendNftRow {
  nftAddress: string
  userAddress: string
}

interface TonConnectMessage {
  /**
   * Receiver's address.
   */
  address: string
  /**
   * Amount to send in nanoTon.
   */
  amount: string
  /**
   * Contract specific data to add to the transaction.
   */
  stateInit?: string
  /**
   * Contract specific data to add to the transaction.
   */
  payload?: string
}

export function parseSendCsv(content: string): SendNftRow[] {
  const rows = content.split(/\r?\n/).filter((element) => element)
  if (rows.length < 1) {
    throw new Error(`[Parse] Not enough rows in nfts.csv`)
  }

  const nfts: SendNftRow[] = []
  for (const row of rows) {
    const fields = row.split(',')
    if (fields.length !== 2) {
      throw new Error(`[Parse] Unknown csv fields length ${fields.length}`)
    }

    const nftAddress = Address.parse(fields[0])
    const ownerAddress = Address.parse(fields[1])

    nfts.push({
      nftAddress: nftAddress.toString({ bounceable: true, urlSafe: true }),
      userAddress: ownerAddress.toString({ bounceable: true, urlSafe: true }),
    })
  }

  return nfts
}

// const NftTransferAmount = 40000000n // 0.04 TON
// const NftForwardAmount = 10000000n // 0.01 TON

export function SendManyNfts() {
  const [sendCsv, setSendCsv] = useState<SendNftRow[]>([])
  const wallet = useTonWallet()
  const myAddress = useTonAddress()
  const [tonConnectUI] = useTonConnectUI()
  const [nftTransferAmount, setNftTransferAmount] = useState('0.05')
  const [nftForwardAmount, setNftForwardAmount] = useState('0.01')

  const sendList = useMemo<TonConnectMessage[]>(() => {
    if (!sendCsv) {
      return []
    }

    return sendCsv.map((row) => {
      return {
        payload: BuildTransferNftBody({
          newOwner: Address.parse(row.userAddress),
          forwardAmount: toNano(nftForwardAmount),
          forwardPayload: undefined,
          responseTo: Address.parse(myAddress),
        })
          .toBoc()
          .toString('base64'),
        address: row.nftAddress,
        amount: toNano(nftTransferAmount).toString(),
      }
    })
    // const message = changeAdminBodyJetton(Address.parse(adminAddress))

    // return message
  }, [sendCsv, myAddress, nftTransferAmount, nftForwardAmount])

  const attachFile = async (e) => {
    const files: File[] = e.target.files

    if (files.length !== 1) {
      return
    }

    const content = await files[0].text()

    try {
      const nfts = parseSendCsv(content)
      setSendCsv(nfts)
    } catch (e) {
      console.error(e)
    }
  }

  const sendTonConnectTx = useCallback(() => {
    tonConnectUI.sendTransaction({
      messages: sendList,
      validUntil: Math.floor(Date.now() / 1000) + 300,
    })
  }, [sendList])

  return (
    <div className="container mx-auto">
      <div className="flex">
        <div>
          <label htmlFor="nftTransferAmount">Amount of TON to send with tx:</label>
          <input
            className="w-full px-2 py-2 bg-gray-200 rounded"
            type="number"
            id="nftTransferAmount"
            value={nftTransferAmount}
            onChange={(e) => setNftTransferAmount(e.target.value)}
          />
        </div>
      </div>

      <div className="flex">
        <div>
          <label htmlFor="nftForwardAmount">Forward amount:</label>
          <div className="text-sm text-gray-500">
            Amount of ton that would be send from nft to new owner with notification. Should be less
            than transfer amount
          </div>
          <input
            className="w-full px-2 py-2 bg-gray-200 rounded"
            type="number"
            id="nftForwardAmount"
            value={nftForwardAmount}
            onChange={(e) => setNftForwardAmount(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label htmlFor="sendList">Send List:</label>
        <input
          className="w-full px-2 py-2 bg-gray-200 rounded"
          type="file"
          id="sendList"
          onChange={attachFile}
        />
      </div>

      {sendList.length && (
        <div className="flex items-center gap-2">
          <div>TonConnect:</div>
          {wallet ? (
            <button className="px-4 py-2 rounded text-white bg-blue-600" onClick={sendTonConnectTx}>
              Send Transaction
            </button>
          ) : (
            <div>Connect TonConnect wallet to send tx</div>
          )}
        </div>
      )}

      <div>
        <div>Send List:</div>
        <table className="border border-gray-500">
          <thead>
            <tr>
              <td className="border border-gray-500 w-8">#</td>
              <td className="border border-gray-500">Nft</td>
              <td className="border border-gray-500">New Owner</td>
            </tr>
          </thead>
          <tbody>
            {sendCsv.map((row, i) => (
              <tr key={i}>
                <td className="border border-gray-500">{i}</td>
                <td className="border border-gray-500">{row.nftAddress}</td>
                <td className="border border-gray-500">{row.userAddress}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
