import { IndexPage } from '@/components/IndexPage/IndexPage'
import { TonConnectUIProvider } from '@tonconnect/ui-react'
import React from 'react'

export function App() {
  return (
    <TonConnectUIProvider
      manifestUrl="https://minter.ton.org/tonconnect-manifest.json"
      walletsListConfiguration={{
        includeWallets: [
          {
            name: 'TonDevWallet',
            aboutUrl: 'https://github.com/tondevwallet/tondevwallet',
            bridgeUrl: 'https://bridge.tonapi.io/bridge',
            deepLink: 'tondevwallet://connect/',
            imageUrl:
              'https://raw.githubusercontent.com/TonDevWallet/TonDevWallet/main/src-tauri/icons/Square284x284Logo.png',
            universalLink: 'tondevwallet://connect/',
            appName: 'TonDevWallet',
            platforms: ['ios', 'android', 'macos', 'windows', 'linux'],
          },
        ],
      }}
    >
      <React.Suspense>{<IndexPage />}</React.Suspense>
    </TonConnectUIProvider>
  )
}
