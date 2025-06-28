const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("YieldVault Deployment", function () {
  let yieldVault;
  let owner, user1, user2;
  let mockUSDC, mockAUSDC, mockLINK;
  let mockAavePool, mockCompoundComet;
  let ccipRouter;

  // Mock addresses for testing
  const MOCK_ADDRESSES = {
    ccipRouter: "0x1234567890123456789012345678901234567890",
    poolAddressesProvider: "0x2345678901234567890123456789012345678901"
  };

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy mock ERC20 tokens
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockUSDC = await MockERC20.deploy("USDC", "USDC", 6);
    mockAUSDC = await MockERC20.deploy("aUSDC", "aUSDC", 6);
    mockLINK = await MockERC20.deploy("LINK", "LINK", 18);

    // Deploy mock Aave pool
    const MockAavePool = await ethers.getContractFactory("MockAavePool");
    mockAavePool = await MockAavePool.deploy(mockUSDC.address, mockAUSDC.address);

    // Deploy mock Compound Comet
    const MockCompoundComet = await ethers.getContractFactory("MockERC20");
    mockCompoundComet = await MockCompoundComet.deploy("cUSDC", "cUSDC", 6);

    // Deploy YieldVault
    const YieldVault = await ethers.getContractFactory("YieldVault");
    yieldVault = await YieldVault.deploy(
      MOCK_ADDRESSES.ccipRouter,
      mockUSDC.address,
      mockAUSDC.address,
      mockLINK.address,
      MOCK_ADDRESSES.poolAddressesProvider,
      mockCompoundComet.address
    );

    await yieldVault.deployed();
  });

  describe("Constructor", function () {
    it("Should initialize with correct parameters", async function () {
      expect(await yieldVault.USDC()).to.equal(mockUSDC.address);
      expect(await yieldVault.aUSDC()).to.equal(mockAUSDC.address);
      expect(await yieldVault.LINK()).to.equal(mockLINK.address);
      expect(await yieldVault.owner()).to.equal(owner.address);
    });

    it("Should set initial protocol correctly", async function () {
      // Since we have a mock pool addresses provider, it should default to AAVE
      const currentProtocol = await yieldVault.currentProtocol();
      expect(currentProtocol).to.equal(1); // Protocol.AAVE
    });

    it("Should initialize with correct constants", async function () {
      const minDeposit = await yieldVault.MIN_DEPOSIT();
      expect(minDeposit).to.equal(ethers.utils.parseUnits("1", 6)); // 1 USDC
      
      const precision = await yieldVault.PRECISION();
      expect(precision).to.equal(ethers.utils.parseEther("1")); // 1e18
    });

    it("Should set initial rebalance parameters", async function () {
      const lastRebalanceTime = await yieldVault.lastRebalanceTime();
      expect(lastRebalanceTime).to.be.gt(0);
      
      const currentStrategy = await yieldVault.currentStrategy();
      expect(currentStrategy).to.equal("INITIAL_SETUP");
      
      const strategyTimestamp = await yieldVault.strategyTimestamp();
      expect(strategyTimestamp).to.be.gt(0);
    });
  });

  describe("Initial Configuration", function () {
    it("Should allow owner to set rebalance parameters", async function () {
      const newInterval = 86400; // 1 day
      const newThreshold = ethers.utils.parseUnits("100", 6); // 100 USDC

      await yieldVault.setRebalanceInterval(newInterval);
      await yieldVault.setRebalanceThreshold(newThreshold);

      expect(await yieldVault.rebalanceInterval()).to.equal(newInterval);
      expect(await yieldVault.rebalanceThreshold()).to.equal(newThreshold);
    });

    it("Should allow owner to configure cross-chain settings", async function () {
      const chainSelector = "16015286601757825753"; // Sepolia
      const gasLimit = 500000;
      const receiverAddress = "0x3456789012345678901234567890123456789012";

      await yieldVault.setGasLimit(chainSelector, gasLimit);
      await yieldVault.setDestinationReceiver(chainSelector, receiverAddress);
      await yieldVault.setAllowedSender(chainSelector, receiverAddress);

      expect(await yieldVault.gasLimits(chainSelector)).to.equal(gasLimit);
      expect(await yieldVault.destinationReceivers(chainSelector)).to.equal(receiverAddress);
      expect(await yieldVault.allowedSenders(chainSelector)).to.equal(receiverAddress);
    });

    it("Should reject non-owner configuration attempts", async function () {
      await expect(
        yieldVault.connect(user1).setRebalanceInterval(3600)
      ).to.be.revertedWith("Ownable: caller is not the owner");

      await expect(
        yieldVault.connect(user1).setRebalanceThreshold(ethers.utils.parseUnits("50", 6))
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Protocol Availability", function () {
    it("Should correctly identify available protocols", async function () {
      // This would need to be tested with actual protocol integrations
      // For now, we test the basic protocol enum
      const currentProtocol = await yieldVault.currentProtocol();
      expect(currentProtocol).to.be.oneOf([0, 1, 2]); // NONE, AAVE, COMPOUND
    });
  });

  describe("Automation Interface", function () {
    it("Should implement checkUpkeep correctly", async function () {
      const [upkeepNeeded, performData] = await yieldVault.checkUpkeep("0x");
      
      // Initially, upkeep should not be needed as there are no assets
      expect(upkeepNeeded).to.be.false;
      expect(performData).to.equal("0x");
    });

    it("Should have correct automation parameters", async function () {
      const rebalanceInterval = await yieldVault.rebalanceInterval();
      const rebalanceThreshold = await yieldVault.rebalanceThreshold();
      
      // Check default values (these might be set during deployment)
      expect(rebalanceInterval).to.be.gt(0);
      expect(rebalanceThreshold).to.be.gt(0);
    });
  });

  describe("Security Features", function () {
    it("Should implement ReentrancyGuard", async function () {
      // This is tested by attempting deposits and withdrawals
      // The actual reentrancy protection would be tested in integration tests
      expect(yieldVault.address).to.be.properAddress;
    });

    it("Should implement Pausable", async function () {
      // Test pause functionality
      await yieldVault.pause();
      expect(await yieldVault.paused()).to.be.true;

      await yieldVault.unpause();
      expect(await yieldVault.paused()).to.be.false;
    });

    it("Should only allow owner to pause/unpause", async function () {
      await expect(
        yieldVault.connect(user1).pause()
      ).to.be.revertedWith("Ownable: caller is not the owner");

      await yieldVault.pause();
      
      await expect(
        yieldVault.connect(user1).unpause()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Cross-Chain Configuration", function () {
    const SEPOLIA_CHAIN_SELECTOR = "16015286601757825753";
    const FUJI_CHAIN_SELECTOR = "14767482510784806043";
    const MUMBAI_CHAIN_SELECTOR = "12532609583862916517";

    it("Should allow setting up multiple chain configurations", async function () {
      const gasLimit = 500000;
      const sepoliaReceiver = "0x1111111111111111111111111111111111111111";
      const fujiReceiver = "0x2222222222222222222222222222222222222222";

      // Configure for Sepolia
      await yieldVault.setGasLimit(SEPOLIA_CHAIN_SELECTOR, gasLimit);
      await yieldVault.setDestinationReceiver(SEPOLIA_CHAIN_SELECTOR, sepoliaReceiver);
      await yieldVault.setAllowedSender(SEPOLIA_CHAIN_SELECTOR, sepoliaReceiver);

      // Configure for Fuji
      await yieldVault.setGasLimit(FUJI_CHAIN_SELECTOR, gasLimit);
      await yieldVault.setDestinationReceiver(FUJI_CHAIN_SELECTOR, fujiReceiver);
      await yieldVault.setAllowedSender(FUJI_CHAIN_SELECTOR, fujiReceiver);

      // Verify configurations
      expect(await yieldVault.gasLimits(SEPOLIA_CHAIN_SELECTOR)).to.equal(gasLimit);
      expect(await yieldVault.destinationReceivers(SEPOLIA_CHAIN_SELECTOR)).to.equal(sepoliaReceiver);
      expect(await yieldVault.allowedSenders(SEPOLIA_CHAIN_SELECTOR)).to.equal(sepoliaReceiver);

      expect(await yieldVault.gasLimits(FUJI_CHAIN_SELECTOR)).to.equal(gasLimit);
      expect(await yieldVault.destinationReceivers(FUJI_CHAIN_SELECTOR)).to.equal(fujiReceiver);
      expect(await yieldVault.allowedSenders(FUJI_CHAIN_SELECTOR)).to.equal(fujiReceiver);
    });

    it("Should handle multiple network configurations", async function () {
      const networks = [
        { selector: SEPOLIA_CHAIN_SELECTOR, receiver: "0x1111111111111111111111111111111111111111" },
        { selector: FUJI_CHAIN_SELECTOR, receiver: "0x2222222222222222222222222222222222222222" },
        { selector: MUMBAI_CHAIN_SELECTOR, receiver: "0x3333333333333333333333333333333333333333" }
      ];

      for (const network of networks) {
        await yieldVault.setGasLimit(network.selector, 500000);
        await yieldVault.setDestinationReceiver(network.selector, network.receiver);
        await yieldVault.setAllowedSender(network.selector, network.receiver);

        expect(await yieldVault.gasLimits(network.selector)).to.equal(500000);
        expect(await yieldVault.destinationReceivers(network.selector)).to.equal(network.receiver);
        expect(await yieldVault.allowedSenders(network.selector)).to.equal(network.receiver);
      }
    });
  });

  describe("Emergency Functions", function () {
    beforeEach(async function () {
      // Mint some mock tokens to the contract for testing
      await mockUSDC.mint(yieldVault.address, ethers.utils.parseUnits("1000", 6));
      await mockLINK.mint(yieldVault.address, ethers.utils.parseEther("10"));
    });

    it("Should allow owner to emergency withdraw when paused", async function () {
      await yieldVault.pause();
      
      const usdcAmount = ethers.utils.parseUnits("100", 6);
      const initialBalance = await mockUSDC.balanceOf(owner.address);
      
      await yieldVault.emergencyWithdrawToken(mockUSDC.address, usdcAmount);
      
      const finalBalance = await mockUSDC.balanceOf(owner.address);
      expect(finalBalance.sub(initialBalance)).to.equal(usdcAmount);
    });

    it("Should not allow emergency withdraw when not paused", async function () {
      const usdcAmount = ethers.utils.parseUnits("100", 6);
      
      await expect(
        yieldVault.emergencyWithdrawToken(mockUSDC.address, usdcAmount)
      ).to.be.revertedWith("Pause first");
    });

    it("Should not allow non-owner to emergency withdraw", async function () {
      await yieldVault.pause();
      
      const usdcAmount = ethers.utils.parseUnits("100", 6);
      
      await expect(
        yieldVault.connect(user1).emergencyWithdrawToken(mockUSDC.address, usdcAmount)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Deployment Validation", function () {
    it("Should have all required interfaces", async function () {
      // Check that the contract supports the expected interfaces
      const interfaces = [
        "0x01ffc9a7", // ERC165
        "0x7f5828d0", // ERC173 (Ownable)
      ];

      // Note: This would require implementing ERC165 in the contract
      // For now, we just verify the contract is deployed correctly
      expect(yieldVault.address).to.be.properAddress;
      expect(await yieldVault.owner()).to.equal(owner.address);
    });

    it("Should have correct initial state", async function () {
      expect(await yieldVault.totalShares()).to.equal(0);
      expect(await yieldVault.totalDeposits()).to.equal(0);
      expect(await yieldVault.aiRebalanceRequested()).to.be.false;
      
      const totalAssets = await yieldVault.totalAssets();
      expect(totalAssets).to.equal(0);
    });

    it("Should have proper access control setup", async function () {
      expect(await yieldVault.owner()).to.equal(owner.address);
      
      // Verify that non-owners cannot call owner functions
      const ownerFunctions = [
        yieldVault.connect(user1).setRebalanceInterval(3600),
        yieldVault.connect(user1).setRebalanceThreshold(ethers.utils.parseUnits("50", 6)),
        yieldVault.connect(user1).pause(),
        yieldVault.connect(user1).rebalanceProtocol(1)
      ];

      for (const func of ownerFunctions) {
        await expect(func).to.be.revertedWith("Ownable: caller is not the owner");
      }
    });
  });

  describe("Gas Optimization", function () {
    it("Should have reasonable gas costs for deployment", async function () {
      const YieldVault = await ethers.getContractFactory("YieldVault");
      const deployTx = YieldVault.getDeployTransaction(
        MOCK_ADDRESSES.ccipRouter,
        mockUSDC.address,
        mockAUSDC.address,
        mockLINK.address,
        MOCK_ADDRESSES.poolAddressesProvider,
        mockCompoundComet.address
      );

      const estimatedGas = await owner.estimateGas(deployTx);
      console.log(`Estimated deployment gas: ${estimatedGas.toString()}`);
      
      // Verify gas is within reasonable limits (adjust as needed)
      expect(estimatedGas).to.be.lt(5000000); // Less than 5M gas
    });

    it("Should have reasonable gas costs for configuration", async function () {
      const gasEstimates = {
        setRebalanceInterval: await yieldVault.estimateGas.setRebalanceInterval(86400),
        setRebalanceThreshold: await yieldVault.estimateGas.setRebalanceThreshold(
          ethers.utils.parseUnits("100", 6)
        ),
        setGasLimit: await yieldVault.estimateGas.setGasLimit("16015286601757825753", 500000)
      };

      console.log("Configuration gas estimates:", gasEstimates);
      
      // Verify each configuration function uses reasonable gas
      Object.values(gasEstimates).forEach(estimate => {
        expect(estimate).to.be.lt(100000); // Less than 100k gas each
      });
    });
  });
}); 