import { useCallback } from 'react'
import { useWallets } from '@privy-io/react-auth'
import { useSetActiveWallet } from '@privy-io/wagmi'
import { useAccount, useSendTransaction } from 'wagmi'
import { parseEther, toHex, type Hash } from 'viem'
import type { SupportedChain } from '../config/chains'

type SendNativeParams = {
  to: `0x${string}`
  amount: string
  chainId: number
}

export function useSendNativeToken() {
  const { wallets } = useWallets()
  const { setActiveWallet } = useSetActiveWallet()
  const { address, isConnected } = useAccount()
  const { sendTransactionAsync } = useSendTransaction()

  const sendNative = useCallback(
    async ({ to, amount, chainId }: SendNativeParams): Promise<Hash> => {
      const value = parseEther(amount)
      const wallet =
        wallets.find((w) => w.address.toLowerCase() === address?.toLowerCase()) ??
        wallets[0]

      if (!wallet) {
        throw new Error('Connect wallet first')
      }

      if (!isConnected) {
        await setActiveWallet(wallet)
      }

      try {
        return await sendTransactionAsync({
          to,
          value,
          chainId: chainId as SupportedChain['id'],
        })
      } catch {
        // Fall back to wallet provider (more reliable on mobile in-app browsers)
      }

      try {
        await wallet.switchChain(chainId)
      } catch {
        // Wallet may prompt chain switch when sending
      }

      const provider = await wallet.getEthereumProvider()
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
    [wallets, address, isConnected, setActiveWallet, sendTransactionAsync],
  )

  return { sendNative }
}
