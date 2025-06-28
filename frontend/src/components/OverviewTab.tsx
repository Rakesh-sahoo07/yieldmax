
import React from "react";
import { TrendingUp, Wallet, DollarSign, ExternalLink, ArrowDownLeft, ArrowUpRight, Layers, Settings, Zap, Globe, Shield, Droplets, Lock, Target, Sprout, Banknote } from "lucide-react";
import { useWallet, SUPPORTED_NETWORKS } from "@/contexts/WalletContext";
import { useContract } from "@/contexts/ContractContext";
import AIInsights from "@/components/AIInsights";

const OverviewTab = () => {
  const { isConnected, account, balance, chainId } = useWallet();
  const { usdcBalance, vaultBalance, isContractReady, transactions } = useContract();

  const getCurrentNetwork = () => {
    return Object.values(SUPPORTED_NETWORKS).find(network => network.chainId === chainId);
  };

  const stats = [
    {
      title: "Wallet USDC",
      value: isConnected && isContractReady ? `${usdcBalance} USDC` : (isConnected ? "Loading..." : "--"),
      change: isConnected ? "Available to deposit" : "Connect wallet",
      icon: Wallet,
      color: "text-purple-400"
    },
    {
      title: "Deposited USDC",
      value: isConnected && isContractReady ? `${vaultBalance} USDC` : (isConnected ? "Loading..." : "--"),
      change: isConnected && isContractReady ? (parseFloat(vaultBalance) > 0 ? "Earning yield in vault" : "No deposits yet") : "Connect wallet",
      icon: DollarSign,
      color: "text-green-400"
    },
    {
      title: "Current APY",
      value: isConnected ? "--%" : "--",
      change: isConnected ? "Coming soon" : "Connect wallet",
      icon: TrendingUp,
      color: "text-blue-400"
    }
  ];

  // Get recent transactions (last 5)
  const recentTransactions = transactions.slice(0, 5);

  // Random portfolio allocation function
  const generateRandomAllocation = (totalAmount: number) => {
    if (totalAmount === 0) {
      return [0, 0, 0, 0, 0];
    }

    // Generate random allocations - some categories might be 0
    const allocations = [];
    const numActiveCategories = Math.floor(Math.random() * 3) + 2; // 2-4 active categories
    
    // Create random percentages for active categories
    const randomPercentages = [];
    for (let i = 0; i < numActiveCategories; i++) {
      randomPercentages.push(Math.random());
    }
    
    // Normalize to sum to 1
    const sum = randomPercentages.reduce((a, b) => a + b, 0);
    const normalizedPercentages = randomPercentages.map(p => p / sum);
    
    // Randomly assign to categories
    const categoryIndices = [];
    while (categoryIndices.length < numActiveCategories) {
      const randomIndex = Math.floor(Math.random() * 5);
      if (!categoryIndices.includes(randomIndex)) {
        categoryIndices.push(randomIndex);
      }
    }
    
    // Create allocation array
    const result = [0, 0, 0, 0, 0];
    categoryIndices.forEach((index, i) => {
      result[index] = normalizedPercentages[i];
    });
    
    return result;
  };

  // Get allocation percentages (regenerate only when vault balance changes significantly)
  const allocationKey = Math.floor(parseFloat(vaultBalance || "0") * 100); // Change when balance changes by 0.01
  const allocationPercentages = React.useMemo(() => {
    return generateRandomAllocation(parseFloat(vaultBalance || "0"));
  }, [allocationKey]);

  // Portfolio breakdown data with random allocation
  const totalBalance = parseFloat(vaultBalance || "0");
  const portfolioBreakdown = [
    {
      title: "liquidity pool",
      value: isConnected && isContractReady ? `$${(totalBalance * allocationPercentages[0]).toFixed(2)}` : "$0.00",
      icon: Droplets,
      color: "bg-gradient-to-br from-cyan-500 to-blue-600",
      textColor: "text-cyan-400"
    },
    {
      title: "staked",
      value: isConnected && isContractReady ? `$${(totalBalance * allocationPercentages[1]).toFixed(2)}` : "$0.00",
      icon: Lock,
      color: "bg-gradient-to-br from-cyan-400 to-blue-500",
      textColor: "text-cyan-400"
    },
    {
      title: "yield", 
      value: isConnected && isContractReady && allocationPercentages[2] > 0 ? `$${(totalBalance * allocationPercentages[2]).toFixed(2)}` : "$0.00",
      icon: Target,
      color: "bg-gradient-to-br from-cyan-600 to-blue-700",
      textColor: "text-cyan-400"
    },
    {
      title: "farming",
      value: isConnected && isContractReady ? `$${(totalBalance * allocationPercentages[3]).toFixed(2)}` : "$0.00",
      icon: Sprout,
      color: "bg-gradient-to-br from-blue-500 to-cyan-600",
      textColor: "text-cyan-400"
    },
    {
      title: "lending",
      value: isConnected && isContractReady ? `$${(totalBalance * allocationPercentages[4]).toFixed(2)}` : "$0.00",
      icon: Banknote,
      color: "bg-gradient-to-br from-blue-600 to-cyan-500",
      textColor: "text-cyan-400"
    }
  ];



  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="glass glass-hover rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-6 h-6 ${stat.color}`} />
                <div className="text-right">
                  <div className="text-lg font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-green-400">{stat.change}</div>
                </div>
              </div>
              <h3 className="text-gray-400 text-xs font-medium">{stat.title}</h3>
            </div>
          );
        })}
      </div>

      {/* Portfolio Breakdown Section */}
      <div className="glass rounded-lg p-6 border border-purple-500/20 shadow-xl">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
          <TrendingUp className="w-6 h-6 text-purple-400" />
          <span>Portfolio Overview</span>
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {portfolioBreakdown.map((item, index) => {
            const Icon = item.icon;
            return (
              <div 
                key={index} 
                className="text-center group cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-20 h-20 mx-auto mb-4 rounded-3xl ${item.color} flex items-center justify-center shadow-xl transform group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm border border-white/10`}>
                  <Icon className="w-10 h-10 text-white drop-shadow-lg" />
                </div>
                <h4 className="text-gray-200 text-sm font-semibold mb-2 capitalize tracking-wide">
                  {item.title}
                </h4>
                <p className={`font-bold text-xl ${item.textColor} drop-shadow-sm`}>
                  {item.value}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        {/* Transaction History */}
        <div className="glass rounded-lg p-4 flex flex-col">
          <h3 className="text-lg font-bold text-white mb-3 flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span>Transaction History</span>
          </h3>
          
          <div className="space-y-2 overflow-y-auto flex-1 pr-2">
            {isConnected ? (
              recentTransactions.length > 0 ? (
                recentTransactions.map((tx, index) => (
                  <div key={`${tx.hash}-${index}`} className="glass rounded-lg p-3 hover:bg-white/15 transition-all duration-300">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <div className={`p-1 rounded ${tx.type === 'deposit' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                          {tx.type === 'deposit' ? (
                            <ArrowDownLeft className="w-3 h-3 text-green-400" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3 text-red-400" />
                          )}
                        </div>
                        <span className="text-xs text-white font-medium capitalize">{tx.type}</span>
                      </div>
                      <span className="text-xs font-medium text-green-400">{parseFloat(tx.amount).toFixed(2)} USDC</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{new Date(tx.timestamp * 1000).toLocaleDateString()}</span>
                      <div className="flex items-center space-x-1">
                        <span>{tx.hash.slice(0, 8)}...</span>
                        <ExternalLink className="w-2 h-2" />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="glass rounded-lg p-6 text-center">
                  <TrendingUp className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <div className="text-gray-400 text-sm">No transactions yet</div>
                  <div className="text-gray-500 text-xs mt-1">Your transaction history will appear here</div>
                </div>
              )
            ) : (
              <div className="glass rounded-lg p-6 text-center">
                <Wallet className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <div className="text-gray-400 text-sm">Connect wallet to view transactions</div>
              </div>
            )}
          </div>
        </div>

        {/* AI Insights */}
        <div className="flex flex-col">
          <AIInsights />
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
