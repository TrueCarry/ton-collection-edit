import { IndexPage } from '@/components/IndexPage/IndexPage'
import { TonConnectUIProvider } from '@tonconnect/ui-react'
import React from 'react'

export function App() {
  return (
    <TonConnectUIProvider manifestUrl="https://minter.ton.org/tonconnect-manifest.json">
      <React.Suspense>{<IndexPage />}</React.Suspense>
    </TonConnectUIProvider>
  )
}
