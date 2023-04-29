import { buildTelemintNumbersMint } from '@/contracts/telemintNumbers/TelemintNumbersCollection.data'
import BN from 'bn.js'
import { useMemo, useState } from 'react'
import { Address } from 'ton-core'
import { ResultContainer } from './ResultContainer'

export function DeployTelemintNumbersNft() {
  const [nftInfo, setNftInfo] = useState<{ tokenName: string; privateKey: string }>({
    tokenName: '',
    privateKey: '',
  })

  const mintMessage = useMemo(() => {
    const now = Math.floor(Date.now() / 1000)
    const data = buildTelemintNumbersMint({
      auctionConfig: {
        beneficiaryAddress: Address.parse('EQCcqOsY-a6sKM55KoZZMR28OmRfAAPpLgOi5Cb-wtk0pfb_'),
        duration: 60,
        initialMinBid: 3 * 10 ** 9,
        maxBid: 3 * 10 ** 9,
        minBidStep: 5,
        minExtendTime: 1,
      },
      content: `https://nft.fragment.com/number/${nftInfo.tokenName}.json`,
      subwalletId: 12,
      tokenName: nftInfo.tokenName,
      validFrom: now - 60,
      validTill: now + 300,
      privateKey: nftInfo.privateKey,
    })

    return data
  }, [nftInfo])

  const collectionAddress = useMemo(() => {
    return Address.parse('EQAkbtP0GVVU_9thj0dJLwRCzSop4UoUWG03xdIy7CuUOmfH')
  }, [])

  return (
    <div className="container mx-auto">
      <div>
        <label htmlFor="newContent">TokenName:</label>
        <input
          className="w-full px-2 py-2 bg-gray-200 rounded"
          type="text"
          id="newContent"
          value={nftInfo.tokenName}
          onChange={(e) =>
            setNftInfo({
              ...nftInfo,
              tokenName: e.target.value,
            })
          }
        />
      </div>

      <div>
        <label htmlFor="privateKey">Private Key:</label>
        <input
          className="w-full px-2 py-2 bg-gray-200 rounded"
          type="text"
          id="privateKey"
          value={nftInfo.privateKey}
          onChange={(e) =>
            setNftInfo({
              ...nftInfo,
              privateKey: e.target.value,
            })
          }
        />
      </div>

      <ResultContainer
        address={collectionAddress.toRawString()}
        cell={mintMessage}
        amount={new BN('3000000000')}
      />
    </div>
  )
}
