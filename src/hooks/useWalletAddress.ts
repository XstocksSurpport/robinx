import { usePrivy } from '@privy-io/react-auth'
import { useAccount } from 'wagmi'

export function useWalletAddress() {
  const { address: wagmiAddress, isConnected } = useAccount()
  const { authenticated, user } = usePrivy()

  const address = (wagmiAddress ?? user?.wallet?.address) as `0x${string}` | undefined

  return {
    address,
    isConnected: isConnected || (authenticated && !!address),
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
