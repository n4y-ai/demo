import 'dotenv/config';

console.log('🔍 Pinata JWT Token Debug');
console.log('========================');

const token = process.env.PINATA_JWT;

if (!token) {
  console.log('❌ PINATA_JWT not found in environment variables');
  console.log('💡 Make sure your .env file contains: PINATA_JWT=your_jwt_here');
  console.log('💡 Get JWT from: https://app.pinata.cloud/developers/api-keys');
  process.exit(1);
}

console.log('✅ Token found in environment');
console.log('📏 Token length:', token.length);
console.log('🔤 First 20 chars:', token.substring(0, 20) + '...');
console.log('🔤 Last 10 chars:', '...' + token.substring(token.length - 10));

console.log('\n🔍 Token Analysis:');
console.log('  - Starts with "eyJ":', token.startsWith('eyJ'));
console.log('  - Contains 2 dots (JWT):', (token.match(/\./g) || []).length === 2);
console.log('  - Length > 100 chars (typical JWT):', token.length > 100);

if (!token.startsWith('eyJ')) {
  console.log('\n❌ ERROR: Token does not start with "eyJ"');
  console.log('   This suggests it might not be a proper JWT token');
  console.log('   Check: https://jwt.io to decode and verify');
  console.log('   Make sure you copied the full JWT from Pinata dashboard');
}

if (token.length < 50) {
  console.log('\n⚠️ WARNING: Token seems short for a JWT!');
  console.log('   Typical Pinata JWTs are 150-200+ characters long');
}

if (token.length > 600) {
  console.log('\n✅ Token length looks good for Pinata JWT');
  console.log('   This is the expected length for a properly scoped API key');
}

console.log('\n🔧 Pinata Setup Instructions:');
console.log('   1. Go to: https://app.pinata.cloud/developers/api-keys');
console.log('   2. Click "New Key"');
console.log('   3. Name it something like "N4Y Backend"');
console.log('   4. IMPORTANT: Enable these permissions (v3):');
console.log('      ✅ org:files:write (to upload files)');
console.log('      ✅ org:files:read (to read file metadata)');
console.log('      ✅ org:admin (recommended for full access)');
console.log('   5. Copy the JWT token');
console.log('   6. Add to .env: PINATA_JWT=your_token_here');

console.log('\n⚠️  Common Issue: Missing permissions!');
console.log('   Make sure your API key has org:files:write enabled.');
console.log('   This is required for the /v3/files upload endpoint.');

console.log('\n💡 If you have an existing key:');
console.log('   - Go to API Keys in Pinata dashboard');
console.log('   - Find your key and click "Edit"');
console.log('   - Enable the "org:files:write" permission');
console.log('   - (Optional) Enable "org:files:read" and "org:admin"');
console.log('   - Save and copy the updated JWT');

console.log('\n✅ Token debugging complete');
