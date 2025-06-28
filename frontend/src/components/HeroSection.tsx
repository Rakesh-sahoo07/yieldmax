
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, TrendingUp, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { useWallet } from "@/contexts/WalletContext";

const HeroSection = () => {
  const { isConnected, connectWallet, isConnecting } = useWallet();

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-700/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full blur-3xl animate-spin-slow"></div>
        
        {/* Floating Particles */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-purple-400 rounded-full animate-float opacity-60"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-blue-400 rounded-full animate-bounce delay-300 opacity-70"></div>
        <div className="absolute bottom-32 left-16 w-3 h-3 bg-purple-300 rounded-full animate-pulse delay-700 opacity-50"></div>
        <div className="absolute top-60 left-1/3 w-1.5 h-1.5 bg-white rounded-full animate-float delay-1000 opacity-80"></div>
        <div className="absolute bottom-40 right-20 w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-500 opacity-60"></div>
        <div className="absolute top-32 right-1/4 w-1 h-1 bg-blue-300 rounded-full animate-pulse delay-200 opacity-70"></div>
        
        {/* Moving Grid Lines */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-purple-500 to-transparent animate-pulse"></div>
          <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-blue-500 to-transparent animate-pulse delay-500"></div>
          <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-pulse delay-300"></div>
          <div className="absolute bottom-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse delay-700"></div>
        </div>
      </div>

      <div className="container mx-auto px-6 text-center relative z-10">
        {/* Enhanced AI Mascot Animation */}
        <div className="mb-8 relative">
          <div className="inline-flex items-center justify-center w-32 h-32 glass rounded-full mb-6 animate-float relative">
            {/* Rotating Ring */}
            <div className="absolute inset-0 rounded-full border-2 border-purple-400/30 animate-spin-slow"></div>
            <div className="absolute inset-2 rounded-full border border-blue-400/20 animate-spin-slow" style={{ animationDirection: 'reverse' }}></div>
            
            <div className="relative z-10">
              {/* Enhanced AI Brain Icon */}
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center animate-glow relative">
                <Zap className="w-8 h-8 text-white animate-pulse" />
                
                {/* Pulsing Energy Rings */}
                <div className="absolute inset-0 rounded-full border-2 border-purple-300/50 animate-ping"></div>
                <div className="absolute inset-0 rounded-full border border-white/30 animate-pulse delay-500"></div>
              </div>
              
              {/* Enhanced Swapping Coins Animation */}
              <div className="absolute -top-6 -left-8 w-7 h-7 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white animate-bounce shadow-lg shadow-blue-500/50">
                <span className="animate-pulse">ETH</span>
              </div>
              <div className="absolute -bottom-6 -right-8 w-7 h-7 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-xs font-bold text-white animate-bounce delay-500 shadow-lg shadow-red-500/50">
                <span className="animate-pulse delay-300">AVAX</span>
              </div>
              
              {/* Enhanced Connecting Lines with Animation */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-20 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 animate-pulse relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-white to-red-400 animate-pulse delay-300 opacity-70"></div>
                </div>
                
                {/* Animated Data Flow Dots */}
                <div className="absolute top-1/2 left-0 w-1 h-1 bg-white rounded-full animate-ping transform -translate-y-1/2"></div>
                <div className="absolute top-1/2 right-0 w-1 h-1 bg-white rounded-full animate-ping delay-700 transform -translate-y-1/2"></div>
              </div>
              
              {/* Orbital Elements */}
              <div className="absolute inset-0 animate-spin-slow">
                <div className="absolute -top-4 left-1/2 w-1 h-1 bg-purple-400 rounded-full transform -translate-x-1/2"></div>
                <div className="absolute -bottom-4 left-1/2 w-1 h-1 bg-blue-400 rounded-full transform -translate-x-1/2"></div>
                <div className="absolute top-1/2 -left-4 w-1 h-1 bg-white rounded-full transform -translate-y-1/2"></div>
                <div className="absolute top-1/2 -right-4 w-1 h-1 bg-purple-300 rounded-full transform -translate-y-1/2"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Hero Content */}
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
            <span className="gradient-text neon-glow animate-pulse">AI-Powered</span>
            <br />
            <span className="text-white animate-fade-in">Cross-Chain</span>
            <br />
            <span className="gradient-text neon-glow animate-pulse delay-500">Yield Optimizer</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-300 mb-6 leading-relaxed animate-fade-in delay-300">
            Maximize your USDC yields across Ethereum and Avalanche with our 
            intelligent AI that automatically finds the best rates and executes 
            cross-chain strategies for optimal returns.
          </p>
          
          {/* Enhanced Key Features */}
          <div className="flex flex-wrap justify-center gap-4">
            <div className="glass glass-hover rounded-lg px-6 py-3 flex items-center space-x-3 animate-fade-in delay-500 hover:scale-105 transition-transform duration-300">
              <TrendingUp className="w-5 h-5 text-purple-400 animate-bounce" />
              <span className="text-white font-medium">Up to 15% APY</span>
            </div>
            <div className="glass glass-hover rounded-lg px-6 py-3 flex items-center space-x-3 animate-fade-in delay-700 hover:scale-105 transition-transform duration-300">
              <Zap className="w-5 h-5 text-purple-400 animate-pulse" />
              <span className="text-white font-medium">Auto-Optimization</span>
            </div>
            <div className="glass glass-hover rounded-lg px-6 py-3 flex items-center space-x-3 animate-fade-in delay-1000 hover:scale-105 transition-transform duration-300">
              <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-red-500 rounded-full animate-pulse"></div>
              <span className="text-white font-medium">Cross-Chain</span>
            </div>
          </div>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            {!isConnected ? (
              <>
                <Button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="glass-hover glow-border bg-gradient-to-r from-purple-500 to-purple-700 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-300 flex items-center space-x-2 hover:scale-105"
                >
                  <Wallet className="w-5 h-5" />
                  <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
                </Button>
                <Link to="/dashboard">
                  <Button
                    variant="outline"
                    className="glass-hover border-purple-500/50 text-purple-400 font-semibold px-8 py-3 rounded-lg transition-all duration-300 flex items-center space-x-2 hover:scale-105 hover:bg-purple-500/10"
                  >
                    <span>View Dashboard</span>
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </>
            ) : (
              <Link to="/dashboard">
                <Button
                  className="glass-hover glow-border bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-300 flex items-center space-x-2 hover:scale-105"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
