import { Address, Cell, beginCell } from 'ton-core'

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
