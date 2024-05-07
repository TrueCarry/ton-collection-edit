import {TransferJetton} from "@/components/TransferJetton";
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
import { DeployVanityContract } from '../DeployVanityContract'
import { DeployJetton } from '../DeployJetton'
import { EditJetton } from '../EditJetton'
import { EditJettonAdmin } from '../EditJettonAdmin'
import { SendManyNfts } from '../SendManyNfts'
import { EditNftEditable } from '../EditNftEditable'

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
          <Tab>Edit Editable Nft</Tab>

          {/* <Tab>Deploy Telemint Numbers Collection</Tab> */}
          <Tab>Deploy Telemint Numbers Nft</Tab>

          <Tab>Deploy Jetton</Tab>
          <Tab>Edit Jetton</Tab>
          <Tab>Edit Jetton Admin</Tab>
          <Tab>Transfer Jetton</Tab>

          <Tab>Deploy Vanity Contract</Tab>

          <Tab>Send Many Nfts</Tab>
        </TabList>

        <TabPanel forceRender={true}>
          <DeployCollection />
        </TabPanel>
        <TabPanel forceRender={true}>
          <DeployNfts />
        </TabPanel>
        <TabPanel forceRender={true}>
          <EditNftCollection />
        </TabPanel>
        <TabPanel forceRender={true}>
          <EditNftCollectionOwner />
        </TabPanel>
        <TabPanel forceRender={true}>
          <EditNftSingle />
        </TabPanel>
        <TabPanel forceRender={true}>
          <EditNftEditable />
        </TabPanel>

        {/* <TabPanel>
          <DeployTelemintNumbersCollection />
        </TabPanel> */}
        <TabPanel forceRender={true}>
          <DeployTelemintNumbersNft />
        </TabPanel>

        <TabPanel forceRender={true}>
          <DeployJetton />
        </TabPanel>
        <TabPanel forceRender={true}>
          <EditJetton />
        </TabPanel>
        <TabPanel forceRender={true}>
          <EditJettonAdmin />
        </TabPanel>
        <TabPanel forceRender={true}>
          <TransferJetton />
        </TabPanel>

        <TabPanel forceRender={true}>
          <DeployVanityContract />
        </TabPanel>

        <TabPanel forceRender={true}>
          <SendManyNfts />
        </TabPanel>
      </Tabs>
    </div>
  )
}
