import hre from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("Starting deployment...");
  
  // Get signers
  const signers = await hre.ethers.getSigners();
  const [deployer, user1, user2] = signers;
  console.log("Deploying contracts with account:", deployer.address);
  const deployerBalance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", deployerBalance.toString());
  
  // Detect network
  const isLocal = hre.network.name === 'localhost' || hre.network.config?.chainId === 31337 || hre.network.config?.chainId === 1337;
  const confirmations = isLocal ? 1 : 2; // Wait for 2 confirmations on testnet
  
  // Deploy QIToken
  console.log("\n1. Deploying QI Token...");
  const QIToken = await hre.ethers.getContractFactory("QIToken");
  const qiToken = await QIToken.deploy();
  const qiTokenDeployTx = qiToken.deploymentTransaction();
  if (qiTokenDeployTx) {
    console.log("   Transaction hash:", qiTokenDeployTx.hash);
    await qiTokenDeployTx.wait(confirmations);
  }
  await qiToken.waitForDeployment();
  const qiTokenAddress = await qiToken.getAddress();
  console.log("   ✅ QI Token deployed to:", qiTokenAddress);
  
  // Deploy QiBank
  console.log("\n2. Deploying QiBank...");
  const QiBank = await hre.ethers.getContractFactory("QiBank");
  const qiBank = await QiBank.deploy(qiTokenAddress);
  const qiBankDeployTx = qiBank.deploymentTransaction();
  if (qiBankDeployTx) {
    console.log("   Transaction hash:", qiBankDeployTx.hash);
    await qiBankDeployTx.wait(confirmations);
  }
  await qiBank.waitForDeployment();
  const qiBankAddress = await qiBank.getAddress();
  console.log("   ✅ QiBank deployed to:", qiBankAddress);
  
  // Deploy LogosRegistry
  console.log("\n3. Deploying LogosRegistry...");
  const LogosRegistry = await hre.ethers.getContractFactory("LogosRegistry");
  const logosRegistry = await LogosRegistry.deploy();
  const logosRegistryDeployTx = logosRegistry.deploymentTransaction();
  if (logosRegistryDeployTx) {
    console.log("   Transaction hash:", logosRegistryDeployTx.hash);
    await logosRegistryDeployTx.wait(confirmations);
  }
  await logosRegistry.waitForDeployment();
  const logosRegistryAddress = await logosRegistry.getAddress();
  console.log("   ✅ LogosRegistry deployed to:", logosRegistryAddress);
  
  // Deploy TaskManager
  console.log("\n4. Deploying TaskManager...");
  const TaskManager = await hre.ethers.getContractFactory("TaskManager");
  const taskManager = await TaskManager.deploy(logosRegistryAddress, qiBankAddress);
  const taskManagerDeployTx = taskManager.deploymentTransaction();
  if (taskManagerDeployTx) {
    console.log("   Transaction hash:", taskManagerDeployTx.hash);
    await taskManagerDeployTx.wait(confirmations);
  }
  await taskManager.waitForDeployment();
  const taskManagerAddress = await taskManager.getAddress();
  console.log("   ✅ TaskManager deployed to:", taskManagerAddress);
  
  // Configure permissions
  console.log("\n5. Configuring permissions...");
  
  // Authorize QiBank as QI token spender
  console.log("   Setting QiBank as authorized spender...");
  const tx1 = await qiToken.setAuthorizedSpender(qiBankAddress, true);
  console.log("   Transaction hash:", tx1.hash);
  await tx1.wait(confirmations);
  console.log("   ✅ QiBank authorized as QI token spender");
  
  // Authorize TaskManager to call QiBank
  console.log("   Setting TaskManager as authorized caller...");
  const tx2 = await qiBank.setAuthorizedCaller(taskManagerAddress, true);
  console.log("   Transaction hash:", tx2.hash);
  await tx2.wait(confirmations);
  console.log("   ✅ TaskManager authorized to call QiBank");
  
  // Authorize TaskManager to update LogosRegistry
  console.log("   Setting TaskManager as authorized contract...");
  const tx3 = await logosRegistry.setAuthorizedContract(taskManagerAddress, true);
  console.log("   Transaction hash:", tx3.hash);
  await tx3.wait(confirmations);
  console.log("   ✅ TaskManager authorized to update LogosRegistry");
  
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
  
  // Verify contracts on testnet/mainnet
  if (!isLocal && process.env.BASESCAN_API_KEY) {
    console.log("\n6. Verifying contracts on BaseScan...");
    console.log("Waiting 30 seconds for transactions to propagate...");
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    try {
      console.log("Verifying QIToken...");
      await hre.run("verify:verify", {
        address: qiTokenAddress,
        constructorArguments: [],
      });
      console.log("✅ QIToken verified");
    } catch (error) {
      console.log("⚠️ QIToken verification failed:", error.message);
    }
    
    try {
      console.log("Verifying QiBank...");
      await hre.run("verify:verify", {
        address: qiBankAddress,
        constructorArguments: [qiTokenAddress],
      });
      console.log("✅ QiBank verified");
    } catch (error) {
      console.log("⚠️ QiBank verification failed:", error.message);
    }
    
    try {
      console.log("Verifying LogosRegistry...");
      await hre.run("verify:verify", {
        address: logosRegistryAddress,
        constructorArguments: [],
      });
      console.log("✅ LogosRegistry verified");
    } catch (error) {
      console.log("⚠️ LogosRegistry verification failed:", error.message);
    }
    
    try {
      console.log("Verifying TaskManager...");
      await hre.run("verify:verify", {
        address: taskManagerAddress,
        constructorArguments: [logosRegistryAddress, qiBankAddress],
      });
      console.log("✅ TaskManager verified");
    } catch (error) {
      console.log("⚠️ TaskManager verification failed:", error.message);
    }
    
    console.log("\n🔍 View contracts on BaseScan:");
    console.log(`   QIToken: https://sepolia.basescan.org/address/${qiTokenAddress}`);
    console.log(`   QiBank: https://sepolia.basescan.org/address/${qiBankAddress}`);
    console.log(`   LogosRegistry: https://sepolia.basescan.org/address/${logosRegistryAddress}`);
    console.log(`   TaskManager: https://sepolia.basescan.org/address/${taskManagerAddress}`);
  }
  
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
    
    // Copy ABIs to frontend
    const frontAbiDir = path.join(process.cwd(), 'front-demo', 'lib', 'abis');
    if (!fs.existsSync(frontAbiDir)) {
      fs.mkdirSync(frontAbiDir, { recursive: true });
    }
    
    const abiFiles = [
      { src: 'artifacts/contracts/core/TaskManager.sol/TaskManager.json', dest: 'TaskManager.json' },
      { src: 'artifacts/contracts/core/LogosRegistry.sol/LogosRegistry.json', dest: 'LogosRegistry.json' },
      { src: 'artifacts/contracts/core/QIToken.sol/QIToken.json', dest: 'QIToken.json' },
      { src: 'artifacts/contracts/core/QiBank.sol/QiBank.json', dest: 'QiBank.json' },
    ];
    
    for (const { src, dest } of abiFiles) {
      const srcPath = path.join(process.cwd(), src);
      const destPath = path.join(frontAbiDir, dest);
      fs.copyFileSync(srcPath, destPath);
    }
    console.log(`ABIs copied to ${frontAbiDir}`);
    
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
  } else {
    // Testnet/Mainnet deployment
    console.log("\n7. Setting up testnet configuration files...");
    
    // Frontend env for testnet
    const frontEnvPath = path.join(process.cwd(), 'front-demo', '.env.local');
    const frontEnv = [
      'NEXT_PUBLIC_USE_LOCAL_NODE=false',
      `NEXT_PUBLIC_DEFAULT_NETWORK=${hre.network.name}`,
      `NEXT_PUBLIC_LOGOS_REGISTRY=${logosRegistryAddress}`,
      `NEXT_PUBLIC_TASK_MANAGER=${taskManagerAddress}`,
      `NEXT_PUBLIC_QI_TOKEN=${qiTokenAddress}`,
      `NEXT_PUBLIC_QI_BANK=${qiBankAddress}`,
      ''
    ].join('\n');
    fs.writeFileSync(frontEnvPath, frontEnv);
    console.log(`Frontend env written to ${frontEnvPath}`);
    
    // Copy ABIs to frontend
    const frontAbiDir = path.join(process.cwd(), 'front-demo', 'lib', 'abis');
    if (!fs.existsSync(frontAbiDir)) {
      fs.mkdirSync(frontAbiDir, { recursive: true });
    }
    
    const abiFiles = [
      { src: 'artifacts/contracts/core/TaskManager.sol/TaskManager.json', dest: 'TaskManager.json' },
      { src: 'artifacts/contracts/core/LogosRegistry.sol/LogosRegistry.json', dest: 'LogosRegistry.json' },
      { src: 'artifacts/contracts/core/QIToken.sol/QIToken.json', dest: 'QIToken.json' },
      { src: 'artifacts/contracts/core/QiBank.sol/QiBank.json', dest: 'QiBank.json' },
    ];
    
    for (const { src, dest } of abiFiles) {
      const srcPath = path.join(process.cwd(), src);
      const destPath = path.join(frontAbiDir, dest);
      fs.copyFileSync(srcPath, destPath);
    }
    console.log(`ABIs copied to ${frontAbiDir}`);
    
    // Backend contracts file
    const backendContractsPath = path.join(process.cwd(), 'backend-service', `contracts.${hre.network.name}.json`);
    const backendContracts = {
      network: deployment.network,
      chainId: deployment.chainId,
      rpcUrl: hre.network.config.url,
      contracts: deployment.contracts
    };
    fs.writeFileSync(backendContractsPath, JSON.stringify(backendContracts, null, 2));
    console.log(`Backend contracts info written to ${backendContractsPath}`);
    
    console.log("\n✅ Testnet deployment complete!");
    console.log("\n📝 Next steps:");
    console.log("1. Update backend-service/.env with:");
    console.log(`   NETWORK_RPC_URL=${hre.network.config.url}`);
    console.log(`   QI_TOKEN_ADDRESS=${qiTokenAddress}`);
    console.log(`   QI_BANK_ADDRESS=${qiBankAddress}`);
    console.log(`   LOGOS_REGISTRY_ADDRESS=${logosRegistryAddress}`);
    console.log(`   TASK_MANAGER_ADDRESS=${taskManagerAddress}`);
    console.log(`   PINATA_JWT=<your_pinata_jwt>`);
    console.log(`   AI_API_KEY=<your_ai_api_key>`);
    console.log("");
    console.log("2. Restart backend service");
    console.log("3. Restart frontend (gateway already configured)");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
