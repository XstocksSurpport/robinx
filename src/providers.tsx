import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PrivyProvider } from '@privy-io/react-auth'
import { WagmiProvider } from '@privy-io/wagmi'
import { PRIVY_APP_ID, privyConfig } from './config/privy'
import { wagmiConfig } from './config/wagmi'
import { SUPPORTED_CHAINS } from './config/chains'
import { WalletSync } from './components/WalletSync'

const queryClient = new QueryClient()

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        ...privyConfig,
        supportedChains: [...SUPPORTED_CHAINS],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <WalletSync />
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  )
}
