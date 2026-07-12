import { http } from 'wagmi'
import { createConfig } from '@privy-io/wagmi'
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
import { robinhoodChain, SUPPORTED_CHAINS } from './chains'

export const wagmiConfig = createConfig({
  chains: [...SUPPORTED_CHAINS],
  transports: {
    [mainnet.id]: http('https://ethereum.publicnode.com'),
    [arbitrum.id]: http('https://arb1.arbitrum.io/rpc'),
    [base.id]: http('https://mainnet.base.org'),
    [optimism.id]: http('https://mainnet.optimism.io'),
    [polygon.id]: http('https://polygon-rpc.com'),
    [bsc.id]: http('https://bsc-dataseed.binance.org'),
    [avalanche.id]: http('https://api.avax.network/ext/bc/C/rpc'),
    [linea.id]: http('https://rpc.linea.build'),
    [scroll.id]: http('https://rpc.scroll.io'),
    [zkSync.id]: http('https://mainnet.era.zksync.io'),
    [robinhoodChain.id]: http('https://rpc.mainnet.chain.robinhood.com'),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig
  }
}
