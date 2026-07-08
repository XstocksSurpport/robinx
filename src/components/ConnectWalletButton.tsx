import { usePrivy } from '@privy-io/react-auth'

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function ConnectWalletButton() {
  const { ready, authenticated, login, logout, user } = usePrivy()

  const walletAddress = user?.wallet?.address

  if (!ready) {
    return (
      <button
        disabled
        className="rounded-full bg-brand-cyan/50 px-5 py-2 text-sm font-semibold text-black/50"
      >
        Loading...
      </button>
    )
  }

  if (authenticated && walletAddress) {
    return (
      <button
        onClick={logout}
        className="rounded-full bg-brand-cyan px-5 py-2 text-sm font-semibold text-black transition hover:brightness-110"
      >
        {truncateAddress(walletAddress)}
      </button>
    )
  }

  return (
    <button
      onClick={login}
      className="rounded-full bg-brand-cyan px-5 py-2 text-sm font-semibold text-black transition hover:brightness-110"
    >
      Connect Wallet
    </button>
  )
}
