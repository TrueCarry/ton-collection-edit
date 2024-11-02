import { BuildTransferNftBody } from '@/contracts/nftItem/NftItem'
import { useTonAddress } from '@tonconnect/ui-react'
import BN from 'bn.js'
import { useEffect, useMemo } from 'react'
import { Address, Cell } from 'ton-core'
import { ResultContainer } from './ResultContainer'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useForm } from 'react-hook-form'

interface TransferNftFormValues {
  nftAddress: string
  queryId: string
  newOwnerAddress: string
  responseDestinationAddress: string
  customPayload: string
  forwardAmount: string
  forwardPayload: string
}

export function TransferNft() {
  const senderAddress = useTonAddress()
  const { toast } = useToast()

  const form = useForm<TransferNftFormValues>({
    defaultValues: {
      nftAddress: '',
      queryId: '0',
      newOwnerAddress: '',
      responseDestinationAddress: '',
      customPayload: '',
      forwardAmount: '1',
      forwardPayload: '',
    },
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form

  const nftAddress = watch('nftAddress')
  const queryId = watch('queryId')
  const newOwnerAddress = watch('newOwnerAddress')
  const responseDestinationAddress = watch('responseDestinationAddress')
  const customPayload = watch('customPayload')
  const forwardAmount = watch('forwardAmount')
  const forwardPayload = watch('forwardPayload')

  useEffect(() => {
    try {
      Address.parse(responseDestinationAddress)
      return
    } catch (e) {}

    let sender: Address
    try {
      sender = Address.parse(senderAddress)
    } catch (e) {
      return
    }

    setValue('responseDestinationAddress', sender.toString({ bounceable: false, urlSafe: true }))
  }, [senderAddress, responseDestinationAddress, setValue])

  useEffect(() => {
    let newOwner: ReturnType<typeof Address.parseFriendly>
    try {
      newOwner = Address.parseFriendly(newOwnerAddress)
    } catch (e) {
      return
    }

    if (!newOwner.isBounceable) {
      return
    }

    setValue('newOwnerAddress', newOwner.address.toString({ bounceable: false, urlSafe: true }))
  }, [newOwnerAddress, setValue])

  useEffect(() => {
    let destination: ReturnType<typeof Address.parseFriendly>
    try {
      destination = Address.parseFriendly(responseDestinationAddress)
    } catch (e) {
      return
    }

    if (!destination.isBounceable) {
      return
    }

    setValue(
      'responseDestinationAddress',
      destination.address.toString({ bounceable: false, urlSafe: true })
    )
  }, [responseDestinationAddress, setValue])

  const deployParams = useMemo(() => {
    if (!nftAddress || !newOwnerAddress || !senderAddress) {
      return
    }

    let message: Cell | null = null
    try {
      message = BuildTransferNftBody({
        queryId: queryId ? parseInt(queryId, 10) : 0,
        newOwner: Address.parse(newOwnerAddress),
        responseTo: responseDestinationAddress
          ? Address.parse(responseDestinationAddress)
          : Address.parse(senderAddress),
        customPayload: customPayload ? Cell.fromBase64(customPayload) : undefined,
        forwardAmount: BigInt(forwardAmount),
        forwardPayload: forwardPayload ? Cell.fromBase64(forwardPayload) : undefined,
      })
    } catch (e) {}

    return message
  }, [
    queryId,
    senderAddress,
    nftAddress,
    newOwnerAddress,
    customPayload,
    forwardAmount,
    forwardPayload,
  ])

  const onSubmit = () => {
    if (deployParams) {
      toast({
        title: 'Transfer Initiated',
        description: 'Your NFT transfer has been initiated successfully.',
      })
    } else {
      toast({
        title: 'Transfer Failed',
        description: 'There was an error initiating the NFT transfer. Please check your inputs.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="container mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Transfer NFT</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                name="nftAddress"
                render={() => (
                  <FormItem>
                    <FormLabel>NFT Address:</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        {...register('nftAddress', { required: 'NFT Address is required' })}
                        placeholder="Enter NFT address"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="queryId"
                render={() => (
                  <FormItem>
                    <FormLabel>Query ID:</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        {...register('queryId', { required: 'Query ID is required' })}
                        placeholder="Enter Query ID"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="newOwnerAddress"
                render={() => (
                  <FormItem>
                    <FormLabel>New Owner Address:</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        {...register('newOwnerAddress', {
                          required: 'New Owner Address is required',
                        })}
                        placeholder="Enter new owner address"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="responseDestinationAddress"
                render={() => (
                  <FormItem>
                    <FormLabel>Response Destination Address:</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        {...register('responseDestinationAddress', {
                          required: 'Response Destination Address is required',
                        })}
                        placeholder="Enter response destination address"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="customPayload"
                render={() => (
                  <FormItem>
                    <FormLabel>Custom Payload (base64):</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        {...register('customPayload')}
                        placeholder="Enter custom payload"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="forwardAmount"
                render={() => (
                  <FormItem>
                    <FormLabel>Forward Amount (in nano, 1 for just notification):</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        {...register('forwardAmount', { required: 'Forward Amount is required' })}
                        placeholder="Enter forward amount"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="forwardPayload"
                render={() => (
                  <FormItem>
                    <FormLabel>Forward Payload (base64):</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        {...register('forwardPayload')}
                        placeholder="Enter forward payload"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit">Initiate Transfer</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      {deployParams && (
        <ResultContainer address={nftAddress} cell={deployParams} amount={new BN(100000000)} />
      )}
    </div>
  )
}
