# 🚀 Cross-Chain Yield Vault

An AI-powered, cross-chain yield optimization vault that automatically allocates USDC deposits between Aave V3 and Compound V3 protocols across Ethereum Sepolia and Avalanche Fuji testnets.

## 🌟 Features

- **Multi-Protocol Support**: Seamlessly integrates with Aave V3 and Compound V3
- **Cross-Chain Operations**: Uses Chainlink CCIP for secure cross-chain transfers
- **AI-Powered Rebalancing**: Smart rebalancing based on yield opportunities
- **Automated Management**: Chainlink Automation for hands-free operation
- **Minimum Deposit**: 1 USDC minimum deposit (user-friendly)
- **Yield Tracking**: Real-time yield calculation and distribution
- **Emergency Controls**: Pause functionality and emergency withdrawals
- **Upgradeable Architecture**: Future-proof design

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Sepolia       │    │      Fuji       │
│                 │    │                 │
│  ┌─────────────┐│    │┌─────────────┐  │
│  │ YieldVault  ││<-->││ YieldVault  │  │
│  │             ││CCIP││             │  │
│  │ ├─ Aave V3  ││    ││ ├─ Aave V3  │  │
│  │ ├─ Compound ││    ││ ├─ Compound │  │
│  │ ├─ AI Logic ││    ││ ├─ AI Logic │  │
│  └─────────────┘│    │└─────────────┘  │
└─────────────────┘    └─────────────────┘
```

## 📋 Prerequisites

- Node.js >= 16.0.0
- Hardhat
- Testnet ETH for gas fees
- Testnet USDC for deposits
- Testnet LINK for CCIP fees

## 🛠️ Installation

```bash
# Clone the repository
git clone <repository-url>
cd smartcontract

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Configure your environment variables
# Add your private key, RPC URLs, and API keys
```

## 🔧 Configuration

### Environment Variables

```bash
# .env file
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your-key
FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### Network Addresses

The contract uses the following testnet addresses:

#### Sepolia
- **USDC**: `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`
- **aUSDC**: `0x8267cF9254734C6Eb452a7bb9AAF97B392258b21`
- **LINK**: `0x779877A7B0D9E8603169DdbD7836e478b4624789`
- **CCIP Router**: `0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59`
- **Aave Pool Provider**: `0x012bAC54348C0E635dCAc9D5FB99f06F24136C9A`
- **Compound Comet**: `0xAec1F48e02Cfb822Be958B68C7957156EB3F0b6e`

#### Fuji
- **USDC**: `0x5425890298aed601595a70AB815c96711a31Bc65`
- **LINK**: `0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846`
- **CCIP Router**: `0xF694E193200268f9a4868e4Aa017A0118C9a8177`

## 🚀 Deployment

### Deploy to Sepolia

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### Deploy to Fuji

```bash
npx hardhat run scripts/deploy.js --network fuji
```

### Cross-Chain Configuration

After deploying to both networks, configure cross-chain settings:

```javascript
// Configure allowed senders and receivers
await sepoliaVault.setAllowedSender(FUJI_CHAIN_SELECTOR, fujiVaultAddress);
await sepoliaVault.setDestinationReceiver(FUJI_CHAIN_SELECTOR, fujiVaultAddress);

await fujiVault.setAllowedSender(SEPOLIA_CHAIN_SELECTOR, sepoliaVaultAddress);
await fujiVault.setDestinationReceiver(SEPOLIA_CHAIN_SELECTOR, sepoliaVaultAddress);
```

## 💡 Usage

### User Operations

#### Deposit USDC

```javascript
// Approve USDC first
await usdc.approve(vaultAddress, amount);

// Deposit (minimum 1 USDC = 1e6 wei)
await vault.deposit(ethers.utils.parseUnits("100", 6)); // 100 USDC
```

#### Withdraw Funds

```javascript
// Withdraw specific shares
await vault.withdraw(sharesAmount);

// Withdraw all funds
await vault.withdrawAll();
```

#### Check Balances

```javascript
// Get user's total balance (including yield)
const balance = await vault.getUserBalance(userAddress);

// Get user's earned yield
const yield = await vault.getUserYield(userAddress);

// Get balance per protocol
const aaveBalance = await vault.getUserAaveBalance(userAddress);
const compoundBalance = await vault.getUserCompoundBalance(userAddress);
```

### Admin Operations

#### Protocol Rebalancing

```javascript
// Rebalance from Aave to Compound
await vault.rebalanceProtocol(2, 0); // Protocol.COMPOUND, amount=0 (all funds)

// Rebalance specific amount
await vault.rebalanceProtocol(1, ethers.utils.parseUnits("50", 6)); // 50 USDC to Aave
```

#### Cross-Chain Operations

```javascript
// Send funds to another chain
await vault.sendCrossChain(
  FUJI_CHAIN_SELECTOR,
  recipientAddress,
  ethers.utils.parseUnits("100", 6) // 100 USDC
);
```

#### AI Integration

```javascript
// Request AI rebalancing advice
await vault.requestAIRebalanceAdvice();

// Execute AI suggestion
await vault.executeAIRebalance("MOVE_TO_COMPOUND", 2); // Protocol.COMPOUND
```

## 🤖 Chainlink Integration

### Automation Setup

1. **Register Upkeep**: Visit [Chainlink Automation](https://automation.chain.link/)
2. **Fund with LINK**: Add LINK tokens to your upkeep
3. **Configure Parameters**:
   - Target Contract: Your vault address
   - Check Data: `0x` (empty)
   - Gas Limit: 500,000

### CCIP Setup

1. **Fund with LINK**: Send LINK tokens to the vault for CCIP fees
2. **Configure Gas Limits**: Set appropriate gas limits for each destination chain
3. **Test Transfers**: Start with small amounts

## 📊 Monitoring

### View Functions

```javascript
// Contract state
const currentProtocol = await vault.currentProtocol();
const totalAssets = await vault.getTotalAssets();
const totalDeposits = await vault.totalDeposits();

// Protocol balances
const aaveAssets = await vault.getTotalAaveAssets();
const compoundAssets = await vault.getTotalCompoundAssets();

// User information
const userInfo = await vault.userInfo(userAddress);
```

### Events

Monitor these events for real-time updates:

- `Deposit(user, amount, shares, protocol, timestamp)`
- `Withdraw(user, amount, shares, protocol, timestamp)`
- `ProtocolRebalance(fromProtocol, toProtocol, amount, timestamp)`
- `CrossChainTransfer(destinationChain, recipient, amount)`
- `AIRebalanceExecuted(suggestion, protocol, amount, timestamp)`

## 🔒 Security Features

### Access Control
- **Owner Only**: Protocol rebalancing, AI integration, emergency functions
- **User Only**: Deposits, withdrawals
- **Automated**: Chainlink Automation upkeep

### Emergency Controls
```javascript
// Pause the contract
await vault.pause();

// Emergency withdraw all funds
await vault.emergencyWithdrawAll();

// Withdraw specific tokens
await vault.emergencyWithdrawToken(tokenAddress, amount);
```

### Best Practices

1. **Start Small**: Test with small amounts first
2. **Monitor Gas**: Keep LINK balance sufficient for CCIP fees
3. **Regular Checks**: Monitor protocol performance and yields
4. **Backup Plans**: Always have emergency procedures ready

## 🧪 Testing

```bash
# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test test/YieldVault.test.js

# Run with gas reporting
REPORT_GAS=true npx hardhat test
```

## 📈 Yield Optimization

### Automatic Rebalancing

The vault automatically rebalances when:
- Time threshold is met (default: 1 day)
- Amount threshold is met (default: 100 USDC)
- AI suggests rebalancing
- Manual trigger by owner

### Rebalancing Logic

```javascript
// Simple rebalancing example
if (aaveAssets > compoundAssets * 2) {
  // Move funds from Aave to Compound
  rebalanceAmount = (aaveAssets - compoundAssets) / 2;
  moveToCompound(rebalanceAmount);
}
```

## 🔍 Troubleshooting

### Common Issues

1. **Insufficient LINK**: Ensure vault has enough LINK for CCIP fees
2. **Gas Limits**: Increase gas limits if cross-chain transactions fail
3. **Approvals**: Check USDC approval before deposits
4. **Network Issues**: Verify RPC endpoints are working

### Debug Commands

```bash
# Check contract state
npx hardhat console --network sepolia

# Verify deployment
npx hardhat verify --network sepolia <contract-address> <constructor-args>
```

## 📚 Additional Resources

- [Aave V3 Documentation](https://docs.aave.com/developers/)
- [Compound V3 Documentation](https://docs.compound.finance/)
- [Chainlink CCIP Documentation](https://docs.chain.link/ccip)
- [Chainlink Automation Documentation](https://docs.chain.link/automation)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This is experimental software for testnet use only. Do not use with real funds on mainnet without proper auditing and testing.

## 🆘 Support

For questions and support:
- Create an issue on GitHub
- Check the documentation
- Review the test files for examples 