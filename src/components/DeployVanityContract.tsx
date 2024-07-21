import BN from 'bn.js'
import { useMemo, useState } from 'react'
import { Address, Cell, beginCell, contractAddress, storeStateInit } from 'ton-core'
import { ResultContainer } from './ResultContainer'
import { useTonAddress } from '@tonconnect/ui-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'

const VanityAddressCode = Cell.fromBase64(
  'te6ccsEBAgEAMgAADQEU/wD0pBP0vPLICwEARtPtRNB11yH6QIMH1yHRAtDTAzH6QDBYxwXyiNTU0QH7BO1UaWPhvg=='
)

export function DeployVanityContract() {
  const [salt, setSalt] = useState('')
  const [code, setCode] = useState('')
  const [data, setData] = useState('')
  const owner = useTonAddress()

  const contractData = useMemo(() => {
    if (!owner) {
      return beginCell().endCell()
    }
    const data = beginCell()
    data.storeInt(0, 5) // padding
    data.storeAddress(Address.parse(owner)) // owner
    data.storeBuffer(Buffer.from(salt, 'hex')) // salt
    return data.endCell()
  }, [salt, owner])

  const stateInit = useMemo(() => {
    if (!contractData) {
      return undefined
    }
    const init = {
      code: VanityAddressCode,
      data: contractData,
    }
    return beginCell().store(storeStateInit(init)).endCell()
  }, [contractData])

  const resultAddress = useMemo(() => {
    if (!contractData) {
      return ''
    }
    const init = contractAddress(0, {
      code: VanityAddressCode,
      data: contractData,
    })
    return init.toString({ bounceable: true, urlSafe: true })
  }, [contractData])

  const mintMessage = useMemo(() => {
    if (!contractData) {
      return beginCell().endCell()
    }
    try {
      const payload = beginCell()
      payload.storeRef(Cell.fromBase64(code))
      payload.storeRef(Cell.fromBase64(data))
      return payload.endCell()
    } catch (e) {
      return beginCell().endCell()
    }
  }, [contractData, code, data])

  return (
    <div className="flex flex-col gap-4 w-full max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Deploy Vanity Contract</CardTitle>
          <CardDescription>Create a new vanity contract on the TON blockchain</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="salt">Salt</Label>
            <Input
              id="salt"
              value={salt}
              onChange={(e) => setSalt(e.target.value)}
              placeholder="Enter salt value"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="inputCode">Code (base64)</Label>
            <Input
              id="inputCode"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter base64 encoded code"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="inputData">Data (base64)</Label>
            <Input
              id="inputData"
              value={data}
              onChange={(e) => setData(e.target.value)}
              placeholder="Enter base64 encoded data"
            />
          </div>

          <div className="space-y-2">
            <Label>Resulting Address</Label>
            <Input value={resultAddress} readOnly />
          </div>
        </CardContent>
      </Card>
      <ResultContainer
        address={resultAddress}
        cell={mintMessage}
        amount={new BN('1000000000')}
        init={stateInit}
      />
    </div>
  )
}
