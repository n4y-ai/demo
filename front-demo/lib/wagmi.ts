import { createConfig, http } from 'wagmi'
import { base, baseSepolia, localhost } from 'wagmi/chains'
import { coinbaseWallet, metaMask, walletConnect } from 'wagmi/connectors'

// Custom Hardhat local chain configuration
export const hardhatLocal = {
  ...localhost,
  id: 31337,
  name: 'Hardhat Local',
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545']
    }
  }
} as const

// Determine which chains to use based on environment
const getChains = () => {
  const isDev = process.env.NODE_ENV === 'development'
  const useLocal = process.env.NEXT_PUBLIC_USE_LOCAL_NODE === 'true'
  
  if (isDev && useLocal) {
    return [hardhatLocal, baseSepolia, base]
  }
  
  return [baseSepolia, base]
}

export const config = createConfig({
  chains: getChains(),
  connectors: [
    metaMask(),
    coinbaseWallet({
      appName: 'N4Y LOGOS',
      appLogoUrl: 'https://logos.n4y.ai/logo.png'
    }),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || 'demo-project-id'
    })
  ],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
    [hardhatLocal.id]: http('http://127.0.0.1:8545')
  },
})

export const SUPPORTED_CHAINS = getChains()

// Default chain based on environment
export const getDefaultChain = () => {
  const isDev = process.env.NODE_ENV === 'development'
  const useLocal = process.env.NEXT_PUBLIC_USE_LOCAL_NODE === 'true'
  
  if (isDev && useLocal) {
    return hardhatLocal
  }
  
  return baseSepolia
}

export const DEFAULT_CHAIN = getDefaultChain()

// Network configuration helpers
export const NETWORK_CONFIG = {
  [hardhatLocal.id]: {
    name: 'Local Hardhat',
    explorer: null,
    faucet: null,
    description: 'Local development network'
  },
  [baseSepolia.id]: {
    name: 'Base Sepolia',
    explorer: 'https://sepolia.basescan.org',
    faucet: 'https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet',
    description: 'Base testnet'
  },
  [base.id]: {
    name: 'Base Mainnet',
    explorer: 'https://basescan.org',
    faucet: null,
    description: 'Base mainnet (production)'
  }
}
