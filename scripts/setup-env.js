import fs from 'fs';
import path from 'path';
import { ethers } from 'ethers';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("N4Y Smart Contracts - Environment Setup\n");

// Check if .env already exists
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  console.log("⚠️  .env file already exists!");
  console.log("   Rename or backup your existing .env file first.\n");
  process.exit(1);
}

// Generate a new wallet for deployment
const wallet = ethers.Wallet.createRandom();

const envContent = `# N4Y Smart Contracts Environment Configuration
# Generated on: ${new Date().toISOString()}

# ============================================
# DEPLOYMENT WALLET (Generated for you)
# ============================================
# Address: ${wallet.address}
# IMPORTANT: Send test ETH to this address before deploying!
PRIVATE_KEY=${wallet.privateKey.slice(2)}

# ============================================
# NETWORK CONFIGURATION
# ============================================
# Base Sepolia Testnet (default)
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# Base Mainnet (production)
BASE_MAINNET_RPC_URL=https://mainnet.base.org

# ============================================
# BLOCK EXPLORER
# ============================================
# Get your API key from https://basescan.org/apis
BASESCAN_API_KEY=

# ============================================
# CONTRACT ADDRESSES (populated after deployment)
# ============================================
QI_TOKEN_ADDRESS=
QI_BANK_ADDRESS=
LOGOS_REGISTRY_ADDRESS=
TASK_MANAGER_ADDRESS=
`;

// Write .env file
fs.writeFileSync(envPath, envContent);

console.log("✅ Created .env file with deployment configuration\n");
console.log("📋 Deployment Wallet Generated:");
console.log(`   Address: ${wallet.address}`);
console.log(`   Private Key: ${wallet.privateKey}\n`);
console.log("⚠️  IMPORTANT NEXT STEPS:");
console.log("   1. Save your private key securely");
console.log("   2. Get test ETH from https://sepoliafaucet.com/");
console.log("   3. Bridge to Base Sepolia at https://bridge.base.org/");
console.log("   4. Add Basescan API key for contract verification\n");
console.log("📚 Documentation: See ENV_SETUP.md for detailed configuration options");
