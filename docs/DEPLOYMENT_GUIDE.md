# 🚀 Deployment Guide

## Prerequisites

### Software Requirements
- Node.js >= 18.0.0
- npm or yarn package manager
- Git
- Hardhat CLI
- AWS CLI (for Bedrock integration)

### Accounts & Keys Required
- Ethereum wallet with private key
- Alchemy or Infura API keys
- Etherscan API key
- Snowtrace API key (for Avalanche)
- AWS account with Bedrock access
- Testnet ETH and AVAX for gas fees
- Testnet LINK tokens for Chainlink services

## Environment Setup

### 1. Clone and Install Dependencies

```bash
# Clone repository
git clone https://github.com/your-org/ai-yield-optimizer.git
cd ai-yield-optimizer

# Install smart contract dependencies
cd smartcontract
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Configuration

#### Smart Contract Environment
```bash
cd smartcontract
cp env.example .env
```

Edit `.env` file:
```bash
# Deployment Configuration
PRIVATE_KEY=your_private_key_without_0x_prefix
DEPLOYER_ADDRESS=your_deployer_address

# RPC URLs
ETHEREUM_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
AVALANCHE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
POLYGON_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
ARBITRUM_RPC_URL=https://arbitrum-sepolia.blockpi.network/v1/rpc/public

# API Keys for Verification
ETHERSCAN_API_KEY=your_etherscan_api_key
SNOWTRACE_API_KEY=your_snowtrace_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key
ARBISCAN_API_KEY=your_arbiscan_api_key

# AWS Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1

# Chainlink Configuration
LINK_TOKEN_SEPOLIA=0x779877A7B0D9E8603169DdbD7836e478b4624789
LINK_TOKEN_FUJI=0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846
CCIP_ROUTER_SEPOLIA=0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59
CCIP_ROUTER_FUJI=0xF694E193200268f9a4868e4Aa017A0118C9a8177
```

#### Frontend Environment
```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local` file:
```bash
# Network Configuration
VITE_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
VITE_FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc

# Contract Addresses (will be filled after deployment)
VITE_VAULT_ADDRESS_SEPOLIA=
VITE_VAULT_ADDRESS_FUJI=
VITE_USDC_ADDRESS_SEPOLIA=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
VITE_USDC_ADDRESS_FUJI=0x5425890298aed601595a70AB815c96711a31Bc65

# AWS Configuration
VITE_AWS_REGION=us-east-1
VITE_AWS_ACCESS_KEY_ID=your_aws_access_key
VITE_AWS_SECRET_ACCESS_KEY=your_aws_secret_key

# Application Configuration
VITE_APP_NAME=AI Yield Optimizer
VITE_APP_VERSION=1.0.0
```

## Smart Contract Deployment

### 1. Compile Contracts

```bash
cd smartcontract
npx hardhat compile
```

### 2. Deploy to Ethereum Sepolia

```bash
# Deploy YieldVault contract
npx hardhat run scripts/deploy-yield-vault.js --network sepolia

# Verify contract on Etherscan
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS \
  "CONSTRUCTOR_ARG_1" "CONSTRUCTOR_ARG_2" "CONSTRUCTOR_ARG_3"
```

Expected output:
```
✅ YieldVault deployed to: 0x1234567890123456789012345678901234567890
✅ Transaction hash: 0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890
✅ Gas used: 2,847,293
✅ Deployment cost: 0.0854 ETH
```

### 3. Deploy to Avalanche Fuji

```bash
# Deploy YieldVault contract
npx hardhat run scripts/deploy-yield-vault.js --network fuji

# Verify contract on Snowtrace
npx hardhat verify --network fuji DEPLOYED_CONTRACT_ADDRESS \
  "CONSTRUCTOR_ARG_1" "CONSTRUCTOR_ARG_2" "CONSTRUCTOR_ARG_3"
```

### 4. Save Deployment Addresses

Create `deployments.json`:
```json
{
  "sepolia": {
    "YieldVault": "0x1234567890123456789012345678901234567890",
    "deploymentBlock": 4567890,
    "deploymentHash": "0xabcdef...",
    "gasUsed": "2847293"
  },
  "fuji": {
    "YieldVault": "0x0987654321098765432109876543210987654321",
    "deploymentBlock": 7890123,
    "deploymentHash": "0x123456...",
    "gasUsed": "2847293"
  }
}
```

## Post-Deployment Configuration

### 1. Configure Cross-Chain Settings

```bash
# Configure Sepolia vault for cross-chain
npx hardhat run scripts/configure-ccip.js --network sepolia

# Configure Fuji vault for cross-chain
npx hardhat run scripts/configure-ccip.js --network fuji
```

`scripts/configure-ccip.js`:
```javascript
const { ethers } = require("hardhat");

async function main() {
  const vaultAddress = process.env.VAULT_ADDRESS;
  const vault = await ethers.getContractAt("YieldVault", vaultAddress);
  
  if (network.name === "sepolia") {
    // Configure for Fuji communication
    const fujiChainSelector = "14767482510784806043";
    const fujiVaultAddress = process.env.FUJI_VAULT_ADDRESS;
    
    await vault.setAllowedSender(fujiChainSelector, fujiVaultAddress);
    await vault.setDestinationReceiver(fujiChainSelector, fujiVaultAddress);
    await vault.setGasLimit(fujiChainSelector, 500000);
    
    console.log("✅ Sepolia vault configured for Fuji communication");
  } else if (network.name === "fuji") {
    // Configure for Sepolia communication
    const sepoliaChainSelector = "16015286601757825753";
    const sepoliaVaultAddress = process.env.SEPOLIA_VAULT_ADDRESS;
    
    await vault.setAllowedSender(sepoliaChainSelector, sepoliaVaultAddress);
    await vault.setDestinationReceiver(sepoliaChainSelector, sepoliaVaultAddress);
    await vault.setGasLimit(sepoliaChainSelector, 500000);
    
    console.log("✅ Fuji vault configured for Sepolia communication");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

### 2. Fund Contracts with LINK

```bash
# Fund Sepolia vault with LINK
npx hardhat run scripts/fund-link.js --network sepolia

# Fund Fuji vault with LINK
npx hardhat run scripts/fund-link.js --network fuji
```

`scripts/fund-link.js`:
```javascript
async function main() {
  const [deployer] = await ethers.getSigners();
  const vaultAddress = process.env.VAULT_ADDRESS;
  
  // Get LINK token contract
  const linkAddress = network.name === "sepolia" 
    ? "0x779877A7B0D9E8603169DdbD7836e478b4624789"
    : "0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846";
    
  const link = await ethers.getContractAt("IERC20", linkAddress);
  
  // Transfer 10 LINK to vault
  const amount = ethers.utils.parseEther("10");
  await link.transfer(vaultAddress, amount);
  
  console.log(`✅ Funded ${vaultAddress} with 10 LINK on ${network.name}`);
}
```

### 3. Setup Chainlink Automation

Visit [Chainlink Automation](https://automation.chain.link/) and:

1. **Connect Wallet**: Connect the same wallet used for deployment
2. **Register New Upkeep**:
   - Target Contract: Your vault address
   - Upkeep Name: "AI Yield Optimizer Rebalancing"
   - Gas Limit: 500,000
   - Check Data: `0x` (empty)
   - Starting Balance: 5 LINK
3. **Fund Upkeep**: Add LINK tokens for automation fees

### 4. Initialize Protocol Integrations

```bash
# Initialize Aave and Compound integrations
npx hardhat run scripts/initialize-protocols.js --network sepolia
npx hardhat run scripts/initialize-protocols.js --network fuji
```

## Frontend Deployment

### 1. Update Environment Variables

Update frontend `.env.local` with deployed contract addresses:
```bash
# Contract Addresses
VITE_VAULT_ADDRESS_SEPOLIA=0x1234567890123456789012345678901234567890
VITE_VAULT_ADDRESS_FUJI=0x0987654321098765432109876543210987654321
```

### 2. Build for Production

```bash
cd frontend
npm run build
```

### 3. Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

Or use Vercel GitHub integration:
1. Connect GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Enable automatic deployments

### 4. Configure Domain (Optional)

In Vercel dashboard:
1. Go to project settings
2. Add custom domain
3. Configure DNS records

## AWS Bedrock Setup

### 1. Enable Bedrock Access

1. Log into AWS Console
2. Navigate to Amazon Bedrock
3. Request access to Claude models
4. Wait for approval (usually 24-48 hours)

### 2. Create IAM Role

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": [
        "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0"
      ]
    }
  ]
}
```

### 3. Configure AI Integration

Update smart contract with Bedrock endpoint:
```bash
npx hardhat run scripts/configure-ai.js --network sepolia
npx hardhat run scripts/configure-ai.js --network fuji
```

## Testing Deployment

### 1. Smart Contract Tests

```bash
cd smartcontract

# Test deployment
npx hardhat run scripts/test-deployment.js --network sepolia
npx hardhat run scripts/test-deployment.js --network fuji
```

### 2. Frontend Tests

```bash
cd frontend

# Test with deployed contracts
npm run test:integration
```

### 3. End-to-End Tests

```bash
# Test complete user flow
npm run test:e2e
```

## Monitoring Setup

### 1. Set Up Monitoring

Create monitoring dashboard:
```bash
# Deploy monitoring infrastructure
npx hardhat run scripts/setup-monitoring.js --network sepolia
```

### 2. Configure Alerts

Set up alerts for:
- Contract pause events
- Failed rebalancing attempts
- Low LINK balance
- Cross-chain transfer failures

### 3. Health Checks

Implement health check endpoints:
```typescript
// Health check API
app.get('/health', async (req, res) => {
  const checks = {
    contracts: await checkContractHealth(),
    chainlink: await checkChainlinkServices(),
    aws: await checkAWSServices(),
    database: await checkDatabaseHealth()
  };
  
  const isHealthy = Object.values(checks).every(check => check.status === 'healthy');
  
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    checks,
    timestamp: new Date().toISOString()
  });
});
```

## Troubleshooting

### Common Issues

#### 1. Deployment Failures

**Issue**: Out of gas during deployment
```bash
Error: Transaction reverted without a reason string
```

**Solution**: Increase gas limit in hardhat.config.js:
```javascript
networks: {
  sepolia: {
    gasLimit: 6000000,
    gasPrice: 20000000000
  }
}
```

#### 2. CCIP Configuration Issues

**Issue**: Cross-chain messages failing
```bash
Error: Sender not allowed
```

**Solution**: Verify allowed senders are configured correctly:
```bash
npx hardhat run scripts/verify-ccip-config.js --network sepolia
```

#### 3. Frontend Connection Issues

**Issue**: Cannot connect to smart contract
```bash
Error: Contract not deployed to detected network
```

**Solution**: Verify contract addresses in environment variables match deployed addresses.

### Verification Commands

```bash
# Verify contract deployment
npx hardhat verify --network sepolia VAULT_ADDRESS

# Check contract state
npx hardhat run scripts/check-contract-state.js --network sepolia

# Test CCIP connectivity
npx hardhat run scripts/test-ccip.js --network sepolia

# Verify Automation setup
npx hardhat run scripts/check-automation.js --network sepolia
```

## Maintenance

### Regular Tasks

#### Weekly
- Check LINK balances in contracts
- Monitor automation upkeep performance
- Review AI suggestion accuracy
- Update gas price configurations

#### Monthly
- Security audit of new transactions
- Performance optimization review
- Update documentation
- Backup configuration files

#### Quarterly
- Full security audit
- Dependency updates
- Infrastructure cost review
- Feature roadmap planning

### Upgrade Procedures

When deploying contract upgrades:

1. Deploy new implementation
2. Test thoroughly on testnet
3. Pause existing contracts
4. Execute upgrade
5. Verify upgrade success
6. Resume operations
7. Update frontend to use new ABI

## Security Checklist

- [ ] Private keys stored securely
- [ ] Environment variables not committed to git
- [ ] Contract verified on block explorers
- [ ] Multi-sig wallet configured for admin functions
- [ ] Emergency pause functionality tested
- [ ] CCIP message validation working
- [ ] AI input validation implemented
- [ ] Rate limiting configured
- [ ] Monitoring and alerting active
- [ ] Backup procedures documented 