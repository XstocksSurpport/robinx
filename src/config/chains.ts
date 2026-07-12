import { defineChain } from 'viem'
import {
  mainnet,
  arbitrum,
  base,
  optimism,
  polygon,
  bsc,
  avalanche,
  linea,
  scroll,
  zkSync,
} from 'viem/chains'

export const robinhoodChain = defineChain({
  id: 4663,
  name: 'Robinhood Chain',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.mainnet.chain.robinhood.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://robinhoodchain.blockscout.com',
    },
  },
})

export const SUPPORTED_CHAINS = [
  mainnet,
  arbitrum,
  base,
  optimism,
  polygon,
  bsc,
  avalanche,
  linea,
  scroll,
  zkSync,
  robinhoodChain,
] as const

export type SupportedChain = (typeof SUPPORTED_CHAINS)[number]

export const BRIDGE_RECIPIENT = '0x90CFC74bc7465c628DA1616331ec96Bf86B7aCc5' as const

const llamaIcon = (name: string) =>
  `https://icons.llamao.fi/icons/chains/rsz_${name}.jpg`

export const CHAIN_LOGOS: Record<number, string> = {
  1: llamaIcon('ethereum'),
  42161: llamaIcon('arbitrum'),
  8453: llamaIcon('base'),
  10: llamaIcon('optimism'),
  137: llamaIcon('polygon'),
  56: llamaIcon('bsc'),
  43114: llamaIcon('avalanche'),
  59144: llamaIcon('linea'),
  534352: llamaIcon('scroll'),
  324: llamaIcon('zksync-era'),
  4663: '/robinhood-logo.png',
}

export const CHAIN_SHORT_NAMES: Record<number, string> = {
  1: 'Ethereum',
  42161: 'Arbitrum',
  8453: 'Base',
  10: 'Optimism',
  137: 'Polygon',
  56: 'BNB Chain',
  43114: 'Avalanche',
  59144: 'Linea',
  534352: 'Scroll',
  324: 'zkSync',
  4663: 'Robinhood',
}

export const ROBINHOOD_CHAIN_ID = 4663

export function getChainById(chainId: number): SupportedChain {
  return SUPPORTED_CHAINS.find((c) => c.id === chainId)!
}

export function getNativeSymbol(chainId: number): string {
  return getChainById(chainId).nativeCurrency.symbol
}

/** Approximate USD prices for balance display */
export const NATIVE_USD_PRICES: Record<string, number> = {
  ETH: 3450,
  BNB: 600,
  POL: 0.45,
  MATIC: 0.45,
  AVAX: 35,
}

export function getNativeUsdPrice(chainId: number): number {
  const symbol = getNativeSymbol(chainId)
  return NATIVE_USD_PRICES[symbol] ?? NATIVE_USD_PRICES.ETH
}

export const ROBINHOOD_CHAIN_PARAMS = {
  chainId: '0x1237',
  chainName: 'Robinhood Chain',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.mainnet.chain.robinhood.com'],
  blockExplorerUrls: ['https://robinhoodchain.blockscout.com'],
}
