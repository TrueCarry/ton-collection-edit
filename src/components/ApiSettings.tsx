import { useTonClient } from '@/store/tonClient'
import { useState, useEffect } from 'react'
import { TonClient } from 'ton'

export function ApiSettings() {
  const [apiKey, setApiKey] = useState('')
  const [endpoint, setEndpoint] = useState('https://mainnet.tonhubapi.com/jsonRPC')

  const tonClient = useTonClient()

  useEffect(() => {
    tonClient.set(
      new TonClient({
        endpoint,
        apiKey,
      })
    )
  }, [apiKey, endpoint])

  return (
    <div className="my-2">
      <div>
        <label htmlFor="apiEndpointInput">API Endpoint:</label>
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
      </div>
    </div>
  )
}
