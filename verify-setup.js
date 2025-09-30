#!/usr/bin/env node

/**
 * Setup Verification Script for N4Y Local Development
 * 
 * This script checks all prerequisites and configuration
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const checks = {
  passed: [],
  failed: [],
  warnings: []
};

function checkPassed(name) {
  checks.passed.push(name);
  console.log('✅', name);
}

function checkFailed(name, reason) {
  checks.failed.push({ name, reason });
  console.log('❌', name, '-', reason);
}

function checkWarning(name, reason) {
  checks.warnings.push({ name, reason });
  console.log('⚠️ ', name, '-', reason);
}

console.log('🔍 Verifying N4Y Local Setup\n');

// 1. Check deployment files
console.log('📁 Checking deployment files...');
if (fs.existsSync('./deployments/localhost-deployment.json')) {
  const deployment = JSON.parse(fs.readFileSync('./deployments/localhost-deployment.json', 'utf8'));
  if (deployment.contracts && deployment.contracts.TaskManager) {
    checkPassed('Contracts deployed');
    console.log('   TaskManager:', deployment.contracts.TaskManager);
  } else {
    checkFailed('Contract deployment', 'Invalid deployment file');
  }
} else {
  checkFailed('Contract deployment', 'Run: npx hardhat run scripts/deploy.js --network localhost');
}

// 2. Check frontend .env.local
console.log('\n📁 Checking frontend configuration...');
if (fs.existsSync('./front-demo/.env.local')) {
  const envContent = fs.readFileSync('./front-demo/.env.local', 'utf8');
  if (envContent.includes('NEXT_PUBLIC_TASK_MANAGER')) {
    checkPassed('Frontend environment configured');
  } else {
    checkFailed('Frontend .env.local', 'Missing contract addresses');
  }
} else {
  checkFailed('Frontend .env.local', 'File not found - re-run deployment script');
}

// 3. Check backend .env
console.log('\n📁 Checking backend configuration...');
if (fs.existsSync('./backend-service/.env')) {
  const envContent = fs.readFileSync('./backend-service/.env', 'utf8');
  if (envContent.includes('NETWORK_RPC_URL')) {
    checkPassed('Backend environment configured');
  } else {
    checkFailed('Backend .env', 'Missing NETWORK_RPC_URL');
  }
} else {
  checkFailed('Backend .env', 'File not found - re-run deployment script');
}

// 4. Check backend contracts.local.json
console.log('\n📁 Checking backend contract info...');
if (fs.existsSync('./backend-service/contracts.local.json')) {
  checkPassed('Backend contract info available');
} else {
  checkFailed('Backend contracts.local.json', 'Re-run deployment script');
}

// 5. Check node_modules
console.log('\n📦 Checking dependencies...');
if (fs.existsSync('./node_modules')) {
  checkPassed('Root dependencies installed');
} else {
  checkFailed('Root dependencies', 'Run: npm install');
}

if (fs.existsSync('./front-demo/node_modules')) {
  checkPassed('Frontend dependencies installed');
} else {
  checkFailed('Frontend dependencies', 'Run: cd front-demo && npm install');
}

if (fs.existsSync('./backend-service/node_modules')) {
  checkPassed('Backend dependencies installed');
} else {
  checkFailed('Backend dependencies', 'Run: cd backend-service && npm install');
}

// 6. Check artifacts (compiled contracts)
console.log('\n🔨 Checking compiled contracts...');
if (fs.existsSync('./artifacts/contracts/core/TaskManager.sol/TaskManager.json')) {
  checkPassed('Contracts compiled');
} else {
  checkFailed('Compiled contracts', 'Run: npx hardhat compile');
}

// 7. Check optional configs
console.log('\n🔧 Checking optional configurations...');
if (fs.existsSync('./backend-service/.env')) {
  const envContent = fs.readFileSync('./backend-service/.env', 'utf8');
  if (envContent.includes('PINATA_JWT') && !envContent.match(/PINATA_JWT=\s*$/m)) {
    checkPassed('Pinata IPFS configured');
  } else {
    checkWarning('Pinata IPFS', 'Optional - will use fallback hashes');
  }
  
  if (envContent.includes('DEEPSEEK_API_KEY') && !envContent.match(/DEEPSEEK_API_KEY=\s*$/m)) {
    checkPassed('DeepSeek AI configured');
  } else {
    checkWarning('DeepSeek AI', 'Optional - will use simulated responses');
  }
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 VERIFICATION SUMMARY');
console.log('='.repeat(60));
console.log(`✅ Passed: ${checks.passed.length}`);
console.log(`❌ Failed: ${checks.failed.length}`);
console.log(`⚠️  Warnings: ${checks.warnings.length}`);
console.log('='.repeat(60) + '\n');

if (checks.failed.length > 0) {
  console.log('❌ FAILED CHECKS:\n');
  checks.failed.forEach(({ name, reason }) => {
    console.log(`  • ${name}: ${reason}`);
  });
  console.log('\n');
}

if (checks.warnings.length > 0) {
  console.log('⚠️  WARNINGS:\n');
  checks.warnings.forEach(({ name, reason }) => {
    console.log(`  • ${name}: ${reason}`);
  });
  console.log('\n');
}

if (checks.failed.length === 0) {
  console.log('🎉 All critical checks passed!\n');
  console.log('📝 Next steps:');
  console.log('   1. Make sure Hardhat node is running: npx hardhat node');
  console.log('   2. Start backend: cd backend-service && node contract-listener.js');
  console.log('   3. Start frontend: cd front-demo && npm run dev');
  console.log('   4. Open http://localhost:3000\n');
} else {
  console.log('⚠️  Please fix the failed checks above before proceeding.\n');
  process.exit(1);
}
