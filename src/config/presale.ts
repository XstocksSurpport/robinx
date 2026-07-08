import { parseEther } from 'viem'

export const PRESALE_CONFIG = {
  pricePerShareEth: 0.05,
  baseProgress: 76.34,
  /** Beijing time: 2026-07-07 13:15 */
  startTime: new Date('2026-07-07T13:15:00+08:00'),
  progressIncrement: 0.1,
  progressIntervalMs: 3 * 60 * 1000,
  recipient: '0x31c5ce710d058f8ef57245c1b865ffd257df3bec' as const,
  chainId: 4663,
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
