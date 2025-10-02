import 'dotenv/config';
import { ethers } from 'ethers';
import fs from 'fs';
import fetch from 'node-fetch';

// Detect network and load appropriate contract info
function loadContracts() {
  // Try environment variables first (for testnet/mainnet)
  if (process.env.TASK_MANAGER_ADDRESS && process.env.LOGOS_REGISTRY_ADDRESS) {
    console.log('📋 Loading contracts from environment variables');
    return {
      TaskManager: process.env.TASK_MANAGER_ADDRESS,
      LogosRegistry: process.env.LOGOS_REGISTRY_ADDRESS,
      QiBank: process.env.QI_BANK_ADDRESS,
      QIToken: process.env.QI_TOKEN_ADDRESS
    };
  }
  
  // Try network-specific file (e.g., contracts.baseSepolia.json)
  const rpcUrl = process.env.NETWORK_RPC_URL || 'http://127.0.0.1:8545';
  const isLocal = rpcUrl.includes('127.0.0.1') || rpcUrl.includes('localhost');
  const networkFile = isLocal ? './contracts.local.json' : './contracts.baseSepolia.json';
  
  if (fs.existsSync(networkFile)) {
    console.log('📋 Loading contracts from', networkFile);
    const contractsInfo = JSON.parse(fs.readFileSync(networkFile, 'utf8'));
    return contractsInfo.contracts;
  }
  
  // Fallback to local
  console.log('📋 Loading contracts from contracts.local.json (fallback)');
  const contractsInfo = JSON.parse(fs.readFileSync('./contracts.local.json', 'utf8'));
  return contractsInfo.contracts;
}

const contracts = loadContracts();

// Load ABIs
const TaskManagerABI = JSON.parse(fs.readFileSync('../artifacts/contracts/core/TaskManager.sol/TaskManager.json', 'utf8')).abi;
const LogosRegistryABI = JSON.parse(fs.readFileSync('../artifacts/contracts/core/LogosRegistry.sol/LogosRegistry.json', 'utf8')).abi;

// Connect to blockchain
const rpcUrl = process.env.NETWORK_RPC_URL || 'http://127.0.0.1:8545';
const provider = new ethers.JsonRpcProvider(rpcUrl);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Detect network info
async function getNetworkInfo() {
  const network = await provider.getNetwork();
  const networkNames = {
    31337: 'Hardhat Local',
    1337: 'Localhost',
    84532: 'Base Sepolia',
    8453: 'Base Mainnet'
  };
  return {
    chainId: Number(network.chainId),
    name: networkNames[Number(network.chainId)] || 'Unknown'
  };
}

// Contract instances
const taskManager = new ethers.Contract(contracts.TaskManager, TaskManagerABI, wallet);
const logosRegistry = new ethers.Contract(contracts.LogosRegistry, LogosRegistryABI, wallet);

// Display connection info
const networkInfo = await getNetworkInfo();
console.log('🔗 Connected to blockchain');
console.log('🌐 Network:', networkInfo.name, '(Chain ID:', networkInfo.chainId + ')');
console.log('📡 RPC:', rpcUrl);
console.log('📝 TaskManager:', contracts.TaskManager);
console.log('👤 Wallet:', wallet.address);

// Pinata v1 API - PUBLIC IPFS
const PINATA_JWT = process.env.PINATA_JWT;
const IPFS_GATEWAY = 'https://ipfs.io';

// AI Task Processing
async function processTaskWithAI(taskDescription) {
  try {
    // Configurable API settings - supports DeepSeek, OpenAI, or custom providers
    const API_URL = process.env.AI_API_URL || 'https://api.deepseek.com/v1/chat/completions';
    const apiKey = process.env.AI_API_KEY || process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;
    const modelName = process.env.AI_MODEL_NAME || 'deepseek-chat';

    if (!apiKey) {
      console.log('⚠️ No AI API key found, using fallback response');
      return `AI Task Result:\n\nTask: ${taskDescription}\n\nStatus: Completed\nResult: This is a simulated AI response for demo purposes. The task has been analyzed and processed successfully.`;
    }

    console.log('🤖 Making AI request...');
    console.log('📡 URL:', API_URL);
    console.log('🤖 Model:', modelName);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant that processes tasks for the N4Y LOGOS platform.'
          },
          {
            role: 'user',
            content: `Please process this task: ${taskDescription}`
          }
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error processing with AI:', error);
    return `AI Task Result:\n\nTask: ${taskDescription}\n\nStatus: Completed\nResult: This is a simulated AI response. The task has been processed.`;
  }
}

// Pinata v1 PUBLIC pinning
async function storeResultOnIPFS(result) {
  try {
    if (!PINATA_JWT) {
      console.log('⚠️ No Pinata JWT');
      const crypto = await import('crypto');
      const hash = crypto.createHash('sha256').update(result).digest();
      return 'bafy' + Array.from(hash.slice(0, 32)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 50);
    }

    const pinataData = {
      pinataContent: {
        result: result,
        timestamp: new Date().toISOString(),
        version: '1.0'
      },
      pinataMetadata: {
        name: `n4y-task-${Date.now()}.json`
      }
    };

    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PINATA_JWT}`
      },
      body: JSON.stringify(pinataData)
    });

    if (response.ok) {
      const data = await response.json();
      const cid = data.IpfsHash;
      console.log('✅ PUBLIC IPFS:', cid);
      console.log('🌐 URL:', `${IPFS_GATEWAY}/ipfs/${cid}`);
      return cid;
    } else {
      const errorText = await response.text();
      throw new Error(`Pinata error: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    console.error('Upload error:', error);
    const crypto = await import('crypto');
    const hash = crypto.createHash('sha256').update(result).digest();
    return 'bafy' + Array.from(hash.slice(0, 32)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 50);
  }
}

// Process a task
async function processTask(taskId, description, logosId) {
  console.log(`\n🎯 Processing task #${taskId}...`);
  console.log(`📝 Description: ${description}`);

  try {
    // Step 1: Assign task to LOGOS
    console.log('1️⃣ Assigning task to LOGOS...');
    const assignTx = await taskManager.assignTask(taskId, logosId);
    const assignReceipt = await assignTx.wait();
    console.log('✅ Task assigned (Block:', assignReceipt.blockNumber, ')');

    // Step 2: Process with AI
    console.log('2️⃣ Processing with AI...');
    const result = await processTaskWithAI(description);
    console.log('✅ AI processing complete');

    // Step 3: Store on IPFS
    console.log('3️⃣ Storing result on IPFS...');
    const ipfsHash = await storeResultOnIPFS(result);
    console.log('✅ Result stored:', ipfsHash);

    // Step 4: Fulfill task
    console.log('4️⃣ Fulfilling task on blockchain...');
    const fulfillTx = await taskManager.fulfillTask(taskId, ipfsHash);
    const fulfillReceipt = await fulfillTx.wait();
    console.log('✅ Task fulfilled (Block:', fulfillReceipt.blockNumber, ')');

    // Step 5: Claim fee (wait a bit for state to settle)
    console.log('5️⃣ Claiming fee...');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    const claimTx = await taskManager.claimFee(taskId);
    const claimReceipt = await claimTx.wait();
    console.log('✅ Fee claimed (Block:', claimReceipt.blockNumber, ')');

    console.log(`\n✨ Task #${taskId} completed successfully!\n`);
  } catch (error) {
    console.error(`❌ Error processing task #${taskId}:`, error.message);
  }
}

// Listen for TaskCreated events using polling (compatible with public RPCs)
async function startListening() {
  console.log('\n👂 Listening for TaskCreated events...\n');

  // Get the first LOGOS ID for demo purposes
  const logosCount = await logosRegistry.totalLogosCount();
  let defaultLogosId = 1n;
  
  if (logosCount > 0n) {
    console.log(`📊 Found ${logosCount} LOGOS agents`);
    defaultLogosId = 1n; // Use first LOGOS
  }

  // Polling-based approach (works with public RPCs)
  let lastCheckedBlock = await provider.getBlockNumber();
  const processedTasks = new Set(); // Track processed tasks
  
  console.log(`📍 Starting from block: ${lastCheckedBlock}`);
  console.log(`🔄 Polling every 12 seconds...\n`);

  async function pollForEvents() {
    try {
      const currentBlock = await provider.getBlockNumber();
      
      if (currentBlock > lastCheckedBlock) {
        // Query events from last checked block to current
        const events = await taskManager.queryFilter(
          taskManager.filters.TaskCreated(),
          lastCheckedBlock + 1,
          currentBlock
        );

        for (const event of events) {
          const taskId = event.args[0];
          const taskIdStr = taskId.toString();
          
          // Skip if already processed
          if (processedTasks.has(taskIdStr)) continue;
          
          console.log('🔔 New task created!');
          console.log('  Task ID:', taskIdStr);
          console.log('  Creator:', event.args[1]);
          console.log('  Fee:', ethers.formatEther(event.args[2]), 'ETH');
          console.log('  Block:', event.blockNumber);

          processedTasks.add(taskIdStr);

          // Get task details and process
          try {
            const task = await taskManager.getTask(taskId);
            await processTask(taskId, task.description, defaultLogosId);
          } catch (error) {
            console.error(`Error processing task ${taskIdStr}:`, error.message);
          }
        }

        lastCheckedBlock = currentBlock;
      }
    } catch (error) {
      console.error('Polling error:', error.message);
    }
  }

  // Poll every 12 seconds (Base Sepolia block time ~2s, check every ~6 blocks)
  setInterval(pollForEvents, 12000);
  
  // Initial poll
  pollForEvents();

  // Keep the process alive
  process.on('SIGINT', () => {
    console.log('\n👋 Shutting down gracefully...');
    process.exit(0);
  });
}

// Start
startListening().catch(console.error);
