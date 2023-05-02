import {
  Address,
  beginCell,
  Builder,
  Cell,
  Contract,
  contractAddress,
  ContractProvider,
  Dictionary,
  Sender,
  SendMode,
  Slice,
} from 'ton-core'

export type BulkBuyConfig = {
  createdAt: number
  buyCount: number
  responseCount: number
  userAddress: Address
}

export function bulkBuyConfigToCell(config: BulkBuyConfig): Cell {
  return beginCell()
    .storeUint(config.createdAt, 32)
    .storeUint(config.buyCount, 8)
    .storeUint(config.responseCount, 8)
    .storeAddress(config.userAddress)
    .storeDict(Dictionary.empty(Dictionary.Keys.Address(), Dictionary.Values.Uint(1)))
    .storeDict(Dictionary.empty(Dictionary.Keys.Address(), Dictionary.Values.Uint(1)))
    .endCell()
}
export interface DepositTicketValue {
  nftAddress: Address
  saleAddress: Address
  buyAmount: bigint
}
const BuyDictSerializer = {
  serialize(src: DepositTicketValue, builder: Builder) {
    builder.storeAddress(src.nftAddress).storeAddress(src.saleAddress).storeCoins(src.buyAmount)
  },
  parse(src: Slice): DepositTicketValue {
    return {
      nftAddress: src.loadAddress(),
      saleAddress: src.loadAddress(),
      buyAmount: src.loadCoins(),
    }
  },
}

export class BulkBuy implements Contract {
  // eslint-disable-next-line no-useless-constructor
  constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

  static createFromAddress(address: Address) {
    return new BulkBuy(address)
  }

  static createFromConfig(config: BulkBuyConfig, code: Cell, workchain = 0) {
    const data = bulkBuyConfigToCell(config)
    const init = { code, data }
    return new BulkBuy(contractAddress(workchain, init), init)
  }

  static createBuyBody({
    totalCount,
    totalAmount,
    buyArray,
  }: {
    totalCount: number
    totalAmount: bigint
    buyArray: Array<{
      nftAddress: Address
      saleAddress: Address
      buyAmount: bigint
    }>
  }): Cell {
    const buyDict = Dictionary.empty(Dictionary.Keys.Uint(8), BuyDictSerializer)

    for (const [i, ticket] of buyArray.entries()) {
      buyDict.set(i, {
        nftAddress: ticket.nftAddress,
        saleAddress: ticket.saleAddress,
        buyAmount: ticket.buyAmount,
      })
    }

    return beginCell()
      .storeUint(0x7bc44acf, 32)
      .storeUint(totalCount, 8)
      .storeCoins(totalAmount)
      .storeDict(buyDict)
      .endCell()
  }

  async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().endCell(),
    })
  }
}
