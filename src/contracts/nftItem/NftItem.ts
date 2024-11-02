import { Address, Cell, StateInit, beginCell, contractAddress, storeStateInit } from 'ton-core'
import { encodeOffChainContent } from '../nft-content/nftContent'

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
  forwardAmount?: bigint
  forwardPayload?: Cell
}): Cell {
  const msgBody = beginCell()
  msgBody.storeUint(OperationCodes.transfer, 32)
  msgBody.storeUint(params.queryId || 0, 64)
  msgBody.storeAddress(params.newOwner)
  msgBody.storeAddress(params.responseTo || null)
  msgBody.storeBit(false) // no custom payload
  msgBody.storeCoins(params.forwardAmount || 0)

  if (params.forwardPayload) {
    // msgBody.storeBit(1)
    msgBody.storeBuilder(params.forwardPayload.asBuilder())
  } else {
    msgBody.storeBit(0) // no forward_payload yet
  }

  return msgBody.endCell()
}

export const NftSingleCodeBoc =
  'te6cckECFQEAAwoAART/APSkE/S88sgLAQIBYgcCAgEgBAMAI7x+f4ARgYuGRlgOS/uAFoICHAIBWAYFABG0Dp4AQgRr4HAAHbXa/gBNhjoaYfph/0gGEAICzgsIAgEgCgkAGzIUATPFljPFszMye1UgABU7UTQ+kD6QNTUMIAIBIA0MABE+kQwcLry4U2AEuQyIccAkl8D4NDTAwFxsJJfA+D6QPpAMfoAMXHXIfoAMfoAMPACBtMf0z+CEF/MPRRSMLqOhzIQRxA2QBXgghAvyyaiUjC64wKCEGk9OVBSMLrjAoIQHARBKlIwuoBMSEQ4BXI6HMhBHEDZAFeAxMjQ1NYIQGgudURK6n1ETxwXy4ZoB1NQwECPwA+BfBIQP8vAPAfZRNscF8uGR+kAh8AH6QNIAMfoAggr68IAboSGUUxWgod4i1wsBwwAgkgahkTbiIML/8uGSIY4+ghBRGkRjyFAKzxZQC88WcSRKFFRGsHCAEMjLBVAHzxZQBfoCFctqEssfyz8ibrOUWM8XAZEy4gHJAfsAEFeUECo4W+IQAIICjjUm8AGCENUydtsQN0UAbXFwgBDIywVQB88WUAX6AhXLahLLH8s/Im6zlFjPFwGRMuIByQH7AJMwMzTiVQLwAwBUFl8GMwHQEoIQqMsArXCAEMjLBVAFzxYk+gIUy2oTyx/LPwHPFsmAQPsAAIYWXwZsInDIywHJcIIQi3cXNSHIy/8D0BPPFhOAQHCAEMjLBVAHzxZQBfoCFctqEssfyz8ibrOUWM8XAZEy4gHJAfsAAfZRN8cF8uGR+kAh8AH6QNIAMfoAggr68IAboSGUUxWgod4i1wsBwwAgkgahkTbiIMIA8uGSIY4+ghAFE42RyFALzxZQC88WcSRLFFRGwHCAEMjLBVAHzxZQBfoCFctqEssfyz8ibrOUWM8XAZEy4gHJAfsAEGeUECo5W+IUAIICjjUm8AGCENUydtsQN0YAbXFwgBDIywVQB88WUAX6AhXLahLLH8s/Im6zlFjPFwGRMuIByQH7AJMwNDTiVQLwA+GNLv4='

export const NftSingleCodeCell = Cell.fromBoc(Buffer.from(NftSingleCodeBoc, 'base64'))[0]

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
