import { RoyaltyParams } from '@/contracts/getgemsCollection/NftCollection.data'
import { decodeOffChainContent } from '@/contracts/nft-content/nftContent'
import { useTonClient } from '@/store/tonClient'
import BN from 'bn.js'
import { useEffect, useMemo, useState } from 'react'
import { Address, Cell } from 'ton'
import { ResultContainer } from './ResultContainer'

interface NftInfo {
  content: string
  royalty: RoyaltyParams
}

export function serializeUri(uri: string) {
  return new TextEncoder().encode(encodeURI(uri))
}

const OFF_CHAIN_CONTENT_PREFIX = 0x01

function bufferToChunks(buff: Buffer, chunkSize: number) {
  const chunks: Buffer[] = []
  while (buff.byteLength > 0) {
    chunks.push(buff.slice(0, chunkSize))
    buff = buff.slice(chunkSize)
  }
  return chunks
}

export function encodeOffChainContent(content: string) {
  let data = Buffer.from(content)
  const offChainPrefix = Buffer.from([OFF_CHAIN_CONTENT_PREFIX])
  data = Buffer.concat([offChainPrefix, data])
  return makeSnakeCell(data)
}

export function makeSnakeCell(data: Buffer) {
  const chunks = bufferToChunks(data, 127)
  const rootCell = new Cell()
  let curCell = rootCell

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]

    curCell.bits.writeBuffer(chunk)

    if (chunks[i + 1]) {
      const nextCell = new Cell()
      curCell.refs.push(nextCell)
      curCell = nextCell
    }
  }

  return rootCell
}

function CreateNftEditBody(
  itemContentUri: string,
  royaltyFactor: number,
  royaltyBase: number,
  royaltyAddress: Address,
  queryId?: number
) {
  const msgBody = new Cell()
  msgBody.bits.writeUint(0x1a0b9d51, 32)
  msgBody.bits.writeUint(queryId || 0, 64)

  const royaltyCell = new Cell()
  royaltyCell.bits.writeUint(royaltyFactor, 16)
  royaltyCell.bits.writeUint(royaltyBase, 16)
  royaltyCell.bits.writeAddress(royaltyAddress)

  const contentCell = encodeOffChainContent(itemContentUri)

  msgBody.refs.push(contentCell)
  msgBody.refs.push(royaltyCell)

  return msgBody
}

export function EditNftSingle() {
  const [nftAddress, setNftAddress] = useState('')
  const tonClient = useTonClient()

  const [nftInfo, setNftInfo] = useState<NftInfo>({
    content: '',
    royalty: {
      royaltyFactor: 0,
      royaltyBase: 0,
      royaltyAddress: Address.parse('0:0'),
    },
  })

  const updateInfo = async () => {
    setNftInfo({
      content: '',
      royalty: {
        royaltyFactor: 0,
        royaltyBase: 0,
        royaltyAddress: Address.parse('0:0'),
      },
    })

    const address = Address.parse(nftAddress)
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

    const contentInfo = await tonClient.value.callGetMethod(address, 'get_nft_data')
    const [, , , , nftContent] = contentInfo.stack as [
      string[], // bn
      string[], // bn
      string[], // bn
      any[], // cell
      any[] // slice
    ]
    const contentCell = Cell.fromBoc(Buffer.from(nftContent[1].bytes, 'base64'))[0]
    const content = decodeOffChainContent(contentCell)

    setNftInfo({
      content,
      royalty,
    })
  }

  useEffect(() => {
    updateInfo()
  }, [nftAddress])

  const [editContent, setEditContent] = useState(new Cell())
  useMemo(async () => {
    const data = CreateNftEditBody(
      nftInfo.content,
      nftInfo.royalty.royaltyFactor,
      nftInfo.royalty.royaltyBase,
      nftInfo.royalty.royaltyAddress
    )
    setEditContent(data)
  }, [nftAddress, nftInfo])

  return (
    <div>
      <div>
        Single NFT is nft without collection, meaning it has it's own royalty settings{' '}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/getgems-io/nft-contracts/blob/main/packages/contracts/sources/nft-single.fc"
        >
          nft-single.fc
        </a>
      </div>
      <div className="py-2">
        <div>
          <label htmlFor="nftAddress">Nft Address:</label>
          <input
            className="w-full px-2 py-2 bg-gray-200 rounded"
            type="text"
            id="nftAddress"
            value={nftAddress}
            onChange={(e) => setNftAddress(e.target.value)}
          />
        </div>
      </div>

      <div className="py-2">
        <div>
          <label htmlFor="newContent">New Content:</label>
          <input
            className="w-full px-2 py-2 bg-gray-200 rounded"
            type="text"
            id="newContent"
            value={nftInfo.content}
            onChange={(e) =>
              setNftInfo({
                ...nftInfo,
                content: e.target.value,
              })
            }
          />
        </div>

        {/* Royalty */}
        <div>
          <label htmlFor="royaltyFactor">Collection Royalty Factor:</label>
          <input
            className="w-full px-2 py-2 bg-gray-200 rounded"
            type="text"
            id="royaltyFactor"
            value={nftInfo.royalty.royaltyFactor}
            onChange={(e) =>
              setNftInfo({
                ...nftInfo,
                royalty: {
                  ...nftInfo.royalty,
                  royaltyFactor: parseInt(e.target.value) || 0,
                },
              })
            }
          />
        </div>
        <div>
          <label htmlFor="royaltyBase">Collection Royalty Base:</label>
          <input
            className="w-full px-2 py-2 bg-gray-200 rounded"
            type="text"
            id="royaltyBase"
            value={nftInfo.royalty.royaltyBase}
            onChange={(e) =>
              setNftInfo({
                ...nftInfo,
                royalty: {
                  ...nftInfo.royalty,
                  royaltyBase: parseInt(e.target.value) || 0,
                },
              })
            }
          />
        </div>
        <div>
          <label htmlFor="royaltyResult">Collection Resulting Royalty(Factor/Base):</label>
          <input
            className="w-full px-2 py-2 bg-gray-200 rounded"
            type="text"
            id="royaltyResult"
            value={`${nftInfo.royalty.royaltyFactor / nftInfo.royalty.royaltyBase} (${
              (nftInfo.royalty.royaltyFactor / nftInfo.royalty.royaltyBase) * 100
            }%)`}
            disabled
          />
        </div>

        <div>
          <label htmlFor="royaltyAddress">Collection Royalty Address:</label>
          <input
            className="w-full px-2 py-2 bg-gray-200 rounded"
            type="text"
            id="royaltyAddress"
            value={nftInfo.royalty.royaltyAddress.toFriendly({
              bounceable: true,
              urlSafe: true,
            })}
            onChange={(e) =>
              setNftInfo({
                ...nftInfo,
                royalty: {
                  ...nftInfo.royalty,
                  royaltyAddress: Address.parse(e.target.value),
                },
              })
            }
          />
        </div>
        {/* /Royalty */}
      </div>

      <div className="my-2">
        <button onClick={updateInfo} className="px-4 py-2 rounded  text-white bg-blue-600">
          Refresh
        </button>
      </div>

      <ResultContainer address={nftAddress} cell={editContent} amount={new BN('10000000')} />
    </div>
  )
}
