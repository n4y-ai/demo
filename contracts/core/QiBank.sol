// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./QIToken.sol";

/**
 * @title QiBank
 * @dev Manages QI token economics and spending for tasks
 */
contract QiBank is ReentrancyGuard, Ownable {
    QIToken public immutable qiToken;
    
    struct QiBudget {
        uint256 allocated;    // QI allocated to task
        uint256 spent;        // QI actually consumed
        uint256 remaining;    // QI left unused
        bool isActive;        // Budget status
    }
    
    mapping(uint256 => QiBudget) public taskBudgets;
    mapping(address => bool) public authorizedCallers;
    
    event QIAllocated(uint256 indexed taskId, address indexed user, uint256 amount);
    event QISpent(uint256 indexed taskId, uint256 amount, string reason);
    event QIRefunded(uint256 indexed taskId, address indexed user, uint256 amount);
    event QIBurned(uint256 amount, string reason);
    event CallerAuthorized(address indexed caller, bool authorized);
    
    constructor(address _qiToken) Ownable(msg.sender) {
        require(_qiToken != address(0), "QiBank: Invalid QI token address");
        qiToken = QIToken(_qiToken);
    }
    
    /**
     * @dev Authorize or revoke caller (TaskManager)
     */
    function setAuthorizedCaller(address caller, bool authorized) external onlyOwner {
        authorizedCallers[caller] = authorized;
        emit CallerAuthorized(caller, authorized);
    }
    
    /**
     * @dev Allocate QI tokens for a task
     * Burns 75% immediately, keeps 25% to return to user
     */
    function allocateQI(uint256 taskId, address user, uint256 amount) 
        external 
        nonReentrant 
        onlyAuthorized 
    {
        require(amount > 0, "QiBank: Amount must be greater than 0");
        require(!taskBudgets[taskId].isActive, "QiBank: Budget already allocated");
        
        // Transfer QI from user to this contract
        require(qiToken.transferFrom(user, address(this), amount), "QiBank: Transfer failed");
        
        // Burn 75% of tokens
        uint256 burnAmount = (amount * 75) / 100;
        uint256 keepAmount = amount - burnAmount;
        
        if (burnAmount > 0) {
            qiToken.burn(burnAmount);
            emit QIBurned(burnAmount, "Task allocation - 75% burn");
        }
        
        taskBudgets[taskId] = QiBudget({
            allocated: amount,
            spent: burnAmount,
            remaining: keepAmount,
            isActive: true
        });
        
        emit QIAllocated(taskId, user, amount);
    }
    
    /**
     * @dev Spend QI tokens for a task
     */
    function spendQI(uint256 taskId, uint256 amount, string memory reason) 
        external 
        nonReentrant 
        onlyAuthorized 
    {
        QiBudget storage budget = taskBudgets[taskId];
        require(budget.isActive, "QiBank: No active budget");
        require(budget.remaining >= amount, "QiBank: Insufficient QI");
        
        budget.spent += amount;
        budget.remaining -= amount;
        
        emit QISpent(taskId, amount, reason);
    }
    
    /**
     * @dev Refund unused QI tokens (25% of original deposit)
     */
    function refundUnusedQI(uint256 taskId, address recipient) 
        external 
        nonReentrant 
        onlyAuthorized 
    {
        QiBudget storage budget = taskBudgets[taskId];
        require(budget.isActive, "QiBank: No active budget");
        
        uint256 refundAmount = budget.remaining;
        budget.remaining = 0;
        budget.isActive = false;
        
        if (refundAmount > 0) {
            require(qiToken.transfer(recipient, refundAmount), "QiBank: Refund failed");
            emit QIRefunded(taskId, recipient, refundAmount);
        }
    }
    
    /**
     * @dev Burn QI tokens (for deflation)
     */
    function burnQI(uint256 amount, string memory reason) 
        external 
        nonReentrant 
        onlyAuthorized 
    {
        require(amount > 0, "QiBank: Amount must be greater than 0");
        require(qiToken.balanceOf(address(this)) >= amount, "QiBank: Insufficient balance");
        
        // QIToken must authorize this contract to burn
        qiToken.burn(amount);
        
        emit QIBurned(amount, reason);
    }
    
    /**
     * @dev Get budget details for a task
     */
    function getBudget(uint256 taskId) external view returns (QiBudget memory) {
        return taskBudgets[taskId];
    }
    
    modifier onlyAuthorized() {
        require(authorizedCallers[msg.sender], "QiBank: Not authorized");
        _;
    }
}
