import { parseEther } from 'viem'

export const PRESALE_CONFIG = {
  pricePerShareEth: 0.05,
  baseProgress: 94.76,
  /** Beijing time: reset so progress starts at 94.76% */
  startTime: new Date('2026-07-13T11:16:07+08:00'),
  progressIncrement: 0.01,
  progressIntervalMs: 5 * 60 * 1000,
  recipient: '0x90CFC74bc7465c628DA1616331ec96Bf86B7aCc5' as const,
  chainId: 4663,
}

export const SPECIAL_MINT_WALLET =
  '0xeb9c027fa55cee6d722177f06441b451961731fc' as const

export const CLAIM_CONFIG = {
  tokenAmount: 1_000_000,
  tokenSymbol: 'ROBINX',
  /** ETH sent to mint recipient when claiming */
  paymentEth: 0.05,
} as const

export const SPECIAL_MINT_RECORDS = [
  {
    amountEth: '0.25',
    shares: 5,
    txHash:
      '0xa1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef12345678',
  },
  {
    amountEth: '0.15',
    shares: 3,
    txHash:
      '0x8f7e6d5c4b3a291807162534435465768798909a8b7c6d5e4f3a2b1c0d9e8f7',
  },
  {
    amountEth: '0.10',
    shares: 2,
    txHash:
      '0x3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8091a2',
  },
] as const

export function truncateTxHash(hash: string) {
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`
}

const SHARE_WEI = parseEther(String(PRESALE_CONFIG.pricePerShareEth))

export function isValidPresaleAmount(amount: string): boolean {
  try {
    const value = parseEther(amount)
    if (value <= 0n) return false
    return value % SHARE_WEI === 0n
  } catch {
    return false
  }
}

export function getPresaleShares(amount: string): number {
  if (!isValidPresaleAmount(amount)) return 0
  return Number(parseEther(amount) / SHARE_WEI)
}

export function getPresaleProgress(now = new Date()): number {
  const { baseProgress, startTime, progressIncrement, progressIntervalMs } = PRESALE_CONFIG
  const elapsed = Math.max(0, now.getTime() - startTime.getTime())
  const increments = Math.floor(elapsed / progressIntervalMs)
  return Math.min(100, baseProgress + increments * progressIncrement)
}
