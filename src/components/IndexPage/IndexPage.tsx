import { Queries, RoyaltyParams } from '@/contracts/getgemsCollection/NftCollection.data'
import { decodeOffChainContent } from '@/contracts/nft-content/nftContent'
// import { Queries } from '@/contracts/NftFixpriceSaleV2.data'
import { useTonClient } from '@/store/tonClient'
import BN from 'bn.js'
import { useEffect, useMemo, useState } from 'react'
import { Address, Cell, TonClient } from 'ton'
import QRCodeStyling from 'qr-code-styling'
import clsx from 'clsx'

interface CollectionInfo {
  content: string
  base: string
  royalty: RoyaltyParams
}
export function IndexPage() {
  const [collectionAddress, setCollectionAddress] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [endpoint, setEndpoint] = useState('https://mainnet.tonhubapi.com/jsonRPC')
  const [collectionInfo, setCollectionInfo] = useState<CollectionInfo>({
    content: '',
    base: '',
    royalty: {
      royaltyFactor: 0,
      royaltyBase: 0,
      royaltyAddress: Address.parse('0:0'),
    },
  })

  const [tonkeeperCode] = useState(
    new QRCodeStyling({
      width: 300,
      height: 300,
      margin: 0,
      type: 'canvas',
      data: 'https://app.tonkeeper.com/transfer/',
      dotsOptions: {
        color: '#000',
        type: 'extra-rounded',
      },
      backgroundOptions: {
        color: '#e9ebee',
      },
      cornersSquareOptions: {
        type: 'extra-rounded',
      },
    })
  )
  const [tonhubCode] = useState(
    new QRCodeStyling({
      width: 300,
      height: 300,
      margin: 0,
      type: 'canvas',
      data: 'https://tonhub.com/transfer/',
      dotsOptions: {
        color: '#000',
        type: 'extra-rounded',
      },
      backgroundOptions: {
        color: '#e9ebee',
      },
      cornersSquareOptions: {
        type: 'extra-rounded',
      },
    })
  )

  const tonClient = useTonClient()

  useEffect(() => {
    tonClient.set(
      new TonClient({
        endpoint,
        apiKey,
      })
    )
  }, [apiKey, endpoint])

  console.log('bn', new BN('1', 'hex'))

  const updateInfo = async () => {
    setCollectionInfo({
      content: '',
      base: '',
      royalty: {
        royaltyFactor: 0,
        royaltyBase: 0,
        royaltyAddress: Address.parse('0:0'),
      },
    })

    const address = Address.parse(collectionAddress)
    const info = await tonClient.value.callGetMethod(address, 'royalty_params')

    const [royaltyFactor, royaltyBase, royaltyAddress] = info.stack as [string[], string[], any[]]
    console.log('info', info, royaltyAddress[1])
    const addressCell = Cell.fromBoc(Buffer.from(royaltyAddress[1].bytes, 'base64'))[0]
    const royaltyOwner = addressCell.beginParse().readAddress()
    if (!royaltyOwner) {
      return
    }

    const royalty = {
      royaltyFactor: new BN(royaltyFactor[1].slice(2), 'hex').toNumber(),
      royaltyBase: new BN(royaltyBase[1].slice(2), 'hex').toNumber(),
      royaltyAddress: royaltyOwner,
    }

    const contentInfo = await tonClient.value.callGetMethod(address, 'get_collection_data')
    const [, collectionContent] = contentInfo.stack as [
      string[], // bn
      any[], // cell
      any[] // slice
    ]
    const contentCell = Cell.fromBoc(Buffer.from(collectionContent[1].bytes, 'base64'))[0]
    const content = decodeOffChainContent(contentCell)

    const baseInfo = await tonClient.value.callGetMethod(address, 'get_nft_content', [
      ['num', '0'],
      ['tvm.Cell', new Cell().toBoc({ idx: false }).toString('base64')],
    ])
    const baseCell = Cell.fromBoc(Buffer.from(baseInfo.stack[0][1].bytes, 'base64'))[0]
    const baseContent = decodeOffChainContent(baseCell)
    console.log('baseInfo', baseInfo, baseContent)

    setCollectionInfo({
      content,
      base: baseContent,
      royalty,
    })
  }

  useEffect(() => {
    updateInfo()
  }, [collectionAddress])

  const setRoyalty = (data: string) => {
    const royalty = parseFloat(data)
    // if (!royalty) {
    //   return
    // }
    const base = 1000
    const factor = Math.floor(base * royalty)

    setCollectionInfo({
      ...collectionInfo,
      royalty: {
        ...collectionInfo.royalty,
        royaltyBase: base,
        royaltyFactor: factor,
      },
      // content: e.target.value,
    })
  }

  const editContent = useMemo(() => {
    return Queries.editContent({
      collectionContent: collectionInfo.content,
      commonContent: collectionInfo.base,
      royaltyParams: {
        royaltyAddress: collectionInfo.royalty.royaltyAddress,
        royaltyBase: collectionInfo.royalty.royaltyBase,
        royaltyFactor: collectionInfo.royalty.royaltyFactor,
      },
    })
  }, [collectionInfo])

  useEffect(() => {
    //   // const qrcode =
    tonkeeperCode.append(document.getElementById('canvas') as HTMLElement)
    tonhubCode.append(document.getElementById('canvas2') as HTMLElement)
  })

  useEffect(() => {
    console.log('add qr')
    // const qrcode = new QRCodeStyling()
    console.log('qr ready')

    const binData = editContent.toBoc().toString('base64').replace(/\//g, '_').replace(/\+/g, '-')

    tonkeeperCode.update({
      data: `https://app.tonkeeper.com/transfer/${collectionAddress}?amount=10000000&bin=${binData}`,
    })
    tonhubCode.update({
      data: `https://tonhub.com/transfer/${collectionAddress}?amount=10000000&bin=${binData}`,
    })

    // tonhub.com/transfer/

    console.log('qr render', document.getElementById('canvas'))
  }, [editContent])

  return (
    <div className="container mx-auto pt-4">
      <h3>Collection Data Changer</h3>

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

      <div className="py-2">
        <div>
          <label htmlFor="collectionAddress">Collection Address:</label>
          <input
            className="w-full px-2 py-2 bg-gray-200 rounded"
            type="text"
            id="collectionAddress"
            value={collectionAddress}
            onChange={(e) => setCollectionAddress(e.target.value)}
          />
        </div>
      </div>
      {collectionInfo.base && (
        <>
          <div className="py-2">
            <div>Collection Info:</div>
            <div>
              <label htmlFor="collectionContent">Collection Content:</label>
              <input
                className="w-full px-2 py-2 bg-gray-200 rounded"
                type="text"
                id="collectionContent"
                value={collectionInfo?.content}
                onChange={(e) =>
                  setCollectionInfo({
                    ...collectionInfo,
                    content: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label htmlFor="collectionBase">Collection Base:</label>
              <input
                className="w-full px-2 py-2 bg-gray-200 rounded"
                type="text"
                id="collectionBase"
                value={collectionInfo?.base}
                onChange={(e) =>
                  setCollectionInfo({
                    ...collectionInfo,
                    base: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label htmlFor="royaltyFactor">Collection Royalty Factor:</label>
              <input
                className="w-full px-2 py-2 bg-gray-200 rounded"
                type="text"
                id="royaltyFactor"
                value={collectionInfo.royalty.royaltyFactor / collectionInfo.royalty.royaltyBase}
                onChange={(e) => setRoyalty(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="royaltyAddress">Collection Royalty Address:</label>
              <input
                className="w-full px-2 py-2 bg-gray-200 rounded"
                type="text"
                id="royaltyAddress"
                value={collectionInfo.royalty.royaltyAddress.toFriendly({
                  bounceable: true,
                  urlSafe: true,
                })}
                onChange={(e) =>
                  setCollectionInfo({
                    ...collectionInfo,
                    royalty: {
                      ...collectionInfo.royalty,
                      royaltyAddress: Address.parse(e.target.value),
                    },
                  })
                }
              />
            </div>
          </div>
        </>
      )}
      <div>
        <button onClick={updateInfo} className="px-4 py-2 rounded  text-white bg-blue-600">
          Refresh
        </button>
      </div>
      <div className={clsx('flex', collectionInfo.base ? '' : 'hidden')}>
        <div>
          Tonkeeper:
          <div id="canvas" className="overflow-hidden w-[300px] h-[300px] flex"></div>
        </div>
        <div>
          Tonhub:
          <div id="canvas2" className="overflow-hidden w-[300px] h-[300px] flex"></div>
        </div>
      </div>
      {/* {JSON.stringify(collectionInfo)} */}
    </div>
  )
}
