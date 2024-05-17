import { useMemo, useState } from 'react'
import { beginCell, toNano } from 'ton'
import { ResultContainer } from './ResultContainer'

function ChangeNftSalePriceBody(params: {
  price: bigint
  marketplaceFee: bigint
  royaltyAmount: bigint
}) {
  const msgBody = beginCell()
  msgBody.storeUint(0x6c6c2080, 32)
  msgBody.storeUint(0, 64) // query id
  msgBody.storeCoins(params.price)
  msgBody.storeCoins(params.marketplaceFee)
  msgBody.storeCoins(params.royaltyAmount)

  return msgBody.endCell()
}

export function EditNftSalePrice() {
  const [nftSaleAddress, setNftSaleAddress] = useState('')
  const [newPrice, setNewPrice] = useState('0')
  const [newMarketplaceFee, setNewMarketplaceFee] = useState('0')
  const [newRoyaltyAmount, setNewRoyaltyAmount] = useState('0')

  const updateMessageCell = useMemo(() => {
    try {
      return ChangeNftSalePriceBody({
        price: toNano(newPrice),
        marketplaceFee: toNano(newMarketplaceFee),
        royaltyAmount: toNano(newRoyaltyAmount),
      })
    } catch (e) {
      return beginCell().endCell()
    }
  }, [nftSaleAddress, newPrice, newMarketplaceFee, newRoyaltyAmount])

  return (
    <div>
      <div>Nft Sale V3R3 allows to change price without redeploy</div>
      <div className="py-2">
        <div>
          <label htmlFor="nftSaleAddress">Nft Sale Address:</label>
          <input
            className="w-full px-2 py-2 bg-gray-200 rounded"
            type="text"
            id="nftSaleAddress"
            value={nftSaleAddress}
            onChange={(e) => setNftSaleAddress(e.target.value)}
          />
        </div>
      </div>

      <div className="py-2">
        <div>
          <label htmlFor="newPrice">New Price:</label>
          <input
            className="w-full px-2 py-2 bg-gray-200 rounded"
            type="text"
            id="newPrice"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="newMarketplaceFee">New Marketplace Fee:</label>
          <input
            className="w-full px-2 py-2 bg-gray-200 rounded"
            type="text"
            id="newMarketplaceFee"
            value={newMarketplaceFee}
            onChange={(e) => setNewMarketplaceFee(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="newRoyaltyAmount">New Royalty Amount:</label>
          <input
            className="w-full px-2 py-2 bg-gray-200 rounded"
            type="text"
            id="newRoyaltyAmount"
            value={newRoyaltyAmount}
            onChange={(e) => setNewRoyaltyAmount(e.target.value)}
          />
        </div>
      </div>

      <ResultContainer address={nftSaleAddress} cell={updateMessageCell} amount={10000000n} />
    </div>
  )
}
