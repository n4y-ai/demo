// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title QIToken
 * @dev Utility token for AI inference costs in the N4Y ecosystem
 */
contract QIToken is ERC20, Ownable {
    uint256 public constant INITIAL_SUPPLY = 1_000_000_000 * 10**18; // 1B QI
    
    mapping(address => bool) public authorizedSpenders;
    
    event SpenderAuthorized(address indexed spender, bool authorized);
    event TokensSpent(address indexed from, address indexed spender, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);
    
    constructor() ERC20("QI Token", "QI") Ownable(msg.sender) {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
    
    /**
     * @dev Mint new tokens (only owner)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    /**
     * @dev Authorize or revoke spender (QiBank, TaskManager)
     */
    function setAuthorizedSpender(address spender, bool authorized) external onlyOwner {
        authorizedSpenders[spender] = authorized;
        emit SpenderAuthorized(spender, authorized);
    }
    
    /**
     * @dev Spend tokens on behalf of a user (only authorized contracts)
     */
    function spend(address from, uint256 amount) external onlyAuthorized {
        _transfer(from, address(this), amount);
        emit TokensSpent(from, msg.sender, amount);
    }
    
    /**
     * @dev Burn tokens from the contract balance
     */
    function burn(uint256 amount) external onlyAuthorized {
        _burn(address(this), amount);
        emit TokensBurned(msg.sender, amount);
    }
    
    modifier onlyAuthorized() {
        require(authorizedSpenders[msg.sender], "QIToken: Not authorized spender");
        _;
    }
}
