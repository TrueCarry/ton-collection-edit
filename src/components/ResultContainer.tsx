import BN from 'bn.js'
import { useCallback, useMemo } from 'react'
import { Cell, loadStateInit } from 'ton'
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
  const initCell = useMemo(
    () => init && init.toBoc().toString('base64').replace(/\//g, '_').replace(/\+/g, '-'),
    [init]
  )

  const { initCode, initData } = useMemo(() => {
    if (!init) {
      return { initCode: '', initData: '' }
    }

    const stateInit = loadStateInit(init.asSlice())
    return {
      initCode:
        stateInit?.code &&
        stateInit.code.toBoc().toString('base64').replace(/\//g, '_').replace(/\+/g, '-'),
      initData:
        stateInit?.data &&
        stateInit.data.toBoc().toString('base64').replace(/\//g, '_').replace(/\+/g, '-'),
    }
    // return init && init.toBoc().toString('base64').replace(/\//g, '_').replace(/\+/g, '-')
  }, [init])

  const sendTonConnectTx = useCallback(() => {
    tonConnectUI.sendTransaction({
      messages: [
        {
          address,
          amount: amount.toString(),
          payload: binData,
          stateInit: initCell || undefined,
        },
      ],
      validUntil: Math.floor(Date.now() / 1000) + 300,
    })
  }, [address, amount, binData, initCell])

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
        <code className="bg-gray-100 h-16">{binData}</code>
      </div>
      <div>
        <div>Init Cell:</div>
        <code
          className="bg-gray-100 h-16 overflow-scroll flex"
          onClick={(e) => window && window.getSelection()?.selectAllChildren(e.target as any)}
        >
          {initCell}
        </code>
      </div>

      <div>
        <div>Init Code:</div>
        <code
          className="bg-gray-100 h-16 overflow-scroll flex"
          onClick={(e) => window && window.getSelection()?.selectAllChildren(e.target as any)}
        >
          {initCode}
        </code>
      </div>

      <div>
        <div>Init Data:</div>
        <code
          className="bg-gray-100 h-16 overflow-scroll flex"
          onClick={(e) => window && window.getSelection()?.selectAllChildren(e.target as any)}
        >
          {initData}
        </code>
      </div>
    </div>
  )
}
