import { ApiSettings } from '../ApiSettings'
import { EditNftCollection } from '../EditNftCollection'
import { EditNftSingle } from '../EditNftSingle'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import 'react-tabs/style/react-tabs.css'
import { EditNftCollectionOwner } from '../EditNftCollectionOwner'
import { DeployCollection } from '../DeployCollection'
import { TonConnectButton } from '@tonconnect/ui-react'
import { DeployNfts } from '../DeployNfts'
import { DeployTelemintNumbersNft } from '../DeployTelemintNumbersNft'
import { BulkBuyNft } from '../BulkBuyNft'

export function IndexPage() {
  return (
    <div className="container mx-auto pt-4 pb-12">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold mb-4">Nft collection tools</h2>
        <div>
          <TonConnectButton />
        </div>
      </div>

      <ApiSettings />

      <Tabs>
        <TabList>
          <Tab>Deploy Collection</Tab>
          <Tab>Deploy Nfts</Tab>
          <Tab>Edit Collection</Tab>
          <Tab>Edit Collection Owner</Tab>
          <Tab>Edit Single Nft</Tab>
          <Tab>Buy many NFTs</Tab>

          {/* <Tab>Deploy Telemint Numbers Collection</Tab> */}
          <Tab>Deploy Telemint Numbers Nft</Tab>
        </TabList>

        <TabPanel>
          <DeployCollection />
        </TabPanel>
        <TabPanel>
          <DeployNfts />
        </TabPanel>
        <TabPanel>
          <EditNftCollection />
        </TabPanel>
        <TabPanel>
          <EditNftCollectionOwner />
        </TabPanel>
        <TabPanel>
          <EditNftSingle />
        </TabPanel>

        <TabPanel>
          <BulkBuyNft />
        </TabPanel>

        {/* <TabPanel>
          <DeployTelemintNumbersCollection />
        </TabPanel> */}
        <TabPanel>
          <DeployTelemintNumbersNft />
        </TabPanel>
      </Tabs>
    </div>
  )
}
