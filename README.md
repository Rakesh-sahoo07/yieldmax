# 🤖 AI-Powered Onchain Yield Optimizer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-^0.8.20-blue)](https://soliditylang.org/)
[![React](https://img.shields.io/badge/React-18.x-blue)](https://reactjs.org/)
[![Chainlink](https://img.shields.io/badge/Chainlink-CCIP%20%7C%20Automation%20%7C%20Functions-red)](https://chain.link/)
[![AWS](https://img.shields.io/badge/AWS-Bedrock%20AI-orange)](https://aws.amazon.com/bedrock/)

> An intelligent, cross-chain DeFi yield optimization platform powered by Amazon Bedrock AI, Chainlink CCIP, and automated rebalancing strategies.

## 🌟 Overview

The AI-Powered Onchain Yield Optimizer is a sophisticated DeFi protocol that automatically optimizes yield generation across multiple blockchains and protocols. Using advanced AI algorithms powered by Amazon Bedrock, the platform continuously analyzes market conditions and automatically rebalances assets to maximize returns while minimizing risk.

### 🎯 Key Features

- **🤖 AI-Powered Optimization**: Amazon Bedrock integration for intelligent yield strategy recommendations
- **⚡ Cross-Chain Operations**: Seamless asset movement via Chainlink CCIP
- **🔄 Automated Rebalancing**: Chainlink Automation for hands-free portfolio management
- **🏦 Multi-Protocol Support**: Integration with Aave V3, Compound V3, and more
- **📊 Real-Time Analytics**: Live performance tracking and yield calculations
- **🔒 Enhanced Security**: Multi-layer security with pause mechanisms and emergency withdrawals
- **💱 DeFi Strategies**: Lending, borrowing, staking, and yield farming capabilities
- **📱 Modern UI/UX**: Responsive React dashboard with real-time insights

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                          │
├─────────────────────────────────────────────────────────────────┤
│  React Dashboard  │  AI Insights  │  Wallet Integration        │
└─────────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                    AI Intelligence Layer                       │
├─────────────────────────────────────────────────────────────────┤
│  Amazon Bedrock  │  Yield Engine  │  Market Predictions        │
└─────────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                   Smart Contract Layer                         │
├─────────────────────────────────────────────────────────────────┤
│  YieldVault  │  CCIP Router  │  Automation  │  Functions       │
└─────────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                      DeFi Protocols                            │
├─────────────────────────────────────────────────────────────────┤
│    Aave V3    │   Compound   │   Staking    │   Yield Farms    │
└─────────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                    Supported Networks                          │
├─────────────────────────────────────────────────────────────────┤
│  Ethereum  │  Avalanche  │  Polygon  │  Arbitrum  │  Optimism   │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Core Features

### 1. 🤖 AI-Powered Yield Optimization

Our AI engine, powered by Amazon Bedrock, continuously analyzes:

- **Market Conditions**: Real-time DeFi protocol performance
- **Yield Opportunities**: Cross-protocol and cross-chain yield comparisons
- **Risk Assessment**: Portfolio concentration and liquidity risks
- **Gas Optimization**: Cost-effective rebalancing strategies
- **Predictive Analytics**: Future yield projections and market trends

#### AI Capabilities:
```typescript
interface AIInsight {
  type: 'rebalance' | 'opportunity' | 'warning' | 'optimization';
  title: string;
  description: string;
  action: string;
  impact: string;
  confidence: number; // 0-100%
  priority: 'high' | 'medium' | 'low';
}
```

### 2. ⚡ Cross-Chain Asset Management

Powered by Chainlink CCIP for secure cross-chain operations:

- **Multi-Chain Support**: Ethereum, Avalanche, Polygon, Arbitrum
- **Automated Bridging**: AI-driven cross-chain yield farming
- **Gas Optimization**: Intelligent routing for cost efficiency
- **Security**: Cryptographic proof verification

#### Supported Networks:
| Network | Chain ID | CCIP Selector | Status |
|---------|----------|---------------|--------|
| Ethereum Sepolia | 11155111 | 16015286601757825753 | ✅ Active |
| Avalanche Fuji | 43113 | 14767482510784806043 | ✅ Active |
| Polygon Mumbai | 80001 | 12532609583862916517 | 🔄 Coming Soon |
| Arbitrum Sepolia | 421614 | 3478487238524512106 | 🔄 Coming Soon |

### 3. 🔄 Automated Strategy Execution

Chainlink Automation ensures 24/7 portfolio optimization:

- **Rebalancing Triggers**: Time-based and performance-based
- **AI Integration**: Automated execution of AI recommendations
- **Gas Efficiency**: Batched operations to minimize costs
- **Emergency Safeguards**: Automatic position protection

### 4. 🏦 Multi-Protocol Integration

#### Lending & Borrowing
- **Aave V3**: Variable and stable rate lending
- **Compound V3**: Optimized lending markets
- **Risk Management**: Automated health factor monitoring

#### Staking & Yield Farming
- **Native Staking**: Ethereum 2.0, Avalanche validators
- **Liquid Staking**: stETH, rETH, avaxETH protocols
- **LP Farming**: Uniswap V3, Curve, Balancer strategies

#### Protocol Integration:
```solidity
enum Protocol { 
    NONE, 
    AAVE, 
    COMPOUND, 
    LIDO_STAKING, 
    ROCKET_POOL, 
    UNISWAP_V3, 
    CURVE, 
    BALANCER 
}
```

## 💻 Technical Architecture

### Smart Contract Components

#### YieldVault.sol
The core vault contract implementing:
```solidity
contract YieldVault is 
    CCIPReceiver, 
    AutomationCompatibleInterface, 
    Ownable, 
    ReentrancyGuard, 
    Pausable {
    
    // Core vault functionality
    function deposit(uint256 amount) external;
    function withdraw(uint256 shares) external;
    
    // AI-powered rebalancing
    function requestAIRebalanceAdvice() external;
    function executeAIRebalance(string memory suggestion, Protocol newProtocol) external;
    
    // Cross-chain operations
    function sendCrossChain(uint64 dstChain, address recipient, uint256 amount) external;
    
    // Automation integration
    function checkUpkeep(bytes calldata checkData) external view returns (bool, bytes memory);
    function performUpkeep(bytes calldata performData) external;
}
```

#### Security Features
- **ReentrancyGuard**: Prevents reentrancy attacks
- **Pausable**: Emergency pause functionality
- **Access Control**: Role-based permissions
- **Multi-sig Support**: For critical operations

### Frontend Architecture

#### React Components
```
├── Dashboard.tsx           // Main dashboard container
├── OverviewTab.tsx        // Portfolio overview
├── DepositWithdrawTab.tsx // Deposit/withdraw interface
├── AIInsights.tsx         // AI-powered insights
├── TransactionHistory.tsx // Transaction tracking
└── DashboardSidebar.tsx   // Navigation sidebar

// Context Providers
├── AIContext.tsx          // AI insights state management
├── WalletContext.tsx      // Wallet connection
└── ContractContext.tsx    // Smart contract interactions
```

#### AI Integration
```typescript
interface AIContextType {
  insights: AIInsight[];
  isLoadingInsights: boolean;
  refreshInsights: () => Promise<void>;
  generateBedrockInsights: (portfolioData: PortfolioData) => Promise<AIInsight[]>;
}
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js >= 18.0.0
- npm or yarn package manager
- Git
- MetaMask or compatible wallet

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/ai-yield-optimizer.git
cd ai-yield-optimizer
```

### 2. Smart Contract Setup
```bash
cd smartcontract
npm install

# Copy environment template
cp env.example .env

# Configure environment variables
nano .env
```

#### Environment Configuration
```bash
# Private key for deployment
PRIVATE_KEY=your_private_key_here

# RPC URLs
ETHEREUM_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your-key
AVALANCHE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc

# API Keys
ETHERSCAN_API_KEY=your_etherscan_api_key
SNOWTRACE_API_KEY=your_snowtrace_api_key

# AWS Configuration for AI
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Start development server
npm run dev
```

## 🚀 Deployment Guide

### Smart Contract Deployment

#### Deploy to Ethereum Sepolia
```bash
cd smartcontract
npx hardhat run scripts/deploy-yield-vault.js --network sepolia
```

#### Deploy to Avalanche Fuji
```bash
npx hardhat run scripts/deploy-yield-vault.js --network fuji
```

#### Post-Deployment Configuration
```bash
# Configure cross-chain settings
npx hardhat run scripts/configure-ccip.js --network sepolia
npx hardhat run scripts/configure-ccip.js --network fuji

# Setup Chainlink Automation
npx hardhat run scripts/setup-automation.js --network sepolia
```

### Frontend Deployment

#### Build for Production
```bash
cd frontend
npm run build
```

#### Deploy to Vercel
```bash
vercel --prod
```

## 📈 Usage Guide

### For Users

#### 1. Connect Wallet
```typescript
// Connect MetaMask or compatible wallet
const connectWallet = async () => {
  if (window.ethereum) {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  }
};
```

#### 2. Deposit Assets
```typescript
// Minimum deposit: 1 USDC
const deposit = async (amount: string) => {
  // Approve USDC spending
  await usdcContract.approve(vaultAddress, parseUnits(amount, 6));
  
  // Deposit to vault
  await vaultContract.deposit(parseUnits(amount, 6));
};
```

#### 3. Monitor AI Insights
The dashboard automatically displays AI-generated insights:
- **Rebalancing Opportunities**: When to move funds between protocols
- **Yield Optimization**: Strategies to increase returns
- **Risk Warnings**: Portfolio concentration alerts
- **Cross-Chain Opportunities**: Better yields on other networks

#### 4. Withdraw Funds
```typescript
const withdraw = async (shares: string) => {
  await vaultContract.withdraw(parseUnits(shares, 18));
};

// Withdraw all funds
const withdrawAll = async () => {
  const userShares = await vaultContract.userInfo(userAddress);
  await vaultContract.withdraw(userShares.shares);
};
```

## 🔧 API Reference

### Smart Contract Functions

#### Core Vault Operations
```solidity
// User functions
function deposit(uint256 amount) external nonReentrant whenNotPaused;
function withdraw(uint256 shares) external nonReentrant whenNotPaused;
function getUserBalance(address user) external view returns (uint256);
function getUserYield(address user) external view returns (uint256);

// Admin functions
function rebalanceProtocol(Protocol newProtocol) external onlyOwner;
function requestAIRebalanceAdvice() external;
function executeAIRebalance(string memory suggestion, Protocol newProtocol) external;

// Cross-chain functions
function sendCrossChain(uint64 dstChain, address recipient, uint256 amount) external;
function _ccipReceive(Client.Any2EVMMessage memory message) internal override;
```

#### AI Integration Functions
```solidity
// AI-powered decision making
function setAISuggestion(string memory suggestion) external;
function getMarketConditions() external view returns (string memory);
function calculateOptimalAllocation() external view returns (uint256[] memory);
```

### Frontend API

#### Wallet Integration
```typescript
interface WalletContextType {
  account: string | null;
  chainId: number | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
}
```

#### Contract Interaction
```typescript
interface ContractContextType {
  vaultContract: Contract | null;
  usdcContract: Contract | null;
  deposit: (amount: string) => Promise<TransactionResponse>;
  withdraw: (shares: string) => Promise<TransactionResponse>;
  getBalance: () => Promise<string>;
  getYield: () => Promise<string>;
}
```

## 🧪 Testing

### Smart Contract Tests
```bash
cd smartcontract

# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test test/YieldVault.test.js

# Run with gas reporting
REPORT_GAS=true npx hardhat test

# Run coverage
npx hardhat coverage
```

### Frontend Tests
```bash
cd frontend

# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e
```

## 🔒 Security Considerations

### Smart Contract Security
- **Audited Code**: Third-party security audits completed
- **Access Controls**: Multi-level permission system
- **Emergency Mechanisms**: Pause and emergency withdrawal functions
- **Reentrancy Protection**: SafeERC20 and ReentrancyGuard usage
- **Oracle Security**: Chainlink price feeds for accurate valuations

### AI Security
- **Data Privacy**: No personal data stored in AI models
- **Validation**: All AI suggestions require manual validation
- **Fallback Mechanisms**: Manual override capabilities
- **Rate Limiting**: Protection against AI manipulation attempts

## 🛣️ Roadmap

### Phase 1: Core Features ✅
- [x] Multi-protocol yield optimization
- [x] Cross-chain CCIP integration
- [x] Basic AI insights
- [x] Automated rebalancing

### Phase 2: Enhanced AI 🔄
- [ ] Advanced ML models for yield prediction
- [ ] Sentiment analysis integration
- [ ] Dynamic risk assessment
- [ ] Gas optimization algorithms

### Phase 3: Expanded DeFi 📋
- [ ] Additional protocol integrations
- [ ] Options and derivatives strategies
- [ ] NFT-based yield strategies
- [ ] DAO governance integration

### Phase 4: Advanced Features 🔮
- [ ] Mobile application
- [ ] Institutional features
- [ ] API for third-party integration
- [ ] Layer 2 scaling solutions

## 🤝 Contributing

We welcome contributions from the community! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Chainlink**: For CCIP, Automation, and Functions infrastructure
- **Amazon Web Services**: For Bedrock AI capabilities
- **OpenZeppelin**: For secure smart contract libraries
- **Aave**: For lending protocol integration
- **Compound**: For money market protocols

## 📞 Support

- **Documentation**: [docs.ai-yield-optimizer.com](https://docs.ai-yield-optimizer.com)
- **Email**: gandhuisflying@gmail.com

---

*Built with ❤️ by the AI Yield Optimizer team* 