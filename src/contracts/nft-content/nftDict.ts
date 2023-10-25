import { Builder, Dictionary, Slice } from 'ton-core'
import { flattenSnakeCell, makeSnakeCell } from './nftContent'

interface ChunkDictValue {
  content: Buffer
}

interface NFTDictValue {
  content: Buffer
}

export const ChunkDictValueSerializer = {
  serialize(src: ChunkDictValue, builder: Builder) {
    builder.storeRef(makeSnakeCell(src.content))
  },
  parse(src: Slice): ChunkDictValue {
    const snake = flattenSnakeCell(src.loadRef())
    return { content: snake }
  },
}

export const NFTDictValueSerializer = {
  serialize(src: NFTDictValue, builder: Builder) {
    builder.storeRef(makeSnakeCell(src.content, true))
  },
  parse(src: Slice): NFTDictValue {
    console.log('parse', src)
    const ref = src.loadRef().asSlice()
    console.log('ref', ref)

    const start = ref.loadUint(8)
    console.log('start', start)
    if (start === 0) {
      const snake = flattenSnakeCell(ref.asCell())
      return { content: snake }
    }

    if (start === 1) {
      return { content: ParseChunkDict(ref) }
    }

    return { content: Buffer.from([]) }
  },
}

export function ParseChunkDict(cell: Slice): Buffer {
  const dict = cell.loadDict(Dictionary.Keys.Uint(32), ChunkDictValueSerializer)

  let buf = Buffer.alloc(0)
  for (const [, v] of dict) {
    buf = Buffer.concat([buf, v.content])
  }
  return buf
}
