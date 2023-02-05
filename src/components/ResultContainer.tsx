import BN from 'bn.js'
import QRCodeStyling from 'qr-code-styling'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Cell } from 'ton'
import { useTonWallet, useTonConnectUI } from '@tonconnect/ui-react'

export function ResultContainer({
  address,
  cell,
  amount,
}: {
  address: string
  cell: Cell
  amount: BN
}) {
  const wallet = useTonWallet()
  const [tonConnectUI] = useTonConnectUI()

  const [tonkeeperCode] = useState(
    new QRCodeStyling({
      width: 300,
      height: 300,
      margin: 0,
      type: 'canvas',
      data: 'https://app.tonkeeper.com/transfer/',
      dotsOptions: {
        color: '#000',
        type: 'extra-rounded',
      },
      backgroundOptions: {
        // color: '#e9ebee',
      },
      cornersSquareOptions: {
        type: 'extra-rounded',
      },
    })
  )
  const [tonhubCode] = useState(
    new QRCodeStyling({
      width: 300,
      height: 300,
      margin: 0,
      type: 'canvas',
      data: 'https://tonhub.com/transfer/',
      dotsOptions: {
        color: '#000',
        type: 'extra-rounded',
      },
      backgroundOptions: {
        // color: '#e9ebee',
      },
      cornersSquareOptions: {
        type: 'extra-rounded',
      },
    })
  )

  const [tonCode] = useState(
    new QRCodeStyling({
      width: 300,
      height: 300,
      margin: 0,
      type: 'canvas',
      data: 'https://tonhub.com/transfer/',
      dotsOptions: {
        color: '#000',
        type: 'extra-rounded',
      },
      backgroundOptions: {
        // color: '#e9ebee',
      },
      cornersSquareOptions: {
        type: 'extra-rounded',
      },
    })
  )

  useEffect(() => {
    tonkeeperCode.append(document.getElementById('canvas') as HTMLElement)
    tonhubCode.append(document.getElementById('canvas2') as HTMLElement)
    tonCode.append(document.getElementById('canvas3') as HTMLElement)
  })

  const binData = useMemo(
    () => cell.toBoc().toString('base64').replace(/\//g, '_').replace(/\+/g, '-'),
    [cell]
  )

  const tonkeeperLink = useMemo(
    () =>
      `https://app.tonkeeper.com/transfer/${address}?amount=${amount.toString()}&bin=${binData}`,
    [address, amount, binData]
  )

  const tonhubLink = useMemo(
    () => `https://tonhub.com/transfer/${address}?amount=${amount.toString()}&bin=${binData}`,
    [address, amount, binData]
  )

  const tonLink = useMemo(
    () => `ton://transfer/${address}?amount=${amount.toString()}&bin=${binData}`,
    [address, amount, binData]
  )

  useEffect(() => {
    console.log('tonhublink,', tonhubLink)
    tonkeeperCode.update({
      data: tonkeeperLink,
    })
    tonhubCode.update({
      data: tonhubLink,
    })
    tonCode.update({
      data: tonLink,
    })
  }, [tonkeeperLink, tonhubLink])

  const sendTonConnectTx = useCallback(() => {
    tonConnectUI.sendTransaction({
      messages: [
        {
          address,
          amount: amount.toString(),
          payload: binData,
        },
      ],
      validUntil: Math.floor(Date.now() / 1000) + 300,
    })
  }, [])

  return (
    <div>
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

      <div className="flex gap-4 mt-8">
        <div>
          Tonkeeper:
          <div id="canvas" className="overflow-hidden w-[100px] h-[100px] flex"></div>
          <a href={tonhubLink} target="_blank" rel="noopener noreferrer">
            Open In Tonkeeper
          </a>
        </div>

        <div>
          Tonhub:
          <div id="canvas2" className="overflow-hidden w-[100px] h-[100px] flex"></div>
          <a href={tonhubLink} target="_blank" rel="noopener noreferrer">
            Open In Tonhub
          </a>
        </div>

        <div>
          Generic Wallet:
          <div id="canvas3" className="overflow-hidden w-[100px] h-[100px] flex"></div>
          <a href={tonLink} target="_blank" rel="noopener noreferrer">
            Open In TON
          </a>
        </div>
      </div>
      <div>
        <div>Body:</div>
        <code className="bg-gray-100">{binData}</code>
      </div>
    </div>
  )
}
