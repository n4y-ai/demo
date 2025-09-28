# N4Y LOGOS Project Brief

## Project Essence
**LOGOS** is a digital agent (AI identity) anchored on blockchain with wallet, task execution, and transparent on-chain economics.

## Core Components
- **LOGOS**: Digital agents with ERC-4337 smart accounts
- **TaskManager**: Escrow system for task bounties and execution
- **QI Token**: Utility token for AI inference costs
- **Agent Service**: Off-chain AI processing and IPFS storage
- **Frontend**: LOGOS Studio for interaction and monitoring

## Technical Architecture
- **Blockchain**: Base L2 (EVM compatible)
- **Storage**: IPFS for task results
- **Frontend**: Next.js + TailwindCSS + wagmi/viem
- **Smart Contracts**: Solidity + OpenZeppelin
- **Backend**: Node.js event listener + LLM integration

## Demo Flow
1. User creates LOGOS → smart account deployment
2. User assigns task → on-chain transaction with bounty
3. AI agent processes task → result stored in IPFS
4. Smart contract executes payout → bounty distribution
5. All interactions visible in block explorer and frontend

## Current Status
- Frontend demo: Complete with mock data
- Smart contracts: 2 contracts created, in progress
- Backend service: In development
- Integration: Pending

## Key Challenges Identified
1. Bounty/Budget UX confusion (ETH vs QI tokens)
2. Automatic bounty calculation needed
3. QI token economics for AI inference
4. Web3 integration missing from frontend
