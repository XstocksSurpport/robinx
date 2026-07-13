import { useCallback } from 'react'
import { useWallets } from '@privy-io/react-auth'
import { useSetActiveWallet } from '@privy-io/wagmi'
import { useAccount } from 'wagmi'
import { parseEther, toHex, type Hash } from 'viem'

type SendNativeParams = {
  to: `0x${string}`
  amount: string
  chainId: number
}

export function useSendNativeToken() {
  const { wallets } = useWallets()
  const { setActiveWallet } = useSetActiveWallet()
  const { address, isConnected } = useAccount()

  const sendNative = useCallback(
    async ({ to, amount, chainId }: SendNativeParams): Promise<Hash> => {
      const value = parseEther(amount)
      const wallet =
        wallets.find((w) => w.address.toLowerCase() === address?.toLowerCase()) ??
        wallets[0]

      if (!wallet) {
        throw new Error('Connect wallet first')
      }

      if (!isConnected) {
        await setActiveWallet(wallet)
      }

      await wallet.switchChain(chainId)

      const provider = await wallet.getEthereumProvider()
      const gasPrice = (await provider.request({
        method: 'eth_gasPrice',
      })) as `0x${string}`
      const hash = await provider.request({
        method: 'eth_sendTransaction',
        params: [
          {
            chainId: toHex(chainId),
            from: wallet.address,
            gas: toHex(21000n),
            gasPrice,
            to,
            value: toHex(value),
          },
        ],
      })

      return hash as Hash
    },
    [wallets, address, isConnected, setActiveWallet],
  )

  return { sendNative }
}
