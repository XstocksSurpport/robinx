import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useAccount } from 'wagmi'

export function useWalletAddress() {
  const { address: wagmiAddress, isConnected: wagmiConnected } = useAccount()
  const { authenticated } = usePrivy()
  const { wallets } = useWallets()

  const walletAddress = wallets[0]?.address as `0x${string}` | undefined
  const address = (wagmiAddress ?? walletAddress) as `0x${string}` | undefined

  return {
    address,
    isConnected: wagmiConnected || (authenticated && !!address),
  }
}

export function formatTxError(message: string) {
  if (message.toLowerCase().includes('exceeds the balance')) {
    return 'Insufficient balance for this amount plus gas fees.'
  }
  if (message.toLowerCase().includes('user rejected')) {
    return 'Transaction cancelled.'
  }
  if (message.length > 120) {
    return message.slice(0, 120) + '…'
  }
  return message
}

export function truncateAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}
