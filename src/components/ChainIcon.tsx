import { CHAIN_LOGOS, CHAIN_SHORT_NAMES } from '../config/chains'

export const ROBINHOOD_CHAIN_ID = 4663
export const ROBINHOOD_LOGO = '/robinhood-logo.png'
export const ROBINX_ICON = '/robinx-icon.png'

const sizeClasses = {
  sm: 'h-5 w-5',
  md: 'h-8 w-8',
  lg: 'h-10 w-10',
}

interface ChainIconProps {
  chainId: number
  size?: 'sm' | 'md' | 'lg'
}

export function ChainIcon({ chainId, size = 'sm' }: ChainIconProps) {
  const logo = CHAIN_LOGOS[chainId]
  const name = CHAIN_SHORT_NAMES[chainId] || 'Network'

  if (!logo) {
    return (
      <span
        className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-white/10 text-xs text-white`}
      >
        ?
      </span>
    )
  }

  return (
    <img
      src={logo}
      alt={name}
      className={`${sizeClasses[size]} rounded-full object-cover`}
    />
  )
}

export function RobinxLogo({ className = 'h-[1.75em] w-auto' }: { className?: string }) {
  return (
    <img
      src={ROBINX_ICON}
      alt=""
      aria-hidden
      className={`${className} shrink-0 object-contain object-center`}
    />
  )
}

export function RobinhoodLogo({ size = 'lg' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <img
      src={ROBINHOOD_LOGO}
      alt="Robinhood"
      className={`${sizeClasses[size]} rounded-xl object-cover`}
    />
  )
}
