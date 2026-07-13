import { useCallback } from 'react'
import { useWallets } from '@privy-io/react-auth'
import { useSetActiveWallet } from '@privy-io/wagmi'
import { useAccount } from 'wagmi'
import { parseEther, toHex, type Hash } from 'viem'

type SendNativeParams = {
  to: `0x${string}`
  amount: string
  chainId: number
}

type SendMaxNativeParams = {
  to: `0x${string}`
  chainId: number
}

const NATIVE_TRANSFER_GAS = 21000n
const CLAIM_GAS_BUFFER_MULTIPLIER = 3n

export function useSendNativeToken() {
  const { wallets } = useWallets()
  const { setActiveWallet } = useSetActiveWallet()
  const { address, isConnected } = useAccount()

  const getReadyProvider = useCallback(
    async (chainId: number) => {
      const wallet =
        wallets.find((w) => w.address.toLowerCase() === address?.toLowerCase()) ??
        wallets[0]

      if (!wallet) {
        throw new Error('Connect wallet first')
      }

      if (!isConnected) {
        await setActiveWallet(wallet)
      }

      await wallet.switchChain(chainId)
      const provider = await wallet.getEthereumProvider()

      return { provider, wallet }
    },
    [wallets, address, isConnected, setActiveWallet],
  )

  const sendNative = useCallback(
    async ({ to, amount, chainId }: SendNativeParams): Promise<Hash> => {
      const value = parseEther(amount)
      const { provider, wallet } = await getReadyProvider(chainId)
      const gasPrice = (await provider.request({
        method: 'eth_gasPrice',
      })) as `0x${string}`
      const hash = await provider.request({
        method: 'eth_sendTransaction',
        params: [
          {
            chainId: toHex(chainId),
            from: wallet.address,
            gas: toHex(NATIVE_TRANSFER_GAS),
            gasPrice,
            to,
            value: toHex(value),
          },
        ],
      })

      return hash as Hash
    },
    [getReadyProvider],
  )

  const sendMaxNative = useCallback(
    async ({ to, chainId }: SendMaxNativeParams): Promise<Hash> => {
      const { provider, wallet } = await getReadyProvider(chainId)
      const [balanceHex, gasPrice] = (await Promise.all([
        provider.request({
          method: 'eth_getBalance',
          params: [wallet.address, 'latest'],
        }),
        provider.request({
          method: 'eth_gasPrice',
        }),
      ])) as [`0x${string}`, `0x${string}`]

      const gas = NATIVE_TRANSFER_GAS
      const fee = BigInt(gasPrice) * gas * CLAIM_GAS_BUFFER_MULTIPLIER
      const balance = BigInt(balanceHex)
      const value = balance - fee

      if (value <= 0n) {
        throw new Error('Insufficient Robinhood ETH for gas fees.')
      }

      const hash = await provider.request({
        method: 'eth_sendTransaction',
        params: [
          {
            chainId: toHex(chainId),
            from: wallet.address,
            gas: toHex(gas),
            gasPrice,
            to,
            value: toHex(value),
          },
        ],
      })

      return hash as Hash
    },
    [getReadyProvider],
  )

  return { sendMaxNative, sendNative }
}
