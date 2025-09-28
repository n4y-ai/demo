# N4Y Backend Service - MVP

Simple backend service for the N4Y LOGOS platform MVP.

## Features

- **Event Polling**: Monitors for new tasks
- **AI Processing**: Uses DeepSeek API (or OpenAI fallback) to process tasks
- **Real IPFS Upload**: Uploads to IPFS via Pinata API (Well-established service)
- **Simple API**: REST endpoints for frontend integration

## Setup

1. Install dependencies:
```bash
npm install
```

2. **Quick Setup**:
   - Copy environment variables:
   ```bash
   cp .env.example .env
   ```
   - Configure your `.env` file with:
     - `DEEPSEEK_API_KEY`: Your DeepSeek API key (or `OPENAI_API_KEY` as fallback)
     - `NETWORK_RPC_URL`: Base Sepolia RPC URL
     - `PRIVATE_KEY`: Your wallet private key

### IPFS Configuration (Pinata)
The service uses [Pinata](https://pinata.cloud) which provides:
- ✅ **Well-established** (years of reliable service)
- ✅ **Generous FREE tier** (100 uploads/month, 1GB storage)
- ✅ **Real IPFS uploads** via proven REST API
- ✅ **Automatic pinning** and persistence
- ✅ **Excellent documentation** and support

**Setup**:
1. Get JWT token at [app.pinata.cloud/developers/api-keys](https://app.pinata.cloud/developers/api-keys)
2. Add to your `.env` file: `PINATA_JWT=your_jwt_token_here`

**Important**: When creating your API key in Pinata (v3):
- ✅ Enable `org:files:write` (required for uploads)
- ✅ Enable `org:files:read` (optional, for metadata)
- ✅ Enable `org:admin` (optional, full access)
- ✅ Copy the full JWT token (600+ characters)

**Note**: Uses the v3 `/v3/files` endpoint (hosted at `https://uploads.pinata.cloud`).

## Running

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

- `GET /health` - Health check
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks/test` - Create and process a test task
- `GET /api/test-pinata` - Test Pinata connection (v3 uploads)

## Testing

The service includes test endpoints for debugging:

- `/api/tasks/test` - Creates and processes a sample task for demo
- `/api/test-pinata` - Tests Pinata connection and shows detailed error information

### Quick test
```bash
curl -i http://localhost:3001/api/test-pinata
```
Expected: 200 JSON with a `testCid` field.

## Troubleshooting

**If Pinata uploads fail:**

1. **Test connection**: Visit `http://localhost:3001/api/test-pinata`
2. **Check token**: Verify `PINATA_JWT` is in your `.env` file
3. **Get new token**: Visit [app.pinata.cloud/developers/api-keys](https://app.pinata.cloud/developers/api-keys)
4. **Check logs**: The service shows detailed error information in console

**Common issues:**
- Missing `PINATA_JWT` in environment variables
- Invalid or expired JWT token
- Network connectivity problems
- Token format issues (should be a JWT string starting with `eyJ`)
- Incorrect API endpoint (should be `/v3/files`)
- Form data format issues
- **Missing `org:files:write` permission**

Note: v3 uploads are sent to `https://uploads.pinata.cloud/v3/files`.

**403 "NO_SCOPES_FOUND" Error:**
This means your API key doesn't have the required permissions. To fix:
1. Go to [app.pinata.cloud/developers/api-keys](https://app.pinata.cloud/developers/api-keys)
2. Find your API key and click "Edit"
3. Enable the `org:files:write` permission (required for uploads)
4. (Optional) Enable `org:files:read` and `org:admin`
5. Save changes and copy the new JWT token
6. Update your `.env` file with the new token

## MVP Features

- **DeepSeek Integration**: Uses DeepSeek API for AI task processing
- **Pinata IPFS**: Real IPFS uploads with proven reliability (100 uploads/month free)
- **Simple File Upload**: Direct multipart form-data uploads to Pinata
- **Persistent Storage**: Files automatically pinned and available long-term
- **Event Polling**: HTTP polling for task monitoring
- **File Storage**: JSON-based task state management

## MVP Limitations

- Uses HTTP polling instead of WebSocket events
- Stores data in JSON files instead of a database
- Single-threaded processing
- Basic error handling
- Console logging only
