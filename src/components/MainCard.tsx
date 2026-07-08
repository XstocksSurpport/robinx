import { useState } from 'react'
import { BridgePanel } from './BridgePanel'
import { MintPanel } from './MintPanel'

type Tab = 'bridge' | 'mint'

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`pb-1 text-sm font-semibold transition ${
        active
          ? 'border-b-2 border-brand-cyan text-white'
          : 'text-gray-400 hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}

export function MainCard() {
  const [tab, setTab] = useState<Tab>('bridge')
  const [slippageOpen, setSlippageOpen] = useState(false)

  return (
    <div className="w-full max-w-md rounded-3xl bg-brand-card p-5 shadow-2xl">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex gap-6">
          <TabButton active={tab === 'bridge'} onClick={() => setTab('bridge')}>
            Bridge
          </TabButton>
          <TabButton active={tab === 'mint'} onClick={() => setTab('mint')}>
            mint
          </TabButton>
        </div>
        {tab === 'bridge' && (
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
        )}
      </div>

      {tab === 'bridge' ? (
        <BridgePanel slippageOpen={slippageOpen} />
      ) : (
        <MintPanel />
      )}
    </div>
  )
}
