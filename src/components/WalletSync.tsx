import { useEffect } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useSetActiveWallet } from '@privy-io/wagmi'
import { useAccount } from 'wagmi'

/** Keep Privy wallet synced with wagmi so sendTransaction works on mobile. */
export function WalletSync() {
  const { ready, authenticated } = usePrivy()
  const { wallets } = useWallets()
  const { setActiveWallet } = useSetActiveWallet()
  const { isConnected } = useAccount()

  useEffect(() => {
    if (!ready || !authenticated || isConnected || wallets.length === 0) return
    void setActiveWallet(wallets[0])
  }, [ready, authenticated, isConnected, wallets, setActiveWallet])

  return null
}
