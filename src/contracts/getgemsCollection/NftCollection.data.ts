import {
  Address,
  beginCell,
  Cell,
  contractAddress,
  Dictionary,
  DictionaryValue,
  StateInit,
  storeStateInit,
} from 'ton-core'
import { NftCollectionCodeCell } from './NftCollection.source'
import { encodeOffChainContent } from '../nft-content/nftContent'
import { NftItemCodeCell, NftItemEditableCodeCell } from '../nftItem/NftItem.source'

export type RoyaltyParams = {
  royaltyFactor: number
  royaltyBase: number
  royaltyAddress: Address
}

export type NftCollectionData = {
  ownerAddress: Address
  nextItemIndex: bigint
  collectionContent: string
  commonContent: string
  nftItemCode: Cell
  royaltyParams: RoyaltyParams
}

export type CollectionMintItemInput = {
  passAmount: bigint
  index: number
  ownerAddress: Address
  content: string
}

export type CollectionEditableMintItemInput = {
  passAmount: bigint
  index: number
  ownerAddress: Address
  content: string
  editorAddress: Address
}

export const MintDictValue: DictionaryValue<CollectionMintItemInput> = {
  serialize(src, builder) {
    const nftItemMessage = beginCell()

    const itemContent = beginCell()
    itemContent.storeBuffer(Buffer.from(src.content))

    nftItemMessage.storeAddress(src.ownerAddress)
    nftItemMessage.storeRef(itemContent)

    builder.storeCoins(src.passAmount)
    builder.storeRef(nftItemMessage)
  },
  parse() {
    return {
      passAmount: 0n,
      index: 0,
      content: '',
      ownerAddress: new Address(0, Buffer.from([])),
      editorAddress: new Address(0, Buffer.from([])),
    }
  },
}

export const MintEditableDictValue: DictionaryValue<CollectionEditableMintItemInput> = {
  serialize(src, builder) {
    const nftItemMessage = beginCell()

    const itemContent = beginCell()
    itemContent.storeBuffer(Buffer.from(src.content))

    nftItemMessage.storeAddress(src.ownerAddress)
    nftItemMessage.storeAddress(src.editorAddress)
    nftItemMessage.storeRef(itemContent)

    builder.storeCoins(src.passAmount)
    builder.storeRef(nftItemMessage)
  },
  parse() {
    return {
      passAmount: 0n,
      index: 0,
      content: '',
      ownerAddress: new Address(0, Buffer.from([])),
      editorAddress: new Address(0, Buffer.from([])),
    }
  },
}

// default#_ royalty_factor:uint16 royalty_base:uint16 royalty_address:MsgAddress = RoyaltyParams;
// storage#_ owner_address:MsgAddress next_item_index:uint64
//           ^[collection_content:^Cell common_content:^Cell]
//           nft_item_code:^Cell
//           royalty_params:^RoyaltyParams
//           = Storage;

// return
// (ds~load_msg_addr(), ;; owner_address
//  ds~load_uint(64), ;; next_item_index
//  ds~load_ref(), ;; content
//  ds~load_ref(), ;; nft_item_code
//  ds~load_ref()  ;; royalty_params
//  );

export function isNftCollectionNftEditable(collectionData: Cell) {
  const s = collectionData.asSlice()
  s.loadRef()

  const itemCode = s.loadRef()
  if (itemCode.equals(NftItemCodeCell)) {
    return false
  }

  if (itemCode.equals(NftItemEditableCodeCell)) {
    return true
  }

  throw new Error('Unknown nft item code')
}

export function buildNftCollectionDataCell(data: NftCollectionData): Cell {
  const dataCell = beginCell()

  dataCell.storeAddress(data.ownerAddress)
  dataCell.storeUint(data.nextItemIndex, 64)

  const contentCell = beginCell()

  const collectionContent = encodeOffChainContent(data.collectionContent)

  const commonContent = beginCell()
  commonContent.storeBuffer(Buffer.from(data.commonContent))
  // commonContent.storeString(data.commonContent)

  contentCell.storeRef(collectionContent)
  contentCell.storeRef(commonContent.asCell())
  dataCell.storeRef(contentCell)

  dataCell.storeRef(data.nftItemCode)

  const royaltyCell = beginCell()
  royaltyCell.storeUint(data.royaltyParams.royaltyFactor, 16)
  royaltyCell.storeUint(data.royaltyParams.royaltyBase, 16)
  royaltyCell.storeAddress(data.royaltyParams.royaltyAddress)
  dataCell.storeRef(royaltyCell)

  return dataCell.endCell()
}

export function buildNftCollectionStateInit(conf: NftCollectionData) {
  const dataCell = buildNftCollectionDataCell(conf)
  const stateInit: StateInit = {
    code: NftCollectionCodeCell,
    data: dataCell,
  }

  const stateInitCell = beginCell().store(storeStateInit(stateInit)).endCell()

  const address = contractAddress(0, { code: NftCollectionCodeCell, data: dataCell })

  return {
    stateInit: stateInitCell,
    stateInitMessage: stateInit,
    address,
  }
}

export const OperationCodes = {
  Mint: 1,
  BatchMint: 2,
  ChangeOwner: 3,
  EditContent: 4,
  GetRoyaltyParams: 0x693d3950,
  GetRoyaltyParamsResponse: 0xa8cb00ad,
}

export const Queries = {
  mint: (params: {
    queryId?: number
    passAmount: bigint
    itemIndex: number
    itemOwnerAddress: Address
    itemContent: string
  }) => {
    const msgBody = beginCell()

    msgBody.storeUint(OperationCodes.Mint, 32)
    msgBody.storeUint(params.queryId || 0, 64)
    msgBody.storeUint(params.itemIndex, 64)
    msgBody.storeCoins(params.passAmount)

    const itemContent = beginCell()
    // itemContent.storeString(params.itemContent)
    itemContent.storeBuffer(Buffer.from(params.itemContent))

    const nftItemMessage = beginCell()

    nftItemMessage.storeAddress(params.itemOwnerAddress)
    nftItemMessage.storeRef(itemContent)

    msgBody.storeRef(nftItemMessage)

    return msgBody.endCell()
  },
  batchMint: (params: { queryId?: number; items: CollectionMintItemInput[] }) => {
    if (params.items.length > 250) {
      throw new Error('Too long list')
    }

    const dict = Dictionary.empty(Dictionary.Keys.Uint(64), MintDictValue)
    for (const item of params.items) {
      dict.set(item.index, item)
    }

    const msgBody = beginCell()

    msgBody.storeUint(OperationCodes.BatchMint, 32)
    msgBody.storeUint(params.queryId || 0, 64)
    msgBody.storeDict(dict)

    return msgBody.endCell()
  },

  mintEditable: (params: { queryId?: number; item: CollectionEditableMintItemInput }) => {
    const msgBody = beginCell()

    msgBody.storeUint(OperationCodes.Mint, 32)
    msgBody.storeUint(params.queryId || 0, 64)
    msgBody.storeUint(params.item.index, 64)
    msgBody.storeCoins(params.item.passAmount)

    const itemContent = beginCell()
    // itemContent.storeString(params.itemContent)
    itemContent.storeBuffer(Buffer.from(params.item.content))

    const nftItemMessage = beginCell()

    nftItemMessage.storeAddress(params.item.ownerAddress)
    nftItemMessage.storeAddress(params.item.editorAddress)
    nftItemMessage.storeRef(itemContent)

    msgBody.storeRef(nftItemMessage)

    return msgBody.endCell()
  },
  batchMintEditable: (params: { queryId?: number; items: CollectionEditableMintItemInput[] }) => {
    if (params.items.length > 250) {
      throw new Error('Too long list')
    }

    // let itemsMap = new Map<string, CollectionEditableMintItemInput>()

    // for (let item of params.items) {
    //     itemsMap.set(item.index.toString(10), item)
    // }

    // let dictCell = serializeDict(itemsMap, 64, (src, cell) => {
    //     let nftItemMessage = beginCell()

    //     let itemContent = beginCell()
    //     // itemContent.storeString(packages.content)
    //     itemContent.storeBuffer(Buffer.from(src.content))

    //     nftItemMessage.storeAddress(src.ownerAddress)
    //     nftItemMessage.storeAddress(src.editorAddress)
    //     nftItemMessage.storeRef(itemContent)

    //     cell.storeCoins(src.passAmount)
    //     cell.storeRef(nftItemMessage)
    // })

    const dict = Dictionary.empty(Dictionary.Keys.Uint(64), MintEditableDictValue)

    for (const item of params.items) {
      dict.set(item.index, item)
    }

    const msgBody = beginCell()

    msgBody.storeUint(OperationCodes.BatchMint, 32)
    msgBody.storeUint(params.queryId || 0, 64)
    msgBody.storeDict(dict)

    return msgBody.endCell()
  },

  changeOwner: (params: { queryId?: number; newOwner: Address }) => {
    const msgBody = beginCell()
    msgBody.storeUint(OperationCodes.ChangeOwner, 32)
    msgBody.storeUint(params.queryId || 0, 64)
    msgBody.storeAddress(params.newOwner)
    return msgBody.endCell()
  },
  getRoyaltyParams: (params: { queryId?: number }) => {
    const msgBody = beginCell()
    msgBody.storeUint(OperationCodes.GetRoyaltyParams, 32)
    msgBody.storeUint(params.queryId || 0, 64)
    return msgBody.endCell()
  },
  editContent: (params: {
    queryId?: number
    collectionContent: string
    commonContent: string
    royaltyParams: RoyaltyParams
  }) => {
    const msgBody = beginCell()
    msgBody.storeUint(OperationCodes.EditContent, 32)
    msgBody.storeUint(params.queryId || 0, 64)

    const royaltyCell = beginCell()
    royaltyCell.storeUint(params.royaltyParams.royaltyFactor, 16)
    royaltyCell.storeUint(params.royaltyParams.royaltyBase, 16)
    royaltyCell.storeAddress(params.royaltyParams.royaltyAddress)

    const contentCell = beginCell()

    const collectionContent = encodeOffChainContent(params.collectionContent)

    const commonContent = beginCell()
    // commonContent.storeString(params.commonContent)
    commonContent.storeBuffer(Buffer.from(params.commonContent))

    contentCell.storeRef(collectionContent)
    contentCell.storeRef(commonContent)

    msgBody.storeRef(contentCell)
    msgBody.storeRef(royaltyCell)

    return msgBody.endCell()
  },
}
