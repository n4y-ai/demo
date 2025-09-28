// Simple test script for N4Y Backend Service
import fetch from 'node-fetch'; // You'll need to install this: npm install node-fetch

const BASE_URL = 'http://localhost:3001';

async function testBackendService() {
  console.log('🧪 Testing N4Y Backend Service...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);

    // Test 2: Get tasks (should be empty initially)
    console.log('\n2️⃣ Testing get tasks endpoint...');
    const tasksResponse = await fetch(`${BASE_URL}/api/tasks`);
    const tasks = await tasksResponse.json();
    console.log('✅ Current tasks:', tasks.length);

    // Test 3: Create a test task
    console.log('\n3️⃣ Testing task creation and processing...');
    const testTask = {
      description: 'Write a simple smart contract for token transfer functionality'
    };

    const createResponse = await fetch(`${BASE_URL}/api/tasks/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testTask)
    });

    const newTask = await createResponse.json();
    console.log('✅ Task created:', newTask.id);

    // Test 4: Wait a bit and check task status
    console.log('\n4️⃣ Waiting for AI processing...');
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds

    const updatedTasksResponse = await fetch(`${BASE_URL}/api/tasks`);
    const updatedTasks = await updatedTasksResponse.json();

    const processedTask = updatedTasks.find(t => t.id === newTask.id);
    if (processedTask) {
      console.log('✅ Task status:', processedTask.status);
      if (processedTask.ipfsHash) {
        console.log('✅ IPFS hash:', processedTask.ipfsHash);
        console.log('✅ Task completed successfully!');
      }
    } else {
      console.log('❌ Task not found');
    }

    console.log('\n🎉 Backend service test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure:');
    console.log('1. Backend service is running on port 3001');
    console.log('2. .env file is configured with API keys');
    console.log('3. Dependencies are installed: npm install');
  }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testBackendService();
}

export { testBackendService };
