import BN from 'bn.js'
import QRCodeStyling from 'qr-code-styling'
import { useEffect, useMemo, useState } from 'react'
import { Cell } from 'ton'

export function ResultContainer({
  address,
  cell,
  amount,
}: {
  address: string
  cell: Cell
  amount: BN
}) {
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

  return (
    <div>
      <div className="flex gap-4">
        <div>
          Tonkeeper:
          <div id="canvas" className="overflow-hidden w-[300px] h-[300px] flex"></div>
          <a href={tonhubLink} target="_blank" rel="noopener noreferrer">
            Open In Tonkeeper
          </a>
        </div>

        <div>
          Tonhub:
          <div id="canvas2" className="overflow-hidden w-[300px] h-[300px] flex"></div>
          <a href={tonhubLink} target="_blank" rel="noopener noreferrer">
            Open In Tonhub
          </a>
        </div>

        <div>
          Generic Wallet:
          <div id="canvas3" className="overflow-hidden w-[300px] h-[300px] flex"></div>
          <a href={tonLink} target="_blank" rel="noopener noreferrer">
            Open In TON
          </a>
        </div>
      </div>
      <div>
        Body: <input type="text" defaultValue={binData} disabled className="w-full" />
      </div>
    </div>
  )
}
