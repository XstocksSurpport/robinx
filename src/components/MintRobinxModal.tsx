import { useEffect, useMemo, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useBalance, useSendTransaction, useSwitchChain } from 'wagmi'
import { formatEther, parseEther } from 'viem'
import { getPresaleProgress, getPresaleShares, isValidPresaleAmount, PRESALE_CONFIG } from '../config/presale'
import { robinhoodChain } from '../config/chains'
import { ChainIcon, ROBINHOOD_CHAIN_ID } from './ChainIcon'

function formatErrorMessage(message: string) {
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

interface MintRobinxModalProps {
  open: boolean
  onClose: () => void
}

export function MintRobinxModal({ open, onClose }: MintRobinxModalProps) {
  const { authenticated, login, user } = usePrivy()
  const walletAddress = user?.wallet?.address as `0x${string}` | undefined
  const [amount, setAmount] = useState('')
  const [progress, setProgress] = useState(getPresaleProgress())
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const { switchChainAsync } = useSwitchChain()
  const { sendTransactionAsync } = useSendTransaction()

  const { data: balance } = useBalance({
    address: walletAddress,
    chainId: robinhoodChain.id,
    query: { enabled: authenticated && !!walletAddress && open },
  })

  useEffect(() => {
    if (!open) return
    setProgress(getPresaleProgress())
    const timer = setInterval(() => setProgress(getPresaleProgress()), 30_000)
    return () => clearInterval(timer)
  }, [open])

  useEffect(() => {
    if (!open) {
      setAmount('')
      setStatus('idle')
      setErrorMessage('')
    }
  }, [open])

  const shares = useMemo(() => getPresaleShares(amount), [amount])

  const amountInvalid =
    amount !== '' && parseFloat(amount) > 0 && !isValidPresaleAmount(amount)

  const formattedBalance = useMemo(() => {
    if (!balance) return null
    const value = parseFloat(formatEther(balance.value))
    if (value === 0) return '0'
    return value.toLocaleString('en-US', { maximumFractionDigits: 4 })
  }, [balance])

  const handleMint = async () => {
    if (!authenticated) {
      login()
      return
    }

    const val = parseFloat(amount)
    if (isNaN(val) || val <= 0) return
    if (!isValidPresaleAmount(amount)) {
      setStatus('error')
      setErrorMessage('Amount must be a multiple of 0.05 ETH.')
      return
    }

    setStatus('pending')
    setErrorMessage('')

    try {
      await switchChainAsync({ chainId: robinhoodChain.id })
      await sendTransactionAsync({
        to: PRESALE_CONFIG.recipient,
        value: parseEther(amount),
        chainId: robinhoodChain.id,
      })
      setStatus('success')
      setAmount('')
    } catch (err) {
      setStatus('error')
      const error = err as { shortMessage?: string; message?: string }
      setErrorMessage(
        formatErrorMessage(error.shortMessage || error.message || 'Transaction failed'),
      )
    }
  }

  const setMaxAmount = () => {
    if (!balance) return
    const shareWei = parseEther(String(PRESALE_CONFIG.pricePerShareEth))
    const gasReserve = parseEther('0.001')
    let max = balance.value - gasReserve
    if (max <= 0n) return
    max = (max / shareWei) * shareWei
    setAmount(formatEther(max))
    setStatus('idle')
    setErrorMessage('')
  }

  if (!open) return null

  const canPay =
    authenticated &&
    amount &&
    isValidPresaleAmount(amount) &&
    status !== 'pending'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-4 backdrop-blur-xl"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[420px] overflow-hidden rounded-3xl border border-white/10 bg-brand-card/75 shadow-2xl backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="text-base font-semibold text-white">mint robinx</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-white/5 hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 p-5">
          {/* Presale stats */}
          <div className="rounded-2xl border border-white/5 bg-brand-input/60 p-4 backdrop-blur-sm">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Presale price</span>
                <span className="font-medium tabular-nums text-white">
                  {PRESALE_CONFIG.pricePerShareEth} ETH / share
                </span>
              </div>
              <div className="h-px bg-white/5" />
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-gray-400">Sold</span>
                  <span className="font-semibold tabular-nums text-brand-cyan">
                    {progress.toFixed(2)}%
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-brand-cyan transition-all duration-500"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Amount input */}
          <div className="rounded-2xl border border-white/5 bg-brand-input/60 p-4 backdrop-blur-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-gray-400">Amount</span>
              {authenticated && formattedBalance !== null && (
                <button
                  type="button"
                  onClick={setMaxAmount}
                  className="text-xs text-gray-500 transition hover:text-brand-cyan"
                >
                  Balance: {formattedBalance} ETH · Max
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step={PRESALE_CONFIG.pricePerShareEth}
                min={PRESALE_CONFIG.pricePerShareEth}
                placeholder="0.0"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value)
                  setStatus('idle')
                  setErrorMessage('')
                }}
                className={`min-w-0 flex-1 bg-transparent text-3xl font-medium tabular-nums text-white outline-none placeholder:text-gray-600 ${
                  amountInvalid ? 'text-red-400' : ''
                }`}
              />
              <span className="shrink-0 text-sm font-medium text-gray-400">ETH</span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3 text-xs text-gray-500">
              <span className={`tabular-nums ${amountInvalid ? 'text-red-400' : ''}`}>
                {amountInvalid
                  ? 'Must be a multiple of 0.05 ETH'
                  : shares > 0
                    ? `${shares} share${shares > 1 ? 's' : ''}`
                    : 'Multiples of 0.05 ETH only'}
              </span>
              <span className="flex items-center gap-1.5">
                <ChainIcon chainId={ROBINHOOD_CHAIN_ID} size="sm" />
                Robinhood Chain
              </span>
            </div>
          </div>

          {/* Status messages */}
          {status === 'success' && (
            <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
              Payment submitted successfully!
            </div>
          )}
          {status === 'error' && errorMessage && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm leading-relaxed text-red-400">
              {errorMessage}
            </div>
          )}

          {/* Action */}
          <button
            onClick={handleMint}
            disabled={!canPay && authenticated}
            className={`w-full rounded-2xl py-4 text-base font-semibold transition ${
              status === 'pending'
                ? 'cursor-wait bg-brand-input text-gray-400'
                : !authenticated
                  ? 'bg-brand-purple text-white hover:brightness-110'
                  : canPay
                    ? 'bg-brand-purple text-white hover:brightness-110'
                    : 'cursor-not-allowed bg-brand-input text-gray-500'
            }`}
          >
            {!authenticated
              ? 'Connect Wallet'
              : status === 'pending'
                ? 'Confirm in wallet...'
                : !amount || parseFloat(amount) <= 0
                  ? 'Enter amount'
                  : amountInvalid
                    ? 'Invalid amount'
                    : 'Pay with ETH'}
          </button>
        </div>
      </div>
    </div>
  )
}

interface MintRobinxButtonProps {
  className?: string
}

export function MintRobinxButton({ className = '' }: MintRobinxButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`text-sm font-medium text-gray-300 transition hover:text-white ${className}`}
      >
        mint robinx
      </button>
      <MintRobinxModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
