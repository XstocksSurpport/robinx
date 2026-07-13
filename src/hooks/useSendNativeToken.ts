import { useCallback } from 'react'
import { useWallets } from '@privy-io/react-auth'
import { useSetActiveWallet } from '@privy-io/wagmi'
import { useAccount } from 'wagmi'
import {
  createPublicClient,
  http,
  parseEther,
  toHex,
  type Address,
  type Hash,
} from 'viem'
import { robinhoodChain, ROBINHOOD_CHAIN_PARAMS } from '../config/chains'

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
const CLAIM_GAS_BUFFER_MULTIPLIER = 10n
const MIN_CLAIM_FEE_RESERVE = parseEther('0.00001')

type WalletProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

const robinhoodPublicClient = createPublicClient({
  chain: robinhoodChain,
  transport: http(robinhoodChain.rpcUrls.default.http[0]),
})

function isUnrecognizedChainError(error: unknown) {
  const walletError = error as {
    code?: number
    data?: { originalError?: { code?: number } }
  }

  return (
    walletError.code === 4902 ||
    walletError.data?.originalError?.code === 4902
  )
}

function maxBigInt(a: bigint, b: bigint) {
  return a > b ? a : b
}

async function verifyProviderChain(provider: WalletProvider, chainId: number) {
  const chainIdHex = toHex(chainId)
  const activeChainId = (await provider.request({
    method: 'eth_chainId',
  })) as string

  if (activeChainId.toLowerCase() !== chainIdHex) {
    throw new Error('Please switch wallet to Robinhood Chain and try again.')
  }
}

async function switchProviderChain(provider: WalletProvider, chainId: number) {
  const chainIdHex = toHex(chainId)

  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }],
    })
  } catch (error) {
    if (!isUnrecognizedChainError(error) || chainId !== robinhoodChain.id) {
      throw error
    }

    await provider.request({
      method: 'wallet_addEthereumChain',
      params: [ROBINHOOD_CHAIN_PARAMS],
    })
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }],
    })
  }

  await verifyProviderChain(provider, chainId)
}

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

      const provider = (await wallet.getEthereumProvider()) as WalletProvider

      try {
        await switchProviderChain(provider, chainId)
      } catch {
        await wallet.switchChain(chainId)
        await verifyProviderChain(provider, chainId)
      }

      return { provider, wallet }
    },
    [wallets, address, isConnected, setActiveWallet],
  )

  const sendNative = useCallback(
    async ({ to, amount, chainId }: SendNativeParams): Promise<Hash> => {
      const value = parseEther(amount)
      const { provider, wallet } = await getReadyProvider(chainId)
      const hash = await provider.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: wallet.address,
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
      const account = wallet.address as Address
      const [balance, gasPrice, estimatedGas] = await Promise.all([
        robinhoodPublicClient.getBalance({ address: account }),
        robinhoodPublicClient.getGasPrice(),
        robinhoodPublicClient
          .estimateGas({ account, to, value: 0n })
          .catch(() => NATIVE_TRANSFER_GAS),
      ])
      const fee = maxBigInt(
        gasPrice * estimatedGas * CLAIM_GAS_BUFFER_MULTIPLIER,
        MIN_CLAIM_FEE_RESERVE,
      )
      const value = balance - fee

      if (value <= 0n) {
        throw new Error('Insufficient Robinhood ETH for gas fees.')
      }

      const hash = await provider.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: wallet.address,
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
