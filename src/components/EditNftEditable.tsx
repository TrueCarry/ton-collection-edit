import { flattenSnakeCell } from '@/contracts/nft-content/nftContent'
import { useTonClient } from '@/store/tonClient'
import BN from 'bn.js'
import { useEffect, useMemo, useState } from 'react'
import { Address, beginCell, Cell, TupleItemInt } from 'ton'
import { TupleItemCell, TupleItemSlice } from 'ton-core/dist/tuple/tuple'
import { ResultContainer } from './ResultContainer'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Label } from './ui/label'

interface NftInfo {
  content: string
}

function CreateEditableNftEditBody(itemContentUri: string, queryId?: number): Cell {
  const body = beginCell()
  body.storeUint(0x1a0b9d51, 32) // OP edit_content
  body.storeUint(queryId || 0, 64) // query_id

  const uriContent = beginCell()
  uriContent.storeBuffer(Buffer.from(serializeUri(itemContentUri)))
  body.storeRef(uriContent)

  return body.endCell()
}

function serializeUri(uri: string) {
  return new TextEncoder().encode(encodeURI(uri))
}

export function EditNftEditable() {
  const [nftAddress, setNftAddress] = useState('')
  const tonClient = useTonClient()

  const [nftInfo, setNftInfo] = useState<NftInfo>({
    content: '',
  })

  const updateInfo = async () => {
    setNftInfo({
      content: '',
    })

    let address: Address
    try {
      address = Address.parse(nftAddress)
    } catch (e) {
      return
    }

    const contentInfo = await tonClient.value.callGetMethod(address, 'get_nft_data')
    const [, , , , nftContent] = [
      contentInfo.stack.pop(),
      contentInfo.stack.pop(),
      contentInfo.stack.pop(),
      contentInfo.stack.pop(),
      contentInfo.stack.pop(),
    ] as [TupleItemInt, TupleItemInt, TupleItemInt, TupleItemCell, TupleItemSlice]
    const content = flattenSnakeCell(nftContent.cell).toString('utf-8')

    setNftInfo({
      content,
    })
  }

  useEffect(() => {
    updateInfo()
  }, [nftAddress])

  const [editContent, setEditContent] = useState(new Cell())
  useMemo(async () => {
    const data = CreateEditableNftEditBody(nftInfo.content)
    setEditContent(data)
  }, [nftAddress, nftInfo])

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Edit Editable NFT</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nftAddress">NFT Address</Label>
              <Input
                id="nftAddress"
                value={nftAddress}
                onChange={(e) => setNftAddress(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newContent">New Content</Label>
              <Input
                id="newContent"
                value={nftInfo.content}
                onChange={(e) =>
                  setNftInfo({
                    ...nftInfo,
                    content: e.target.value,
                  })
                }
              />
            </div>
            <Button onClick={updateInfo}>Refresh</Button>
          </div>
        </CardContent>
      </Card>
      <ResultContainer address={nftAddress} cell={editContent} amount={new BN('10000000')} />
    </div>
  )
}
