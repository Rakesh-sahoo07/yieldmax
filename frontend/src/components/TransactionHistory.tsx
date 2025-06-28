import React from 'react';
import { ArrowDownLeft, ArrowUpRight, ExternalLink, Clock, Copy } from 'lucide-react';
import { useContract } from '@/contexts/ContractContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const TransactionHistory = () => {
  const { transactions, isLoadingTransactions } = useContract();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const getExplorerUrl = (hash: string) => {
    // For Sepolia testnet
    return `https://sepolia.etherscan.io/tx/${hash}`;
  };

  if (isLoadingTransactions) {
    return (
      <div className="glass rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Transaction History</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
          <span className="ml-3 text-gray-200 font-medium">Loading transactions...</span>
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="glass rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Transaction History</h3>
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-200 text-lg font-medium">No transactions yet</p>
          <p className="text-gray-400 text-sm mt-2">Your deposits and withdrawals will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Transaction History</h3>
        <span className="text-sm text-gray-200 font-medium bg-gray-800/50 px-3 py-1 rounded-full">{transactions.length} transactions</span>
      </div>
      
      <div className="space-y-3">
        {transactions.map((tx, index) => (
                     <div
             key={`${tx.hash}-${index}`}
             className="bg-gray-900/70 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 hover:bg-gray-800/70 hover:border-gray-600/50 transition-all duration-300"
           >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${
                  tx.type === 'deposit' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {tx.type === 'deposit' ? (
                    <ArrowDownLeft className="w-4 h-4" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-white font-semibold capitalize text-lg">
                      {tx.type}
                    </span>
                    <span className="text-green-400 font-semibold text-lg">
                      {parseFloat(tx.amount).toFixed(2)} USDC
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-200 space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-300 font-medium">From:</span>
                      <span className="font-mono bg-gray-800/80 text-white px-2 py-1 rounded">
                        {formatAddress(tx.fromAddress)}
                      </span>
                      <button
                        onClick={() => copyToClipboard(tx.fromAddress)}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-300 font-medium">To:</span>
                      <span className="font-mono bg-gray-800/80 text-white px-2 py-1 rounded">
                        {formatAddress(tx.toAddress)}
                      </span>
                      <button
                        onClick={() => copyToClipboard(tx.toAddress)}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-300 font-medium">Hash:</span>
                      <span className="font-mono bg-gray-800/80 text-white px-2 py-1 rounded">
                        {formatAddress(tx.hash)}
                      </span>
                      <button
                        onClick={() => copyToClipboard(tx.hash)}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-200 mb-2 font-medium">
                  {formatTimestamp(tx.timestamp)}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(getExplorerUrl(tx.hash), '_blank')}
                  className="glass-hover border-purple-500/50 text-purple-300 hover:bg-purple-500/20 hover:text-white h-8 px-3"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  View
                </Button>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-600/50">
              <div className="flex justify-between items-center text-sm text-gray-300">
                <span className="font-medium">Shares: <span className="text-purple-300">{parseFloat(tx.shares).toFixed(6)}</span></span>
                <span className="font-medium">Block: <span className="text-blue-300">{tx.blockNumber}</span></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionHistory; 