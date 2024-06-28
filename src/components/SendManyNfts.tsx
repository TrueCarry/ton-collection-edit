import { useCallback, useMemo, useState } from 'react'
import { Address, toNano } from 'ton-core'
import { useTonAddress, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react'
import { BuildTransferNftBody } from '@/contracts/nftItem/NftItem'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

interface SendNftRow {
  nftAddress: string
  userAddress: string
}

interface TonConnectMessage {
  address: string
  amount: string
  stateInit?: string
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
  }, [sendCsv, myAddress, nftTransferAmount, nftForwardAmount])

  const attachFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length !== 1) return

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
  }, [sendList, tonConnectUI])

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Send Many NFTs</CardTitle>
        <CardDescription>Transfer multiple NFTs in a single transaction</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nftTransferAmount">Amount of TON to send with tx</Label>
          <Input
            id="nftTransferAmount"
            type="number"
            value={nftTransferAmount}
            onChange={(e) => setNftTransferAmount(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nftForwardAmount">Forward amount</Label>
          <Input
            id="nftForwardAmount"
            type="number"
            value={nftForwardAmount}
            onChange={(e) => setNftForwardAmount(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Amount of TON that would be sent from NFT to new owner with notification. Should be less
            than transfer amount.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sendList">Send List</Label>
          <Input id="sendList" type="file" onChange={attachFile} />
          <p className="text-sm text-muted-foreground">
            Upload a CSV file containing NFT addresses and new owner addresses. Format:
            nft_address,new_owner_address (one per line)
          </p>
          <p className="text-sm text-muted-foreground">Example file content:</p>
          <pre className="text-sm bg-gray-100 p-2 rounded overflow-x-auto">
            EQCBGq-baE565-7v4-WfG5JOEuVjHI84oipBEe5OopV4KXt0,EQDu6s_r9_wmgWm5QgZuIeLep2fiSg4ijxGcJ0Sw8g4_9gYN
          </pre>
        </div>

        {sendList.length > 0 && (
          <div className="flex items-center gap-2">
            <div>TonConnect:</div>
            {wallet ? (
              <Button onClick={sendTonConnectTx}>Send Transaction</Button>
            ) : (
              <div>Connect TonConnect wallet to send tx</div>
            )}
          </div>
        )}

        {sendCsv.length > 0 && (
          <div>
            <div>Send List:</div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>NFT</TableHead>
                  <TableHead>New Owner</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sendCsv.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell>{i}</TableCell>
                    <TableCell>
                      <a
                        href={`https://tonviewer.com/${row.nftAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600"
                      >
                        {truncateAddress(row.nftAddress)}
                      </a>
                    </TableCell>
                    <TableCell>
                      <a
                        href={`https://tonviewer.com/${row.userAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600"
                      >
                        {truncateAddress(row.userAddress)}
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
