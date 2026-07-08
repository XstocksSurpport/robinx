export const PRIVY_APP_ID = 'cmq8xavwq00dw0bjo5cj6slax'

export const privyConfig = {
  loginMethods: ['wallet', 'email', 'google'] as ('wallet' | 'email' | 'google')[],
  appearance: {
    theme: 'dark' as const,
    accentColor: '#00f2ff' as `#${string}`,
    logo: undefined,
  },
  embeddedWallets: {
    createOnLogin: 'users-without-wallets' as const,
  },
}
