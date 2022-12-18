import { Address, Cell, serializeDict } from 'ton'
import BN from 'bn.js'
import { encodeOffChainContent } from '../nft-content/nftContent'

export type RoyaltyParams = {
  royaltyFactor: number
  royaltyBase: number
  royaltyAddress: Address
}

export type NftCollectionData = {
  ownerAddress: Address
  nextItemIndex: number | BN
  collectionContent: string
  commonContent: string
  nftItemCode: Cell
  royaltyParams: RoyaltyParams
}

// default#_ royalty_factor:uint16 royalty_base:uint16 royalty_address:MsgAddress = RoyaltyParams;
// storage#_ owner_address:MsgAddress next_item_index:uint64
//           ^[collection_content:^Cell common_content:^Cell]
//           nft_item_code:^Cell
//           royalty_params:^RoyaltyParams
//           = Storage;

export function buildNftCollectionDataCell(data: NftCollectionData) {
  const dataCell = new Cell()

  dataCell.bits.writeAddress(data.ownerAddress)
  dataCell.bits.writeUint(data.nextItemIndex, 64)

  const contentCell = new Cell()

  const collectionContent = encodeOffChainContent(data.collectionContent)

  const commonContent = new Cell()
  commonContent.bits.writeBuffer(Buffer.from(data.commonContent))
  // commonContent.bits.writeString(data.commonContent)

  contentCell.refs.push(collectionContent)
  contentCell.refs.push(commonContent)
  dataCell.refs.push(contentCell)

  dataCell.refs.push(data.nftItemCode)

  const royaltyCell = new Cell()
  royaltyCell.bits.writeUint(data.royaltyParams.royaltyFactor, 16)
  royaltyCell.bits.writeUint(data.royaltyParams.royaltyBase, 16)
  royaltyCell.bits.writeAddress(data.royaltyParams.royaltyAddress)
  dataCell.refs.push(royaltyCell)

  return dataCell
}

export const OperationCodes = {
  Mint: 1,
  BatchMint: 2,
  ChangeOwner: 3,
  EditContent: 4,
  GetRoyaltyParams: 0x693d3950,
  GetRoyaltyParamsResponse: 0xa8cb00ad,
}

export type CollectionMintItemInput = {
  passAmount: BN
  index: number
  ownerAddress: Address
  content: string
}

export const Queries = {
  mint: (params: {
    queryId?: number
    passAmount: BN
    itemIndex: number
    itemOwnerAddress: Address
    itemContent: string
  }) => {
    const msgBody = new Cell()

    msgBody.bits.writeUint(OperationCodes.Mint, 32)
    msgBody.bits.writeUint(params.queryId || 0, 64)
    msgBody.bits.writeUint(params.itemIndex, 64)
    msgBody.bits.writeCoins(params.passAmount)

    const itemContent = new Cell()
    // itemContent.bits.writeString(params.itemContent)
    itemContent.bits.writeBuffer(Buffer.from(params.itemContent))

    const nftItemMessage = new Cell()

    nftItemMessage.bits.writeAddress(params.itemOwnerAddress)
    nftItemMessage.refs.push(itemContent)

    msgBody.refs.push(nftItemMessage)

    return msgBody
  },
  batchMint: (params: { queryId?: number; items: CollectionMintItemInput[] }) => {
    if (params.items.length > 250) {
      throw new Error('Too long list')
    }

    const itemsMap = new Map<string, CollectionMintItemInput>()

    for (const item of params.items) {
      itemsMap.set(item.index.toString(10), item)
    }

    const dictCell = serializeDict(itemsMap, 64, (src, cell) => {
      const nftItemMessage = new Cell()

      const itemContent = new Cell()
      // itemContent.bits.writeString(packages.content)
      itemContent.bits.writeBuffer(Buffer.from(src.content))

      nftItemMessage.bits.writeAddress(src.ownerAddress)
      nftItemMessage.refs.push(itemContent)

      cell.bits.writeCoins(src.passAmount)
      cell.refs.push(nftItemMessage)
    })

    const msgBody = new Cell()

    msgBody.bits.writeUint(OperationCodes.BatchMint, 32)
    msgBody.bits.writeUint(params.queryId || 0, 64)
    msgBody.refs.push(dictCell)

    return msgBody
  },
  changeOwner: (params: { queryId?: number; newOwner: Address }) => {
    const msgBody = new Cell()
    msgBody.bits.writeUint(OperationCodes.ChangeOwner, 32)
    msgBody.bits.writeUint(params.queryId || 0, 64)
    msgBody.bits.writeAddress(params.newOwner)
    return msgBody
  },
  getRoyaltyParams: (params: { queryId?: number }) => {
    const msgBody = new Cell()
    msgBody.bits.writeUint(OperationCodes.GetRoyaltyParams, 32)
    msgBody.bits.writeUint(params.queryId || 0, 64)
    return msgBody
  },
  editContent: (params: {
    queryId?: number
    collectionContent: string
    commonContent: string
    royaltyParams: RoyaltyParams
  }) => {
    const msgBody = new Cell()
    msgBody.bits.writeUint(OperationCodes.EditContent, 32)
    msgBody.bits.writeUint(params.queryId || 0, 64)

    const royaltyCell = new Cell()
    royaltyCell.bits.writeUint(params.royaltyParams.royaltyFactor, 16)
    royaltyCell.bits.writeUint(params.royaltyParams.royaltyBase, 16)
    royaltyCell.bits.writeAddress(params.royaltyParams.royaltyAddress)

    const contentCell = new Cell()

    const collectionContent = encodeOffChainContent(params.collectionContent)

    const commonContent = new Cell()
    // commonContent.bits.writeString(params.commonContent)
    commonContent.bits.writeBuffer(Buffer.from(params.commonContent))

    contentCell.refs.push(collectionContent)
    contentCell.refs.push(commonContent)

    msgBody.refs.push(contentCell)
    msgBody.refs.push(royaltyCell)

    return msgBody
  },
}
