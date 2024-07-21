import { Cell, beginCell, Address, toNano, Dictionary } from 'ton-core'

// eslint-disable-next-line camelcase
import { sha256_sync as sha256 } from 'ton-crypto'

import walletHex from '@/contracts/jetton/jetton-wallet.compiled'
import minterHex from '@/contracts/jetton/jetton-minter.compiled'
import { NFTDictValueSerializer } from '@/contracts/nft-content/nftDict'

export const JETTON_DEPLOY_GAS = 250000000 // toNano(0.25)

export type JettonMetaDataKeys =
  | 'name'
  | 'description'
  | 'image'
  | 'symbol'
  | 'image_data'
  | 'decimals'

const jettonOnChainMetadataSpec: {
  [key in JettonMetaDataKeys]: 'utf8' | 'ascii' | undefined
} = {
  name: 'utf8',
  description: 'utf8',
  image: 'ascii',
  decimals: 'utf8',
  symbol: 'utf8',
  image_data: undefined,
}

const ONCHAIN_CONTENT_PREFIX = 0x00
const OFFCHAIN_CONTENT_PREFIX = 0x01

export const JETTON_WALLET_CODE = Cell.fromBoc(Buffer.from(walletHex.hex, 'hex'))[0]
export const JETTON_MINTER_CODE = Cell.fromBoc(Buffer.from(minterHex.hex, 'hex'))[0] // code cell from build output

interface JettonDeployParams {
  onchainMetaData?: {
    name: string
    symbol: string
    description?: string
    image?: string
    decimals?: string
  }
  offchainUri?: string
  owner: Address
  amountToMint: bigint
}

export function createJettonDeployParams(params: JettonDeployParams, offchainUri?: string) {
  const queryId = 0

  return {
    code: JETTON_MINTER_CODE,
    data: initJettonData(params.owner, params.onchainMetaData, offchainUri),
    deployer: params.owner,
    value: JETTON_DEPLOY_GAS,
    message: mintJettonBody(params.owner, params.amountToMint, 20000000n, queryId),
  }
}

// const SNAKE_PREFIX = 0x00

// export const JETTON_WALLET_CODE = Cell.fromBoc(Buffer.from(walletHex.hex, 'hex'))[0]
// export const JETTON_MINTER_CODE = Cell.fromBoc(Buffer.from(minterHex.hex, 'hex'))[0] // code cell from build output

enum OPS {
  ChangeAdmin = 3,
  ReplaceMetadata = 4,
  Mint = 21,
  InternalTransfer = 0x178d4519,
  Transfer = 0xf8a7ea5,
  Burn = 0x595f07bc,
}

// export type JettonMetaDataKeys =
//   | 'name'
//   | 'description'
//   | 'image'
//   | 'symbol'
//   | 'image_data'
//   | 'decimals'

// const jettonOnChainMetadataSpec: {
//   [key in JettonMetaDataKeys]: 'utf8' | 'ascii' | undefined
// } = {
//   name: 'utf8',
//   description: 'utf8',
//   image: 'ascii',
//   decimals: 'utf8',
//   symbol: 'utf8',
//   image_data: undefined,
// }

export function buildJettonOnchainMetadata(data: { [s: string]: string | undefined }): Cell {
  const dataDict = Dictionary.empty(Dictionary.Keys.Buffer(32), NFTDictValueSerializer)
  for (const [k, v] of Object.entries(data)) {
    dataDict.set(sha256(k), {
      content: Buffer.from(v as string, jettonOnChainMetadataSpec[k as JettonMetaDataKeys]),
    })
  }

  return beginCell().storeInt(ONCHAIN_CONTENT_PREFIX, 8).storeDict(dataDict).endCell()
}

export function buildJettonOffChainMetadata(contentUri: string): Cell {
  return beginCell()
    .storeInt(OFFCHAIN_CONTENT_PREFIX, 8)
    .storeBuffer(Buffer.from(contentUri, 'ascii'))
    .endCell()
}

export type persistenceType = 'onchain' | 'offchain_private_domain' | 'offchain_ipfs'

// export async function readJettonMetadata(contentCell: Cell): Promise<{
//   persistenceType: persistenceType
//   metadata: { [s in JettonMetaDataKeys]?: string }
//   isJettonDeployerFaultyOnChainData?: boolean
// }> {
//   const contentSlice = contentCell.beginParse()

//   switch (contentSlice.loadUint(8)) {
//     case ONCHAIN_CONTENT_PREFIX:
//       return {
//         persistenceType: 'onchain',
//         ...parseJettonOnchainMetadata(contentSlice),
//       }
//     case OFFCHAIN_CONTENT_PREFIX:
//       const { metadata, isIpfs } = await parseJettonOffchainMetadata(contentSlice)
//       return {
//         persistenceType: isIpfs ? 'offchain_ipfs' : 'offchain_private_domain',
//         metadata,
//       }
//     default:
//       throw new Error('Unexpected jetton metadata content prefix')
//   }
// }

// async function parseJettonOffchainMetadata(contentSlice: Slice): Promise<{
//   metadata: { [s in JettonMetaDataKeys]?: string }
//   isIpfs: boolean
// }> {
//   const jsonURI = contentSlice
//     .readRemainingBytes()
//     .toString('ascii')
//     .replace('ipfs://', 'https://ipfs.io/ipfs/')

//   return {
//     metadata: (await axios.get(jsonURI)).data,
//     isIpfs: /(^|\/)ipfs[.:]/.test(jsonURI),
//   }
// }

// function parseJettonOnchainMetadata(contentSlice: Slice): {
//   metadata: { [s in JettonMetaDataKeys]?: string }
//   isJettonDeployerFaultyOnChainData: boolean
// } {
//   // Note that this relies on what is (perhaps) an internal implementation detail:
//   // "ton" library dict parser converts: key (provided as buffer) => BN(base10)
//   // and upon parsing, it reads it back to a BN(base10)
//   // tl;dr if we want to read the map back to a JSON with string keys, we have to convert BN(10) back to hex
//   const toKey = (str: string) => new BN(str, 'hex').toString(10)
//   const KEYLEN = 256

//   let isJettonDeployerFaultyOnChainData = false

//   const dict = contentSlice.readDict(KEYLEN, (s) => {
//     const buffer = Buffer.from('')

//     const sliceToVal = (s: Slice, v: Buffer, isFirst: boolean) => {
//       s.toCell().beginParse()
//       if (isFirst && s.readUint(8).toNumber() !== SNAKE_PREFIX)
//         throw new Error('Only snake format is supported')

//       v = Buffer.concat([v, s.readRemainingBytes()])
//       if (s.remainingRefs === 1) {
//         v = sliceToVal(s.readRef(), v, false)
//       }

//       return v
//     }

//     if (s.remainingRefs === 0) {
//       isJettonDeployerFaultyOnChainData = true
//       return sliceToVal(s, buffer, true)
//     }

//     return sliceToVal(s.readRef(), buffer, true)
//   })

//   const res: { [s in JettonMetaDataKeys]?: string } = {}

//   Object.keys(jettonOnChainMetadataSpec).forEach((k) => {
//     const val = dict
//       .get(toKey(sha256(k).toString('hex')))
//       ?.toString(jettonOnChainMetadataSpec[k as JettonMetaDataKeys])
//     if (val) res[k as JettonMetaDataKeys] = val
//   })

//   return {
//     metadata: res,
//     isJettonDeployerFaultyOnChainData,
//   }
// }

export function initJettonData(
  owner: Address,
  data?: { [s in JettonMetaDataKeys]?: string | undefined },
  offchainUri?: string
) {
  if (!data && !offchainUri) {
    throw new Error('Must either specify onchain data or offchain uri')
  }
  return beginCell()
    .storeCoins(0)
    .storeAddress(owner)
    .storeRef(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      offchainUri ? buildJettonOffChainMetadata(offchainUri) : buildJettonOnchainMetadata(data!)
    )
    .storeRef(JETTON_WALLET_CODE)
    .endCell()
}

export function mintJettonBody(
  owner: Address,
  jettonValue: bigint,
  transferToJWallet: bigint,
  queryId: number
): Cell {
  return beginCell()
    .storeUint(OPS.Mint, 32)
    .storeUint(queryId, 64) // queryid
    .storeAddress(owner)
    .storeCoins(transferToJWallet)
    .storeRef(
      // internal transfer message
      beginCell()
        .storeUint(OPS.InternalTransfer, 32)
        .storeUint(0, 64)
        .storeCoins(jettonValue)
        .storeAddress(null)
        .storeAddress(owner)
        .storeCoins(1000000n)
        .storeBit(false) // forward_payload in this slice, not separate cell
        .endCell()
    )
    .endCell()
}

export function burnJetton(amount: bigint, responseAddress: Address) {
  return beginCell()
    .storeUint(OPS.Burn, 32) // action
    .storeUint(1, 64) // query-id
    .storeCoins(amount)
    .storeAddress(responseAddress)
    .storeDict(null)
    .endCell()
}

export function transferJetton(to: Address, from: Address, jettonAmount: bigint) {
  return beginCell()
    .storeUint(OPS.Transfer, 32)
    .storeUint(1, 64)
    .storeCoins(jettonAmount)
    .storeAddress(to)
    .storeAddress(from)
    .storeBit(false)
    .storeCoins(toNano('0.001'))
    .storeBit(false) // forward_payload in this slice, not separate cell
    .endCell()
}

export function changeAdminBodyJetton(newAdmin: Address): Cell {
  return beginCell()
    .storeUint(OPS.ChangeAdmin, 32)
    .storeUint(0, 64) // queryid
    .storeAddress(newAdmin)
    .endCell()
}

export function updateMetadataBodyJetton(metadata: Cell): Cell {
  return beginCell()
    .storeUint(OPS.ReplaceMetadata, 32)
    .storeUint(0, 64) // queryid
    .storeRef(metadata)
    .endCell()
}
