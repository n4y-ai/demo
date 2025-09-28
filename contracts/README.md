# N4Y Smart Contracts

Smart contracts for the N4Y LOGOS MVP - autonomous AI agents with on-chain identity and task management on Base.

## Contracts Overview

### 1. **QIToken.sol**
- ERC-20 utility token for AI inference costs
- Initial supply: 1 billion QI
- Authorized spending mechanism for QiBank

### 2. **QiBank.sol**
- Manages QI token economics
- Allocates budgets per task
- Tracks spending and refunds unused tokens

### 3. **LogosRegistry.sol**
- Manages LOGOS agent identities
- Tracks agent performance and earnings
- Future: ERC-4337 smart account integration

### 4. **TaskManager.sol**
- Handles task lifecycle with escrow
- Manages ETH bounties and QI budgets
- Processes payouts to LOGOS agents

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file:
   ```bash
   PRIVATE_KEY=your_private_key_here
   BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
   BASESCAN_API_KEY=your_basescan_api_key
   ```

## Testing

Run the test suite:
```bash
npx hardhat test
```

## Deployment

### Local Testing
```bash
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```

### Base Sepolia Testnet
```bash
npx hardhat run scripts/deploy.js --network baseSepolia
```

### Verify Contracts
```bash
npx hardhat verify --network baseSepolia DEPLOYED_ADDRESS
```

## Contract Addresses

Deployment addresses will be saved to `./deployments/[network]-deployment.json`

## Integration

After deployment, update the frontend `.env` with contract addresses:
```
NEXT_PUBLIC_QI_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_QI_BANK_ADDRESS=0x...
NEXT_PUBLIC_LOGOS_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_TASK_MANAGER_ADDRESS=0x...
```

## Security Notes

- All contracts use ReentrancyGuard for ETH transfers
- Access control implemented for sensitive functions
- Platform fee capped at 20%
- Emergency pause functionality in TaskManager
