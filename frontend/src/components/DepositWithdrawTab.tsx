
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ArrowUpDown, Zap, Wallet, RefreshCw, AlertCircle } from "lucide-react";
import { useWallet, SUPPORTED_NETWORKS } from "@/contexts/WalletContext";
import { useContract } from "@/contexts/ContractContext";

const DepositWithdrawTab = () => {
  const { isConnected, account, balance, chainId } = useWallet();
  const { 
    usdcBalance, 
    vaultBalance, 
    allowance, 
    isLoading,
    isApproving, 
    isDepositing, 
    isWithdrawing,
    isContractReady,
    contractError,
    approveUSDC, 
    deposit, 
    withdraw, 
    refreshBalances 
  } = useContract();
  
  const [mode, setMode] = useState<"deposit" | "withdraw">("deposit");
  const [amount, setAmount] = useState("");

  const getCurrentNetwork = () => {
    return Object.values(SUPPORTED_NETWORKS).find(network => network.chainId === chainId);
  };

  // Check if amount is approved
  const isAmountApproved = () => {
    if (!amount || !allowance) return false;
    return parseFloat(allowance) >= parseFloat(amount);
  };

  // Set max amount
  const setMaxAmount = () => {
    if (mode === "deposit") {
      setAmount(usdcBalance);
    } else {
      setAmount(vaultBalance);
    }
  };

  const handleApprove = async () => {
    if (!amount) return;
    const success = await approveUSDC(amount);
    if (success) {
      // Give a moment for the UI to update with new allowance
      setTimeout(() => {
        refreshBalances();
      }, 500);
    }
    // Success/error handling is done in the context with toasts
  };

  const handleTransaction = async () => {
    if (!amount) return;
    
    if (mode === "deposit") {
      await deposit(amount);
    } else {
      await withdraw(amount);
    }
    
    // Clear amount on successful transaction
    setAmount("");
  };

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-xl mx-auto">
        {!isConnected ? (
          <div className="glass rounded-lg p-6 text-center">
            <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-white mb-2">Connect Your Wallet</h2>
            <p className="text-gray-400 text-sm">Please connect your wallet to deposit or withdraw funds</p>
          </div>
        ) : contractError ? (
          <div className="glass rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-white mb-2">Contract Not Available</h2>
            <p className="text-gray-400 text-sm">{contractError}</p>
            <p className="text-gray-500 text-xs mt-2">Please deploy contracts or switch to a supported network</p>
          </div>
        ) : (
          <div className="glass rounded-lg p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">Manage Funds</h2>
                <p className="text-gray-400 text-xs">Deposit or withdraw USDC to optimize your yields</p>
              </div>
              <Button
                onClick={refreshBalances}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="glass-hover border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>

          {/* Mode Toggle */}
          <div className="flex bg-gray-800/50 rounded-lg p-1 mb-4">
            <button
              onClick={() => setMode("deposit")}
              className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all duration-300 text-sm ${
                mode === "deposit"
                  ? "bg-gradient-to-r from-purple-500 to-purple-700 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Deposit
            </button>
            <button
              onClick={() => setMode("withdraw")}
              className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all duration-300 text-sm ${
                mode === "withdraw"
                  ? "bg-gradient-to-r from-purple-500 to-purple-700 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Withdraw
            </button>
          </div>

          {/* Token Selector */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-400 mb-1">Token</label>
            <div className="glass rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  $
                </div>
                <div>
                  <div className="text-white font-medium text-sm">USDC</div>
                  <div className="text-xs text-gray-400">USD Coin</div>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Amount Input */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-400 mb-1">Amount</label>
            <div className="glass rounded-lg p-3">
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 bg-transparent text-white text-lg font-semibold placeholder-gray-500 focus:outline-none"
                />
                <button 
                  onClick={setMaxAmount}
                  className="text-purple-400 hover:text-purple-300 text-xs font-medium transition-colors"
                >
                  MAX
                </button>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                <span>Wallet: {usdcBalance} USDC</span>
                <span>Deposited: {vaultBalance} USDC</span>
              </div>
              {mode === "deposit" && !isAmountApproved() && amount && (
                <div className="mt-1 text-xs text-yellow-400">
                  Allowance: {allowance} USDC (Approval needed)
                </div>
              )}
            </div>
          </div>

          {/* AI Optimization Info */}
          <div className="glass rounded-lg p-3 mb-4 bg-gradient-to-r from-purple-500/10 to-purple-700/10 border border-purple-500/30">
            <div className="flex items-start space-x-2">
              <Zap className="w-4 h-4 text-purple-400 mt-0.5" />
              <div>
                <h4 className="text-white font-medium mb-1 text-sm">AI Optimization Active</h4>
                <p className="text-xs text-gray-300">
                  Our AI will automatically allocate your funds across Ethereum and Avalanche 
                  to maximize yields. Current optimal strategy: 60% ETH, 40% AVAX.
                </p>
              </div>
            </div>
          </div>

                      {/* Action Buttons */}
            <div className="space-y-3">
              {!isAmountApproved() && mode === "deposit" && amount && (
                <Button
                  onClick={handleApprove}
                  disabled={isApproving || !amount || !isContractReady}
                  className="w-full glass-hover glow-border bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 text-sm"
                >
                  {isApproving && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>{isApproving ? "Approving..." : "Approve USDC"}</span>
                  {!isApproving && <ArrowUpDown className="w-4 h-4" />}
                </Button>
              )}
              
              <Button
                onClick={handleTransaction}
                disabled={
                  !amount || 
                  !isContractReady || 
                  (mode === "deposit" && (!isAmountApproved() || isDepositing)) ||
                  (mode === "withdraw" && isWithdrawing) ||
                  (mode === "deposit" && parseFloat(amount) > parseFloat(usdcBalance)) ||
                  (mode === "withdraw" && parseFloat(amount) > parseFloat(vaultBalance))
                }
                className={`w-full glass-hover glow-border font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 text-sm ${
                  mode === "deposit"
                    ? "bg-gradient-to-r from-green-500 to-green-600"
                    : "bg-gradient-to-r from-red-500 to-red-600"
                } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {(isDepositing || isWithdrawing) && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>
                  {mode === "deposit" 
                    ? (isDepositing ? "Depositing..." : "Deposit USDC")
                    : (isWithdrawing ? "Withdrawing..." : "Withdraw USDC")
                  }
                </span>
                {!isDepositing && !isWithdrawing && <ArrowUpDown className="w-4 h-4" />}
              </Button>
              
              {/* Balance validation messages */}
              {amount && mode === "deposit" && parseFloat(amount) > parseFloat(usdcBalance) && (
                <p className="text-red-400 text-xs text-center">Insufficient USDC balance</p>
              )}
              {amount && mode === "withdraw" && parseFloat(amount) > parseFloat(vaultBalance) && (
                <p className="text-red-400 text-xs text-center">Insufficient vault balance</p>
              )}
            </div>

            {/* Chain Selection Info */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="glass rounded-lg p-3 text-center">
                <div className="w-4 h-4 bg-blue-500 rounded-full mx-auto mb-1"></div>
                <div className="text-xs text-white font-medium">Ethereum</div>
                <div className="text-xs text-gray-400">Sepolia Testnet</div>
                <div className="text-xs text-green-400 mt-1">8.5% APY</div>
              </div>
              
              <div className="glass rounded-lg p-3 text-center">
                <div className="w-4 h-4 bg-red-500 rounded-full mx-auto mb-1"></div>
                <div className="text-xs text-white font-medium">Avalanche</div>
                <div className="text-xs text-gray-400">Fuji Testnet</div>
                <div className="text-xs text-green-400 mt-1">11.8% APY</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepositWithdrawTab;
