import BN from 'bn.js'
import { useCallback, useMemo } from 'react'
import { Cell } from 'ton'
import { useTonWallet, useTonConnectUI } from '@tonconnect/ui-react'

export function ResultContainer({
  address,
  cell,
  amount,
  init,
}: {
  address: string
  cell: Cell
  init?: Cell
  amount: BN
}) {
  const wallet = useTonWallet()
  const [tonConnectUI] = useTonConnectUI()

  const binData = useMemo(
    () => cell && cell.toBoc().toString('base64').replace(/\//g, '_').replace(/\+/g, '-'),
    [cell]
  )
  const initData = useMemo(
    () => init && init.toBoc().toString('base64').replace(/\//g, '_').replace(/\+/g, '-'),
    [init]
  )

  const sendTonConnectTx = useCallback(() => {
    tonConnectUI.sendTransaction({
      messages: [
        {
          address,
          amount: amount.toString(),
          payload: binData,
          stateInit: initData,
        },
      ],
      validUntil: Math.floor(Date.now() / 1000) + 300,
    })
  }, [address, amount, binData, initData])

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

      <div>
        <div>Body:</div>
        <code className="bg-gray-100">{binData}</code>
      </div>
      <div>
        <div>Init:</div>
        <code className="bg-gray-100">{initData}</code>
      </div>
    </div>
  )
}
