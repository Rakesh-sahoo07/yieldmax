const { ethers } = require("hardhat");
const hre = require("hardhat");

const NETWORK_CONFIG = {
  sepolia: {
    name: "Ethereum Sepolia",
    chainId: 11155111,
    ccipRouter: "0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59",
    usdc: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    aUsdc: "0x8267cF9254734C6Eb452a7bb9AAF97B392258b21",
    link: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
    poolAddressesProvider: "0x012bAC54348C0E635dCAc9D5FB99f06F24136C9A",
    compoundComet: "0xAec1F48e02Cfb822Be958B68C7957156EB3F0b6e",
    chainSelector: "16015286601757825753",
    explorer: "https://sepolia.etherscan.io",
    gasPrice: 30000000000,
    gasLimit: 8000000,
    blockConfirmations: 3
  },
  fuji: {
    name: "Avalanche Fuji",
    chainId: 43113,
    ccipRouter: "0xF694E193200268f9a4868e4Aa017A0118C9a8177",
    usdc: "0x5425890298aed601595a70AB815c96711a31Bc65",
    aUsdc: "0x625E7708f30cA75bfd92586e17077590C60eb4cD",
    link: "0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846",
    // Disable Aave on Fuji
    poolAddressesProvider: "0x0000000000000000000000000000000000000000",
    compoundComet: "0xF09F0369aB0a875254fB565E52226c88f10A47e7",
    chainSelector: "14767482510784806043",
    explorer: "https://testnet.snowtrace.io",
    gasPrice: 25000000000,
    gasLimit: 8000000,
    blockConfirmations: 3
  }
};

async function main() {
  const networkName = hre.network.name;
  console.log(`Deploying to ${NETWORK_CONFIG[networkName].name}...`);
  
  const config = NETWORK_CONFIG[networkName];
  const [deployer] = await ethers.getSigners();
  console.log(`Deployer address: ${deployer.address}`);
  
  // Special case for Fuji - use different USDC
  if (networkName === 'fuji') {
    console.log("Using Fuji-specific USDC address for Compound");
  }

  console.log("Deployment parameters:");
  console.log("CCIP Router:", config.ccipRouter);
  console.log("USDC:", config.usdc);
  console.log("aUSDC:", config.aUsdc);
  console.log("LINK:", config.link);
  console.log("Pool Addresses Provider:", config.poolAddressesProvider);
  console.log("Compound Comet:", config.compoundComet);
  
  const YieldVault = await ethers.getContractFactory("YieldVault");
  console.log("Deploying YieldVault...");
  
  try {
    const yieldVault = await YieldVault.deploy(
      config.ccipRouter,
      config.usdc,
      config.aUsdc,
      config.link,
      config.poolAddressesProvider,
      config.compoundComet
    );
    
    console.log("Deployment transaction sent, waiting for confirmation...");
    await yieldVault.waitForDeployment();
    const address = await yieldVault.getAddress();
    
    console.log(`YieldVault deployed to: ${address}`);
    console.log(`Explorer: ${config.explorer}/address/${address}`);
    
    // Initial setup after deployment
    console.log("Performing post-deployment setup...");
    const contract = await ethers.getContractAt("YieldVault", address);
    
    // Approve tokens after deployment
    console.log("Approving tokens...");
    try {
      const approveTx = await contract.manualApproveTokens();
      await approveTx.wait();
      console.log("✅ Token approvals completed!");
    } catch (error) {
      console.log("❌ Token approval failed:", error.message);
    }
    
    console.log("✅ Deployment and setup completed successfully!");
    
  } catch (error) {
    console.error("Deployment failed:");
    console.error(error);
    throw error;
  }
  
  // Set cross-chain configurations
  if (networkName === 'sepolia') {
    await contract.setAllowedSender(
      NETWORK_CONFIG.fuji.chainSelector,
      address // Allow Fuji contract to send to this contract
    );
    await contract.setDestinationReceiver(
      NETWORK_CONFIG.fuji.chainSelector,
      address // Send to Fuji contract
    );
    await contract.setGasLimit(NETWORK_CONFIG.fuji.chainSelector, 200_000);
  }
  
  if (networkName === 'fuji') {
    await contract.setAllowedSender(
      NETWORK_CONFIG.sepolia.chainSelector,
      address // Allow Sepolia contract to send to this contract
    );
    await contract.setDestinationReceiver(
      NETWORK_CONFIG.sepolia.chainSelector,
      address // Send to Sepolia contract
    );
    await contract.setGasLimit(NETWORK_CONFIG.sepolia.chainSelector, 200_000);
  }
  
  console.log("Cross-chain configuration set!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});