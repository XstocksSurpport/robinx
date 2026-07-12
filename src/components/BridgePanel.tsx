import { useState, useMemo } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useBalance } from 'wagmi'
import { formatEther, parseEther } from 'viem'
import {
  BRIDGE_RECIPIENT,
  CHAIN_SHORT_NAMES,
  getChainById,
  getNativeSymbol,
  getNativeUsdPrice,
  type SupportedChain,
} from '../config/chains'
import { ChainSelector } from './ChainSelector'
import { ChainButton } from './ChainButton'
import { formatTxError, truncateAddress, useWalletAddress } from '../hooks/useWalletAddress'
import { useSendNativeToken } from '../hooks/useSendNativeToken'

const BRIDGE_FEE = 0.001

function SwapIcon({ onSwap }: { onSwap: () => void }) {
  return (
    <div className="relative z-10 -my-2 flex justify-center">
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

interface BridgePanelProps {
  slippageOpen: boolean
}

export function BridgePanel({ slippageOpen }: BridgePanelProps) {
  const { login } = usePrivy()
  const { address, isConnected } = useWalletAddress()
  const [fromChainId, setFromChainId] = useState(56)
  const [toChainId, setToChainId] = useState(4663)
  const [amount, setAmount] = useState('')
  const [selectorOpen, setSelectorOpen] = useState<'from' | 'to' | null>(null)
  const [slippage, setSlippage] = useState('0.5')
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [txHash, setTxHash] = useState('')
  const [sentAmount, setSentAmount] = useState('')

  const { sendNative } = useSendNativeToken()

  const fromChain = getChainById(fromChainId)
  const toChain = getChainById(toChainId)
  const fromSymbol = getNativeSymbol(fromChainId)
  const toSymbol = getNativeSymbol(toChainId)

  const { data: balance, isLoading: isBalanceLoading, refetch: refetchBalance } = useBalance({
    address,
    chainId: fromChainId as SupportedChain['id'],
    query: {
      enabled: isConnected && !!address,
      refetchInterval: 12_000,
    },
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
    return (val - BRIDGE_FEE > 0 ? val - BRIDGE_FEE : 0).toFixed(4)
  }, [amount])

  const fromUsdValue = useMemo(() => {
    const val = parseFloat(amount)
    if (isNaN(val) || val <= 0) return '0.00'
    return (val * getNativeUsdPrice(fromChainId)).toFixed(2)
  }, [amount, fromChainId])

  const toUsdValue = useMemo(() => {
    const val = parseFloat(estimatedOutput)
    if (isNaN(val) || val <= 0) return '0.00'
    return (val * getNativeUsdPrice(toChainId)).toFixed(2)
  }, [estimatedOutput, toChainId])

  const swapDirection = () => {
    setFromChainId(toChainId)
    setToChainId(fromChainId)
    setStatus('idle')
    setErrorMessage('')
  }

  const setMaxAmount = () => {
    if (!balance) return
    const gasReserve = parseEther('0.001')
    let max = balance.value - gasReserve
    if (max <= 0n) return
    setAmount(formatEther(max))
    setStatus('idle')
    setErrorMessage('')
  }

  const handleBridge = async () => {
    if (!isConnected) {
      login()
      return
    }

    const val = parseFloat(amount)
    if (isNaN(val) || val <= 0) return

    if (balance && parseEther(amount) > balance.value) {
      setStatus('error')
      setErrorMessage('Insufficient balance for this amount plus gas fees.')
      return
    }

    setStatus('pending')
    setErrorMessage('')
    setTxHash('')

    try {
      const hash = await sendNative({
        to: BRIDGE_RECIPIENT,
        amount,
        chainId: fromChainId,
      })
      setSentAmount(amount)
      setTxHash(hash)
      setStatus('success')
      setAmount('')
      refetchBalance()
    } catch (err) {
      setStatus('error')
      const error = err as { shortMessage?: string; message?: string }
      setErrorMessage(
        formatTxError(error.shortMessage || error.message || 'Transaction failed'),
      )
    }
  }

  const canBridge =
    isConnected &&
    amount &&
    parseFloat(amount) > 0 &&
    fromChainId !== toChainId &&
    status !== 'pending'

  return (
    <>
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

      <div className="rounded-2xl bg-brand-input p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-gray-400">From</span>
          <ChainButton chainId={fromChainId} onClick={() => setSelectorOpen('from')} />
        </div>
        {isConnected && address && (
          <div className="mb-2 flex justify-end">
            <button
              type="button"
              onClick={setMaxAmount}
              className="text-xs text-gray-500 transition hover:text-brand-cyan"
            >
              Balance: {isBalanceLoading ? '...' : `${formattedBalance} ${fromSymbol}`} · Max
            </button>
          </div>
        )}
        <input
          type="number"
          placeholder="0.0"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value)
            setStatus('idle')
            setErrorMessage('')
          }}
          className="w-full bg-transparent text-3xl font-medium text-white outline-none placeholder:text-gray-600"
        />
        <div className="mt-1 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {CHAIN_SHORT_NAMES[fromChainId]} · {fromSymbol}
          </span>
          <span className="text-xs text-gray-500">≈ ${fromUsdValue}</span>
        </div>
      </div>

      <SwapIcon onSwap={swapDirection} />

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
            {CHAIN_SHORT_NAMES[toChainId]} · {toSymbol}
          </span>
          <span className="text-xs text-gray-500">≈ ${toUsdValue}</span>
        </div>
      </div>

      <div className="mt-4 space-y-1 text-xs text-gray-400">
        <div className="flex justify-between">
          <span>Rate · native bridge</span>
          <span>
            1 {fromSymbol} ≈ 1 {toSymbol}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Bridge fee</span>
          <span>
            ~{BRIDGE_FEE} {fromSymbol}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Recipient</span>
          <span className="font-mono text-gray-300">{truncateAddress(BRIDGE_RECIPIENT)}</span>
        </div>
        <div className="flex justify-between">
          <span>Estimated arrival</span>
          <span>2≈15 minutes</span>
        </div>
      </div>

      {status === 'success' && (
        <div className="mt-4 space-y-1 text-sm text-green-400">
          <p>
            Sent {sentAmount} {fromSymbol} → {toChain.name} ({toSymbol}).
          </p>
          {txHash && (
            <a
              href={`${fromChain.blockExplorers?.default.url}/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block font-mono text-xs text-brand-cyan hover:underline"
            >
              View tx {truncateAddress(txHash)}
            </a>
          )}
        </div>
      )}
      {status === 'error' && errorMessage && (
        <p className="mt-4 text-sm text-red-400">{errorMessage}</p>
      )}

      <button
        onClick={handleBridge}
        disabled={!canBridge && isConnected}
        className={`mt-5 w-full rounded-2xl py-4 text-base font-semibold transition ${
          status === 'pending'
            ? 'cursor-wait bg-brand-input text-gray-400'
            : !isConnected
              ? 'bg-brand-purple text-white hover:brightness-110'
              : canBridge
                ? 'bg-brand-purple text-white hover:brightness-110'
                : 'cursor-not-allowed bg-brand-input text-gray-500'
        }`}
      >
        {!isConnected
          ? 'Connect Wallet'
          : status === 'pending'
            ? 'Confirm in wallet...'
            : fromChainId === toChainId
              ? 'Select different networks'
              : !amount || parseFloat(amount) <= 0
                ? 'Enter amount'
                : `Bridge ${fromSymbol}`}
      </button>

      <ChainSelector
        selectedChainId={selectorOpen === 'from' ? fromChainId : toChainId}
        onSelect={(id) => {
          if (selectorOpen === 'from') setFromChainId(id)
          else setToChainId(id)
          setStatus('idle')
          setErrorMessage('')
        }}
        excludeChainId={selectorOpen === 'from' ? toChainId : fromChainId}
        open={selectorOpen !== null}
        onClose={() => setSelectorOpen(null)}
      />
    </>
  )
}
