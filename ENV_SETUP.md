# Environment Configuration for N4Y Smart Contracts

## Quick Start - Minimal .env

Create a `.env` file in the project root with:

```bash
# REQUIRED: Private key for deployment (without 0x prefix)
# WARNING: This is a well-known test key, NEVER use for real funds!
PRIVATE_KEY=ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Base Sepolia RPC URL (free public endpoint)
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# Optional: Basescan API key for contract verification
BASESCAN_API_KEY=
```

## Full Configuration Example

For production deployment, use this comprehensive configuration:

```bash
# ============================================
# DEPLOYMENT CONFIGURATION
# ============================================

# Private key for deployment (without 0x prefix)
# Generate a new wallet: npx hardhat accounts
PRIVATE_KEY=your_deployment_wallet_private_key_here

# ============================================
# NETWORK RPC URLS
# ============================================

# Base Sepolia Testnet
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# Alternative endpoints for better reliability:
# - https://base-sepolia.public.blastapi.io
# - https://base-sepolia-rpc.publicnode.com

# Base Mainnet (for production)
BASE_MAINNET_RPC_URL=https://mainnet.base.org

# ============================================
# BLOCK EXPLORER VERIFICATION
# ============================================

# Get from https://basescan.org/apis
BASESCAN_API_KEY=your_basescan_api_key

# ============================================
# CONTRACT ADDRESSES (after deployment)
# ============================================

QI_TOKEN_ADDRESS=0x...
QI_BANK_ADDRESS=0x...
LOGOS_REGISTRY_ADDRESS=0x...
TASK_MANAGER_ADDRESS=0x...
```

## Security Best Practices

1. **Never commit .env files** - Already in .gitignore
2. **Use separate wallets** for deployment vs operations
3. **Test on testnet first** before mainnet deployment
4. **Keep minimal ETH** in deployment wallet

## Getting Test ETH

For Base Sepolia testnet:
1. Get Sepolia ETH from: https://sepoliafaucet.com/
2. Bridge to Base Sepolia: https://bridge.base.org/

## Local Dev Quickstart

Run a full local stack (Hardhat node, deploy, backend, frontend):

```bash
# 1) Install deps in root, backend, and frontend
npm install
(cd backend-service && npm install)
(cd front-demo && npm install)

# 2) Start everything (node + deploy + backend + frontend)
npm run dev:all
```

What it does:
- Starts Hardhat node at http://127.0.0.1:8545
- Deploys contracts to localhost and writes:
  - `deployments/localhost-deployment.json`
  - `deployments/localhost-accounts.json`
  - `front-demo/.env.local` with contract addresses
  - `backend-service/contracts.local.json` with addresses and local accounts
- Starts backend on port 3001 using local RPC
- Starts frontend on port 3000 with local network enabled

If you prefer to run manually:
```bash
npm run node
# In another terminal
npm run deploy:local
npm run dev:backend
# In another terminal
npm run dev:frontend
```

## Deployment Commands

```bash
# Local testing
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost

# Base Sepolia deployment
npx hardhat run scripts/deploy.js --network baseSepolia

# Verify contracts
npx hardhat verify --network baseSepolia DEPLOYED_ADDRESS
```

## Frontend Integration

After deployment, update `front-demo/.env`:

```bash
NEXT_PUBLIC_QI_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_QI_BANK_ADDRESS=0x...
NEXT_PUBLIC_LOGOS_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_TASK_MANAGER_ADDRESS=0x...
```
