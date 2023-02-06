import { useTonClient } from '@/store/tonClient'
import { useEffect } from 'react'
import { TonClient } from 'ton'
import useLocalStorage from 'react-use-localstorage'
import { getHttpEndpoint } from '@orbs-network/ton-access'

export function ApiSettings() {
  // const [apiKey, setApiKey] = useLocalStorage('deployerApiKey', '')
  // const [endpoint, setEndpoint] = useLocalStorage(
  //   'deployerApiUrl',
  //   'https://mainnet.tonhubapi.com/jsonRPC'
  // )

  const [isTestnet, setTestnet] = useLocalStorage('deployerIsTestnet', 'false')

  const tonClient = useTonClient()

  useEffect(() => {
    console.log('change network')
    getHttpEndpoint({
      network: isTestnet === 'true' ? 'testnet' : 'mainnet',
    }).then((endpoint) => {
      tonClient.set(
        new TonClient({
          endpoint,
        })
      )
    })
  }, [isTestnet])

  // useEffect(() => {
  //   tonClient.set(
  //     new TonClient({
  //       endpoint,
  //       apiKey,
  //     })
  //   )
  // }, [apiKey, endpoint])

  return (
    <div className="my-2">
      <div>
        <label htmlFor="apiTestnetInput">Is Testnet:</label>
        <input
          className="ml-2 bg-gray-200 rounded"
          type="checkbox"
          id="apiTestnetInput"
          checked={isTestnet === 'true'}
          onChange={(e) => setTestnet(String(e.target.checked))}
        />
      </div>
      {/* <div>
        <label htmlFor="apiEndpointInput">API Endpoint:</label>
        <div className="text-sm text-gray-500 my-1">
          Mainnet: https://mainnet.tonhubapi.com/jsonRPC Testnet:
          https://testnet.tonhubapi.com/jsonRPC
        </div>
        <input
          className="w-full px-2 py-2 bg-gray-200 rounded"
          type="text"
          id="apiEndpointInput"
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="apiKeyInput">API Key:</label>
        <input
          className="w-full px-2 py-2 bg-gray-200 rounded"
          type="text"
          id="apiKeyInput"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
      </div> */}
    </div>
  )
}
