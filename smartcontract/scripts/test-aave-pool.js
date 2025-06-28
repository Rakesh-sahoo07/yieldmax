const { ethers } = require("hardhat");

async function testAavePool() {
  console.log("Testing Aave Pool Addresses Provider on Sepolia...");
  
  const addresses = {
    poolAddressesProvider: "0x012bAC54348C0E635dCAc9D5FB99f06F24136C9A"
  };
  
  try {
    // Create a contract instance for Pool Addresses Provider
    const providerABI = [
      "function getPool() external view returns (address)"
    ];
    
    const poolProvider = new ethers.Contract(
      addresses.poolAddressesProvider,
      providerABI,
      ethers.provider
    );
    
    console.log("Pool Addresses Provider:", addresses.poolAddressesProvider);
    
    const poolAddress = await poolProvider.getPool();
    console.log("Pool address from provider:", poolAddress);
    
    if (poolAddress === "0x0000000000000000000000000000000000000000") {
      console.log("❌ Pool address is zero!");
    } else {
      console.log("✅ Pool address looks valid!");
      
      // Check if the pool address has code
      const code = await ethers.provider.getCode(poolAddress);
      if (code === "0x") {
        console.log("❌ Pool address has no contract code!");
      } else {
        console.log("✅ Pool address has contract code!");
      }
    }
    
  } catch (error) {
    console.error("❌ Error checking Aave pool:", error.message);
    console.log("This might be causing the deployment to fail.");
  }
}

testAavePool().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 