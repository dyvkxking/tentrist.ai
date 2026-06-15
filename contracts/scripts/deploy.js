// Deployment script for Phase 1 contracts to local Hardhat network
// Run with: npx hardhat run scripts/deploy.js --network hardhat

const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy Escrow first
  console.log("\n1. Deploying Escrow...");
  const Escrow = await hre.ethers.getContractFactory("Escrow");
  const escrow = await Escrow.deploy();
  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();
  console.log("   Escrow deployed to:", escrowAddress);

  // Deploy SLAContract
  console.log("\n2. Deploying SLAContract...");
  const SLAContract = await hre.ethers.getContractFactory("SLAContract");
  const slaContract = await SLAContract.deploy();
  await slaContract.waitForDeployment();
  const slaAddress = await slaContract.getAddress();
  console.log("   SLAContract deployed to:", slaAddress);

  // Deploy SlashManager with Escrow reference
  console.log("\n3. Deploying SlashManager...");
  const SlashManager = await hre.ethers.getContractFactory("SlashManager");
  const slashManager = await SlashManager.deploy(escrowAddress);
  await slashManager.waitForDeployment();
  const slashManagerAddress = await slashManager.getAddress();
  console.log("   SlashManager deployed to:", slashManagerAddress);

  // Deploy ReputationLedger
  console.log("\n4. Deploying ReputationLedger...");
  const ReputationLedger = await hre.ethers.getContractFactory("ReputationLedger");
  const reputationLedger = await ReputationLedger.deploy();
  await reputationLedger.waitForDeployment();
  const reputationAddress = await reputationLedger.getAddress();
  console.log("   ReputationLedger deployed to:", reputationAddress);

  // Deploy NodeRegistry
  console.log("\n5. Deploying NodeRegistry...");
  const NodeRegistry = await hre.ethers.getContractFactory("NodeRegistry");
  const nodeRegistry = await NodeRegistry.deploy();
  await nodeRegistry.waitForDeployment();
  const nodeRegistryAddress = await nodeRegistry.getAddress();
  console.log("   NodeRegistry deployed to:", nodeRegistryAddress);

  // Configure SlashManager as slasher in Escrow
  console.log("\n6. Configuring Escrow with SlashManager as slasher...");
  const tx = await escrow.connect(deployer).authorizeSlasher(slashManagerAddress);
  await tx.wait();
  console.log("   SlashManager authorized as slasher");

  // Fund SlashManager for credit operations
  console.log("\n7. Funding SlashManager with initial ETH for credit operations...");
  const fundTx = await deployer.sendTransaction({
    to: slashManagerAddress,
    value: hre.ethers.parseEther("10.0")
  });
  await fundTx.wait();
  console.log("   Funded 10 ETH to SlashManager");

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("PHASE 1 CONTRACTS DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("Escrow:           ", escrowAddress);
  console.log("SLAContract:      ", slaAddress);
  console.log("SlashManager:     ", slashManagerAddress);
  console.log("ReputationLedger: ", reputationAddress);
  console.log("NodeRegistry:     ", nodeRegistryAddress);
  console.log("=".repeat(60));

  // Export deployment addresses for use in tests
  const deploymentInfo = {
    network: "hardhat",
    chainId: (await hre.ethers.provider.getNetwork()).chainId,
    timestamp: new Date().toISOString(),
    contracts: {
      Escrow: escrowAddress,
      SLAContract: slaAddress,
      SlashManager: slashManagerAddress,
      ReputationLedger: reputationAddress,
      NodeRegistry: nodeRegistryAddress
    }
  };

  console.log("\nDeployment info (JSON):");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
