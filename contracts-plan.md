# N4Y LOGOS Smart Contracts Architecture

## Overview
Design autonomous AI agents (LOGOS) with on-chain identity, task management, and transparent economics on Base L2.

## Core Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   LOGOS AGENT   │    │  TASK MANAGER   │    │   QI ECONOMICS  │
│                 │    │                 │    │                 │
│ • Identity      │◄──►│ • Escrow        │◄──►│ • QI Token      │
│ • Wallet        │    │ • Lifecycle     │    │ • QI Bank       │
│ • History       │    │ • Payouts       │    │ • Token Flow    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                               │
                    ┌─────────────────┐
                    │   INTEGRATION   │
                    │                 │
                    │ • Events        │
                    │ • Oracles       │
                    │ • IPFS Links    │
                    └─────────────────┘
```

## Contract Specifications

### 1. LOGOS Registry (`LogosRegistry.sol`)

**Purpose**: Manage LOGOS agent identities and smart accounts

```solidity
contract LogosRegistry {
    struct LogosAgent {
        address owner;           // Creator of the LOGOS
        address smartAccount;    // ERC-4337 account address
        string name;            // Agent name
        string description;     // Agent description
        uint256 createdAt;      // Creation timestamp
        uint256 totalTasks;     // Tasks completed
        uint256 totalEarnings;  // Total ETH earned
        bool isActive;          // Agent status
    }
    
    // Core Functions
    function createLOGOS(string name, string description) external returns (address);
    function updateLOGOS(address logosId, string name, string description) external;
    function deactivateLOGOS(address logosId) external;
    function getLOGOS(address logosId) external view returns (LogosAgent);
    
    // Events
    event LogosCreated(address indexed logosId, address indexed owner, string name);
    event LogosUpdated(address indexed logosId, string name, string description);
}
```

**Key Features:**
- ERC-4337 smart account integration
- LOGOS metadata storage
- Owner permissions
- Activity tracking

### 2. Task Manager (`TaskManager.sol`)

**Purpose**: Handle task lifecycle, escrow, and payouts

```solidity
contract TaskManager {
    enum TaskStatus { Created, InProgress, Fulfilled, Cancelled, Disputed }
    
    struct Task {
        uint256 taskId;
        address creator;         // User who created task
        address assignedLOGOS;   // LOGOS agent assigned
        string description;      // Task description
        uint256 bountyAmount;    // ETH bounty
        uint256 qiBudget;        // QI tokens allocated
        TaskStatus status;
        uint256 createdAt;
        uint256 deadline;
        string resultIPFS;       // IPFS hash of result
    }
    
    // Core Functions
    function createTask(
        string memory description,
        uint256 qiBudget,
        uint256 deadline
    ) external payable returns (uint256);
    
    function assignTask(uint256 taskId, address logosAgent) external;
    function fulfillTask(uint256 taskId, string memory resultIPFS) external;
    function cancelTask(uint256 taskId) external;
    function claimBounty(uint256 taskId) external;
    
    // Events
    event TaskCreated(uint256 indexed taskId, address indexed creator, uint256 bounty, uint256 qiBudget);
    event TaskAssigned(uint256 indexed taskId, address indexed logosAgent);
    event TaskFulfilled(uint256 indexed taskId, string resultIPFS);
    event BountyClaimed(uint256 indexed taskId, address indexed recipient, uint256 amount);
}
```

**Key Features:**
- Escrow system for bounties
- Automatic gas estimation for bounties
- Task lifecycle management
- IPFS result storage
- Dispute resolution framework

### 3. QI Token (`QIToken.sol`)

**Purpose**: Utility token for AI inference costs

```solidity
contract QIToken is ERC20, Ownable {
    uint256 public constant INITIAL_SUPPLY = 1_000_000_000 * 10**18; // 1B QI
    
    mapping(address => bool) public authorizedSpenders; // QiBank, TaskManager
    
    function mint(address to, uint256 amount) external onlyOwner;
    function authorizeSpender(address spender) external onlyOwner;
    function spend(address from, uint256 amount) external onlyAuthorized;
    
    modifier onlyAuthorized() {
        require(authorizedSpenders[msg.sender], "Not authorized");
        _;
    }
}
```

**Key Features:**
- Standard ERC-20 functionality
- Controlled minting for ecosystem growth
- Authorized spender pattern for contracts
- Burn mechanism for token economics

### 4. QI Bank (`QiBank.sol`)

**Purpose**: Manage QI token economics and spending

```solidity
contract QiBank {
    struct QiBudget {
        uint256 allocated;    // QI allocated to task
        uint256 spent;        // QI actually consumed
        uint256 remaining;    // QI left unused
        bool isActive;        // Budget status
    }
    
    mapping(uint256 => QiBudget) public taskBudgets; // taskId => budget
    
    function allocateQI(uint256 taskId, address user, uint256 amount) external;
    function spendQI(uint256 taskId, uint256 amount, string memory reason) external;
    function refundUnusedQI(uint256 taskId) external;
    function burnQI(uint256 amount) external;
    
    // Events
    event QIAllocated(uint256 indexed taskId, address indexed user, uint256 amount);
    event QISpent(uint256 indexed taskId, uint256 amount, string reason);
    event QIRefunded(uint256 indexed taskId, address indexed user, uint256 amount);
}
```

**Key Features:**
- Budget allocation per task
- Spending tracking and limits
- Unused token refund mechanism
- Token burning for deflation

## Integration Architecture

### Event Flow
```
1. User creates task → TaskCreated event
2. Backend assigns to LOGOS → TaskAssigned event  
3. AI processes task → QI spending tracked
4. Result uploaded to IPFS → TaskFulfilled event
5. Smart contract validates → BountyClaimed event
6. Unused QI refunded → QIRefunded event
```

### Gas Optimization Strategy
- Use packed structs for storage efficiency
- Batch operations where possible
- Implement proxy patterns for upgradeability
- Optimize event emissions

### Security Considerations
- ReentrancyGuard for all payable functions
- Access control with OpenZeppelin
- Input validation and sanitization
- Emergency pause functionality
- Multi-signature for critical operations

## Deployment Plan

### Phase 1: Core Contracts (Base Sepolia)
1. Deploy QI Token contract
2. Deploy QI Bank contract  
3. Deploy LOGOS Registry
4. Deploy Task Manager
5. Configure integrations

### Phase 2: Testing & Validation
1. Unit tests for all contracts
2. Integration testing
3. Frontend integration
4. Security audit preparation

### Phase 3: Mainnet Deployment (Base)
1. Final security audit
2. Mainnet deployment
3. Liquidity provisioning
4. Production launch

## Contract Addresses (To Be Populated)

### Base Sepolia (Testnet)
```
QI_TOKEN=0x...
QI_BANK=0x...
LOGOS_REGISTRY=0x...
TASK_MANAGER=0x...
```

### Base Mainnet (Production)
```
QI_TOKEN=0x...
QI_BANK=0x...
LOGOS_REGISTRY=0x...
TASK_MANAGER=0x...
```

## Development Environment

### Required Tools
- Hardhat for development
- OpenZeppelin contracts
- Foundry for testing
- Slither for security analysis

### Project Structure
```
contracts/
├── core/
│   ├── LogosRegistry.sol
│   ├── TaskManager.sol
│   ├── QIToken.sol
│   └── QiBank.sol
├── interfaces/
├── libraries/
├── mocks/
└── test/
```

## Next Steps
1. Set up Hardhat development environment
2. Implement core contract interfaces
3. Write comprehensive tests
4. Deploy to Base Sepolia
5. Integrate with frontend
6. Implement backend event listening
