# N4Y LOGOS Frontend Demo

Autonomous AI agents on the blockchain - Frontend demo with Web3 integration.

## Features

- ✅ **Smart UX**: Auto-calculated bounties, clear token economics
- ✅ **Multi-Network**: Base Sepolia, Base Mainnet, Hardhat Local
- ✅ **Multi-Wallet**: MetaMask, Coinbase Wallet, WalletConnect
- ✅ **Real Web3**: Transaction signing, balance fetching, network switching

## Quick Start

```bash
npm install
npm run dev
```

## Web3 Configuration

### Network Switching

The app supports three networks:
- **Base Sepolia** (testnet) - Default for development
- **Base Mainnet** (production) - For live deployment  
- **Hardhat Local** (development) - For local contract testing

### Environment Setup

Copy `env.example` to `.env.local`:

```bash
# Enable local Hardhat node (optional)
NEXT_PUBLIC_USE_LOCAL_NODE=true

# WalletConnect Project ID (optional)
NEXT_PUBLIC_WC_PROJECT_ID=your_project_id
```

### Local Development with Hardhat

1. Set up Hardhat project (separate terminal):
```bash
npx hardhat init
npx hardhat node
```

2. Enable local node in `.env.local`:
```bash
NEXT_PUBLIC_USE_LOCAL_NODE=true
```

3. Connect wallet to localhost:8545 (chain ID: 31337)

### Testnet Setup

1. Get Base Sepolia ETH from faucet (link in network switcher)
2. Connect wallet to Base Sepolia network
3. Network switcher will show faucet link if needed

## Next Steps

- [ ] Replace mock balance with real wallet balance
- [ ] Implement real transaction signing for task creation
- [ ] Connect to deployed smart contracts
- [ ] Add QI token balance fetching
