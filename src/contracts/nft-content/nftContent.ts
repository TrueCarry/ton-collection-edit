import { Cell } from 'ton'

const OFF_CHAIN_CONTENT_PREFIX = 0x01

export function flattenSnakeCell(cell: Cell) {
  let c: Cell | null = cell

  let res = Buffer.alloc(0)

  while (c) {
    const cs = c.beginParse()
    const data = cs.readRemainingBytes()
    res = Buffer.concat([res, data])
    c = c.refs[0]
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
