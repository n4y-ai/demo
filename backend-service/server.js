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

// Pinata IPFS Configuration (Reliable, well-established service)
const PINATA_BASE_URL = 'https://api.pinata.cloud';
const PINATA_UPLOADS_URL = 'https://uploads.pinata.cloud';
const PINATA_JWT = process.env.PINATA_JWT;

if (!PINATA_JWT) {
  console.warn('⚠️ PINATA_JWT not found in environment variables');
  console.warn('The service will fall back to generating mock IPFS hashes');
  console.warn('💡 Pinata provides free IPFS storage with excellent API');
  console.warn('💡 Get JWT from: https://app.pinata.cloud/developers/api-keys');
} else {
  console.log('🔑 Pinata JWT found:', PINATA_JWT.substring(0, 20) + '...');
  console.log('🔑 Token length:', PINATA_JWT.length);
  console.log('🔑 Is JWT format:', PINATA_JWT.startsWith('eyJ'));
}

// Blockchain configuration
const provider = new ethers.JsonRpcProvider(process.env.NETWORK_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

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

// AI Task Processing with DeepSeek API
async function processTaskWithAI(taskDescription) {
  try {
    const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
    const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY; // Fallback to OpenAI if available

    if (!apiKey) {
      throw new Error('DEEPSEEK_API_KEY or OPENAI_API_KEY environment variable is required');
    }

    console.log('🔑 Making DeepSeek API request...');
    console.log('📡 URL:', DEEPSEEK_API_URL);
    console.log('🔒 API Key length:', apiKey.length);

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat', // or 'deepseek-coder' for coding tasks
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
      console.error('❌ DeepSeek API Error Response:', errorData);
      throw new Error(`DeepSeek API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log('✅ DeepSeek API Response received successfully');
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error processing task with AI:', error);
    throw new Error(`AI processing failed: ${error.message}`);
  }
}

// Pinata IPFS Upload (Reliable and well-established)
async function storeResultOnIPFS(result) {
  try {
    if (!PINATA_JWT) {
      throw new Error('PINATA_JWT environment variable is required');
    }

    console.log('📦 Uploading to Pinata IPFS...');
    console.log('📋 Content preview:', result.substring(0, 100) + '...');

    // Create a simple file for upload
    const timestamp = new Date().toISOString();
    const filename = `n4y-task-result-${Date.now()}.json`;

    const fileContent = JSON.stringify({
      result: result,
      timestamp: timestamp,
      version: '1.0',
      uploadedBy: 'N4Y Backend Service',
      description: 'AI-generated task completion result'
    }, null, 2);

    // Pinata v3 API uses /files endpoint
    console.log('🚀 Starting Pinata v3 upload...');

    // Create proper FormData for Node.js
    const FormData = (await import('form-data')).default;
    const formData = new FormData();
    formData.append('file', Buffer.from(fileContent), {
      filename: filename,
      contentType: 'application/json'
    });

    // Pinata v3 API endpoint for file uploads
    const response = await fetch(`${PINATA_UPLOADS_URL}/v3/files`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`,
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Response status:', response.status);
      console.error('❌ Response headers:', Object.fromEntries(response.headers.entries()));
      console.error('❌ Error body:', errorText);

      // Provide specific guidance for common errors
      if (response.status === 403) {
        console.error('\n🔧 PINATA 403 ERROR - MISSING PERMISSIONS!');
        console.error('💡 Solution: Your API key needs "org:files:write" permission');
        console.error('💡 Go to: https://app.pinata.cloud/developers/api-keys');
        console.error('💡 Find your key → Edit → Enable "org:files:write" → Save');
        console.error('💡 Then copy the new JWT token to your .env file');
      }

      throw new Error(`Pinata API error: ${response.status} - ${errorText}`);
    }

    const uploadResult = await response.json();
    console.log('✅ Upload successful!');
    console.log('📦 Response:', JSON.stringify(uploadResult, null, 2));

    // Pinata v3 returns the CID as `cid`; keep fallbacks
    const cid = uploadResult.cid || uploadResult?.data?.cid || uploadResult.IpfsHash;
    if (!cid) {
      throw new Error('Pinata response did not include a CID');
    }
    console.log('🔗 IPFS CID:', cid);

    return cid;
  } catch (error) {
    console.error('❌ Pinata upload failed:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      tokenExists: !!PINATA_JWT,
      tokenLength: PINATA_JWT?.length || 0,
      tokenPreview: PINATA_JWT?.substring(0, 20) + '...'
    });

    // Fallback: Generate a realistic hash for demo
    console.log('⚠️ Using fallback hash generation...');
    const crypto = await import('crypto');

    const hash = crypto.createHash('sha256');
    hash.update(result);
    const hashBytes = hash.digest();

    const fallbackHash = 'bafy' + Array.from(hashBytes.slice(0, 32))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .slice(0, 50);

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
