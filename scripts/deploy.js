import hre from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("Starting deployment...");
  
  // Get signers
  const signers = await hre.ethers.getSigners();
  const [deployer, user1, user2] = signers;
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());
  
  // Deploy QIToken
  console.log("\n1. Deploying QI Token...");
  const QIToken = await hre.ethers.getContractFactory("QIToken");
  const qiToken = await QIToken.deploy();
  await qiToken.waitForDeployment();
  const qiTokenAddress = await qiToken.getAddress();
  console.log("QI Token deployed to:", qiTokenAddress);
  
  // Deploy QiBank
  console.log("\n2. Deploying QiBank...");
  const QiBank = await hre.ethers.getContractFactory("QiBank");
  const qiBank = await QiBank.deploy(qiTokenAddress);
  await qiBank.waitForDeployment();
  const qiBankAddress = await qiBank.getAddress();
  console.log("QiBank deployed to:", qiBankAddress);
  
  // Deploy LogosRegistry
  console.log("\n3. Deploying LogosRegistry...");
  const LogosRegistry = await hre.ethers.getContractFactory("LogosRegistry");
  const logosRegistry = await LogosRegistry.deploy();
  await logosRegistry.waitForDeployment();
  const logosRegistryAddress = await logosRegistry.getAddress();
  console.log("LogosRegistry deployed to:", logosRegistryAddress);
  
  // Deploy TaskManager
  console.log("\n4. Deploying TaskManager...");
  const TaskManager = await hre.ethers.getContractFactory("TaskManager");
  const taskManager = await TaskManager.deploy(logosRegistryAddress, qiBankAddress);
  await taskManager.waitForDeployment();
  const taskManagerAddress = await taskManager.getAddress();
  console.log("TaskManager deployed to:", taskManagerAddress);
  
  // Configure permissions
  console.log("\n5. Configuring permissions...");
  
  // Authorize QiBank as QI token spender
  await qiToken.setAuthorizedSpender(qiBankAddress, true);
  console.log("- QiBank authorized as QI token spender");
  
  // Authorize TaskManager to call QiBank
  await qiBank.setAuthorizedCaller(taskManagerAddress, true);
  console.log("- TaskManager authorized to call QiBank");
  
  // Authorize TaskManager to update LogosRegistry
  await logosRegistry.setAuthorizedContract(taskManagerAddress, true);
  console.log("- TaskManager authorized to update LogosRegistry");
  
  // Detect local network
  const isLocal = hre.network.name === 'localhost' || hre.network.config?.chainId === 31337 || hre.network.config?.chainId === 1337;
  
  // If running on local network, fund a couple of accounts with QI
  if (isLocal) {
    console.log("\n6. Funding local accounts with QI...");
    const decimals = BigInt(10) ** BigInt(18);
    const amount = BigInt(1_000_000) * decimals; // 1,000,000 QI
    if (user1) {
      await (await qiToken.transfer(await user1.getAddress(), amount)).wait();
      console.log(`- Transferred 1,000,000 QI to ${await user1.getAddress()}`);
    }
    if (user2) {
      await (await qiToken.transfer(await user2.getAddress(), amount)).wait();
      console.log(`- Transferred 1,000,000 QI to ${await user2.getAddress()}`);
    }
  }
  
  // Save deployment addresses
  const deployment = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    contracts: {
      QIToken: qiTokenAddress,
      QiBank: qiBankAddress,
      LogosRegistry: logosRegistryAddress,
      TaskManager: taskManagerAddress
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };
  
  console.log("\n========== DEPLOYMENT SUMMARY ==========");
  console.log(JSON.stringify(deployment, null, 2));
  console.log("=======================================\n");
  
  // Save to file
  const deploymentFile = `./deployments/${hre.network.name}-deployment.json`;
  
  // Create deployments directory if it doesn't exist
  if (!fs.existsSync("./deployments")) {
    fs.mkdirSync("./deployments");
  }
  
  fs.writeFileSync(deploymentFile, JSON.stringify(deployment, null, 2));
  console.log(`Deployment saved to ${deploymentFile}`);
  
  if (isLocal) {
    console.log("\n7. Writing local development config files...");
    
    // Collect a few local accounts (address + private key if available)
    const localAccounts = [];
    for (let i = 0; i < Math.min(signers.length, 5); i++) {
      const s = signers[i];
      const addr = await s.getAddress();
      const pk = s.privateKey || undefined;
      localAccounts.push({ index: i, address: addr, privateKey: pk });
    }
    
    // Save accounts for reference (localhost only)
    const accountsFile = `./deployments/${hre.network.name}-accounts.json`;
    fs.writeFileSync(accountsFile, JSON.stringify({ network: hre.network.name, accounts: localAccounts }, null, 2));
    console.log(`Accounts info saved to ${accountsFile}`);
    
    // Prepare frontend .env.local with contract addresses
    const frontEnvPath = path.join(process.cwd(), 'front-demo', '.env.local');
    const frontEnv = [
      'NEXT_PUBLIC_USE_LOCAL_NODE=true',
      'NEXT_PUBLIC_DEFAULT_NETWORK=hardhat',
      `NEXT_PUBLIC_LOGOS_REGISTRY=${logosRegistryAddress}`,
      `NEXT_PUBLIC_TASK_MANAGER=${taskManagerAddress}`,
      `NEXT_PUBLIC_QI_TOKEN=${qiTokenAddress}`,
      `NEXT_PUBLIC_QI_BANK=${qiBankAddress}`,
      ''
    ].join('\n');
    fs.writeFileSync(frontEnvPath, frontEnv);
    console.log(`Frontend env written to ${frontEnvPath}`);
    
    // Backend contracts info file for reference/integration
    const backendContractsPath = path.join(process.cwd(), 'backend-service', 'contracts.local.json');
    const backendContracts = {
      network: deployment.network,
      chainId: deployment.chainId,
      deployer: deployment.deployer,
      contracts: deployment.contracts,
      accounts: localAccounts.map(a => ({ index: a.index, address: a.address, privateKey: a.privateKey }))
    };
    fs.writeFileSync(backendContractsPath, JSON.stringify(backendContracts, null, 2));
    console.log(`Backend contracts info written to ${backendContractsPath}`);
    
    // Create backend .env if missing to point to local node and use deployer key
    const backendEnvPath = path.join(process.cwd(), 'backend-service', '.env');
    if (!fs.existsSync(backendEnvPath)) {
      const deployerPk = localAccounts[0]?.privateKey || '';
      const backendEnv = [
        '# Auto-generated for local development',
        'NETWORK_RPC_URL=http://127.0.0.1:8545',
        deployerPk ? `PRIVATE_KEY=${deployerPk}` : '# PRIVATE_KEY=<fill 0x-prefixed local private key>' ,
        '# PINATA_JWT=<your_pinata_v3_jwt>',
        '# DEEPSEEK_API_KEY=<optional>',
        ''
      ].join('\n');
      fs.writeFileSync(backendEnvPath, backendEnv);
      console.log(`Backend env created at ${backendEnvPath}`);
    } else {
      console.log('Backend .env already exists, not overwriting.');
    }
    
    console.log("\n✅ Local setup complete. You can now run backend and frontend against localhost.");
    console.log("   Backend RPC: http://127.0.0.1:8545 (set NETWORK_RPC_URL)");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
