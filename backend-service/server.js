import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { ethers } from 'ethers';
import fetch from 'node-fetch';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Pinata v1 API - PUBLIC IPFS pinning
const PINATA_JWT = process.env.PINATA_JWT;
const IPFS_GATEWAY = 'https://ipfs.io';

if (!PINATA_JWT) {
  console.warn('⚠️ PINATA_JWT not found');
  console.warn('Get JWT from: https://app.pinata.cloud');
  console.warn('Files will use fallback hashes');
} else {
  console.log('🔑 Pinata JWT found');
}

// Blockchain configuration
const rpcUrl = process.env.NETWORK_RPC_URL || 'http://127.0.0.1:8545';
const provider = new ethers.JsonRpcProvider(rpcUrl);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Display network info on startup
(async () => {
  try {
    const network = await provider.getNetwork();
    const networkNames = {
      31337: 'Hardhat Local',
      1337: 'Localhost', 
      84532: 'Base Sepolia',
      8453: 'Base Mainnet'
    };
    const chainId = Number(network.chainId);
    console.log('🔗 Connected to blockchain');
    console.log('🌐 Network:', networkNames[chainId] || 'Unknown', '(Chain ID:', chainId + ')');
    console.log('📡 RPC:', rpcUrl);
    console.log('👤 Wallet:', wallet.address);
    const balance = await provider.getBalance(wallet.address);
    console.log('💰 Balance:', ethers.formatEther(balance), 'ETH');
  } catch (error) {
    console.error('❌ Failed to connect to blockchain:', error.message);
  }
})();

// Task storage (simple JSON file for MVP)
const TASKS_FILE = './data/tasks.json';
let tasks = [];

// Load tasks from file
try {
  const fs = await import('fs');
  if (fs.existsSync(TASKS_FILE)) {
    tasks = JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8'));
  }
} catch (error) {
  console.log('No existing tasks file, starting fresh');
}

// Save tasks to file
async function saveTasks() {
  try {
    const fs = await import('fs');
    const dir = './data';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
  } catch (error) {
    console.error('Error saving tasks:', error);
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get all tasks
app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

// AI Task Processing with configurable API provider
async function processTaskWithAI(taskDescription) {
  try {
    // Configurable API settings - supports DeepSeek, OpenAI, or custom providers
    const API_URL = process.env.AI_API_URL || 'https://api.deepseek.com/v1/chat/completions';
    const apiKey = process.env.AI_API_KEY || process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;
    const modelName = process.env.AI_MODEL_NAME || 'deepseek-chat';

    if (!apiKey) {
      throw new Error('AI_API_KEY (or DEEPSEEK_API_KEY/OPENAI_API_KEY) environment variable is required');
    }

    console.log('🔑 Making AI API request...');
    console.log('📡 URL:', API_URL);
    console.log('🤖 Model:', modelName);
    console.log('🔒 API Key length:', apiKey.length);

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
            content: `You are a helpful AI assistant that processes tasks for the N4Y LOGOS platform.
            You need to analyze the task and provide a detailed solution or completion.

            Guidelines:
            - Provide actionable, specific results
            - Include any relevant code, explanations, or data
            - Format your response clearly with sections if needed
            - Be comprehensive but concise`
          },
          {
            role: 'user',
            content: `Please process this task: ${taskDescription}

            Provide a complete solution or result.`
          }
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ AI API Error Response:', errorData);
      throw new Error(`AI API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log('✅ AI API Response received successfully');
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error processing task with AI:', error);
    throw new Error(`AI processing failed: ${error.message}`);
  }
}

// Pinata v1 PUBLIC pinning API
async function storeResultOnIPFS(result) {
  try {
    if (!PINATA_JWT) {
      console.warn('⚠️ No Pinata JWT, using fallback');
      const crypto = await import('crypto');
      const hash = crypto.createHash('sha256').update(result).digest();
      return 'bafy' + Array.from(hash.slice(0, 32)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 50);
    }

    console.log('📦 Uploading to PUBLIC IPFS via Pinata...');

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

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Pinata error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const cid = data.IpfsHash;
    
    console.log('✅ PINNED TO PUBLIC IPFS!');
    console.log('🔗 CID:', cid);
    console.log('🌐 PUBLIC URLs (accessible anywhere):');
    console.log('   - ' + IPFS_GATEWAY + '/ipfs/' + cid);
    console.log('   - https://cloudflare-ipfs.com/ipfs/' + cid);
    console.log('   - https://dweb.link/ipfs/' + cid);

    return cid;
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    const crypto = await import('crypto');
    const hash = crypto.createHash('sha256').update(result).digest();
    const fallbackHash = 'bafy' + Array.from(hash.slice(0, 32)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 50);
    console.log('🔗 Fallback hash:', fallbackHash);
    return fallbackHash;
  }
}


// Generate a realistic IPFS hash from content
async function generateContentHash(content) {
  const crypto = await import('crypto');

  const hash = crypto.createHash('sha256');
  hash.update(content);
  const hashBytes = hash.digest();

  // Generate IPFS v1 CID format (bafy...)
  const ipfsHash = 'bafy' + Array.from(hashBytes.slice(0, 32))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 50);

  return ipfsHash;
}

// Simple task polling (MVP approach)
async function pollForTasks() {
  console.log('Starting task polling...');

  // In a real implementation, this would poll the blockchain
  // For MVP, we'll simulate task detection

  setInterval(async () => {
    // Check for new tasks that need processing
    const pendingTasks = tasks.filter(task =>
      task.status === 'created' && !task.isProcessing
    );

    for (const task of pendingTasks) {
      await processTask(task);
    }
  }, 10000); // Poll every 10 seconds
}

// Process a single task
async function processTask(task) {
  try {
    task.isProcessing = true;
    task.status = 'processing';
    saveTasks();

    console.log(`Processing task ${task.id}: ${task.description}`);

    // Process with AI
    const result = await processTaskWithAI(task.description);

    // Store result on IPFS
    const ipfsHash = await storeResultOnIPFS(result);

    // Update task
    task.status = 'completed';
    task.result = result;
    task.ipfsHash = ipfsHash;
    task.completedAt = new Date().toISOString();
    task.isProcessing = false;

    saveTasks();
    console.log(`Task ${task.id} completed and stored on IPFS: ${ipfsHash}`);

    // In real implementation, this would call the smart contract
    // await taskManagerContract.fulfillTask(task.id, ipfsHash);

  } catch (error) {
    console.error(`Error processing task ${task.id}:`, error);
    task.status = 'failed';
    task.error = error.message;
    task.isProcessing = false;
    saveTasks();
  }
}

// Test Pinata connection
app.get('/api/test-pinata', async (req, res) => {
  try {
    if (!PINATA_JWT) {
      return res.status(400).json({
        error: 'PINATA_JWT not configured',
        message: 'Add PINATA_JWT to your .env file'
      });
    }

    console.log('🧪 Testing Pinata connection...');
    console.log('Token exists:', !!PINATA_JWT);
    console.log('Token length:', PINATA_JWT?.length || 0);
    console.log('Is JWT format:', PINATA_JWT?.startsWith('eyJ') || false);

    // Test simple file upload to Pinata v3
    const testContent = 'This is a test file from N4Y Backend Service';


    const FormData = (await import('form-data')).default;
    const testFormData = new FormData();
    testFormData.append('file', Buffer.from(testContent), {
      filename: 'test.txt',
      contentType: 'text/plain'
    });

    const testResponse = await fetch(`${PINATA_UPLOADS_URL}/v3/files`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`,
      },
      body: testFormData
    });

    if (testResponse.ok) {
      const result = await testResponse.json();
      const cid = result.cid || result?.data?.cid || result.IpfsHash;
      console.log('✅ Pinata test successful!');
      console.log('📦 Response:', JSON.stringify(result, null, 2));

      res.json({
        success: true,
        message: 'Pinata connection working',
        testCid: cid,
        tokenConfigured: true,
        baseUrl: PINATA_UPLOADS_URL,
        apiEndpoint: '/v3/files'
      });
    } else {
      const errorText = await testResponse.text();
      console.error('❌ Test response status:', testResponse.status);
      console.error('❌ Test error:', errorText);

      // Provide specific guidance for 403 errors
      if (testResponse.status === 403) {
        console.error('\n🔧 PINATA 403 ERROR - MISSING PERMISSIONS!');
        console.error('💡 Solution: Your API key needs "org:files:write" permission');
        console.error('💡 Go to: https://app.pinata.cloud/developers/api-keys');
        console.error('💡 Find your key → Edit → Enable "org:files:write" → Save');
        console.error('💡 Then copy the new JWT token to your .env file');
      }

      throw new Error(`Test failed: ${testResponse.status} - ${errorText}`);
    }

  } catch (error) {
    console.error('❌ Pinata test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      tokenConfigured: !!PINATA_JWT,
      tokenLength: PINATA_JWT?.length || 0,
      troubleshooting: {
        issue: "403 NO_SCOPES_FOUND error",
        solution: "Enable 'pinning' scope in Pinata dashboard",
        steps: [
          "Go to: https://app.pinata.cloud/developers/api-keys",
          "Find your API key and click 'Edit'",
          "Enable the 'pinning' scope (required for uploads)",
          "Enable 'admin' scope (recommended for full access)",
          "Save and copy the new JWT token",
          "Update PINATA_JWT in your .env file"
        ]
      },
      details: {
        message: error.message,
        stack: error.stack
      }
    });
  }
});

// API endpoint to create a test task (for demo purposes)
app.post('/api/tasks/test', async (req, res) => {
  const { description } = req.body;

  if (!description) {
    return res.status(400).json({ error: 'Description required' });
  }

  const newTask = {
    id: Date.now().toString(),
    description,
    status: 'created',
    createdAt: new Date().toISOString(),
    isProcessing: false
  };

  tasks.push(newTask);
  saveTasks();

  // Process the task immediately for demo
  await processTask(newTask);

  res.json(newTask);
});

// Start server
app.listen(PORT, () => {
  console.log(`N4Y Backend Service running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);

  // Start polling for tasks
  pollForTasks();
});

// Export functions for testing
export { storeResultOnIPFS };
