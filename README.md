# ROBINX SWAP

A multi-chain bridge frontend for Robinhood Chain, inspired by the scash swap UI design.

## Features

- Bridge between Ethereum, Arbitrum, Base, Optimism, Polygon, BNB Chain, Avalanche, Linea, Scroll, zkSync, and **Robinhood Chain**
- Fixed recipient address: `0x31c5ce710d058f8ef57245c1b865ffd257df3bec`
- Privy wallet connection (MetaMask and other EVM wallets)
- One-click Robinhood Chain network import

## Getting Started

```bash
npm install
npm run dev
```

## Tech Stack

- React 18 + Vite + TypeScript
- Tailwind CSS
- Privy.io (`@privy-io/react-auth`)
- wagmi + viem

## Robinhood Chain Network

| Parameter | Value |
|-----------|-------|
| Network Name | Robinhood Chain |
| Chain ID | 4663 |
| Currency Symbol | ETH |
| RPC | https://rpc.mainnet.chain.robinhood.com |
| Block Explorer | https://robinhoodchain.blockscout.com |
