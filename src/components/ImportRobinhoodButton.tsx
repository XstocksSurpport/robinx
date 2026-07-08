import { useState, useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { ROBINHOOD_CHAIN_PARAMS } from '../config/chains'
import { RobinhoodLogo } from './ChainIcon'

export function ImportRobinhoodButton() {
  const { authenticated, login } = usePrivy()
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!message || status === 'loading') return
    const timer = setTimeout(() => {
      setMessage('')
      setStatus('idle')
    }, 3000)
    return () => clearTimeout(timer)
  }, [message, status])

  const handleImport = async () => {
    if (!authenticated) {
      login()
      return
    }

    const ethereum = (window as Window & { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum
    if (!ethereum) {
      setStatus('error')
      setMessage('No EVM wallet detected. Please install MetaMask or another wallet.')
      return
    }

    setStatus('loading')
    setMessage('')

    try {
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [ROBINHOOD_CHAIN_PARAMS],
      })
      setStatus('success')
      setMessage('Robinhood Chain added to your wallet successfully!')
    } catch (err) {
      const error = err as { code?: number; message?: string }
      if (error.code === 4902 || error.message?.includes('already')) {
        try {
          await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: ROBINHOOD_CHAIN_PARAMS.chainId }],
          })
          setStatus('success')
          setMessage('Switched to Robinhood Chain')
        } catch {
          setStatus('error')
          setMessage('Network exists but switch failed')
        }
      } else if (error.code === 4001) {
        setStatus('idle')
        setMessage('User rejected the request')
      } else {
        setStatus('error')
        setMessage(error.message || 'Failed to add network')
      }
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleImport}
        disabled={status === 'loading'}
        className="flex items-center gap-2 rounded-full border border-brand-cyan/40 bg-brand-cyan/10 px-4 py-2 text-sm font-medium text-brand-cyan transition hover:bg-brand-cyan/20 disabled:opacity-50"
      >
        <RobinhoodLogo size="sm" />
        {status === 'loading' ? 'Adding...' : 'Add Robinhood Chain'}
      </button>
      {message && (
        <p
          className={`text-xs ${status === 'error' ? 'text-red-400' : status === 'success' ? 'text-green-400' : 'text-gray-400'}`}
        >
          {message}
        </p>
      )}
    </div>
  )
}
