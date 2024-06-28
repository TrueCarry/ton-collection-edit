import { RoyaltyParams } from '@/contracts/getgemsCollection/NftCollection.data'
import { decodeOffChainContent } from '@/contracts/nft-content/nftContent'
import { useTonClient } from '@/store/tonClient'
import { useEffect, useState } from 'react'
import { Address, Cell, TupleItemCell, TupleItemInt } from 'ton-core'
import { TupleItemSlice } from 'ton-core/dist/tuple/tuple'

export function useCollectionRoyaltyParams(address: Address | null) {
  const [royalty, setRoyalty] = useState<RoyaltyParams | null>(null)
  const tonClient = useTonClient()

  useEffect(() => {
    const fetchRoyaltyParams = async () => {
      try {
        if (!address) {
          setRoyalty(null)
          return
        }
        const info = await tonClient.value.callGetMethod(address, 'royalty_params')
        const [royaltyFactor, royaltyBase, royaltyAddress] = [
          info.stack.pop(),
          info.stack.pop(),
          info.stack.pop(),
        ] as [TupleItemInt, TupleItemInt, TupleItemSlice]

        const royaltyOwner = royaltyAddress.cell.beginParse().loadAddress()
        if (!royaltyOwner) {
          setRoyalty(null)
          return
        }

        setRoyalty({
          royaltyFactor: Number(royaltyFactor.value),
          royaltyBase: Number(royaltyBase.value),
          royaltyAddress: royaltyOwner,
        })
      } catch (e) {
        setRoyalty(null)
      }
    }

    fetchRoyaltyParams()
  }, [address, tonClient.value])

  return royalty
}

export function useCollectionInfo(address: Address | null) {
  const [content, setContent] = useState('')
  const [owner, setOwner] = useState<Address | null>(null)
  const [nextItemIndex, setNextItemIndex] = useState<string | null>(null)
  const tonClient = useTonClient()

  useEffect(() => {
    const fetchCollectionContent = async () => {
      try {
        if (!address) {
          setContent('')
          setOwner(null)
          setNextItemIndex(null)
          return
        }
        const contentInfo = await tonClient.value.callGetMethod(address, 'get_collection_data')
        const [nextItemIndexItem, collectionContent, ownerAddress] = [
          contentInfo.stack.pop(),
          contentInfo.stack.pop(),
          contentInfo.stack.pop(),
        ] as [TupleItemInt, TupleItemCell, TupleItemSlice]
        setContent(decodeOffChainContent(collectionContent.cell))
        const owner = ownerAddress.cell.beginParse().loadAddress()
        setOwner(owner)
        setNextItemIndex(nextItemIndexItem.value.toString())
      } catch (e) {
        setContent('')
        setOwner(null)
        setNextItemIndex(null)
      }
    }

    fetchCollectionContent()
  }, [address, tonClient.value])

  return { content, owner, nextItemIndex }
}

export function useCollectionBaseContent(address: Address | null) {
  const [baseContent, setBaseContent] = useState('')
  const tonClient = useTonClient()

  useEffect(() => {
    const fetchBaseContent = async () => {
      try {
        if (!address) {
          setBaseContent('')
          return
        }
        const baseInfo = await tonClient.value.callGetMethod(address, 'get_nft_content', [
          { type: 'int', value: 0n },
          { type: 'cell', cell: new Cell() },
        ])
        setBaseContent(decodeOffChainContent((baseInfo.stack.pop() as TupleItemCell).cell))
      } catch (e) {
        setBaseContent('')
      }
    }

    fetchBaseContent()
  }, [address, tonClient.value])

  return baseContent
}
