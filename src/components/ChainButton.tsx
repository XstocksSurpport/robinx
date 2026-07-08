import { CHAIN_SHORT_NAMES } from '../config/chains'
import { ChainIcon } from './ChainIcon'

interface ChainButtonProps {
  chainId: number
  onClick: () => void
}

export function ChainButton({ chainId, onClick }: ChainButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-white/15"
    >
      <ChainIcon chainId={chainId} size="sm" />
      <span>{CHAIN_SHORT_NAMES[chainId] || 'Unknown'}</span>
      <span className="text-gray-400">▾</span>
    </button>
  )
}
