import { storeJettonTransferMessage } from '@/contracts/jetton/jetton-wallet'
import { useTonClient } from '@/store/tonClient'
import { useTonAddress } from '@tonconnect/ui-react'
import { useEffect, useMemo, useState } from 'react'
import { Address, beginCell, Cell, TupleBuilder } from 'ton-core'
import { ResultContainer } from './ResultContainer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { useToast } from '@/components/ui/use-toast'

export function TransferJetton() {
  const senderAddress = useTonAddress()
  const tonClient = useTonClient()
  const { toast } = useToast()

  const form = useForm({
    defaultValues: {
      jettonContractAddress: '',
      queryId: '0',
      destinationAddress: '',
      responseDestinationAddress: '',
      amount: '',
      customPayload: '',
      forwardAmount: '',
      forwardPayload: '',
    },
  })

  const [jettonWalletAddress, setJettonWalletAddress] = useState('')

  const updateInfo = async () => {
    const jettonContractAddress = form.getValues('jettonContractAddress')
    let address: Address
    try {
      address = Address.parse(jettonContractAddress)
    } catch (e) {
      return
    }

    let sender: Address
    try {
      sender = Address.parse(senderAddress)
    } catch (e) {
      return
    }

    const builder = new TupleBuilder()
    builder.writeAddress(sender)
    const info = await tonClient.value.runMethod(address, 'get_wallet_address', builder.build())

    const jettonWalletAddress = info.stack.readAddress()

    setJettonWalletAddress(jettonWalletAddress.toString({ bounceable: true, urlSafe: true }))
    console.log('jetton wallet address', jettonWalletAddress)
  }

  useEffect(() => {
    updateInfo()
  }, [form.watch('jettonContractAddress'), tonClient, senderAddress])

  useEffect(() => {
    try {
      Address.parse(form.getValues('responseDestinationAddress'))
      return
    } catch (e) {}

    let sender: Address
    try {
      sender = Address.parse(senderAddress)
    } catch (e) {
      return
    }

    form.setValue(
      'responseDestinationAddress',
      sender.toString({ bounceable: false, urlSafe: true })
    )
  }, [senderAddress, form.watch('responseDestinationAddress')])

  useEffect(() => {
    let destination: ReturnType<typeof Address.parseFriendly>
    try {
      destination = Address.parseFriendly(form.getValues('destinationAddress'))
    } catch (e) {
      return
    }

    if (!destination.isBounceable) {
      return
    }

    form.setValue(
      'destinationAddress',
      destination.address.toString({ bounceable: false, urlSafe: true })
    )
  }, [form.watch('destinationAddress')])

  useEffect(() => {
    let destination: ReturnType<typeof Address.parseFriendly>
    try {
      destination = Address.parseFriendly(form.getValues('responseDestinationAddress'))
    } catch (e) {
      return
    }

    if (!destination.isBounceable) {
      return
    }

    form.setValue(
      'responseDestinationAddress',
      destination.address.toString({ bounceable: false, urlSafe: true })
    )
  }, [form.watch('responseDestinationAddress')])

  const deployParams = useMemo(() => {
    console.log('deployParams', form.getValues())
    const values = form.getValues()

    if (!jettonWalletAddress || !values.destinationAddress || !values.amount || !senderAddress) {
      return
    }

    let message: Cell | null = null
    try {
      message = beginCell()
        .store(
          storeJettonTransferMessage({
            queryId: values.queryId ? BigInt(values.queryId) : 0n,
            amount: BigInt(values.amount),
            destination: Address.parse(values.destinationAddress),
            responseDestination: values.responseDestinationAddress
              ? Address.parse(values.responseDestinationAddress)
              : Address.parse(senderAddress),
            customPayload: values.customPayload ? Cell.fromBase64(values.customPayload) : null,
            forwardAmount: BigInt(values.forwardAmount),
            forwardPayload: values.forwardPayload ? Cell.fromBase64(values.forwardPayload) : null,
          })
        )
        .endCell()
    } catch (e) {
      console.log('store error', e)
    }

    return message
  }, [form.watch(), jettonWalletAddress, senderAddress])

  const onSubmit = () => {
    if (deployParams) {
      toast({
        title: 'Transfer Initiated',
        description: 'Your Jetton transfer has been initiated successfully.',
      })
    } else {
      toast({
        title: 'Transfer Failed',
        description: 'There was an error initiating the Jetton transfer. Please check your inputs.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto">
      <Card className="">
        <CardHeader>
          <CardTitle>Transfer Jetton</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="jettonContractAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jetton Contract Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="queryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Query ID</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="destinationAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="responseDestinationAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Response Destination Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (in units)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customPayload"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Payload (base64)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="forwardAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forward Amount (in nano)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="forwardPayload"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forward Payload (base64)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>
      {deployParams && (
        <ResultContainer address={jettonWalletAddress} cell={deployParams} amount={100000000n} />
      )}
    </div>
  )
}
