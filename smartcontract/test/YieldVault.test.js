const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("YieldVault", function () {
  let yieldVault;
  let owner, user1, user2;
  let mockUsdc, mockLink, mockAavePool;

  // Mock contract for testing
  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy mock contracts
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockUsdc = await MockERC20.deploy("Mock USDC", "USDC", 18);
    mockLink = await MockERC20.deploy("Mock LINK", "LINK", 18);
    
    const MockAavePool = await ethers.getContractFactory("MockAavePool");
    mockAavePool = await MockAavePool.deploy();

    // Deploy YieldVault
    const YieldVault = await ethers.getContractFactory("YieldVault");
    yieldVault = await YieldVault.deploy(
      ethers.ZeroAddress, // Mock router
      await mockUsdc.getAddress(),
      await mockLink.getAddress(),
      await mockAavePool.getAddress()
    );

    // Mint tokens for testing
    await mockUsdc.mint(user1.address, ethers.parseEther("1000"));
    await mockUsdc.mint(user2.address, ethers.parseEther("1000"));
    await mockLink.mint(await yieldVault.getAddress(), ethers.parseEther("100"));
  });

  describe("Deployment", function () {
    it("Should set the correct token addresses", async function () {
      expect(await yieldVault.USDC()).to.equal(await mockUsdc.getAddress());
      expect(await yieldVault.LINK()).to.equal(await mockLink.getAddress());
    });

    it("Should set the owner correctly", async function () {
      expect(await yieldVault.owner()).to.equal(owner.address);
    });
  });

  describe("Deposits", function () {
    it("Should allow users to deposit USDC", async function () {
      const depositAmount = ethers.parseEther("100");
      
      // Approve vault to spend USDC
      await mockUsdc.connect(user1).approve(await yieldVault.getAddress(), depositAmount);
      
      // Deposit
      await yieldVault.connect(user1).deposit(depositAmount);
      
      // Check balance
      expect(await yieldVault.getUserBalance(user1.address)).to.equal(depositAmount);
      expect(await yieldVault.totalDeposits()).to.equal(depositAmount);
    });

    it("Should emit Deposit event", async function () {
      const depositAmount = ethers.parseEther("100");
      
      await mockUsdc.connect(user1).approve(await yieldVault.getAddress(), depositAmount);
      
      await expect(yieldVault.connect(user1).deposit(depositAmount))
        .to.emit(yieldVault, "Deposit")
        .withArgs(user1.address, depositAmount, anyValue);
    });

    it("Should reject zero deposits", async function () {
      await expect(yieldVault.connect(user1).deposit(0))
        .to.be.revertedWith("Amount must be greater than 0");
    });
  });

  describe("Withdrawals", function () {
    beforeEach(async function () {
      const depositAmount = ethers.parseEther("100");
      await mockUsdc.connect(user1).approve(await yieldVault.getAddress(), depositAmount);
      await yieldVault.connect(user1).deposit(depositAmount);
    });

    it("Should allow users to withdraw their USDC", async function () {
      const withdrawAmount = ethers.parseEther("50");
      const initialBalance = await mockUsdc.balanceOf(user1.address);
      
      await yieldVault.connect(user1).withdraw(withdrawAmount);
      
      expect(await yieldVault.getUserBalance(user1.address)).to.equal(
        ethers.parseEther("50")
      );
      expect(await mockUsdc.balanceOf(user1.address)).to.equal(
        initialBalance + withdrawAmount
      );
    });

    it("Should emit Withdraw event", async function () {
      const withdrawAmount = ethers.parseEther("50");
      
      await expect(yieldVault.connect(user1).withdraw(withdrawAmount))
        .to.emit(yieldVault, "Withdraw")
        .withArgs(user1.address, withdrawAmount, anyValue);
    });

    it("Should reject withdrawals exceeding balance", async function () {
      const withdrawAmount = ethers.parseEther("200");
      
      await expect(yieldVault.connect(user1).withdraw(withdrawAmount))
        .to.be.revertedWith("Insufficient balance");
    });
  });

  describe("Automation", function () {
    beforeEach(async function () {
      // Set up vault with sufficient deposits for rebalancing
      const depositAmount = ethers.parseEther("150");
      await mockUsdc.connect(user1).approve(await yieldVault.getAddress(), depositAmount);
      await yieldVault.connect(user1).deposit(depositAmount);
      
      // Set rebalance threshold and interval for testing
      await yieldVault.setRebalanceThreshold(ethers.parseEther("100"));
      await yieldVault.setRebalanceInterval(3600); // 1 hour
    });

    it("Should check upkeep correctly", async function () {
      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [3700]); // 1 hour + 1 minute
      await ethers.provider.send("evm_mine");
      
      const [upkeepNeeded, performData] = await yieldVault.checkUpkeep("0x");
      expect(upkeepNeeded).to.be.true;
    });

    it("Should not need upkeep before interval", async function () {
      const [upkeepNeeded, performData] = await yieldVault.checkUpkeep("0x");
      expect(upkeepNeeded).to.be.false;
    });
  });

  describe("Configuration", function () {
    it("Should allow owner to set rebalance parameters", async function () {
      const newInterval = 7200; // 2 hours
      const newThreshold = ethers.parseEther("200");
      
      await yieldVault.setRebalanceInterval(newInterval);
      await yieldVault.setRebalanceThreshold(newThreshold);
      
      expect(await yieldVault.rebalanceInterval()).to.equal(newInterval);
      expect(await yieldVault.rebalanceThreshold()).to.equal(newThreshold);
    });

    it("Should allow owner to configure cross-chain settings", async function () {
      const chainSelector = "16015286601757825753";
      const receiver = user2.address;
      const gasLimit = 200000;
      
      await yieldVault.setDestinationReceiver(chainSelector, receiver);
      await yieldVault.setAllowedSender(chainSelector, receiver);
      await yieldVault.setGasLimit(chainSelector, gasLimit);
      
      expect(await yieldVault.destinationReceivers(chainSelector)).to.equal(receiver);
      expect(await yieldVault.allowedSenders(chainSelector)).to.equal(receiver);
      expect(await yieldVault.gasLimits(chainSelector)).to.equal(gasLimit);
    });

    it("Should reject configuration changes from non-owner", async function () {
      await expect(
        yieldVault.connect(user1).setRebalanceInterval(3600)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("AI Strategy Updates", function () {
    it("Should allow owner to update strategy from AI", async function () {
      const newStrategy = "CROSS_CHAIN_REBALANCE";
      
      await yieldVault.updateStrategyFromAI(newStrategy);
      
      expect(await yieldVault.currentStrategy()).to.equal(newStrategy);
    });

    it("Should update strategy timestamp", async function () {
      const newStrategy = "MAINTAIN_POSITION";
      const beforeTimestamp = await yieldVault.strategyTimestamp();
      
      await yieldVault.updateStrategyFromAI(newStrategy);
      
      const afterTimestamp = await yieldVault.strategyTimestamp();
      expect(afterTimestamp).to.be.gt(beforeTimestamp);
    });
  });
});

// Helper for any value in events
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs"); 