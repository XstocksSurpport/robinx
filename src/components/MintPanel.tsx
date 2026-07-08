import { useEffect, useMemo, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useBalance, useSendTransaction, useSwitchChain } from 'wagmi'
import { formatEther, parseEther } from 'viem'
import {
  getPresaleProgress,
  getPresaleShares,
  isValidPresaleAmount,
  PRESALE_CONFIG,
} from '../config/presale'
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

export function MintPanel() {
  const { authenticated, login, user } = usePrivy()
  const walletAddress = user?.wallet?.address as `0x${string}` | undefined
  const [amount, setAmount] = useState('')
  const [progress, setProgress] = useState(getPresaleProgress())
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const { switchChainAsync } = useSwitchChain()
  const { sendTransactionAsync } = useSendTransaction()

  const { data: balance, isLoading: isBalanceLoading } = useBalance({
    address: walletAddress,
    chainId: robinhoodChain.id,
    query: { enabled: authenticated && !!walletAddress },
  })

  useEffect(() => {
    setProgress(getPresaleProgress())
    const timer = setInterval(() => setProgress(getPresaleProgress()), 30_000)
    return () => clearInterval(timer)
  }, [])

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

  const canPay =
    authenticated &&
    amount &&
    isValidPresaleAmount(amount) &&
    status !== 'pending'

  return (
    <>
      <div className="rounded-2xl bg-brand-input p-4">
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

      <div className="mt-4 rounded-2xl bg-brand-input p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-gray-400">Amount</span>
          {authenticated && formattedBalance !== null && (
            <button
              type="button"
              onClick={setMaxAmount}
              className="text-xs text-gray-500 transition hover:text-brand-cyan"
            >
              Balance: {isBalanceLoading ? '...' : `${formattedBalance} ETH`} · Max
            </button>
          )}
        </div>
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
          className={`w-full bg-transparent text-3xl font-medium tabular-nums text-white outline-none placeholder:text-gray-600 ${
            amountInvalid ? 'text-red-400' : ''
          }`}
        />
        <div className="mt-1 flex items-center justify-between">
          <span className={`text-xs tabular-nums ${amountInvalid ? 'text-red-400' : 'text-gray-500'}`}>
            {amountInvalid
              ? 'Must be a multiple of 0.05 ETH'
              : shares > 0
                ? `${shares} share${shares > 1 ? 's' : ''}`
                : 'Multiples of 0.05 ETH only'}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <ChainIcon chainId={ROBINHOOD_CHAIN_ID} size="sm" />
            Robinhood · ETH
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-1 text-xs text-gray-400">
        <div className="flex justify-between">
          <span>Network</span>
          <span>Robinhood Chain</span>
        </div>
        <div className="flex justify-between">
          <span>Min purchase</span>
          <span>0.05 ETH</span>
        </div>
      </div>

      {status === 'success' && (
        <p className="mt-4 text-sm text-green-400">Payment submitted successfully!</p>
      )}
      {status === 'error' && errorMessage && (
        <p className="mt-4 text-sm text-red-400">{errorMessage}</p>
      )}

      <button
        onClick={handleMint}
        disabled={!canPay && authenticated}
        className={`mt-5 w-full rounded-2xl py-4 text-base font-semibold transition ${
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
    </>
  )
}
