import { ApiSettings } from '../ApiSettings'
import { EditNftCollection } from '../EditNftCollection'
import { EditNftSingle } from '../EditNftSingle'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import 'react-tabs/style/react-tabs.css'

export function IndexPage() {
  return (
    <div className="container mx-auto pt-4 pb-12">
      <h2 className="text-lg font-bold mb-4">Nft Data Changer</h2>

      <ApiSettings />

      <Tabs>
        <TabList>
          <Tab>Edit Collection</Tab>
          <Tab>Edit Single Nft</Tab>
        </TabList>

        <TabPanel>
          <EditNftCollection />
        </TabPanel>
        <TabPanel>
          <EditNftSingle />
        </TabPanel>
      </Tabs>
    </div>
  )
}
