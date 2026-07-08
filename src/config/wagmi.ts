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
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
    [optimism.id]: http(),
    [polygon.id]: http(),
    [bsc.id]: http(),
    [avalanche.id]: http(),
    [linea.id]: http(),
    [scroll.id]: http(),
    [zkSync.id]: http(),
    [robinhoodChain.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig
  }
}
