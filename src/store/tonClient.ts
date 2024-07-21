import { hookstate, useHookstate } from '@hookstate/core'
import { TonClient } from 'ton'
import { Api, HttpClient } from 'tonapi-sdk-js'

const TonConnection = hookstate<TonClient>(
  new TonClient({
    endpoint: 'https://mainnet.tonhubapi.com/jsonRPC',
  })
)

export function useTonClient() {
  return useHookstate(TonConnection)
}

export function setTonClient(newClient: TonClient) {
  TonConnection.set(newClient)
}

const TonapiConnection = hookstate<Api<unknown>>(getTonapi(false))

export function useTonapiClient() {
  return useHookstate(TonapiConnection)
}

export function setTonapiClient(newClient: Api<unknown>) {
  TonapiConnection.set(newClient)
}

export { TonConnection }

export function getTonapi(isTestnet: boolean) {
  const mainnetRpc = 'https://tonapi.io'
  const testnetRpc = 'https://testnet.tonapi.io'
  const rpc = isTestnet ? testnetRpc : mainnetRpc

  // Configure the HTTP client with your host and token
  const httpClient = new HttpClient({
    baseUrl: rpc,
    baseApiParams: {
      headers: {
        // Authorization:
        // 'Bearer ',
        'Content-type': 'application/json',
      },
    },
  })

  // Initialize the API client
  const client = new Api(httpClient)
  return client
}
