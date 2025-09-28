// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LogosRegistry
 * @dev Manages LOGOS agent identities and smart accounts
 */
contract LogosRegistry is Ownable {
    
    struct LogosAgent {
        address owner;           // Creator of the LOGOS
        address smartAccount;    // ERC-4337 account address (future implementation)
        string name;            // Agent name
        string description;     // Agent description  
        uint256 createdAt;      // Creation timestamp
        uint256 totalTasks;     // Tasks completed
        uint256 totalEarnings;  // Total ETH earned
        bool isActive;          // Agent status
    }
    
    uint256 private _logosIdCounter;
    
    // Mapping from LOGOS ID to agent data
    mapping(uint256 => LogosAgent) public logosAgents;
    
    // Mapping from owner to their LOGOS IDs
    mapping(address => uint256[]) public ownerLogos;
    
    // Mapping from smart account to LOGOS ID
    mapping(address => uint256) public smartAccountToLogos;
    
    // Events
    event LogosCreated(uint256 indexed logosId, address indexed owner, string name);
    event LogosUpdated(uint256 indexed logosId, string name, string description);
    event LogosDeactivated(uint256 indexed logosId);
    event LogosTaskCompleted(uint256 indexed logosId, uint256 earnings);
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Create a new LOGOS agent
     */
    function createLOGOS(string memory name, string memory description) 
        external 
        returns (uint256) 
    {
        require(bytes(name).length > 0, "LogosRegistry: Name required");
        require(bytes(description).length > 0, "LogosRegistry: Description required");
        
        _logosIdCounter++;
        uint256 newLogosId = _logosIdCounter;
        
        // For MVP, we'll use the LOGOS ID as a simple identifier
        // In production, this would create an ERC-4337 smart account
        address smartAccount = address(uint160(newLogosId));
        
        logosAgents[newLogosId] = LogosAgent({
            owner: msg.sender,
            smartAccount: smartAccount,
            name: name,
            description: description,
            createdAt: block.timestamp,
            totalTasks: 0,
            totalEarnings: 0,
            isActive: true
        });
        
        ownerLogos[msg.sender].push(newLogosId);
        smartAccountToLogos[smartAccount] = newLogosId;
        
        emit LogosCreated(newLogosId, msg.sender, name);
        
        return newLogosId;
    }
    
    /**
     * @dev Update LOGOS metadata
     */
    function updateLOGOS(uint256 logosId, string memory name, string memory description) 
        external 
    {
        require(logosAgents[logosId].owner == msg.sender, "LogosRegistry: Not owner");
        require(logosAgents[logosId].isActive, "LogosRegistry: LOGOS inactive");
        require(bytes(name).length > 0, "LogosRegistry: Name required");
        require(bytes(description).length > 0, "LogosRegistry: Description required");
        
        logosAgents[logosId].name = name;
        logosAgents[logosId].description = description;
        
        emit LogosUpdated(logosId, name, description);
    }
    
    /**
     * @dev Deactivate a LOGOS agent
     */
    function deactivateLOGOS(uint256 logosId) external {
        require(logosAgents[logosId].owner == msg.sender, "LogosRegistry: Not owner");
        require(logosAgents[logosId].isActive, "LogosRegistry: Already inactive");
        
        logosAgents[logosId].isActive = false;
        
        emit LogosDeactivated(logosId);
    }
    
    /**
     * @dev Record task completion (called by TaskManager)
     */
    function recordTaskCompletion(uint256 logosId, uint256 earnings) 
        external 
        onlyAuthorized 
    {
        require(logosAgents[logosId].isActive, "LogosRegistry: LOGOS inactive");
        
        logosAgents[logosId].totalTasks++;
        logosAgents[logosId].totalEarnings += earnings;
        
        emit LogosTaskCompleted(logosId, earnings);
    }
    
    /**
     * @dev Get LOGOS details
     */
    function getLOGOS(uint256 logosId) 
        external 
        view 
        returns (LogosAgent memory) 
    {
        require(logosAgents[logosId].createdAt > 0, "LogosRegistry: LOGOS not found");
        return logosAgents[logosId];
    }
    
    /**
     * @dev Get all LOGOS owned by an address
     */
    function getOwnerLogos(address owner) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return ownerLogos[owner];
    }
    
    /**
     * @dev Get LOGOS ID by smart account
     */
    function getLogosBySmartAccount(address smartAccount) 
        external 
        view 
        returns (uint256) 
    {
        return smartAccountToLogos[smartAccount];
    }
    
    /**
     * @dev Check if LOGOS exists and is active
     */
    function isLogosActive(uint256 logosId) 
        external 
        view 
        returns (bool) 
    {
        return logosAgents[logosId].isActive;
    }
    
    /**
     * @dev Get total number of LOGOS created
     */
    function totalLogosCount() 
        external 
        view 
        returns (uint256) 
    {
        return _logosIdCounter;
    }
    
    // Access control for TaskManager
    mapping(address => bool) public authorizedContracts;
    
    function setAuthorizedContract(address contractAddress, bool authorized) 
        external 
        onlyOwner 
    {
        authorizedContracts[contractAddress] = authorized;
    }
    
    modifier onlyAuthorized() {
        require(
            authorizedContracts[msg.sender] || msg.sender == owner(),
            "LogosRegistry: Not authorized"
        );
        _;
    }
}
