
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronDown, Wallet, LogOut } from "lucide-react";
import { useWallet, SUPPORTED_NETWORKS } from "@/contexts/WalletContext";
import { useState, useEffect, useRef } from "react";

const Navbar = () => {
  const location = useLocation();
  const { account, isConnected, isConnecting, chainId, balance, connectWallet, disconnectWallet, switchNetwork } = useWallet();
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const walletMenuRef = useRef<HTMLDivElement>(null);

  // Close wallet menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (walletMenuRef.current && !walletMenuRef.current.contains(event.target as Node)) {
        setShowWalletMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getCurrentNetwork = () => {
    return Object.values(SUPPORTED_NETWORKS).find(network => network.chainId === chainId);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">AI</span>
            </div>
            <span className="text-xl font-bold gradient-text">YieldMax</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/dashboard"
              className={`text-white hover:text-purple-400 transition-colors font-medium ${
                location.pathname === '/dashboard' ? 'text-purple-400' : ''
              }`}
            >
              Dashboard
            </Link>
          </div>

          {/* Wallet Section */}
          <div className="relative" ref={walletMenuRef}>
            {!isConnected ? (
              <Button
                onClick={connectWallet}
                disabled={isConnecting}
                className="glass-hover glow-border bg-gradient-to-r from-purple-500 to-purple-700 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2"
              >
                <Wallet className="w-4 h-4" />
                <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
              </Button>
            ) : (
              <div className="flex items-center space-x-2">
                {/* Network Indicator */}
                <div className="flex items-center space-x-2 glass rounded-lg px-3 py-2">
                  <div className={`w-3 h-3 rounded-full ${getCurrentNetwork()?.color || 'bg-gray-500'}`}></div>
                  <span className="text-white text-sm font-medium">
                    {getCurrentNetwork()?.name || 'Unknown Network'}
                  </span>
                </div>

                {/* Wallet Info */}
                <Button
                  onClick={() => setShowWalletMenu(!showWalletMenu)}
                  className="glass-hover glow-border bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2"
                >
                  <div className="text-right">
                    <div className="text-sm">{formatAddress(account!)}</div>
                    <div className="text-xs opacity-80">{balance} {getCurrentNetwork()?.symbol}</div>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </Button>

                {/* Wallet Menu */}
                {showWalletMenu && (
                  <div className="absolute right-0 top-full mt-2 w-64 backdrop-blur-3xl bg-white/15 border border-white/30 shadow-2xl rounded-lg p-4 z-50">
                    <div className="space-y-3">
                      <div className="text-center">
                        <div className="text-white font-medium">{formatAddress(account!)}</div>
                        <div className="text-gray-400 text-sm">{balance} {getCurrentNetwork()?.symbol}</div>
                      </div>
                      
                      <div className="border-t border-white/20 pt-3">
                        <div className="text-gray-400 text-xs mb-2">Switch Network:</div>
                        <div className="space-y-1">
                          {Object.values(SUPPORTED_NETWORKS).map((network) => (
                            <button
                              key={network.chainId}
                              onClick={() => {
                                switchNetwork(network.chainId);
                                setShowWalletMenu(false);
                              }}
                              className={`w-full flex items-center space-x-2 p-2 rounded-lg text-left text-sm transition-all duration-300 ${
                                chainId === network.chainId
                                  ? 'bg-purple-500/20 border border-purple-500/50'
                                  : 'hover:bg-white/10'
                              }`}
                            >
                              <div className={`w-3 h-3 rounded-full ${network.color}`}></div>
                              <span className="text-white">{network.name}</span>
                              {chainId === network.chainId && (
                                <span className="ml-auto text-purple-400 text-xs">Connected</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="border-t border-white/20 pt-3">
                        <button
                          onClick={() => {
                            disconnectWallet();
                            setShowWalletMenu(false);
                          }}
                          className="w-full flex items-center space-x-2 p-2 rounded-lg text-left text-sm text-red-400 hover:bg-red-500/10 transition-all duration-300"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Disconnect Wallet</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
