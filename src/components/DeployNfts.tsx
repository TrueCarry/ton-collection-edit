import {
  isNftCollectionNftEditable,
  Queries,
  RoyaltyParams,
} from '@/contracts/getgemsCollection/NftCollection.data'
import { decodeOffChainContent } from '@/contracts/nft-content/nftContent'
import { useTonClient } from '@/store/tonClient'
import { useTonConnectUI } from '@tonconnect/ui-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Address, Cell, TupleItemCell, TupleItemInt } from 'ton-core'
import { TupleItemSlice } from 'ton-core/dist/tuple/tuple'

interface CollectionInfo {
  content: string
  base: string
  royalty: RoyaltyParams
  owner: Address
  nftEditable: boolean
  nextItemIndex: string
}
export function DeployNfts() {
  const tonClient = useTonClient()

  const [collectionInfo, setCollectionInfo] = useState<CollectionInfo>({
    content: '',
    base: '',
    royalty: {
      royaltyFactor: 0,
      royaltyBase: 1000,
      royaltyAddress: new Address(0, Buffer.from([])),
    },
    owner: new Address(0, Buffer.from([])),
    nftEditable: false,
    nextItemIndex: '-1',
  })

  const [collectionAddress, setCollectionAddress] = useState('')
  const [start, setStart] = useState<number>(0)
  const [count, setCount] = useState<number>(0)
  const [template, setTemplate] = useState<string>('{id}.json')

  const replaceId = (template: string, id: number) => {
    return template.replace(/{id}/g, id.toString())
  }

  const updateInfo = async () => {
    setCollectionInfo({
      content: '',
      base: '',
      royalty: {
        royaltyFactor: 0,
        royaltyBase: 0,
        royaltyAddress: new Address(0, Buffer.from([])),
      },
      owner: new Address(0, Buffer.from([])),
      nftEditable: false,
      nextItemIndex: '-1',
    })

    let address: Address
    try {
      address = Address.parse(collectionAddress)
    } catch (e) {
      return
    }
    const account = await tonClient.value.getContractState(address)
    const info = await tonClient.value.callGetMethod(address, 'royalty_params')

    const [royaltyFactor, royaltyBase, royaltyAddress] = [
      info.stack.pop(),
      info.stack.pop(),
      info.stack.pop(),
    ] as [TupleItemInt, TupleItemInt, TupleItemSlice]
    console.log('info', info, royaltyAddress[1])
    const royaltyOwner = royaltyAddress.cell.beginParse().loadAddress()
    if (!royaltyOwner) {
      return
    }

    const royalty = {
      royaltyFactor: Number(royaltyFactor.value),
      royaltyBase: Number(royaltyBase.value),
      royaltyAddress: royaltyOwner,
    }

    const contentInfo = await tonClient.value.callGetMethod(address, 'get_collection_data')
    const [nextItemIndex, collectionContent, collectionOwner] = [
      contentInfo.stack.pop(),
      contentInfo.stack.pop(),
      contentInfo.stack.pop(),
    ] as [
      TupleItemInt, // bn
      TupleItemCell, // cell
      TupleItemSlice // slice
    ]
    const content = decodeOffChainContent(collectionContent.cell)

    const baseInfo = await tonClient.value.callGetMethod(address, 'get_nft_content', [
      {
        type: 'int',
        value: 0n,
      },
      { type: 'cell', cell: new Cell() },
    ])

    const cell = (baseInfo.stack.pop() as TupleItemCell).cell
    const baseContent = decodeOffChainContent(cell)

    setCollectionInfo({
      nextItemIndex: nextItemIndex.value.toString(),
      content,
      base: baseContent,
      royalty,
      owner: collectionOwner.cell.asSlice().loadAddress(),
      nftEditable: isNftCollectionNftEditable(Cell.fromBoc(account.data || Buffer.from([]))[0]),
    })
  }

  useEffect(() => {
    updateInfo()
  }, [collectionAddress])

  const [tonConnectUI] = useTonConnectUI()

  const mintContent = useMemo(() => {
    // const start = 0
    // const count = 400

    if (!count || count < 1 || count < start) {
      return []
    }

    // if (!collectionInfo.base) {
    //   return
    // }

    const messages: {
      address: string

      amount: string

      stateInit?: string

      payload?: string
    }[] = []

    const ids = [...Array(count - start)].map((_, i) => start + i)
    while (ids.length > 0) {
      const nftIds = ids.splice(0, 100)

      const mintBody = collectionInfo.nftEditable
        ? Queries.batchMintEditable({
            items: nftIds.map((i) => {
              return {
                passAmount: 10000000n,
                content: replaceId(template || '', i),
                index: i,
                ownerAddress: Address.parse(tonConnectUI.account?.address || ''),
                editorAddress: Address.parse(tonConnectUI.account?.address || ''),
              }
            }),
          })
        : Queries.batchMint({
            items: nftIds.map((i) => {
              return {
                passAmount: 10000000n,
                content: replaceId(template || '', i),
                index: i,
                ownerAddress: Address.parse(tonConnectUI.account?.address || ''),
              }
            }),
          })

      const messageValue = (10000000n + 17500000n) * BigInt(nftIds.length)
      messages.push({
        address: collectionAddress,
        amount: messageValue.toString(),
        payload: mintBody.toBoc().toString('base64'),
      })
    }

    return messages
  }, [start, count, template, collectionInfo, tonConnectUI.account])

  const sendTx = useCallback(() => {
    tonConnectUI.sendTransaction({
      messages: mintContent,
      validUntil: Math.floor(Date.now()) + 300,
    })
  }, mintContent)

  return (
    <div className="container mx-auto">
      <div className="">
        <div>
          <label htmlFor="collectionAddress">Collection Address:</label>
          <input
            className="w-full px-2 py-2 bg-gray-200 rounded"
            type="text"
            id="collectionAddress"
            value={collectionAddress}
            onChange={(e) => setCollectionAddress(e.target.value)}
          />
        </div>
      </div>

      <div className="py-2">
        <div className="flex">
          <div>
            <label htmlFor="collectionEditable">Collection Nfts Editable:</label>
            <input
              className="ml-2 bg-gray-200 rounded"
              type="checkbox"
              id="collectionEditable"
              checked={collectionInfo?.nftEditable}
              readOnly
            />
          </div>
        </div>

        <div>
          <label htmlFor="collectionBase">Collection Base:</label>
          <input
            className="w-full px-2 py-2 bg-gray-200 rounded"
            type="text"
            id="collectionBase"
            value={collectionInfo?.base}
            readOnly
          />
        </div>

        <div>
          <label htmlFor="collectionIndex">Next Item Index:</label>
          <input
            className="w-full px-2 py-2 bg-gray-200 rounded"
            type="text"
            id="collectionIndex"
            value={collectionInfo?.nextItemIndex}
            readOnly
          />
        </div>
      </div>

      <h3 className="font-bold text-lg">Mint settings:</h3>
      <div className="flex">
        <div>
          <label htmlFor="mintStart">Start from:</label>
          <input
            className="w-full px-2 py-2 bg-gray-200 rounded"
            type="number"
            id="mintStart"
            value={start}
            onChange={(e) => setStart(parseInt(e.target.value, 10) || 0)}
          />
        </div>
      </div>
      <div className="flex">
        <div>
          <label htmlFor="mintCount">Nfts to mint (max: 400):</label>
          <input
            className="w-full px-2 py-2 bg-gray-200 rounded"
            type="number"
            id="mintCount"
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value, 10) || 0)}
          />
        </div>
      </div>
      <div className="flex">
        <div>
          <label htmlFor="mintTemplate">
            Nft content template (replaces {'{id}'} with your nft id):
          </label>
          <input
            className="w-full px-2 py-2 bg-gray-200 rounded"
            type="text"
            id="mintTemplate"
            value={template || ''}
            onChange={(e) => setTemplate(e.target.value)}
          />
          <div>Result exaple: {replaceId(template, 1)}</div>
        </div>
      </div>

      <button onClick={sendTx} className="mt-4 px-4 py-2 rounded text-white bg-blue-600">
        Send Mint Tx
      </button>
    </div>
  )
}
