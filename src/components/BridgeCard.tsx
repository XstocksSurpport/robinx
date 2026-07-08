import { useState, useMemo } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useBalance } from 'wagmi'
import { formatEther } from 'viem'
import {
  SUPPORTED_CHAINS,
  CHAIN_SHORT_NAMES,
  type SupportedChain,
} from '../config/chains'
import { ChainSelector } from './ChainSelector'
import { ChainButton } from './ChainButton'

const ETH_PRICE_USD = 3450

function getChainById(id: number) {
  return SUPPORTED_CHAINS.find((c) => c.id === id)!
}

function SwapIcon({ onSwap }: { onSwap: () => void }) {
  return (
    <div className="flex justify-center -my-2 relative z-10">
      <button
        type="button"
        onClick={onSwap}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-cyan text-black shadow-lg transition hover:brightness-110"
        aria-label="Swap direction"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M11 2v5H6l2-2-2-2h5zM5 14V9h5l-2 2 2 2H5z" />
        </svg>
      </button>
    </div>
  )
}

export function BridgeCard() {
  const { authenticated, login, user } = usePrivy()
  const walletAddress = user?.wallet?.address as `0x${string}` | undefined
  const [fromChainId, setFromChainId] = useState(4663)
  const [toChainId, setToChainId] = useState(1)
  const [amount, setAmount] = useState('')
  const [selectorOpen, setSelectorOpen] = useState<'from' | 'to' | null>(null)
  const [slippageOpen, setSlippageOpen] = useState(false)
  const [slippage, setSlippage] = useState('0.5')

  const fromChain = getChainById(fromChainId)
  const toChain = getChainById(toChainId)

  const { data: balance, isLoading: isBalanceLoading } = useBalance({
    address: walletAddress,
    chainId: fromChainId as SupportedChain['id'],
    query: { enabled: authenticated && !!walletAddress },
  })

  const formattedBalance = useMemo(() => {
    if (!balance) return '0'
    const value = parseFloat(formatEther(balance.value))
    if (value === 0) return '0'
    if (value < 0.0001) return value.toExponential(2)
    return value.toLocaleString('en-US', { maximumFractionDigits: 4 })
  }, [balance])

  const estimatedOutput = useMemo(() => {
    const val = parseFloat(amount)
    if (isNaN(val) || val <= 0) return '0.0'
    const fee = 0.001
    return (val - fee > 0 ? val - fee : 0).toFixed(4)
  }, [amount])

  const usdValue = useMemo(() => {
    const val = parseFloat(amount)
    if (isNaN(val) || val <= 0) return '0.00'
    return (val * ETH_PRICE_USD).toFixed(2)
  }, [amount])

  const swapDirection = () => {
    setFromChainId(toChainId)
    setToChainId(fromChainId)
  }

  const handleBridge = () => {
    if (!authenticated) {
      login()
      return
    }
    alert(
      `Bridge request submitted\n\nFrom: ${fromChain.name}\nTo: ${toChain.name}\nAmount: ${amount} ETH`,
    )
  }

  const canBridge =
    authenticated &&
    amount &&
    parseFloat(amount) > 0 &&
    fromChainId !== toChainId

  return (
    <>
      <div className="w-full max-w-md rounded-3xl bg-brand-card p-5 shadow-2xl">
        {/* Tabs */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex gap-6">
            <button className="border-b-2 border-brand-cyan pb-1 text-sm font-semibold text-white">
              Bridge
            </button>
          </div>
          <button
            onClick={() => setSlippageOpen(!slippageOpen)}
            className="text-gray-400 transition hover:text-white"
            aria-label="Settings"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          </button>
        </div>

        {slippageOpen && (
          <div className="mb-4 rounded-xl bg-brand-input p-3">
            <p className="mb-2 text-xs text-gray-400">Slippage tolerance (%)</p>
            <div className="flex gap-2">
              {['0.1', '0.5', '1.0'].map((v) => (
                <button
                  key={v}
                  onClick={() => setSlippage(v)}
                  className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
                    slippage === v
                      ? 'bg-brand-cyan text-black'
                      : 'bg-white/10 text-gray-300 hover:bg-white/15'
                  }`}
                >
                  {v}%
                </button>
              ))}
              <input
                type="number"
                value={slippage}
                onChange={(e) => setSlippage(e.target.value)}
                className="w-16 rounded-lg bg-white/10 px-2 py-1 text-xs text-white outline-none"
              />
            </div>
          </div>
        )}

        {/* From */}
        <div className="rounded-2xl bg-brand-input p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-gray-400">From</span>
            <ChainButton chainId={fromChainId} onClick={() => setSelectorOpen('from')} />
          </div>
          {authenticated && walletAddress && (
            <div className="mb-2 flex justify-end">
              <span className="text-xs text-gray-500">
                Balance:{' '}
                {isBalanceLoading ? '...' : `${formattedBalance} ETH`}
              </span>
            </div>
          )}
          <input
            type="number"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-transparent text-3xl font-medium text-white outline-none placeholder:text-gray-600"
          />
          <div className="mt-1 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {CHAIN_SHORT_NAMES[fromChainId]} · ETH
            </span>
            <span className="text-xs text-gray-500">≈ ${usdValue}</span>
          </div>
        </div>

        <SwapIcon onSwap={swapDirection} />

        {/* To */}
        <div className="rounded-2xl bg-brand-input p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-gray-400">To</span>
            <ChainButton chainId={toChainId} onClick={() => setSelectorOpen('to')} />
          </div>
          <input
            type="text"
            readOnly
            placeholder="0.0"
            value={estimatedOutput}
            className="w-full bg-transparent text-3xl font-medium text-white outline-none placeholder:text-gray-600"
          />
          <div className="mt-1 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {CHAIN_SHORT_NAMES[toChainId]} · ETH
            </span>
            <span className="text-xs text-gray-500">
              ≈ ${(parseFloat(estimatedOutput) * ETH_PRICE_USD).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Rate info */}
        <div className="mt-4 space-y-1 text-xs text-gray-400">
          <div className="flex justify-between">
            <span>Rate · 1:1 bridge</span>
            <span>1 ETH ≈ 1 ETH</span>
          </div>
          <div className="flex justify-between">
            <span>Bridge fee</span>
            <span>~0.001 ETH</span>
          </div>
          <div className="flex justify-between">
            <span>Estimated arrival</span>
            <span>2≈15 minutes</span>
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={handleBridge}
          disabled={authenticated && (!amount || parseFloat(amount) <= 0 || fromChainId === toChainId)}
          className={`mt-5 w-full rounded-2xl py-4 text-base font-semibold transition ${
            !authenticated
              ? 'bg-brand-purple text-white hover:brightness-110'
              : canBridge
                ? 'bg-brand-purple text-white hover:brightness-110'
                : 'cursor-not-allowed bg-brand-input text-gray-500'
          }`}
        >
          {!authenticated
            ? 'Connect Wallet'
            : fromChainId === toChainId
              ? 'Select different networks'
              : !amount || parseFloat(amount) <= 0
                ? 'Enter amount'
                : 'Confirm Bridge'}
        </button>
      </div>

      <ChainSelector
        selectedChainId={selectorOpen === 'from' ? fromChainId : toChainId}
        onSelect={(id) => {
          if (selectorOpen === 'from') setFromChainId(id)
          else setToChainId(id)
        }}
        excludeChainId={selectorOpen === 'from' ? toChainId : fromChainId}
        open={selectorOpen !== null}
        onClose={() => setSelectorOpen(null)}
      />
    </>
  )
}

