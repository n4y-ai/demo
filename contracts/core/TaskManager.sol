// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./LogosRegistry.sol";
import "./QiBank.sol";

/**
 * @title TaskManager
 * @dev Handles task lifecycle, escrow, and payouts
 */
contract TaskManager is ReentrancyGuard, Pausable, Ownable {
    
    enum TaskStatus { Created, InProgress, Fulfilled, Cancelled, Disputed }
    
    struct Task {
        uint256 taskId;
        address creator;         // User who created task
        uint256 assignedLOGOS;   // LOGOS agent ID assigned
        string description;      // Task description
        uint256 bountyAmount;    // ETH bounty
        uint256 qiBudget;        // QI tokens allocated
        TaskStatus status;
        uint256 createdAt;
        uint256 deadline;
        string resultIPFS;       // IPFS hash of result
    }
    
    uint256 private _taskIdCounter;
    LogosRegistry public immutable logosRegistry;
    QiBank public immutable qiBank;
    
    // Configuration
    uint256 public constant MIN_BOUNTY = 0.001 ether;
    uint256 public constant MAX_BOUNTY = 10 ether;
    uint256 public platformFeePercent = 5; // 5%
    
    // Storage
    mapping(uint256 => Task) public tasks;
    mapping(address => uint256[]) public userTasks;
    mapping(uint256 => uint256[]) public logosTasks;
    
    // Events
    event TaskCreated(
        uint256 indexed taskId, 
        address indexed creator, 
        uint256 bounty, 
        uint256 qiBudget
    );
    event TaskAssigned(uint256 indexed taskId, uint256 indexed logosId);
    event TaskFulfilled(uint256 indexed taskId, string resultIPFS);
    event TaskCancelled(uint256 indexed taskId);
    event BountyClaimed(uint256 indexed taskId, address indexed recipient, uint256 amount);
    event PlatformFeeUpdated(uint256 newFeePercent);
    
    constructor(address _logosRegistry, address _qiBank) Ownable(msg.sender) {
        require(_logosRegistry != address(0), "TaskManager: Invalid registry");
        require(_qiBank != address(0), "TaskManager: Invalid QiBank");
        
        logosRegistry = LogosRegistry(_logosRegistry);
        qiBank = QiBank(_qiBank);
    }
    
    /**
     * @dev Create a new task with ETH bounty and QI budget
     */
    function createTask(
        string memory description,
        uint256 qiBudget,
        uint256 deadline
    ) external payable nonReentrant whenNotPaused returns (uint256) {
        require(bytes(description).length > 0, "TaskManager: Description required");
        require(msg.value >= MIN_BOUNTY && msg.value <= MAX_BOUNTY, "TaskManager: Invalid bounty");
        require(qiBudget > 0, "TaskManager: QI budget required");
        require(deadline > block.timestamp, "TaskManager: Invalid deadline");
        
        _taskIdCounter++;
        uint256 newTaskId = _taskIdCounter;
        
        // Allocate QI tokens through QiBank
        qiBank.allocateQI(newTaskId, msg.sender, qiBudget);
        
        tasks[newTaskId] = Task({
            taskId: newTaskId,
            creator: msg.sender,
            assignedLOGOS: 0,
            description: description,
            bountyAmount: msg.value,
            qiBudget: qiBudget,
            status: TaskStatus.Created,
            createdAt: block.timestamp,
            deadline: deadline,
            resultIPFS: ""
        });
        
        userTasks[msg.sender].push(newTaskId);
        
        emit TaskCreated(newTaskId, msg.sender, msg.value, qiBudget);
        
        return newTaskId;
    }
    
    /**
     * @dev Assign task to a LOGOS agent
     */
    function assignTask(uint256 taskId, uint256 logosId) 
        external 
        onlyAuthorized 
        nonReentrant 
    {
        Task storage task = tasks[taskId];
        require(task.status == TaskStatus.Created, "TaskManager: Invalid status");
        require(logosRegistry.isLogosActive(logosId), "TaskManager: LOGOS inactive");
        
        task.assignedLOGOS = logosId;
        task.status = TaskStatus.InProgress;
        
        logosTasks[logosId].push(taskId);
        
        emit TaskAssigned(taskId, logosId);
    }
    
    /**
     * @dev Fulfill task with result
     */
    function fulfillTask(uint256 taskId, string memory resultIPFS) 
        external 
        onlyAuthorized 
        nonReentrant 
    {
        Task storage task = tasks[taskId];
        require(task.status == TaskStatus.InProgress, "TaskManager: Invalid status");
        require(bytes(resultIPFS).length > 0, "TaskManager: Result required");
        
        task.status = TaskStatus.Fulfilled;
        task.resultIPFS = resultIPFS;
        
        emit TaskFulfilled(taskId, resultIPFS);
    }
    
    /**
     * @dev Claim bounty after task fulfillment
     */
    function claimBounty(uint256 taskId) 
        external 
        onlyAuthorized 
        nonReentrant 
    {
        Task storage task = tasks[taskId];
        require(task.status == TaskStatus.Fulfilled, "TaskManager: Not fulfilled");
        require(task.bountyAmount > 0, "TaskManager: No bounty");
        
        uint256 platformFee = (task.bountyAmount * platformFeePercent) / 100;
        uint256 payoutAmount = task.bountyAmount - platformFee;
        
        // Get LOGOS smart account
        LogosRegistry.LogosAgent memory logos = logosRegistry.getLOGOS(task.assignedLOGOS);
        
        // Update LOGOS stats
        logosRegistry.recordTaskCompletion(task.assignedLOGOS, payoutAmount);
        
        // Transfer bounty
        task.bountyAmount = 0;
        
        if (platformFee > 0) {
            (bool feeSuccess, ) = owner().call{value: platformFee}("");
            require(feeSuccess, "TaskManager: Fee transfer failed");
        }
        
        (bool payoutSuccess, ) = logos.smartAccount.call{value: payoutAmount}("");
        require(payoutSuccess, "TaskManager: Payout failed");
        
        emit BountyClaimed(taskId, logos.smartAccount, payoutAmount);
    }
    
    /**
     * @dev Cancel task and refund
     */
    function cancelTask(uint256 taskId) external nonReentrant {
        Task storage task = tasks[taskId];
        require(task.creator == msg.sender, "TaskManager: Not creator");
        require(
            task.status == TaskStatus.Created || task.status == TaskStatus.InProgress,
            "TaskManager: Cannot cancel"
        );
        
        task.status = TaskStatus.Cancelled;
        
        // Refund bounty
        uint256 refundAmount = task.bountyAmount;
        task.bountyAmount = 0;
        
        // Refund unused QI
        qiBank.refundUnusedQI(taskId, msg.sender);
        
        if (refundAmount > 0) {
            (bool success, ) = msg.sender.call{value: refundAmount}("");
            require(success, "TaskManager: Refund failed");
        }
        
        emit TaskCancelled(taskId);
    }
    
    /**
     * @dev Get task details
     */
    function getTask(uint256 taskId) external view returns (Task memory) {
        return tasks[taskId];
    }
    
    /**
     * @dev Get user's tasks
     */
    function getUserTasks(address user) external view returns (uint256[] memory) {
        return userTasks[user];
    }
    
    /**
     * @dev Get LOGOS's tasks
     */
    function getLogosTasks(uint256 logosId) external view returns (uint256[] memory) {
        return logosTasks[logosId];
    }
    
    /**
     * @dev Update platform fee
     */
    function setPlatformFee(uint256 newFeePercent) external onlyOwner {
        require(newFeePercent <= 20, "TaskManager: Fee too high"); // Max 20%
        platformFeePercent = newFeePercent;
        emit PlatformFeeUpdated(newFeePercent);
    }
    
    /**
     * @dev Pause contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // Access control
    mapping(address => bool) public authorizedCallers;
    
    function setAuthorizedCaller(address caller, bool authorized) external onlyOwner {
        authorizedCallers[caller] = authorized;
    }
    
    modifier onlyAuthorized() {
        require(
            authorizedCallers[msg.sender] || msg.sender == owner(),
            "TaskManager: Not authorized"
        );
        _;
    }
    
    // Receive function to accept ETH
    receive() external payable {}
}
