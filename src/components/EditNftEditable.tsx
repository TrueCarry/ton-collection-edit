import { flattenSnakeCell } from '@/contracts/nft-content/nftContent'
import { useTonClient } from '@/store/tonClient'
import BN from 'bn.js'
import { useEffect, useMemo, useState } from 'react'
import { Address, beginCell, Cell, TupleItemInt } from 'ton'
import { TupleItemCell, TupleItemSlice } from 'ton-core/dist/tuple/tuple'
import { ResultContainer } from './ResultContainer'

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
    ] as [
      TupleItemInt,
      TupleItemInt,
      TupleItemInt,
      TupleItemCell, // cell
      TupleItemSlice, // slice
    ]
    // const content = decodeOffChainContent(nftContent.cell)c
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
    <div>
      <div>Edit Editable Nft</div>
      <div className="py-2">
        <div>
          <label htmlFor="nftAddress">Nft Address:</label>
          <input
            className="w-full px-2 py-2 bg-gray-200 rounded"
            type="text"
            id="nftAddress"
            value={nftAddress}
            onChange={(e) => setNftAddress(e.target.value)}
          />
        </div>
      </div>

      <div className="py-2">
        <div>
          <label htmlFor="newContent">New Content:</label>
          <input
            className="w-full px-2 py-2 bg-gray-200 rounded"
            type="text"
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
      </div>

      <div className="my-2">
        <button onClick={updateInfo} className="px-4 py-2 rounded text-white bg-blue-600">
          Refresh
        </button>
      </div>

      <ResultContainer address={nftAddress} cell={editContent} amount={new BN('10000000')} />
    </div>
  )
}
