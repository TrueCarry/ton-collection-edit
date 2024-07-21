import BN from 'bn.js'
import { useCallback, useMemo } from 'react'
import { Cell, loadStateInit } from 'ton'
import { useTonWallet, useTonConnectUI } from '@tonconnect/ui-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CopyButton } from '@/components/items/CopyButton'

export function ResultContainer({
  address,
  cell,
  amount,
  init,
}: {
  address: string
  cell?: Cell
  init?: Cell
  amount: BN | bigint
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
    <Card>
      <CardHeader>
        <CardTitle>Transaction Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div>TonConnect:</div>
            {wallet ? (
              <Button onClick={sendTonConnectTx}>Send Transaction</Button>
            ) : (
              <div>Connect TonConnect wallet to send tx</div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Body:</Label>
            <div className="flex items-center gap-2">
              <Input id="body" value={binData || ''} readOnly />
              <CopyButton value={binData || ''} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="initCell">Init Cell:</Label>
            <div className="flex items-center gap-2">
              <Input
                id="initCell"
                value={initCell || ''}
                readOnly
                onClick={(e) => window && window.getSelection()?.selectAllChildren(e.target as any)}
              />
              <CopyButton value={initCell || ''} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="initCode">Init Code:</Label>
            <div className="flex items-center gap-2">
              <Input
                id="initCode"
                value={initCode || ''}
                readOnly
                onClick={(e) => window && window.getSelection()?.selectAllChildren(e.target as any)}
              />
              <CopyButton value={initCode || ''} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="initData">Init Data:</Label>
            <div className="flex items-center gap-2">
              <Input
                id="initData"
                value={initData || ''}
                readOnly
                onClick={(e) => window && window.getSelection()?.selectAllChildren(e.target as any)}
              />
              <CopyButton value={initData || ''} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
