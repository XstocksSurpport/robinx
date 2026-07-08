import { useEffect, useRef } from 'react'
import { SUPPORTED_CHAINS, CHAIN_SHORT_NAMES } from '../config/chains'
import type { SupportedChain } from '../config/chains'
import { ChainIcon } from './ChainIcon'

interface ChainSelectorProps {
  selectedChainId: number
  onSelect: (chainId: number) => void
  excludeChainId?: number
  open: boolean
  onClose: () => void
}

export function ChainSelector({
  selectedChainId,
  onSelect,
  excludeChainId,
  open,
  onClose,
}: ChainSelectorProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open, onClose])

  if (!open) return null

  const chains = SUPPORTED_CHAINS.filter((c) => c.id !== excludeChainId)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        ref={ref}
        className="w-full max-w-sm rounded-2xl bg-brand-card p-4 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Select Network</h3>
          <button
            onClick={onClose}
            className="text-gray-400 transition hover:text-white"
          >
            ✕
          </button>
        </div>
        <div className="max-h-80 space-y-1 overflow-y-auto">
          {chains.map((chain: SupportedChain) => (
            <button
              key={chain.id}
              onClick={() => {
                onSelect(chain.id)
                onClose()
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-white/5 ${
                chain.id === selectedChainId ? 'bg-brand-cyan/10 ring-1 ring-brand-cyan/30' : ''
              }`}
            >
              <ChainIcon chainId={chain.id} size="md" />
              <p className="font-medium text-white">
                {CHAIN_SHORT_NAMES[chain.id] || chain.name}
              </p>
              {chain.id === selectedChainId && (
                <span className="ml-auto text-brand-cyan">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
