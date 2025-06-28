import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './WalletContext';
import { toast } from 'sonner';
import { getContractAddresses, isContractDeployed } from '@/utils/contractAddresses';
import { debugLog, logBalanceChange } from '@/utils/debug';

// Transaction interfaces
interface Transaction {
  hash: string;
  type: 'deposit' | 'withdraw';
  amount: string;
  shares: string;
  fromAddress: string;
  toAddress: string;
  timestamp: number;
  blockNumber: number;
  status: 'confirmed' | 'pending' | 'failed';
}

// Contract ABIs (matching the actual deployed contract)
const YIELD_VAULT_ABI = [
  "function deposit(uint256 amount) external",
  "function withdraw(uint256 shares) public",
  "function userInfo(address user) external view returns (uint256 shares, uint256 lastDepositTime)",
  "function getUserBalance(address user) external view returns (uint256)",
  "function totalAssets() external view returns (uint256)",
  "function totalShares() external view returns (uint256)",
  "function idleUSDC() external view returns (uint256)",
  "function currentProtocol() external view returns (uint8)",
  "function currentStrategy() external view returns (string)",
  "function MIN_DEPOSIT() external view returns (uint256)",
  "event Deposit(address indexed user, uint256 amount, uint256 shares)",
  "event Withdraw(address indexed user, uint256 amount, uint256 shares)"
];

const ERC20_ABI = [
  "function balanceOf(address owner) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
];

// Contract addresses are now imported from utils

interface ContractContextType {
  // Contract instances
  yieldVault: ethers.Contract | null;
  usdcToken: ethers.Contract | null;
  
  // Balances
  usdcBalance: string;
  vaultBalance: string;
  allowance: string;
  
  // Loading states
  isLoading: boolean;
  isApproving: boolean;
  isDepositing: boolean;
  isWithdrawing: boolean;
  
  // Transactions
  transactions: Transaction[];
  isLoadingTransactions: boolean;
  
  // Functions
  refreshBalances: () => Promise<void>;
  approveUSDC: (amount: string) => Promise<boolean>;
  deposit: (amount: string) => Promise<boolean>;
  withdraw: (amount: string) => Promise<boolean>;
  refreshTransactions: () => Promise<void>;
  
  // Contract info
  isContractReady: boolean;
  contractError: string | null;
}

const ContractContext = createContext<ContractContextType | undefined>(undefined);

interface ContractProviderProps {
  children: ReactNode;
}

export const ContractProvider: React.FC<ContractProviderProps> = ({ children }) => {
  const { provider, signer, account, chainId, isConnected } = useWallet();
  
  const [yieldVault, setYieldVault] = useState<ethers.Contract | null>(null);
  const [usdcToken, setUsdcToken] = useState<ethers.Contract | null>(null);
  
  const [usdcBalance, setUsdcBalance] = useState('0.00');
  const [vaultBalance, setVaultBalance] = useState('0.00');
  const [allowance, setAllowance] = useState('0.00');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  
  const [isContractReady, setIsContractReady] = useState(false);
  const [contractError, setContractError] = useState<string | null>(null);

  // Initialize contracts when wallet connects
  useEffect(() => {
    if (isConnected && provider && signer && chainId && account) {
      initializeContracts();
    } else {
      setYieldVault(null);
      setUsdcToken(null);
      setIsContractReady(false);
    }
  }, [isConnected, provider, signer, chainId, account]);

  // Refresh balances and transactions when contracts are ready
  useEffect(() => {
    if (isContractReady && account) {
      refreshBalances();
      refreshTransactions();
    }
  }, [isContractReady, account]);

  const initializeContracts = async () => {
    try {
      setIsLoading(true);
      setContractError(null);
      
      if (!chainId || !signer) {
        throw new Error('Wallet not properly connected');
      }

      const addresses = getContractAddresses(chainId);
      if (!addresses) {
        throw new Error(`Unsupported network. Please switch to Ethereum Sepolia or Polygon Amoy.`);
      }

      // Check if contracts are deployed
      if (!isContractDeployed(chainId)) {
        setContractError(`Contracts not yet deployed on ${addresses.name}. Please deploy contracts first.`);
        setIsContractReady(false);
        return;
      }

      // Initialize contracts
      const vaultContract = new ethers.Contract(addresses.yieldVault, YIELD_VAULT_ABI, signer);
      const usdcContract = new ethers.Contract(addresses.usdc, ERC20_ABI, signer);

      // Verify contracts are accessible
      const vaultAddress = await vaultContract.getAddress();
      const usdcAddress = await usdcContract.getAddress();
      
      console.log('🏦 Contract Initialization:', {
        network: addresses.name,
        chainId: chainId,
        vault: {
          expected: addresses.yieldVault,
          actual: vaultAddress,
          match: vaultAddress.toLowerCase() === addresses.yieldVault.toLowerCase()
        },
        usdc: {
          expected: addresses.usdc,
          actual: usdcAddress,
          match: usdcAddress.toLowerCase() === addresses.usdc.toLowerCase()
        },
        signer: await signer.getAddress()
      });

      setYieldVault(vaultContract);
      setUsdcToken(usdcContract);
      setIsContractReady(true);
      
      console.log('✅ Contracts initialized successfully');
    } catch (error) {
      console.error('Error initializing contracts:', error);
      setContractError(error instanceof Error ? error.message : 'Failed to initialize contracts');
      setIsContractReady(false);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshBalances = async () => {
    if (!isContractReady || !account || !usdcToken || !yieldVault) return;

    try {
      const [usdcBal, userVaultBalance, currentAllowance] = await Promise.all([
        usdcToken.balanceOf(account),
        yieldVault.getUserBalance(account),
        usdcToken.allowance(account, await yieldVault.getAddress())
      ]);

      setUsdcBalance(ethers.formatUnits(usdcBal, 6)); // USDC has 6 decimals
      setVaultBalance(ethers.formatUnits(userVaultBalance, 6));
      setAllowance(ethers.formatUnits(currentAllowance, 6));
      
      console.log('💰 Balance Update:', {
        usdcBalance: ethers.formatUnits(usdcBal, 6),
        vaultBalance: ethers.formatUnits(userVaultBalance, 6),
        allowance: ethers.formatUnits(currentAllowance, 6)
      });
    } catch (error) {
      console.error('Error refreshing balances:', error);
    }
  };

  const approveUSDC = async (amount: string): Promise<boolean> => {
    if (!isContractReady || !usdcToken || !yieldVault || !signer) {
      toast.error('Contracts not ready');
      return false;
    }

    try {
      setIsApproving(true);
      
      const amountWei = ethers.parseUnits(amount, 6); // USDC has 6 decimals
      const vaultAddress = await yieldVault.getAddress();
      const usdcAddress = await usdcToken.getAddress();
      const userAddress = await signer.getAddress();
      
      const addresses = getContractAddresses(chainId!);
      console.log('🔐 USDC Approval Details:', {
        user: userAddress,
        amount: amount,
        amountWei: amountWei.toString(),
        usdcContract: usdcAddress,
        vaultContract: vaultAddress,
        expectedVault: addresses?.yieldVault,
        vaultMatches: vaultAddress.toLowerCase() === addresses?.yieldVault.toLowerCase(),
        blockchainConnected: true
      });
      
      const tx = await usdcToken.approve(vaultAddress, amountWei);
      toast.info('Approval transaction sent. Please wait...');
      
      const receipt = await tx.wait();
      console.log('Approval successful:', receipt);
      
      // Wait a bit for the blockchain state to settle, then refresh allowance
      await new Promise(resolve => setTimeout(resolve, 1000));
      await refreshBalances();
      
      // Double-check the allowance was properly set
      const currentAllowance = await usdcToken.allowance(account, vaultAddress);
      const allowanceFormatted = ethers.formatUnits(currentAllowance, 6);
      console.log('Updated allowance:', allowanceFormatted);
      
      toast.success('USDC approval successful!');
      return true;
    } catch (error: unknown) {
      console.error('Error approving USDC:', error);
      
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ACTION_REJECTED') {
        toast.error('Transaction was rejected by user');
      } else {
        toast.error('Failed to approve USDC. Please try again.');
      }
      return false;
    } finally {
      setIsApproving(false);
    }
  };

  const deposit = async (amount: string): Promise<boolean> => {
    if (!isContractReady || !yieldVault || !signer || !usdcToken || !account) {
      toast.error('Contracts not ready');
      return false;
    }

    try {
      setIsDepositing(true);
      
      // Store balances before transaction
      const beforeBalances = { wallet: usdcBalance, vault: vaultBalance };
      
      const amountWei = ethers.parseUnits(amount, 6); // USDC has 6 decimals
      const vaultAddress = await yieldVault.getAddress();
      
      // Check allowance before attempting deposit
      const currentAllowance = await usdcToken.allowance(account, vaultAddress);
      console.log('Current allowance before deposit:', {
        allowance: ethers.formatUnits(currentAllowance, 6),
        required: amount,
        allowanceWei: currentAllowance.toString(),
        amountWei: amountWei.toString()
      });
      
      if (currentAllowance < amountWei) {
        toast.error(`Insufficient allowance. Current: ${ethers.formatUnits(currentAllowance, 6)} USDC, Required: ${amount} USDC`);
        return false;
      }
      
      debugLog('Depositing USDC', { amount, amountWei: amountWei.toString(), beforeBalances });
      
      const tx = await yieldVault.deposit(amountWei);
      toast.info('Deposit transaction sent. Please wait...');
      
      const receipt = await tx.wait();
      debugLog('Deposit successful', receipt);
      
      // Refresh balances and transactions
      await refreshBalances();
      await refreshTransactions();
      
      // Log balance change
      const afterBalances = { wallet: usdcBalance, vault: vaultBalance };
      logBalanceChange('deposit', amount, beforeBalances, afterBalances);
      
      toast.success(`Successfully deposited ${amount} USDC!`);
      return true;
    } catch (error: unknown) {
      console.error('Error depositing:', error);
      
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ACTION_REJECTED') {
        toast.error('Transaction was rejected by user');
      } else if (error && typeof error === 'object' && 'message' in error) {
        const message = error.message as string;
        if (message.includes('insufficient allowance')) {
          toast.error('Insufficient USDC allowance. Please approve first.');
        } else if (message.includes('insufficient balance')) {
          toast.error('Insufficient USDC balance');
        } else if (message.includes('Invalid aToken')) {
          toast.error('Contract configuration issue. Deployment update needed.');
        } else {
          toast.error('Failed to deposit. Please try again.');
        }
      } else {
        toast.error('Failed to deposit. Please try again.');
      }
      return false;
    } finally {
      setIsDepositing(false);
    }
  };

  const withdraw = async (amount: string): Promise<boolean> => {
    if (!isContractReady || !yieldVault || !signer || !account) {
      toast.error('Contracts not ready');
      return false;
    }

    try {
      setIsWithdrawing(true);
      
      // Store balances before transaction
      const beforeBalances = { wallet: usdcBalance, vault: vaultBalance };
      
      // Get user shares
      const userInfoResult = await yieldVault.userInfo(account);
      const userShares = userInfoResult[0];
      
      let sharesToWithdraw = 0n;
      
      if (amount.toLowerCase() === 'all') {
        // Withdraw all shares
        sharesToWithdraw = userShares;
      } else {
        // Convert amount to shares: shares = (amount * totalShares) / totalAssets
        const amountWei = ethers.parseUnits(amount, 6);
        const [totalAssets, totalShares] = await Promise.all([
          yieldVault.totalAssets(),
          yieldVault.totalShares()
        ]);
        
        if (totalAssets > 0n && totalShares > 0n) {
          sharesToWithdraw = (amountWei * totalShares) / totalAssets;
        }
        
        // Make sure we don't withdraw more shares than user has
        sharesToWithdraw = sharesToWithdraw > userShares ? userShares : sharesToWithdraw;
      }
      
      if (sharesToWithdraw === 0n) {
        toast.error('No shares to withdraw');
        return false;
      }
      
      debugLog('Withdrawing USDC', { 
        amount, 
        sharesToWithdraw: sharesToWithdraw.toString(),
        userShares: userShares.toString(),
        beforeBalances 
      });
      
      const tx = await yieldVault.withdraw(sharesToWithdraw);
      toast.info('Withdrawal transaction sent. Please wait...');
      
      const receipt = await tx.wait();
      debugLog('Withdrawal successful', receipt);
      
      // Refresh balances and transactions
      await refreshBalances();
      await refreshTransactions();
      
      // Log balance change
      const afterBalances = { wallet: usdcBalance, vault: vaultBalance };
      logBalanceChange('withdraw', amount, beforeBalances, afterBalances);
      
      const successMessage = amount.toLowerCase() === 'all' 
        ? 'Successfully withdrew all USDC!' 
        : `Successfully withdrew ${amount} USDC!`;
      toast.success(successMessage);
      return true;
    } catch (error: unknown) {
      console.error('Error withdrawing:', error);
      
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ACTION_REJECTED') {
        toast.error('Transaction was rejected by user');
      } else if (error && typeof error === 'object' && 'message' in error) {
        const message = error.message as string;
        if (message.includes('insufficient balance')) {
          toast.error('Insufficient vault balance');
        } else {
          toast.error('Failed to withdraw. Please try again.');
        }
      } else {
        toast.error('Failed to withdraw. Please try again.');
      }
      return false;
    } finally {
      setIsWithdrawing(false);
    }
  };



  const refreshTransactions = async () => {
    if (!isContractReady || !account || !yieldVault || !provider) return;

    try {
      setIsLoadingTransactions(true);

      // Get contract address for filtering
      const contractAddress = await yieldVault.getAddress();

      // Create a filter for the last 1000 blocks (adjust as needed)
      const currentBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 1000);

      // Get deposit and withdraw events for the user
      const depositFilter = yieldVault.filters.Deposit(account);
      const withdrawFilter = yieldVault.filters.Withdraw(account);

      const [depositEvents, withdrawEvents] = await Promise.all([
        yieldVault.queryFilter(depositFilter, fromBlock),
        yieldVault.queryFilter(withdrawFilter, fromBlock)
      ]);

      // Process events into Transaction objects
      const allTransactions: Transaction[] = [];

      // Process deposit events
      for (const event of depositEvents) {
        if ('args' in event) {
          const block = await provider.getBlock(event.blockNumber);
          const transaction: Transaction = {
            hash: event.transactionHash,
            type: 'deposit',
            amount: ethers.formatUnits(event.args.amount || 0, 6),
            shares: ethers.formatUnits(event.args.shares || 0, 6),
            fromAddress: account,
            toAddress: contractAddress,
            timestamp: block?.timestamp || 0,
            blockNumber: event.blockNumber,
            status: 'confirmed'
          };
          allTransactions.push(transaction);
        }
      }

      // Process withdraw events
      for (const event of withdrawEvents) {
        if ('args' in event) {
          const block = await provider.getBlock(event.blockNumber);
          const transaction: Transaction = {
            hash: event.transactionHash,
            type: 'withdraw',
            amount: ethers.formatUnits(event.args.amount || 0, 6),
            shares: ethers.formatUnits(event.args.shares || 0, 6),
            fromAddress: contractAddress,
            toAddress: account,
            timestamp: block?.timestamp || 0,
            blockNumber: event.blockNumber,
            status: 'confirmed'
          };
          allTransactions.push(transaction);
        }
      }

      // Sort by timestamp (newest first)
      allTransactions.sort((a, b) => b.timestamp - a.timestamp);

      setTransactions(allTransactions);
      console.log(`📋 Loaded ${allTransactions.length} transactions for user`);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const value: ContractContextType = {
    yieldVault,
    usdcToken,
    usdcBalance,
    vaultBalance,
    allowance,
    isLoading,
    isApproving,
    isDepositing,
    isWithdrawing,
    transactions,
    isLoadingTransactions,
    refreshBalances,
    approveUSDC,
    deposit,
    withdraw,
    refreshTransactions,
    isContractReady,
    contractError,
  };

  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  );
};

export const useContract = (): ContractContextType => {
  const context = useContext(ContractContext);
  if (context === undefined) {
    throw new Error('useContract must be used within a ContractProvider');
  }
  return context;
}; 