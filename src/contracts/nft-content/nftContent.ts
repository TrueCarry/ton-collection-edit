import { beginCell, Cell, Dictionary } from 'ton-core'
// eslint-disable-next-line camelcase
import { sha256_sync } from 'ton-crypto'
import { NFTDictValueSerializer } from './nftDict'

export interface JettonContent {
  name?: string
  symbol?: string
  description?: string
  image?: string
  decimals?: string
  image_data?: string
  uri?: string
}

const OFF_CHAIN_CONTENT_PREFIX = 0x01

export function flattenSnakeCell(cell: Cell) {
  let c: Cell | null = cell

  let res = Buffer.alloc(0)

  while (c) {
    const cs = c.beginParse()
    if (cs.remainingBits === 0) {
      return res
    }
    if (cs.remainingBits % 8 !== 0) {
      throw Error('Number remaining of bits is not multiply of 8')
    }

    const data = cs.loadBuffer(cs.remainingBits / 8)
    res = Buffer.concat([res, data])
    c = c.refs && c.refs[0]
  }

  return res
}

function bufferToChunks(buff: Buffer, chunkSize: number) {
  const chunks: Buffer[] = []
  while (buff.byteLength > 0) {
    chunks.push(buff.slice(0, chunkSize))
    buff = buff.slice(chunkSize)
  }
  return chunks
}

export function makeSnakeCell(data: Buffer, addStartBit = false): Cell {
  const chunks = bufferToChunks(data, 126)

  if (chunks.length === 0) {
    return beginCell().endCell()
  }

  if (chunks.length === 1) {
    if (addStartBit) {
      return beginCell().storeUint(0, 8).storeBuffer(chunks[0]).endCell()
    }
    return beginCell().storeBuffer(chunks[0]).endCell()
  }

  let curCell = beginCell()

  for (let i = chunks.length - 1; i >= 0; i--) {
    const chunk = chunks[i]

    if (i === 0 && addStartBit) {
      curCell.storeUint(0, 8)
    }
    curCell.storeBuffer(chunk)

    if (i - 1 >= 0) {
      const nextCell = beginCell()
      nextCell.storeRef(curCell)
      curCell = nextCell
    }
  }

  return curCell.endCell()
}

export function encodeOffChainContent(content: string) {
  let data = Buffer.from(content)
  const offChainPrefix = Buffer.from([OFF_CHAIN_CONTENT_PREFIX])
  data = Buffer.concat([offChainPrefix, data])
  return makeSnakeCell(data)
}

export function decodeOffChainContent(content: Cell) {
  const data = flattenSnakeCell(content)

  const prefix = data[0]
  if (prefix !== OFF_CHAIN_CONTENT_PREFIX) {
    throw new Error(`Unknown content prefix: ${prefix.toString(16)}`)
  }
  return data.slice(1).toString()
}

const jettonKeys = [
  'image', // img
  'name',
  'description',
  // 'content_url',
  'decimals',
  'symbol',
  'image_data',
  'uri',
]

const jettonHashKeys = jettonKeys.map(sha256_sync)

export function parseJettonContent(content: Cell) {
  const data = content.asSlice()
  const contentType = data.preloadUint(8)

  const result: JettonContent = {}

  if (contentType === 0) {
    data.skip(8)
    const dict = data.loadDict(Dictionary.Keys.Buffer(32), NFTDictValueSerializer)

    for (const [i, key] of jettonKeys.entries()) {
      const dictKey = jettonHashKeys[i]
      const dictValue = dict.get(dictKey)
      console.log('key', i, key, dictValue)
      if (dictValue) {
        result[key] = dictValue.content.toString('utf-8')
      }
    }
  }

  if (!result.decimals) {
    result.decimals = '9'
  }

  return result
}
