import { usePrivy } from '@privy-io/react-auth'

function truncateAddress(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-3)}`
}

const btnClass =
  'rounded-full bg-brand-cyan px-2.5 py-1.5 text-[11px] font-semibold text-black transition hover:brightness-110 sm:px-4 sm:py-2 sm:text-xs md:px-5 md:text-sm'

export function ConnectWalletButton() {
  const { ready, authenticated, login, logout, user } = usePrivy()

  const walletAddress = user?.wallet?.address

  if (!ready) {
    return (
      <button
        disabled
        className="rounded-full bg-brand-cyan/50 px-2.5 py-1.5 text-[11px] font-semibold text-black/50 sm:px-4 sm:py-2 sm:text-xs md:px-5 md:text-sm"
      >
        <span className="sm:hidden">...</span>
        <span className="hidden sm:inline">Loading...</span>
      </button>
    )
  }

  if (authenticated && walletAddress) {
    return (
      <button onClick={logout} className={btnClass}>
        {truncateAddress(walletAddress)}
      </button>
    )
  }

  return (
    <button onClick={login} className={btnClass}>
      <span className="sm:hidden">Connect</span>
      <span className="hidden sm:inline">Connect Wallet</span>
    </button>
  )
}
