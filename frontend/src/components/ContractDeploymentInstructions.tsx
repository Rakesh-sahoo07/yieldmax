import { Code, Terminal, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContractDeploymentInstructionsProps {
  networkName: string;
  chainId: number;
}

const ContractDeploymentInstructions: React.FC<ContractDeploymentInstructionsProps> = ({ 
  networkName, 
  chainId 
}) => {
  const deployCommand = chainId === 11155111 ? "npm run deploy:sepolia" : "npm run deploy:amoy";
  
  return (
    <div className="glass rounded-lg p-6 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <Terminal className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-white mb-2">Smart Contracts Not Deployed</h2>
        <p className="text-gray-400 text-sm">
          The YieldVault contracts are not yet deployed on {networkName}. 
          Deploy them to start using the application.
        </p>
      </div>

      <div className="space-y-4">
        <div className="glass rounded-lg p-4 bg-gradient-to-r from-yellow-500/10 to-yellow-700/10 border border-yellow-500/30">
          <h3 className="text-white font-medium mb-2 flex items-center space-x-2">
            <Code className="w-4 h-4 text-yellow-400" />
            <span>Deployment Steps</span>
          </h3>
          
          <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
            <li>Navigate to the smartcontract directory</li>
            <li>Set up your environment variables (.env file)</li>
            <li>Run the deployment command</li>
            <li>Update the contract addresses in the frontend</li>
          </ol>
        </div>

        <div className="glass rounded-lg p-4">
          <h4 className="text-white font-medium mb-2">Deployment Command:</h4>
          <div className="bg-black/50 rounded p-3 font-mono text-sm text-green-400">
            cd ../smartcontract && {deployCommand}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <a 
            href="https://docs.chain.link/ccip" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-2 glass-hover border border-purple-500/50 text-purple-400 font-medium px-4 py-3 rounded-lg text-sm transition-all duration-300 hover:bg-purple-500/10"
          >
            <span>Chainlink CCIP Docs</span>
            <ExternalLink className="w-4 h-4" />
          </a>
          
          <a 
            href="https://faucets.chain.link/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-2 glass-hover border border-blue-500/50 text-blue-400 font-medium px-4 py-3 rounded-lg text-sm transition-all duration-300 hover:bg-blue-500/10"
          >
            <span>Get Test Tokens</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <div className="text-center text-xs text-gray-500 mt-4">
          <p>Make sure you have testnet ETH/MATIC and LINK tokens before deploying</p>
        </div>
      </div>
    </div>
  );
};

export default ContractDeploymentInstructions; 