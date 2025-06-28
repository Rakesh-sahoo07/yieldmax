# 📚 API Documentation

## Smart Contract API

### YieldVault Contract

#### Core Functions

##### `deposit(uint256 amount)`
Deposits USDC into the vault and mints shares to the user.

**Parameters:**
- `amount`: Amount of USDC to deposit (minimum 1e6 = 1 USDC)

**Events Emitted:**
- `Deposit(address indexed user, uint256 amount, uint256 shares)`

**Example:**
```solidity
// Approve USDC first
IERC20(USDC_ADDRESS).approve(VAULT_ADDRESS, 100e6);
// Deposit 100 USDC
vault.deposit(100e6);
```

##### `withdraw(uint256 shares)`
Burns user shares and returns proportional USDC amount.

**Parameters:**
- `shares`: Number of vault shares to burn

**Events Emitted:**
- `Withdraw(address indexed user, uint256 amount, uint256 shares)`

**Example:**
```solidity
// Withdraw 50% of user's shares
uint256 userShares = vault.userInfo(msg.sender).shares;
vault.withdraw(userShares / 2);
```

##### `withdrawAll()`
Convenience function to withdraw all user funds.

**Events Emitted:**
- `Withdraw(address indexed user, uint256 amount, uint256 shares)`

#### Protocol Management (Admin Only)

##### `depositToProtocol(uint256 amount, Protocol protocol)`
Moves funds from vault to specified DeFi protocol.

**Parameters:**
- `amount`: Amount to deposit
- `protocol`: Target protocol (0=NONE, 1=AAVE, 2=COMPOUND)

**Events Emitted:**
- `ProtocolDeposit(Protocol protocol, uint256 amount)`

##### `withdrawFromProtocol(uint256 amount, Protocol protocol)`
Withdraws funds from specified protocol back to vault.

**Parameters:**
- `amount`: Amount to withdraw
- `protocol`: Source protocol

**Events Emitted:**
- `ProtocolWithdraw(Protocol protocol, uint256 amount)`

##### `rebalanceProtocol(Protocol newProtocol)`
Moves all funds from current protocol to new protocol.

**Parameters:**
- `newProtocol`: Target protocol for rebalancing

**Events Emitted:**
- `ProtocolRebalance(Protocol from, Protocol to, uint256 amount)`

#### AI Integration

##### `requestAIRebalanceAdvice()`
Triggers AI analysis of current market conditions and portfolio.

**Events Emitted:**
- `AIRebalanceRequest(string currentStrategy, uint256 aaveBalance, uint256 compoundBalance)`

##### `executeAIRebalance(string memory suggestion, Protocol newProtocol)`
Executes AI-recommended rebalancing strategy.

**Parameters:**
- `suggestion`: AI recommendation string
- `newProtocol`: Target protocol from AI analysis

**Events Emitted:**
- `AIRebalanceExecuted(string suggestion, Protocol newProtocol, uint256 amount)`

#### Cross-Chain Operations

##### `sendCrossChain(uint64 dstChain, address recipient, uint256 amount)`
Sends funds to another blockchain via Chainlink CCIP.

**Parameters:**
- `dstChain`: Destination chain selector
- `recipient`: Recipient address on destination chain
- `amount`: Amount to send

**Events Emitted:**
- `CrossChainTransfer(uint64 indexed dstChain, bytes32 messageId, address indexed recipient, uint256 amount)`

**Chain Selectors:**
- Ethereum Sepolia: `16015286601757825753`
- Avalanche Fuji: `14767482510784806043`

#### Chainlink Automation

##### `checkUpkeep(bytes calldata checkData)`
Chainlink Automation calls this to check if rebalancing is needed.

**Returns:**
- `upkeepNeeded`: Boolean indicating if performUpkeep should be called
- `performData`: Encoded data for performUpkeep

##### `performUpkeep(bytes calldata performData)`
Executes automated rebalancing when conditions are met.

**Parameters:**
- `performData`: Encoded rebalancing parameters

#### View Functions

##### `getUserBalance(address user)`
Returns user's total balance including yield.

**Returns:**
- `uint256`: Total user balance in USDC

##### `getUserYield(address user)`
Returns user's earned yield since last deposit.

**Returns:**
- `uint256`: Yield amount in USDC

##### `getUserAaveBalance(address user)`
Returns user's balance allocated to Aave protocol.

**Returns:**
- `uint256`: Aave allocation in USDC

##### `getUserCompoundBalance(address user)`
Returns user's balance allocated to Compound protocol.

**Returns:**
- `uint256`: Compound allocation in USDC

##### `totalAssets()`
Returns total assets under management.

**Returns:**
- `uint256`: Total AUM in USDC

##### `getAaveBalance()`
Returns total vault balance in Aave.

**Returns:**
- `uint256`: Aave balance in USDC

##### `getCompoundBalance()`
Returns total vault balance in Compound.

**Returns:**
- `uint256`: Compound balance in USDC

#### Configuration Functions (Admin Only)

##### `setAllowedSender(uint64 chainSelector, address sender)`
Configures allowed cross-chain message senders.

##### `setDestinationReceiver(uint64 chainSelector, address receiver)`
Sets destination receiver addresses for cross-chain operations.

##### `setGasLimit(uint64 chainSelector, uint256 gasLimit)`
Configures gas limits for cross-chain destinations.

##### `setRebalanceInterval(uint256 interval)`
Sets minimum time between automated rebalances.

##### `setRebalanceThreshold(uint256 threshold)`
Sets minimum amount threshold for triggering rebalance.

## Frontend API

### Wallet Context

```typescript
interface WalletContextType {
  // State
  account: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  
  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
}
```

#### Usage Example:
```typescript
import { useWallet } from '@/contexts/WalletContext';

const Component = () => {
  const { account, isConnected, connect, switchNetwork } = useWallet();
  
  const handleConnect = async () => {
    if (!isConnected) {
      await connect();
    }
  };
  
  const handleSwitchToSepolia = async () => {
    await switchNetwork(11155111);
  };
};
```

### Contract Context

```typescript
interface ContractContextType {
  // Contracts
  vaultContract: Contract | null;
  usdcContract: Contract | null;
  
  // Vault Operations
  deposit: (amount: string) => Promise<TransactionResponse>;
  withdraw: (shares: string) => Promise<TransactionResponse>;
  withdrawAll: () => Promise<TransactionResponse>;
  
  // Balance Queries
  getBalance: () => Promise<string>;
  getShares: () => Promise<string>;
  getYield: () => Promise<string>;
  getTotalAssets: () => Promise<string>;
  
  // Protocol Balances
  getAaveBalance: () => Promise<string>;
  getCompoundBalance: () => Promise<string>;
  
  // Admin Functions
  rebalanceProtocol: (protocol: number) => Promise<TransactionResponse>;
  requestAIAdvice: () => Promise<TransactionResponse>;
  executeAIRebalance: (suggestion: string, protocol: number) => Promise<TransactionResponse>;
  
  // Cross-chain
  sendCrossChain: (chainSelector: string, recipient: string, amount: string) => Promise<TransactionResponse>;
}
```

#### Usage Example:
```typescript
import { useContract } from '@/contexts/ContractContext';

const DepositComponent = () => {
  const { deposit, getBalance, usdcContract } = useContract();
  const [amount, setAmount] = useState('');
  
  const handleDeposit = async () => {
    // First approve USDC
    const tx1 = await usdcContract.approve(VAULT_ADDRESS, parseUnits(amount, 6));
    await tx1.wait();
    
    // Then deposit
    const tx2 = await deposit(amount);
    await tx2.wait();
    
    // Update balance
    const newBalance = await getBalance();
    console.log('New balance:', newBalance);
  };
};
```

### AI Context

```typescript
interface AIContextType {
  // State
  insights: AIInsight[];
  isLoadingInsights: boolean;
  isAIEnabled: boolean;
  
  // Actions
  refreshInsights: () => Promise<void>;
  generateBedrockInsights: (portfolioData: PortfolioData) => Promise<AIInsight[]>;
}

interface AIInsight {
  id: string;
  type: 'rebalance' | 'opportunity' | 'warning' | 'optimization';
  title: string;
  description: string;
  action: string;
  impact: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
  timestamp: number;
}

interface PortfolioData {
  totalBalance: number;
  allocations: {
    protocol: string;
    amount: number;
    percentage: number;
    apy: number;
  }[];
  userAddress: string;
  chainId: number;
}
```

#### Usage Example:
```typescript
import { useAI } from '@/contexts/AIContext';

const AIInsightsComponent = () => {
  const { insights, isLoadingInsights, refreshInsights } = useAI();
  
  useEffect(() => {
    refreshInsights();
  }, []);
  
  const highPriorityInsights = insights.filter(i => i.priority === 'high');
  
  return (
    <div>
      {isLoadingInsights ? (
        <div>Loading AI insights...</div>
      ) : (
        <div>
          {highPriorityInsights.map(insight => (
            <div key={insight.id}>
              <h3>{insight.title}</h3>
              <p>{insight.description}</p>
              <p>Action: {insight.action}</p>
              <p>Impact: {insight.impact}</p>
              <p>Confidence: {insight.confidence}%</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

## Events and Error Handling

### Smart Contract Events

```solidity
// User Operations
event Deposit(address indexed user, uint256 amount, uint256 shares);
event Withdraw(address indexed user, uint256 amount, uint256 shares);

// Protocol Operations
event ProtocolDeposit(Protocol protocol, uint256 amount);
event ProtocolWithdraw(Protocol protocol, uint256 amount);
event ProtocolRebalance(Protocol from, Protocol to, uint256 amount);

// AI Operations
event AIRebalanceRequest(string currentStrategy, uint256 aaveBalance, uint256 compoundBalance);
event AIRebalanceExecuted(string suggestion, Protocol newProtocol, uint256 amount);

// Cross-Chain Operations
event CrossChainTransfer(uint64 indexed dstChain, bytes32 messageId, address indexed recipient, uint256 amount);
event CrossChainReceived(bytes32 indexed messageId, uint64 indexed srcChain, address sender, uint256 amount);

// Emergency Operations
event EmergencyWithdraw(address indexed token, uint256 amount);
event RebalanceFailure(string reason);
```

### Custom Errors

```solidity
error InsufficientBalance(uint256 requested, uint256 available);
error InvalidProtocol(uint256 protocol);
error RebalanceInProgress();
error CrossChainTransferFailed(bytes32 messageId);
error InvalidChainSelector(uint64 chainSelector);
error UnauthorizedSender(address sender);
error MinimumDepositNotMet(uint256 amount, uint256 minimum);
error ContractPaused();
error ZeroAmount();
error InvalidRecipient(address recipient);
```

### Frontend Error Handling

```typescript
// Error types
interface VaultError {
  code: string;
  message: string;
  details?: any;
}

// Error handling utility
const handleTransactionError = (error: any): VaultError => {
  if (error.code === 'USER_REJECTED') {
    return {
      code: 'USER_REJECTED',
      message: 'Transaction was rejected by user'
    };
  }
  
  if (error.reason?.includes('InsufficientBalance')) {
    return {
      code: 'INSUFFICIENT_BALANCE',
      message: 'Insufficient balance for this operation'
    };
  }
  
  if (error.reason?.includes('MinimumDepositNotMet')) {
    return {
      code: 'MINIMUM_DEPOSIT',
      message: 'Minimum deposit of 1 USDC required'
    };
  }
  
  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred',
    details: error
  };
};
```

## Rate Limits and Quotas

### Chainlink CCIP
- **Message Size**: Maximum 10KB per message
- **Gas Limit**: Configurable per destination chain
- **Fee**: Paid in LINK tokens

### Chainlink Automation
- **Check Frequency**: Every block (12 seconds)
- **Gas Limit**: 5,000,000 gas per performUpkeep call
- **LINK Balance**: Must maintain sufficient LINK for operations

### AWS Bedrock
- **Rate Limit**: 1000 requests per minute
- **Token Limit**: 100,000 tokens per request
- **Monthly Quota**: Based on AWS account limits

## Security Considerations

### Input Validation
- All amounts validated for minimum thresholds
- Address validation for zero addresses
- Protocol enum validation
- Chain selector validation

### Access Control
- Owner-only functions protected with `onlyOwner` modifier
- Cross-chain sender validation
- Pause functionality for emergency stops

### Reentrancy Protection
- `nonReentrant` modifier on all state-changing functions
- Checks-effects-interactions pattern followed
- SafeERC20 for all token transfers 