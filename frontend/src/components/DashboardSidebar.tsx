
import { useState } from "react";
import { BarChart3, Wallet, TrendingUp, ArrowUpDown, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWallet, SUPPORTED_NETWORKS } from "@/contexts/WalletContext";

interface DashboardSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const DashboardSidebar = ({ activeTab, onTabChange }: DashboardSidebarProps) => {
  const { isConnected, chainId } = useWallet();
  
  const getConnectedNetworks = () => {
    if (!isConnected || !chainId) return [];
    return Object.values(SUPPORTED_NETWORKS).filter(network => network.chainId === chainId);
  };

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: BarChart3,
      description: "Portfolio summary & history"
    },
    {
      id: "deposit-withdraw",
      label: "Deposit & Withdraw",
      icon: ArrowUpDown,
      description: "Manage your funds"
    },
    {
      id: "transactions",
      label: "Transaction History",
      icon: History,
      description: "View all your transactions"
    }
  ];

  return (
    <div className="w-64 h-full glass rounded-lg p-4 flex flex-col">
      <div className="mb-4">
        <h2 className="text-lg font-bold gradient-text mb-1">Dashboard</h2>
        <p className="text-gray-400 text-xs">Manage your cross-chain yields</p>
      </div>
      
      <nav className="space-y-2 flex-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "w-full flex items-start space-x-2 p-3 rounded-lg transition-all duration-300 text-left text-sm",
                isActive
                  ? "bg-gradient-to-r from-purple-500/20 to-purple-700/20 border border-purple-500/50 shadow-lg shadow-purple-500/20"
                  : "glass-hover border border-transparent hover:border-white/20"
              )}
            >
              <Icon className={cn(
                "w-4 h-4 mt-0.5 flex-shrink-0",
                isActive ? "text-purple-400" : "text-gray-400"
              )} />
              <div>
                <div className={cn(
                  "font-medium text-sm",
                  isActive ? "text-white" : "text-gray-300"
                )}>
                  {tab.label}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {tab.description}
                </div>
              </div>
            </button>
          );
        })}
      </nav>
      
      {/* Quick Stats */}
      <div className="mt-4 space-y-2">
        {isConnected ? (
          <>
            <div className="glass rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <TrendingUp className="w-3 h-3 text-green-400" />
                <span className="text-xs text-gray-400">24h Performance</span>
              </div>
              <div className="text-sm font-bold text-gray-400">--</div>
              <div className="text-xs text-gray-500 mt-1">Coming soon</div>
            </div>
            
            <div className="glass rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Wallet className="w-3 h-3 text-purple-400" />
                <span className="text-xs text-gray-400">Connected Chain</span>
              </div>
              <div className="text-sm font-bold text-white">
                {getConnectedNetworks().length || 0}
              </div>
              <div className="flex space-x-1 mt-1">
                {getConnectedNetworks().map((network) => (
                  <div 
                    key={network.chainId}
                    className={`w-2 h-2 rounded-full ${network.color}`}
                    title={network.name}
                  ></div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="glass rounded-lg p-3 text-center">
            <Wallet className="w-6 h-6 text-gray-400 mx-auto mb-2" />
            <div className="text-xs text-gray-400">Connect wallet to view stats</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardSidebar;
