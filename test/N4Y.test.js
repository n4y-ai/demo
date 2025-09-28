import { expect } from "chai";
import pkg from "hardhat";
const { ethers } = pkg;

describe("N4Y Contracts", function () {
  let qiToken, qiBank, logosRegistry, taskManager;
  let owner, user1, user2;
  
  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    // Deploy contracts
    const QIToken = await ethers.getContractFactory("QIToken");
    qiToken = await QIToken.deploy();
    await qiToken.waitForDeployment();
    
    const QiBank = await ethers.getContractFactory("QiBank");
    qiBank = await QiBank.deploy(await qiToken.getAddress());
    await qiBank.waitForDeployment();
    
    const LogosRegistry = await ethers.getContractFactory("LogosRegistry");
    logosRegistry = await LogosRegistry.deploy();
    await logosRegistry.waitForDeployment();
    
    const TaskManager = await ethers.getContractFactory("TaskManager");
    taskManager = await TaskManager.deploy(await logosRegistry.getAddress(), await qiBank.getAddress());
    await taskManager.waitForDeployment();
    
    // Configure permissions
    await qiToken.setAuthorizedSpender(await qiBank.getAddress(), true);
    await qiBank.setAuthorizedCaller(await taskManager.getAddress(), true);
    await logosRegistry.setAuthorizedContract(await taskManager.getAddress(), true);
  });
  
  describe("QI Token", function () {
    it("Should mint initial supply to owner", async function () {
      const balance = await qiToken.balanceOf(owner.address);
      expect(balance).to.equal(ethers.parseEther("1000000000"));
    });
    
    it("Should authorize spenders", async function () {
      expect(await qiToken.authorizedSpenders(await qiBank.getAddress())).to.be.true;
    });
  });
  
  describe("LOGOS Registry", function () {
    it("Should create a LOGOS agent", async function () {
      await logosRegistry.connect(user1).createLOGOS("AI Assistant", "Helpful AI agent");
      
      const logos = await logosRegistry.getLOGOS(1);
      expect(logos.owner).to.equal(user1.address);
      expect(logos.name).to.equal("AI Assistant");
      expect(logos.isActive).to.be.true;
    });
    
    it("Should track owner's LOGOS", async function () {
      await logosRegistry.connect(user1).createLOGOS("Agent 1", "First agent");
      await logosRegistry.connect(user1).createLOGOS("Agent 2", "Second agent");
      
      const userLogos = await logosRegistry.getOwnerLogos(user1.address);
      expect(userLogos.length).to.equal(2);
    });
  });
  
  describe("Task Manager", function () {
    beforeEach(async function () {
      // Transfer QI tokens to users
      await qiToken.transfer(user1.address, ethers.parseEther("10000"));
      await qiToken.transfer(user2.address, ethers.parseEther("10000"));
      
      // Create a LOGOS
      await logosRegistry.connect(user1).createLOGOS("Worker", "Task processor");
      
      // Approve QI spending
      await qiToken.connect(user1).approve(await qiBank.getAddress(), ethers.parseEther("10000"));
    });
    
    it("Should create a task", async function () {
      const bounty = ethers.parseEther("0.1");
      const qiBudget = ethers.parseEther("100");
      const deadline = Math.floor(Date.now() / 1000) + 86400; // 1 day
      
      await taskManager.connect(user1).createTask(
        "Analyze this data",
        qiBudget,
        deadline,
        { value: bounty }
      );
      
      const task = await taskManager.getTask(1);
      expect(task.creator).to.equal(user1.address);
      expect(task.bountyAmount).to.equal(bounty);
      expect(task.qiBudget).to.equal(qiBudget);
    });
    
    it("Should allocate QI budget", async function () {
      const qiBudget = ethers.parseEther("100");
      const deadline = Math.floor(Date.now() / 1000) + 86400;
      
      await taskManager.connect(user1).createTask(
        "Test task",
        qiBudget,
        deadline,
        { value: ethers.parseEther("0.1") }
      );
      
      const budget = await qiBank.getBudget(1);
      expect(budget.allocated).to.equal(qiBudget);
      expect(budget.isActive).to.be.true;
    });
  });
});
