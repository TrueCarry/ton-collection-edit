import { Address, Cell, StateInit, beginCell, contractAddress, storeStateInit } from 'ton-core'
import { encodeOffChainContent } from '../nft-content/nftContent'
import { NftSingleCodeCell } from './NftItem.source'

export const OperationCodes = {
  transfer: 0x5fcc3d14,
  getStaticData: 0x2fcb26a2,
  getStaticDataResponse: 0x8b771735,
  GetRoyaltyParams: 0x693d3950,
  GetRoyaltyParamsResponse: 0xa8cb00ad,
  EditContent: 0x1a0b9d51,
  TransferEditorship: 0x1c04412a,
}

export function BuildTransferNftBody(params: {
  queryId?: number
  newOwner: Address
  responseTo?: Address
  customPayload?: Cell
  forwardAmount?: bigint
  forwardPayload?: Cell
}): Cell {
  const msgBody = beginCell()
  msgBody.storeUint(OperationCodes.transfer, 32)
  msgBody.storeUint(params.queryId || 0, 64)
  msgBody.storeAddress(params.newOwner)
  msgBody.storeAddress(params.responseTo || null)
  msgBody.storeMaybeRef(params.customPayload || null)
  msgBody.storeCoins(params.forwardAmount || 0)
  msgBody.storeMaybeRef(params.forwardPayload || null)

  return msgBody.endCell()
}

export type RoyaltyParams = {
  // numerator
  royaltyFactor: number
  // denominator
  royaltyBase: number
  royaltyAddress: Address
}

export type NftSingleData = {
  ownerAddress: Address
  editorAddress: Address
  content: string
  royaltyParams: RoyaltyParams
}

export function buildSingleNftDataCell(data: NftSingleData) {
  const dataCell = beginCell()

  const contentCell = encodeOffChainContent(data.content)

  const royaltyCell = beginCell()
  royaltyCell.storeUint(data.royaltyParams.royaltyFactor, 16)
  royaltyCell.storeUint(data.royaltyParams.royaltyBase, 16)
  royaltyCell.storeAddress(data.royaltyParams.royaltyAddress)

  dataCell.storeAddress(data.ownerAddress)
  dataCell.storeAddress(data.editorAddress)
  dataCell.storeRef(contentCell)
  dataCell.storeRef(royaltyCell)

  return dataCell.endCell()
}

export function buildSingleNftStateInit(conf: NftSingleData) {
  const dataCell = buildSingleNftDataCell(conf)

  const stateInit: StateInit = {
    code: NftSingleCodeCell,
    data: dataCell,
  }

  const stateInitCell = beginCell().store(storeStateInit(stateInit)).endCell()

  const address = contractAddress(0, stateInit)

  return {
    stateInit: stateInitCell,
    stateInitMessage: stateInit,
    address,
  }
}
