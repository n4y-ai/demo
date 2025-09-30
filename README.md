# N4Y LOGOS Platform Demo

Decentralized AI task marketplace built on Base blockchain with IPFS storage.

**Stack:** Solidity, Hardhat, ethers.js, Next.js, React, Wagmi, Base Sepolia

---

## Project Structure

### `/contracts` - Smart Contracts
- **QIToken.sol** - ERC20 governance token
- **QiBank.sol** - Token distribution & staking
- **LogosRegistry.sol** - AI agent registry
- **TaskManager.sol** - Task creation, assignment, fulfillment

### `/backend-service` - Node.js Service
- Event listener for blockchain tasks
- AI processing (configurable: DeepSeek, OpenAI, custom)
- IPFS storage via Pinata
- Auto-fulfillment of tasks on-chain

### `/front-demo` - Next.js Frontend
- Web3 wallet integration (MetaMask, Coinbase Wallet)
- Task creation UI
- Real-time event monitoring
- IPFS result viewing

---

## Environment Configuration

### Root `.env`
```bash
# Deployment wallet (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Network RPC
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# BaseScan API (for contract verification)
BASESCAN_API_KEY=your_basescan_api_key
```

### Backend `backend-service/.env`
```bash
# Network
NETWORK_RPC_URL=https://sepolia.base.org

# Contract addresses (populated after deployment)
QI_TOKEN_ADDRESS=0x...
QI_BANK_ADDRESS=0x...
LOGOS_REGISTRY_ADDRESS=0x...
TASK_MANAGER_ADDRESS=0x...

# Backend wallet
PRIVATE_KEY=your_private_key_here

# IPFS (Pinata)
PINATA_JWT=your_pinata_jwt_token

# AI Provider
AI_API_KEY=your_ai_api_key
AI_MODEL_NAME=deepseek-chat
AI_API_URL=https://api.deepseek.com/v1/chat/completions

# Server
PORT=3001
```

### Frontend `front-demo/.env.local`
```bash
# Network
NEXT_PUBLIC_USE_LOCAL_NODE=false
NEXT_PUBLIC_DEFAULT_NETWORK=baseSepolia

# Contract addresses (auto-populated by deployment script)
NEXT_PUBLIC_LOGOS_REGISTRY=0x...
NEXT_PUBLIC_TASK_MANAGER=0x...
NEXT_PUBLIC_QI_TOKEN=0x...
NEXT_PUBLIC_QI_BANK=0x...

# WalletConnect (optional)
NEXT_PUBLIC_WC_PROJECT_ID=your_walletconnect_project_id
```

---

## Local Deployment

### 1. Install Dependencies
```bash
npm install
cd backend-service && npm install
cd ../front-demo && npm install
cd ..
```

### 2. Start Local Hardhat Node
```bash
npx hardhat node
```
Keep this running in terminal 1.

### 3. Deploy Contracts
```bash
# New terminal
npx hardhat run scripts/deploy.js --network localhost
```

Contracts deployed and configured automatically.

### 4. Start Backend Service
```bash
cd backend-service
node contract-listener.js
```
Keep this running in terminal 2.

### 5. Start Frontend
```bash
# New terminal
cd front-demo
npm run dev
```

### 6. Access
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### 7. Connect Wallet
- Add Hardhat network to MetaMask:
  - Network: Hardhat Local
  - RPC: http://127.0.0.1:8545
  - Chain ID: 31337
  - Currency: ETH
- Import test account from `deployments/localhost-accounts.json`

---

## Base Sepolia Testnet Deployment

### Prerequisites
- Wallet with 0.05+ Sepolia ETH ([Get from faucet](https://coinbase.com/faucets/base-ethereum-sepolia-faucet))
- [BaseScan API key](https://basescan.org/myapikey)
- [Pinata JWT token](https://app.pinata.cloud/developers/api-keys)
- AI API key (DeepSeek, OpenAI, or custom)

### 1. Configure Root Environment
Create `.env` in project root:
```bash
PRIVATE_KEY=your_private_key_without_0x
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASESCAN_API_KEY=your_basescan_key
```

### 2. Compile Contracts
```bash
npx hardhat compile
```

### 3. Deploy to Base Sepolia
```bash
npx hardhat run scripts/deploy.js --network baseSepolia
```

**What happens:**
- Deploys 4 contracts
- Configures permissions
- Waits 30 seconds
- Verifies contracts on BaseScan
- Auto-creates config files
- Shows next steps

**Copy** the contract addresses from output.

### 4. Configure Backend
Update `backend-service/.env` with deployed addresses:
```bash
NETWORK_RPC_URL=https://sepolia.base.org
QI_TOKEN_ADDRESS=0x...        # from deployment output
QI_BANK_ADDRESS=0x...
LOGOS_REGISTRY_ADDRESS=0x...
TASK_MANAGER_ADDRESS=0x...
PRIVATE_KEY=your_backend_wallet_key
PINATA_JWT=your_pinata_jwt
AI_API_KEY=your_ai_key
AI_MODEL_NAME=deepseek-chat
PORT=3001
```

### 5. Start Backend
```bash
cd backend-service
node contract-listener.js
```

**Verify connection:**
- `🔗 Connected to Base Sepolia (Chain ID: 84532)`
- `🔑 Pinata JWT found`
- `🚀 Server running on port 3001`

### 6. Start Frontend
```bash
cd front-demo
npm run dev
```

Frontend auto-configured by deployment script.

### 7. Connect & Test
1. Open http://localhost:3000
2. Connect wallet
3. **Switch to Base Sepolia network** in wallet
4. Create task with 0.001+ ETH bounty
5. Watch Event Feed for processing
6. Click "View Result" when fulfilled

### 8. Verify on BaseScan
- Contracts: https://sepolia.basescan.org
- Transactions visible in real-time
- Contract code verified automatically

---

## API Keys & Services

### Pinata (IPFS Storage)
1. Sign up: https://app.pinata.cloud
2. Dashboard → API Keys → New Key
3. Enable permissions: `pinFileToIPFS`, `pinJSONToIPFS`
4. Copy JWT token → `PINATA_JWT`

### DeepSeek (AI - Default)
1. Sign up: https://platform.deepseek.com
2. Get API key
3. Copy → `AI_API_KEY`
4. Set `AI_MODEL_NAME=deepseek-chat`

### BaseScan (Verification)
1. Sign up: https://basescan.org
2. Account → API Keys → Create
3. Copy → `BASESCAN_API_KEY`

### Alternative: Custom AI Provider
```bash
AI_API_URL=https://your-api-url.com/v1/chat/completions
AI_API_KEY=your_custom_key
AI_MODEL_NAME=your_model_name
```

---

## Architecture

```
User (Web3 Wallet)
    ↓
Frontend (Next.js + Wagmi)
    ↓
Smart Contracts (Base)
    ↓ [TaskCreated Event]
Backend Service (Node.js)
    ↓
AI Processing
    ↓
IPFS Storage (Pinata)
    ↓
On-chain Fulfillment
```

---

## Key Features

✅ **Decentralized Task Marketplace**  
✅ **AI-Powered Task Processing**  
✅ **IPFS Result Storage**  
✅ **Multi-Wallet Support**  
✅ **Real-time Event Monitoring**  
✅ **Automatic Contract Verification**  
✅ **Testnet & Mainnet Ready**

---

## Network Info

**Base Sepolia Testnet:**
- Chain ID: `84532`
- RPC: `https://sepolia.base.org`
- Explorer: `https://sepolia.basescan.org`
- Faucet: `https://coinbase.com/faucets/base-ethereum-sepolia-faucet`

**Local Hardhat:**
- Chain ID: `31337`
- RPC: `http://127.0.0.1:8545`
- Pre-funded accounts with test ETH

---

## Troubleshooting

### "Insufficient funds"
- Get testnet ETH from faucet
- Check balance on BaseScan

### "Wrong network"
- Switch wallet to Base Sepolia (84532)
- Or Hardhat Local (31337) for local dev

### Backend not processing tasks
1. Check contract addresses in `.env`
2. Verify backend wallet has ETH for gas
3. Check AI API key is valid
4. Review logs for errors

### Contract verification failed
```bash
# Manual verification
npx hardhat verify --network baseSepolia CONTRACT_ADDRESS CONSTRUCTOR_ARGS
```

### Frontend not connecting
1. Check `front-demo/.env.local` exists
2. Restart dev server: `npm run dev`
3. Clear browser cache
4. Check console for errors

---

## Scripts

```bash
# Compile contracts
npx hardhat compile

# Deploy to localhost
npx hardhat run scripts/deploy.js --network localhost

# Deploy to Base Sepolia
npx hardhat run scripts/deploy.js --network baseSepolia

# Run tests
npx hardhat test

# Start local node
npx hardhat node
```

---

## License

MIT

---

## Support

- Contracts on BaseScan: [View deployment file](./deployments/)
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Testnet Explorer: https://sepolia.basescan.org
