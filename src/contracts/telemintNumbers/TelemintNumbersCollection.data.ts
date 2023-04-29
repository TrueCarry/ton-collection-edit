import { Address, beginCell, Cell, contractAddress, StateInit, storeStateInit } from 'ton-core'
import { encodeOffChainContent } from '../nft-content/nftContent'
import { TelemintNumbersCollectionCodeCell } from './TelemintNumbersCollection.source'
import nacl from 'tweetnacl'

export interface TelemintAuctionStartData {
  beneficiaryAddress: Address
  initialMinBid: number // coins
  maxBid: number // coins
  minBidStep: number // uint8
  minExtendTime: number // uint32
  duration: number // uint32
}

/*
    var res = (
            cs~load_int(1), ;; touched
            cs~load_uint(32), ;; subwallet_id
            cs~load_uint(256), ;; owner_key
            cs~load_ref(), ;; content
            cs~load_ref(), ;; item_code
            cs~load_text_ref(), ;; full_domain
            cs~load_ref() ;; royalty_params
    );
*/

/*
cell pack_nft_royalty_params(int numerator, int denominator, slice destination) inline {
    return begin_cell()
            .store_uint(numerator, 16)
            .store_uint(denominator, 16)
            .store_slice(destination)
            .end_cell();
}
*/

export type TelemintNumbersCollectionData = {
  touched: boolean
  subwalletId: number
  ownerKey: Buffer
  content: string
  itemCode: Cell
  fullDomain: Cell
  royaltyParams: {
    numerator: number
    denominator: number
    destination: Address
  }
}

export function buildTelemintNumbersCollectionDataCell(data: TelemintNumbersCollectionData): Cell {
  const dataCell = beginCell()

  dataCell.storeBit(data.touched)
  dataCell.storeUint(data.subwalletId, 32)
  dataCell.storeBuffer(data.ownerKey, 32) // 256 bits

  const collectionContent = encodeOffChainContent(data.content)
  // const fullDomain = encodeOffChainContent('')
  const royaltyParams = beginCell()

  royaltyParams.storeUint(data.royaltyParams.numerator, 16)
  royaltyParams.storeUint(data.royaltyParams.denominator, 16)
  royaltyParams.storeAddress(data.royaltyParams.destination)

  dataCell.storeRef(collectionContent)
  dataCell.storeRef(data.itemCode)
  dataCell.storeRef(data.fullDomain)
  dataCell.storeRef(royaltyParams)

  return dataCell.endCell()
}

export function buildTelemintNumbersCollectionStateInit(conf: TelemintNumbersCollectionData) {
  const dataCell = buildTelemintNumbersCollectionDataCell(conf)
  const stateInit: StateInit = {
    code: TelemintNumbersCollectionCodeCell,
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

/*
  (slice signature, int hash, int got_subwallet_id, int valid_since, int valid_till, slice cmd)
            = unpack_signed_cmd(signed_cmd);
*/
/*
_ unpack_signed_cmd(slice cs) inline {
    return (
            cs~load_bits(512), ;; signature
            slice_hash(cs), ;; hash
            cs~load_uint(32), ;; subwallet_id
            cs~load_uint(32), ;; valid_since
            cs~load_uint(32), ;; valid_till
            cs ;; cmd
    );
}
*/
// const int op::telemint_msg_deploy_v2 = 0x4637289b;
/*
_ unpack_deploy_msg_v2(slice cs) inline {
    var res = (
            cs~load_text(), ;; token_name
            cs~load_ref(), ;; content
            cs~load_ref(), ;; auction_config
            cs~load_maybe_ref(), ;; royalty
            cs~load_maybe_ref() ;; restrictions
    );
    cs.end_parse();
    return res;
}
*/
/*
(slice, int, int, int, int, int) unpack_auction_config(cell c) inline {
    slice cs = c.begin_parse();
    var res = (
            cs~load_msg_addr(), ;; beneficiary address
            cs~load_grams(), ;; initial_min_bid
            cs~load_grams(), ;; max_bid
            cs~load_uint(8), ;; min_bid_step
            cs~load_uint(32), ;; min_extend_time
            cs~load_uint(32) ;; duration
    );
    cs.end_parse();
    return res;
}
*/
export function buildTelemintNumbersMint(data: {
  subwalletId: number
  validFrom: number
  validTill: number
  tokenName: string
  content: string
  privateKey: string
  auctionConfig: TelemintAuctionStartData
}): Cell {
  if (data.privateKey.length < 64) {
    return beginCell().endCell()
  }
  const body = beginCell()

  body.storeUint(0x4637289b, 32)

  const auctionConfigCell = buildAuctionConfig(data.auctionConfig)

  const cmd = beginCell()
  cmd.storeUint(data.subwalletId, 32)
  cmd.storeUint(data.validFrom, 32)
  cmd.storeUint(data.validTill, 32)

  const text = Buffer.from(new TextEncoder().encode(data.tokenName))
  cmd.storeUint(text.length, 8)
  cmd.storeBuffer(text)
  cmd.storeRef(encodeOffChainContent(data.content))
  cmd.storeRef(auctionConfigCell)
  cmd.storeMaybeRef(null)
  cmd.storeMaybeRef(null)

  const cmdData = cmd.endCell()

  const cmdHash = cmdData.hash()
  const key = Buffer.from(data.privateKey, 'hex')
  const signature = nacl.sign.detached(cmdHash, key)

  body.storeBuffer(Buffer.from(signature), 64) // 512
  // body.storeBuffer(cmdHash)
  body.storeBuilder(cmd)
  // body.storeRef(encodeOffChainContent(data.content))
  // body.storeRef(auctionConfigCell)
  // cmd.storeMaybeRef(null)
  // cmd.storeMaybeRef(null)

  return body.endCell()
}

function buildAuctionConfig(params: TelemintAuctionStartData): Cell {
  const auctionConfigRef = beginCell()
  auctionConfigRef.storeAddress(params.beneficiaryAddress) // nft owner
  auctionConfigRef.storeCoins(params.initialMinBid) // start bid can be 0(1 TON = 10 ** 9)
  auctionConfigRef.storeCoins(params.maxBid || 0) // max bid
  auctionConfigRef.storeUint(params.minBidStep, 8) // min bid step in %, should be 5
  auctionConfigRef.storeUint(60, 32) // telemint default is 3600, we probably want 300?
  auctionConfigRef.storeUint(params.duration, 32) // duration in seconds

  return auctionConfigRef.endCell()
}
