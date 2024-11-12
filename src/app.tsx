import { IndexPage } from '@/components/IndexPage/IndexPage'
import { TonConnectUIProvider } from '@tonconnect/ui-react'
import React, { useEffect } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { MainLayout } from '@/components/MainLayout'
import { DeployCollection } from '@/components/DeployCollection'
import { DeployNfts } from '@/components/DeployNfts'
import { DeployJetton } from '@/components/DeployJetton'
import { EditNftEditable } from '@/components/EditNftEditable'
import { EditNftSingle } from '@/components/EditNftSingle'
import { EditNftCollection } from '@/components/EditNftCollection'
import { EditNftCollectionOwner } from '@/components/EditNftCollectionOwner'
import { EditJetton } from '@/components/EditJetton'
import { EditJettonAdmin } from '@/components/EditJettonAdmin'
import { EditNftSalePrice } from '@/components/EditNftSalePrice'
import { SendManyNfts } from '@/components/SendManyNfts'
import { DeployVanityContract } from '@/components/DeployVanityContract'
import { TransferJetton } from '@/components/TransferJetton'
import { UserJettons } from './components/UserJettons'
import { TransferNft } from '@/components/TransferNft'
import { DeployNftSingle } from './components/DeployNftSingle'

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <IndexPage /> },
      { path: 'deploy-collection', element: <DeployCollection /> },
      { path: 'deploy-nfts', element: <DeployNfts /> },
      { path: 'deploy-nft-single', element: <DeployNftSingle /> },
      { path: 'deploy-jetton', element: <DeployJetton /> },
      { path: 'edit-nft-editable', element: <EditNftEditable /> },
      { path: 'edit-nft-single', element: <EditNftSingle /> },
      { path: 'edit-nft-collection', element: <EditNftCollection /> },
      { path: 'edit-nft-collection-owner', element: <EditNftCollectionOwner /> },
      { path: 'edit-jetton', element: <EditJetton /> },
      { path: 'edit-jetton-admin', element: <EditJettonAdmin /> },
      { path: 'edit-nft-sale-price', element: <EditNftSalePrice /> },
      { path: 'send-many-nfts', element: <SendManyNfts /> },
      { path: 'deploy-vanity-contract', element: <DeployVanityContract /> },
      { path: 'transfer-jetton', element: <TransferJetton /> },
      { path: 'user-jettons', element: <UserJettons /> },
      { path: 'transfer-nft', element: <TransferNft /> },
    ],
  },
])

export function App() {
  useEffect(() => {
    if (window.location.href === 'https://truecarry.github.io/ton-collection-edit/') {
      window.location.href = 'https://ton-collection-edit.vercel.app/'
    }
  }, [])

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
      <React.Suspense fallback={<div>Loading...</div>}>
        <RouterProvider router={router} />
      </React.Suspense>
    </TonConnectUIProvider>
  )
}
