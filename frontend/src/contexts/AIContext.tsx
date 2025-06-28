import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';

// AI Insight interfaces
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

interface AIContextType {
  insights: AIInsight[];
  isLoadingInsights: boolean;
  isAIEnabled: boolean;
  refreshInsights: () => Promise<void>;
  generateBedrockInsights: (portfolioData: PortfolioData) => Promise<AIInsight[]>;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

interface AIProviderProps {
  children: ReactNode;
}

export const AIProvider: React.FC<AIProviderProps> = ({ children }) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [isAIEnabled] = useState(true); // For now, always enabled

  // Dummy AI insights - will be replaced with actual Bedrock API calls
  const generateDummyInsights = (): AIInsight[] => {
    const dummyInsights: AIInsight[] = [
      {
        id: '1',
        type: 'rebalance',
        title: 'Optimize Protocol Allocation',
        description: 'Current Aave allocation shows lower yields compared to Compound',
        action: 'Move 30% from Aave to Compound protocol',
        impact: '+2.3% estimated APY increase',
        confidence: 85,
        priority: 'high',
        timestamp: Date.now() - 1000 * 60 * 15 // 15 minutes ago
      },
      {
        id: '2',
        type: 'opportunity',
        title: 'Staking Opportunity Detected',
        description: 'Lending protocols showing saturation, staking offers better returns',
        action: 'Move 15% from lending to staking protocols',
        impact: '+1.8% potential yield boost',
        confidence: 72,
        priority: 'medium',
        timestamp: Date.now() - 1000 * 60 * 45 // 45 minutes ago
      },
      {
        id: '3',
        type: 'optimization',
        title: 'Cross-Chain Arbitrage',
        description: 'Avalanche yield farming showing 4.2% higher returns than Ethereum',
        action: 'Consider moving 25% to Avalanche Fuji',
        impact: '+4.2% cross-chain yield advantage',
        confidence: 68,
        priority: 'medium',
        timestamp: Date.now() - 1000 * 60 * 120 // 2 hours ago
      },
      {
        id: '4',
        type: 'warning',
        title: 'Liquidity Pool Risk Assessment',
        description: 'Current liquidity pool exposure may be too concentrated',
        action: 'Diversify 20% to yield farming strategies',
        impact: 'Reduced portfolio risk exposure',
        confidence: 78,
        priority: 'low',
        timestamp: Date.now() - 1000 * 60 * 180 // 3 hours ago
      }
    ];

    // Randomly select 2-3 insights to show
    const shuffled = dummyInsights.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.floor(Math.random() * 2) + 2);
  };

  // Future Amazon Bedrock integration function
  const generateBedrockInsights = async (portfolioData: PortfolioData): Promise<AIInsight[]> => {
    // TODO: Implement actual Amazon Bedrock API call
    // This will analyze portfolio data and return AI-generated insights
    
    const bedrockClient = new BedrockRuntimeClient({
      region: 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });

    const prompt = `
      Analyze the following DeFi portfolio data and provide optimization recommendations:
      ${JSON.stringify(portfolioData)}
      
      Provide insights on:
      1. Protocol rebalancing opportunities
      2. Yield optimization strategies
      3. Risk management suggestions
      4. Cross-chain opportunities
    `;

    const response = await bedrockClient.invokeModel({
      modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    return parseBedrockResponse(response);

    // For now, return dummy insights
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
    return generateDummyInsights();
  };

  const refreshInsights = async () => {
    setIsLoadingInsights(true);
    try {
      // For now, use dummy data
      const newInsights = generateDummyInsights();
      setInsights(newInsights);
      console.log('🤖 AI Insights refreshed:', newInsights.length, 'insights generated');
    } catch (error) {
      console.error('Error generating AI insights:', error);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  // Initialize insights on mount
  useEffect(() => {
    refreshInsights();
  }, []);

  const value: AIContextType = {
    insights,
    isLoadingInsights,
    isAIEnabled,
    refreshInsights,
    generateBedrockInsights,
  };

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = (): AIContextType => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
}; 