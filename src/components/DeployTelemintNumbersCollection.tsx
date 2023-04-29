import {
  buildTelemintNumbersCollectionStateInit,
  TelemintNumbersCollectionData,
} from '@/contracts/telemintNumbers/TelemintNumbersCollection.data'
import { TelemintNumbersNftCodeCell } from '@/contracts/telemintNumbers/TelemintNumbersCollection.source'
import BN from 'bn.js'
import { useMemo, useState } from 'react'
import { Address, Cell } from 'ton-core'
import { ResultContainer } from './ResultContainer'

export function DeployTelemintNumbersCollection() {
  const [collectionInfo] = useState<TelemintNumbersCollectionData>({
    touched: true,
    subwalletId: 12,
    ownerKey: Buffer.from(
      'b1cde06b529218348e76ab0d88efff41bd6c303b814b288811716289c7793fc8',
      'hex'
    ),
    content: 'https://nft.fragment.com/numbers.json',
    itemCode: TelemintNumbersNftCodeCell,
    fullDomain: Cell.fromBase64('te6cckEBAQEABAAABAEApA/l1g=='),
    royaltyParams: {
      numerator: 5,
      denominator: 100,
      destination: Address.parse('EQCcqOsY-a6sKM55KoZZMR28OmRfAAPpLgOi5Cb-wtk0pfb_'),
    },
  })

  const collectionInit = useMemo(() => {
    const init = buildTelemintNumbersCollectionStateInit(collectionInfo)

    return init
  }, [collectionInfo])

  const collectionAddress = useMemo(() => {
    return collectionInit ? collectionInit.address : new Address(0, Buffer.from([]))
  }, [collectionInit])

  return (
    <div className="container mx-auto">
      <div className="">
        <div>
          <label htmlFor="collectionAddress">Collection Address:</label>
          <input
            className="w-full px-2 py-2 bg-gray-200 rounded"
            type="text"
            id="collectionAddress"
            value={collectionAddress.toString({ bounceable: true, urlSafe: true })}
            readOnly
          />
        </div>
      </div>

      <ResultContainer
        address={collectionAddress.toRawString()}
        cell={new Cell()}
        amount={new BN('10000000')}
        init={collectionInit.stateInit}
      />
    </div>
  )
}
