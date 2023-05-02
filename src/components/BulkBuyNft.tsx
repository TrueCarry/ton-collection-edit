import BN from 'bn.js'
import { useMemo, useState } from 'react'
import { Address, beginCell, Cell, contractAddress, storeStateInit, toNano } from 'ton-core'
import { ResultContainer } from './ResultContainer'
import { BulkBuy } from '@/contracts/bulkBuy/BulkBuy'
import { BulkBuyCodeBocCodeCell } from '@/contracts/bulkBuy/BulkBuy.source'
import { useTonAddress } from '@tonconnect/ui-react'

interface buyNftRow {
  nftAddress: string
  saleAddress: string
  buyAmount: number
}

export function BulkBuyNft() {
  const userAddress = useTonAddress(true)

  const [nftsToBuy, setNftsToBuy] = useState<Array<buyNftRow>>([
    {
      buyAmount: 1,
      nftAddress: '',
      saleAddress: '',
    },
  ])

  const addNftToBuy = () => {
    setNftsToBuy([
      ...nftsToBuy,
      {
        buyAmount: 1,
        nftAddress: '',
        saleAddress: '',
      },
    ])
  }

  const [editContent, setEditContent] = useState<{
    body: Cell
    value: bigint
    init?: Cell
    address?: Address
  }>({
    body: new Cell(),
    value: 0n,
  })
  useMemo(async () => {
    const totalAmount = toNano(
      nftsToBuy.reduce((c, n) => c + n.buyAmount, 0) + 2 * nftsToBuy.length
    )
    const data = BulkBuy.createBuyBody({
      totalCount: nftsToBuy.length,
      totalAmount,
      buyArray: nftsToBuy.map((n) => ({
        buyAmount: toNano(n.buyAmount),
        nftAddress: Address.parse(n.nftAddress),
        saleAddress: Address.parse(n.saleAddress),
      })),
    })
    const init = BulkBuy.createFromConfig(
      {
        buyCount: nftsToBuy.length,
        responseCount: 0,
        userAddress: Address.parse(userAddress),
        createdAt: Math.floor(Date.now() / 1000),
      },
      BulkBuyCodeBocCodeCell,
      0
    )

    if (!init.init) {
      throw new Error('No contract init')
    }

    console.log('buy', nftsToBuy, totalAmount, userAddress)
    setEditContent({
      body: data,
      value: totalAmount,
      init: beginCell().store(storeStateInit(init.init)).endCell(),
      address: contractAddress(0, init.init),
    })
  }, [nftsToBuy])

  return (
    <div>
      <div>Buy many nfts with one transaction</div>

      <div className="py-2">
        {nftsToBuy.map((row, i) => (
          <div key={i} className="p-2 my-2">
            <div>Nft #{i + 1}</div>
            <div>
              <label htmlFor="">Nft Address:</label>
              <input
                className="w-full px-2 py-2 bg-gray-200 rounded"
                type="text"
                id=""
                value={row.nftAddress}
                onChange={(e) => {
                  const data = [...nftsToBuy]
                  data[i].nftAddress = e.target.value
                  setNftsToBuy(data)
                }}
              />
            </div>

            <div>
              <label htmlFor="">Sale Address:</label>
              <input
                className="w-full px-2 py-2 bg-gray-200 rounded"
                type="text"
                id=""
                value={row.saleAddress}
                onChange={(e) => {
                  const data = [...nftsToBuy]
                  data[i].saleAddress = e.target.value
                  setNftsToBuy(data)
                }}
              />
            </div>

            <div>
              <label htmlFor="">Buy Amount:</label>
              <input
                className="w-full px-2 py-2 bg-gray-200 rounded"
                type="text"
                id=""
                value={row.buyAmount}
                onChange={(e) => {
                  const data = [...nftsToBuy]
                  data[i].buyAmount = parseInt(e.target.value)
                  setNftsToBuy(data)
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="my-2">
        Add Nft To Buy:
        <button className="px-4 py-2 rounded text-white bg-blue-600" onClick={addNftToBuy}>
          addNftToBuy
        </button>
      </div>
      {/* 
      <div className="my-2">
        <button onClick={updateInfo} className="px-4 py-2 rounded text-white bg-blue-600">
          Refresh
        </button>
      </div> */}

      <ResultContainer
        address={editContent.address?.toString({ urlSafe: true, bounceable: true }) || ''}
        cell={editContent.body}
        amount={new BN(editContent.value.toString())}
        init={editContent.init || new Cell()}
      />
    </div>
  )
}
