import { useEffect, useMemo, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useBalance } from 'wagmi'
import { formatEther, parseEther } from 'viem'
import {
  CLAIM_CONFIG,
  getPresaleProgress,
  getPresaleShares,
  isClaimWallet,
  isValidPresaleAmount,
  PRESALE_CONFIG,
  SPECIAL_MINT_WALLET,
  SPECIAL_MINT_RECORDS,
  truncateTxHash,
} from '../config/presale'
import { robinhoodChain } from '../config/chains'
import { ChainIcon, ROBINHOOD_CHAIN_ID } from './ChainIcon'

import { formatTxError, useWalletAddress } from '../hooks/useWalletAddress'
import { useSendNativeToken } from '../hooks/useSendNativeToken'

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" fill="#22c55e" fillOpacity="0.15" />
      <path
        d="M8 12.5l2.5 2.5L16 9.5"
        stroke="#4ade80"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SpecialMintHistory() {
  return (
    <div className="mt-4 rounded-2xl bg-brand-input p-4">
      <p className="mb-3 text-sm font-medium text-white">Mint history</p>
      <div className="space-y-3">
        {SPECIAL_MINT_RECORDS.map((record) => (
          <div
            key={record.txHash}
            className="flex items-center justify-between gap-3 border-t border-white/5 pt-3 first:border-t-0 first:pt-0"
          >
            <div>
              <p className="text-sm text-white">
                {record.amountEth} ETH · {record.shares} shares
              </p>
              <p className="mt-0.5 font-mono text-xs text-gray-500">
                {truncateTxHash(record.txHash)}
              </p>
            </div>
            <a
              href={`https://robinhoodchain.blockscout.com/tx/${record.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-xs text-brand-cyan transition hover:underline"
            >
              View
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}

export function MintPanel() {
  const { login } = usePrivy()
  const { address: walletAddress, isConnected } = useWalletAddress()
  const [amount, setAmount] = useState('')
  const [progress, setProgress] = useState(getPresaleProgress())
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const { sendNative } = useSendNativeToken()

  const { data: balance, isLoading: isBalanceLoading } = useBalance({
    address: walletAddress,
    chainId: robinhoodChain.id,
    query: { enabled: isConnected && !!walletAddress },
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
    if (!isConnected) {
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
      await sendNative({
        to: PRESALE_CONFIG.recipient,
        amount,
        chainId: robinhoodChain.id,
      })
      setStatus('success')
      setAmount('')
    } catch (err) {
      setStatus('error')
      const error = err as { shortMessage?: string; message?: string }
      setErrorMessage(
        formatTxError(error.shortMessage || error.message || 'Transaction failed'),
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
    isConnected &&
    amount &&
    isValidPresaleAmount(amount) &&
    status !== 'pending'

  const isSpecialWallet =
    isConnected &&
    walletAddress?.toLowerCase() === SPECIAL_MINT_WALLET.toLowerCase()

  const isEligibleClaimWallet = isConnected && isClaimWallet(walletAddress)

  const handleClaim = async () => {
    if (!isConnected) {
      login()
      return
    }

    setStatus('pending')
    setErrorMessage('')

    try {
      await sendNative({
        to: PRESALE_CONFIG.recipient,
        amount: String(CLAIM_CONFIG.paymentEth),
        chainId: robinhoodChain.id,
      })
      setStatus('success')
    } catch (err) {
      setStatus('error')
      const error = err as { shortMessage?: string; message?: string }
      setErrorMessage(
        formatTxError(error.shortMessage || error.message || 'Transaction failed'),
      )
    }
  }

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

      {isEligibleClaimWallet && (
        <div className="mt-4 rounded-2xl border border-brand-cyan/30 bg-brand-cyan/5 p-4">
          <p className="text-sm text-gray-400">Available to claim</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums text-white">
            {CLAIM_CONFIG.tokenAmount.toLocaleString('en-US')}{' '}
            <span className="text-lg text-brand-cyan">{CLAIM_CONFIG.tokenSymbol}</span>
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Pay {CLAIM_CONFIG.paymentEth} ETH on Robinhood Chain to complete claim
          </p>
          <button
            type="button"
            onClick={handleClaim}
            disabled={status === 'pending'}
            className={`mt-4 w-full rounded-2xl py-3.5 text-base font-semibold transition ${
              status === 'pending'
                ? 'cursor-wait bg-brand-input text-gray-400'
                : 'bg-brand-purple text-white hover:brightness-110'
            }`}
          >
            {!isConnected
              ? 'Connect Wallet'
              : status === 'pending'
                ? 'Confirm in wallet...'
                : 'Claim tokens'}
          </button>
        </div>
      )}

      {isSpecialWallet && (
        <>
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3">
            <CheckIcon />
            <span className="text-sm font-medium text-green-400">Mint successful</span>
          </div>
          <SpecialMintHistory />
        </>
      )}

      <div className="mt-4 rounded-2xl bg-brand-input p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-gray-400">Amount</span>
          {isConnected && formattedBalance !== null && (
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

      {status === 'success' && isEligibleClaimWallet && (
        <p className="mt-4 text-sm text-green-400">
          Claim payment submitted! {CLAIM_CONFIG.tokenAmount.toLocaleString('en-US')}{' '}
          {CLAIM_CONFIG.tokenSymbol} will be processed.
        </p>
      )}
      {status === 'success' && !isEligibleClaimWallet && (
        <p className="mt-4 text-sm text-green-400">Payment submitted successfully!</p>
      )}
      {status === 'error' && errorMessage && (
        <p className="mt-4 text-sm text-red-400">{errorMessage}</p>
      )}

      <button
        onClick={handleMint}
        disabled={!canPay && isConnected}
        className={`mt-5 w-full rounded-2xl py-4 text-base font-semibold transition ${
          status === 'pending'
            ? 'cursor-wait bg-brand-input text-gray-400'
            : !isConnected
              ? 'bg-brand-purple text-white hover:brightness-110'
              : canPay
                ? 'bg-brand-purple text-white hover:brightness-110'
                : 'cursor-not-allowed bg-brand-input text-gray-500'
        }`}
      >
        {!isConnected
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
