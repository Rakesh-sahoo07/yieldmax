import React from 'react';
import { useAI } from '@/contexts/AIContext';
import { Brain, TrendingUp, AlertTriangle, Zap, Target, RefreshCw } from 'lucide-react';

const AIInsights: React.FC = () => {
  const { insights, isLoadingInsights, refreshInsights } = useAI();

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'rebalance':
        return <Target className="w-3 h-3" />;
      case 'opportunity':
        return <TrendingUp className="w-3 h-3" />;
      case 'warning':
        return <AlertTriangle className="w-3 h-3" />;
      case 'optimization':
        return <Zap className="w-3 h-3" />;
      default:
        return <Brain className="w-3 h-3" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'rebalance':
        return 'text-cyan-400';
      case 'opportunity':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'optimization':
        return 'text-purple-400';
      default:
        return 'text-cyan-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-300';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'low':
        return 'bg-green-500/20 text-green-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours > 0) {
      return `${hours}h ago`;
    } else {
      return `${minutes}m ago`;
    }
  };

  return (
    <div className="glass rounded-lg p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <span>🤖 AI Portfolio Insights</span>
            </h3>
            <p className="text-gray-400 text-xs">Powered by Amazon Bedrock</p>
          </div>
        </div>
        <button
          onClick={refreshInsights}
          disabled={isLoadingInsights}
          className="flex items-center gap-1 px-3 py-1 glass glass-hover text-purple-400 rounded transition-all duration-200"
        >
          <RefreshCw className={`w-3 h-3 ${isLoadingInsights ? 'animate-spin' : ''}`} />
          <span className="text-xs">Refresh</span>
        </button>
      </div>

      <div className="space-y-2 overflow-y-auto flex-1 pr-2">
        {isLoadingInsights ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-lg p-3 animate-pulse">
                <div className="h-3 bg-purple-500/20 rounded w-3/4 mb-2"></div>
                <div className="h-2 bg-purple-500/10 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {insights.map((insight) => (
              <div
                key={insight.id}
                className="glass rounded-lg p-3 hover:bg-white/15 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1 glass rounded ${getInsightColor(insight.type)}`}>
                      {getInsightIcon(insight.type)}
                    </div>
                    <div>
                      <h4 className="font-medium text-white text-sm">{insight.title}</h4>
                      <p className="text-gray-400 text-xs">{insight.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(insight.priority)}`}>
                      {insight.priority.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatTimeAgo(insight.timestamp)}
                    </span>
                  </div>
                </div>

                <div className="ml-6 space-y-1">
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-medium text-gray-400 min-w-fit">Action:</span>
                    <span className="text-xs text-white font-medium">{insight.action}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-medium text-gray-400 min-w-fit">Impact:</span>
                    <span className="text-xs text-green-400 font-medium">{insight.impact}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-400">Confidence:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-cyan-500 rounded-full transition-all duration-300"
                          style={{ width: `${insight.confidence}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-white font-medium">{insight.confidence}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {!isLoadingInsights && insights.length === 0 && (
          <div className="glass rounded-lg p-6 text-center">
            <Brain className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <div className="text-gray-400 text-sm">No AI insights available</div>
            <button
              onClick={refreshInsights}
              className="mt-2 text-purple-400 hover:text-purple-300 transition-colors text-xs"
            >
              Generate new insights
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsights; 