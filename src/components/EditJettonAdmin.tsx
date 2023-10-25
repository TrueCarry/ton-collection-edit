import BN from 'bn.js'
import { useEffect, useMemo, useState } from 'react'
import { Address } from 'ton-core'
import { ResultContainer } from './ResultContainer'

import { changeAdminBodyJetton } from '@/contracts/jetton/jetton-minter'
import { useTonClient } from '@/store/tonClient'

export function EditJettonAdmin() {
  const [jettonContractAddress, setJettonContractAddress] = useState('')
  const [adminAddress, setAdminAddress] = useState('')
  const tonClient = useTonClient()

  const updateInfo = async () => {
    let address: Address
    try {
      address = Address.parse(jettonContractAddress)
    } catch (e) {
      return
    }
    const info = await tonClient.value.callGetMethod(address, 'get_jetton_data')

    const contractAdminAddress = info.stack.readAddressOpt()

    if (contractAdminAddress) {
      setAdminAddress(contractAdminAddress?.toString({ bounceable: true, urlSafe: true }))
    }
  }
  useEffect(() => {
    updateInfo()
  }, [jettonContractAddress, tonClient])

  const deployParams = useMemo(() => {
    if (!adminAddress) {
      return
    }

    const message = changeAdminBodyJetton(Address.parse(adminAddress))

    return message
  }, [adminAddress])

  return (
    <div className="container mx-auto">
      <div>
        <label htmlFor="jettonContractAddress">jettonContractAddress:</label>
        <input
          className="w-full px-2 py-2 bg-gray-200 rounded"
          type="text"
          id="jettonContractAddress"
          value={jettonContractAddress}
          onChange={(e) => setJettonContractAddress(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="imageUrl">adminAddress:</label>
        <input
          className="w-full px-2 py-2 bg-gray-200 rounded"
          type="text"
          id="adminAddress"
          value={adminAddress}
          onChange={(e) => setAdminAddress(e.target.value)}
        />
      </div>

      {deployParams && (
        <>
          <ResultContainer
            address={jettonContractAddress}
            cell={deployParams}
            amount={new BN(100000000)}
          />
        </>
      )}
    </div>
  )
}
