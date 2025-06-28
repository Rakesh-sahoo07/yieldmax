# 🤝 Contributing to AI-Powered Yield Optimizer

Thank you for your interest in contributing to the AI-Powered Yield Optimizer! This document provides guidelines and instructions for contributing to the project.

## 🌟 Ways to Contribute

- **Code Contributions**: Bug fixes, feature implementations, optimizations
- **Documentation**: Improve docs, add examples, write tutorials
- **Testing**: Add test cases, improve test coverage, performance testing
- **Security**: Security audits, vulnerability reports, safety improvements
- **UI/UX**: Design improvements, accessibility enhancements
- **Community**: Help others, answer questions, write blog posts

## 🚀 Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/ai-yield-optimizer.git
cd ai-yield-optimizer

# Add upstream remote
git remote add upstream https://github.com/original-org/ai-yield-optimizer.git
```

### 2. Set Up Development Environment

```bash
# Install dependencies
cd smartcontract && npm install
cd ../frontend && npm install

# Set up environment variables
cp smartcontract/env.example smartcontract/.env
cp frontend/.env.example frontend/.env.local

# Run tests to ensure setup works
cd smartcontract && npm test
cd ../frontend && npm test
```

### 3. Create a Branch

```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-number-description
```

## 📝 Development Guidelines

### Smart Contract Development

#### Code Style
- Follow [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- Use meaningful variable and function names
- Add comprehensive NatSpec documentation
- Maintain gas efficiency

#### Example:
```solidity
/**
 * @title YieldVault
 * @notice Manages user deposits and yield optimization across protocols
 * @dev Implements ERC-4626 vault standard with cross-chain capabilities
 */
contract YieldVault {
    /**
     * @notice Deposits USDC and mints vault shares
     * @param amount Amount of USDC to deposit (minimum 1e6)
     * @return shares Number of shares minted to user
     */
    function deposit(uint256 amount) external nonReentrant whenNotPaused returns (uint256 shares) {
        require(amount >= MIN_DEPOSIT, "Insufficient deposit amount");
        // Implementation...
    }
}
```

#### Testing Requirements
- Write comprehensive unit tests
- Include integration tests for protocol interactions
- Test edge cases and error conditions
- Maintain 95%+ test coverage

```javascript
describe("YieldVault", function () {
    it("should deposit USDC and mint shares", async function () {
        const depositAmount = parseUnits("100", 6); // 100 USDC
        
        await usdc.approve(vault.address, depositAmount);
        const tx = await vault.deposit(depositAmount);
        
        expect(await vault.balanceOf(user.address)).to.be.gt(0);
        expect(await vault.totalAssets()).to.equal(depositAmount);
    });
});
```

### Frontend Development

#### Code Style
- Use TypeScript for type safety
- Follow React best practices
- Implement responsive design
- Ensure accessibility (WCAG 2.1 AA)

#### Component Structure
```typescript
interface ComponentProps {
    title: string;
    amount: BigNumber;
    onSubmit: (amount: string) => Promise<void>;
}

const Component: React.FC<ComponentProps> = ({ title, amount, onSubmit }) => {
    const [loading, setLoading] = useState(false);
    
    const handleSubmit = async (value: string) => {
        setLoading(true);
        try {
            await onSubmit(value);
        } catch (error) {
            console.error('Submission failed:', error);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="p-4 bg-white rounded-lg">
            {/* Component JSX */}
        </div>
    );
};
```

#### State Management
```typescript
// Use Context for global state
const useVault = () => {
    const context = useContext(VaultContext);
    if (!context) {
        throw new Error('useVault must be used within VaultProvider');
    }
    return context;
};
```

## 🧪 Testing Guidelines

### Smart Contract Testing

```bash
# Run all tests
npm test

# Run specific test file
npx hardhat test test/YieldVault.test.js

# Run with gas reporting
REPORT_GAS=true npm test

# Run coverage
npm run coverage
```

### Frontend Testing

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Visual regression tests
npm run test:visual
```

### Test Categories

#### Unit Tests
- Test individual functions in isolation
- Mock external dependencies
- Focus on business logic

#### Integration Tests
- Test component interactions
- Use real contracts on testnet
- Verify end-to-end workflows

#### E2E Tests
- Test complete user journeys
- Use browser automation
- Verify UI/UX functionality

## 📋 Pull Request Process

### 1. Before Creating PR

- [ ] Code compiles without warnings
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Code formatted with Prettier
- [ ] No console.log statements
- [ ] Gas optimizations considered

### 2. PR Checklist

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed

## Security
- [ ] No security vulnerabilities introduced
- [ ] Access controls properly implemented
- [ ] Input validation added

## Documentation
- [ ] Code comments updated
- [ ] README updated if needed
- [ ] API documentation updated
```

### 3. PR Review Process

1. **Automated Checks**: CI/CD pipeline runs tests
2. **Code Review**: Maintainers review code
3. **Security Review**: Security-focused review for contracts
4. **Testing**: Manual testing on testnet
5. **Approval**: At least 2 approvals required
6. **Merge**: Squash and merge to main branch

## 🔒 Security Guidelines

### Smart Contract Security

#### Common Vulnerabilities to Avoid
- Reentrancy attacks
- Integer overflow/underflow
- Access control issues
- Front-running vulnerabilities
- Oracle manipulation

#### Security Checklist
```solidity
// ✅ Good: Use ReentrancyGuard
function withdraw(uint256 amount) external nonReentrant {
    // Implementation
}

// ✅ Good: Validate inputs
function deposit(uint256 amount) external {
    require(amount > 0, "Amount must be positive");
    require(amount >= MIN_DEPOSIT, "Below minimum deposit");
    // Implementation
}

// ✅ Good: Use SafeERC20
using SafeERC20 for IERC20;
token.safeTransfer(recipient, amount);
```

### Responsible Disclosure

If you discover a security vulnerability:

1. **DO NOT** create a public issue
2. **Email** security@ai-yield-optimizer.com
3. **Include** detailed description and reproduction steps
4. **Wait** for acknowledgment before public disclosure
5. **Coordinate** disclosure timeline with maintainers

## 🎨 Design Guidelines

### UI/UX Principles

- **Clarity**: Clear information hierarchy
- **Accessibility**: WCAG 2.1 AA compliance
- **Responsiveness**: Mobile-first design
- **Performance**: Fast loading times
- **Trust**: Clear security indicators

### Design System

```typescript
// Color palette
const colors = {
    primary: {
        50: '#eff6ff',
        500: '#3b82f6',
        900: '#1e3a8a'
    },
    success: {
        50: '#f0fdf4',
        500: '#22c55e',
        900: '#14532d'
    }
};

// Typography
const typography = {
    h1: 'text-4xl font-bold',
    h2: 'text-3xl font-semibold',
    body: 'text-base',
    caption: 'text-sm text-gray-500'
};
```

## 📚 Documentation Standards

### Code Documentation

```typescript
/**
 * Calculates optimal protocol allocation based on current yields
 * @param currentAllocation Current protocol distribution
 * @param marketConditions Current market data
 * @returns Recommended allocation adjustments
 */
async function calculateOptimalAllocation(
    currentAllocation: ProtocolAllocation,
    marketConditions: MarketData
): Promise<AllocationRecommendation> {
    // Implementation
}
```

### API Documentation

Use OpenAPI/Swagger for API documentation:

```yaml
paths:
  /api/vault/deposit:
    post:
      summary: Deposit funds to vault
      parameters:
        - name: amount
          in: body
          required: true
          schema:
            type: string
            example: "1000.0"
```

## 🤖 AI Integration Guidelines

### Prompt Engineering

```typescript
// Good: Structured prompt with clear context
const prompt = `
Context: DeFi yield optimization for ${portfolioValue} USDC portfolio
Current allocation: ${currentAllocation}
Market conditions: ${marketData}

Task: Recommend optimal rebalancing strategy
Requirements: Maximize yield while maintaining risk level < 7/10

Output format:
1. Recommended allocation changes
2. Expected APY impact
3. Risk assessment
4. Confidence score (0-100)
`;
```

### AI Safety

- Validate all AI responses
- Implement confidence thresholds
- Provide human override capabilities
- Log all AI decisions for audit

## 🔄 Release Process

### Version Numbering

Follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes, backward compatible

### Release Checklist

- [ ] All tests pass
- [ ] Documentation updated
- [ ] Smart contracts audited
- [ ] Testnet deployment successful
- [ ] Performance benchmarks met
- [ ] Security review completed

## 🏆 Recognition

Contributors will be recognized in:
- GitHub contributors list
- Project documentation
- Release notes
- Community announcements

### Contributor Levels

- **Contributor**: Made at least one merged PR
- **Regular Contributor**: Made 5+ merged PRs
- **Core Contributor**: Significant ongoing contributions
- **Maintainer**: Commit access and review privileges

## 📞 Getting Help

- **Discord**: [Join our community](https://discord.gg/ai-yield-optimizer)
- **GitHub Discussions**: For general questions
- **GitHub Issues**: For bug reports and feature requests
- **Email**: dev@ai-yield-optimizer.com

## 📋 Issue Templates

### Bug Report
```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior

**Expected behavior**
What you expected to happen

**Environment**
- OS: [e.g., macOS, Windows]
- Browser: [e.g., Chrome, Firefox]
- Version: [e.g., 1.2.3]
```

### Feature Request
```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Additional context**
Any other context or screenshots about the feature.
```

## 📜 Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Examples of behavior that contributes to creating a positive environment:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community

**Examples of unacceptable behavior:**
- The use of sexualized language or imagery
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project team at conduct@ai-yield-optimizer.com.

---

Thank you for contributing to the AI-Powered Yield Optimizer! Together, we're building the future of DeFi yield optimization. 🚀 