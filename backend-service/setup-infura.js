import 'dotenv/config';
import fetch from 'node-fetch';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise(resolve => rl.question(query, resolve));

async function setupInfura() {
  console.log('🔧 Infura IPFS Setup Helper');
  console.log('============================');

  // Check if .env already exists
  const fs = await import('fs');
  const envPath = '.env';

  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
    console.log('📄 Found existing .env file');
  }

  // Get Infura Project ID
  const projectId = await question('Enter your Infura IPFS Project ID: ');
  if (!projectId.trim()) {
    console.log('❌ Project ID is required');
    rl.close();
    return;
  }

  // Get Infura Project Secret
  const projectSecret = await question('Enter your Infura IPFS Project Secret: ');
  if (!projectSecret.trim()) {
    console.log('❌ Project Secret is required');
    rl.close();
    return;
  }

  // Test the credentials
  console.log('\n🔍 Testing Infura credentials...');

  try {
    const authHeader = `Basic ${Buffer.from(`${projectId}:${projectSecret}`).toString('base64')}`;
    const testResponse = await fetch('https://ipfs.infura.io:5001/api/v0/version', {
      headers: {
        'Authorization': authHeader
      }
    });

    if (testResponse.ok) {
      console.log('✅ Infura credentials are valid!');
    } else {
      console.log('❌ Invalid Infura credentials. Please check your Project ID and Secret.');
      rl.close();
      return;
    }
  } catch (error) {
    console.log('❌ Error testing Infura credentials:', error.message);
    console.log('Please check your internet connection and credentials.');
    rl.close();
    return;
  }

  // Update .env content
  const envLines = envContent.split('\n').filter(line => line.trim());
  const updatedLines = [];

  for (const line of envLines) {
    if (line.startsWith('INFURA_IPFS_PROJECT_ID=')) {
      updatedLines.push(`INFURA_IPFS_PROJECT_ID=${projectId}`);
    } else if (line.startsWith('INFURA_IPFS_PROJECT_SECRET=')) {
      updatedLines.push(`INFURA_IPFS_PROJECT_SECRET=${projectSecret}`);
    } else {
      updatedLines.push(line);
    }
  }

  // Add missing variables
  if (!envLines.some(line => line.startsWith('INFURA_IPFS_PROJECT_ID='))) {
    updatedLines.push(`INFURA_IPFS_PROJECT_ID=${projectId}`);
  }
  if (!envLines.some(line => line.startsWith('INFURA_IPFS_PROJECT_SECRET='))) {
    updatedLines.push(`INFURA_IPFS_PROJECT_SECRET=${projectSecret}`);
  }

  // Write back to .env
  const finalEnvContent = updatedLines.join('\n') + '\n';
  fs.writeFileSync(envPath, finalEnvContent);

  console.log('\n✅ .env file updated successfully!');
  console.log('📄 Your .env file now contains:');
  console.log(finalEnvContent);

  console.log('\n🚀 Ready to test with real IPFS!');
  console.log('Run: npm start');
  console.log('Then test: node test-service.js');

  rl.close();
}

setupInfura().catch(console.error);
