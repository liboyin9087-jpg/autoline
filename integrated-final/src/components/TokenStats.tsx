import React from 'react';
import { Zap, TrendingUp, AlertTriangle, Calendar } from 'lucide-react';
import { AppSettings } from '../types';

interface TokenStatsProps {
  settings: AppSettings;
  currentSessionTokens: number;
}

export const TokenStats: React.FC<TokenStatsProps> = ({ settings, currentSessionTokens }) => {
  const dailyLimit = settings.dailyTokenLimit || 50000;
  const stats = settings.tokenUsageStats || [];
  
  // 計算今日使用量
  const today = new Date().toISOString().split('T')[0];
  const todayStats = stats.find(s => s.date === today);
  const todayUsage = (todayStats?.tokens || 0) + currentSessionTokens;
  
  // 計算使用率
  const usagePercentage = Math.min((todayUsage / dailyLimit) * 100, 100);
  
  // 計算本週使用量
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoStr = weekAgo.toISOString().split('T')[0];
  const weekUsage = stats
    .filter(s => s.date >= weekAgoStr)
    .reduce((sum, s) => sum + s.tokens, 0) + currentSessionTokens;
  
  // 預估本月費用（假設 1000 tokens = $0.002）
  const estimatedCost = (todayUsage / 1000) * 0.002;
  
  return (
    <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-4 rounded-2xl border border-yellow-200">
      {/* 標題 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-yellow-400 rounded-lg">
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800">Token 使用統計</h3>
            <p className="text-xs text-gray-500">今日用量監控</p>
          </div>
        </div>
        <Calendar size={16} className="text-gray-400" />
      </div>
      
      {/* 今日使用進度條 */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-600 font-medium">今日使用</span>
          <span className="text-xs font-mono text-gray-800 font-bold">
            {todayUsage.toLocaleString()} / {dailyLimit.toLocaleString()}
          </span>
        </div>
        <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-yellow-200">
          <div
            className={`h-full transition-all duration-500 ${
              usagePercentage >= 90
                ? 'bg-gradient-to-r from-red-400 to-red-500'
                : usagePercentage >= 70
                ? 'bg-gradient-to-r from-orange-400 to-orange-500'
                : 'bg-gradient-to-r from-yellow-400 to-yellow-500'
            }`}
            style={{ width: `${usagePercentage}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-[10px] text-gray-500">約 {Math.ceil(todayUsage / 2)} 字</span>
          <span className="text-[10px] text-gray-500">{usagePercentage.toFixed(1)}% 已使用</span>
        </div>
      </div>
      
      {/* 警告提示 */}
      {usagePercentage >= 80 && (
        <div className="mb-4 p-3 bg-orange-100 border border-orange-300 rounded-lg flex items-start gap-2">
          <AlertTriangle size={16} className="text-orange-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-orange-800 mb-1">接近每日上限</p>
            <p className="text-[10px] text-orange-700">
              建議使用「閃電娘娘」模式以節省 Token 用量
            </p>
          </div>
        </div>
      )}
      
      {/* 統計數據 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-3 rounded-xl border border-yellow-100">
          <div className="flex items-center gap-1 mb-1">
            <TrendingUp size={12} className="text-yellow-600" />
            <span className="text-[10px] text-gray-500 font-medium">本週累計</span>
          </div>
          <p className="text-lg font-bold text-gray-800">{(weekUsage / 1000).toFixed(1)}K</p>
          <p className="text-[10px] text-gray-500 mt-1">約 {Math.ceil(weekUsage / 2)} 字</p>
        </div>
        
        <div className="bg-white p-3 rounded-xl border border-yellow-100">
          <div className="flex items-center gap-1 mb-1">
            <Zap size={12} className="text-yellow-600" />
            <span className="text-[10px] text-gray-500 font-medium">預估成本</span>
          </div>
          <p className="text-lg font-bold text-gray-800">${estimatedCost.toFixed(3)}</p>
          <p className="text-[10px] text-gray-500 mt-1">今日累計</p>
        </div>
      </div>
      
      {/* 節省建議 */}
      <div className="mt-4 p-3 bg-white rounded-lg border border-yellow-100">
        <p className="text-xs font-medium text-gray-700 mb-2">💡 節省 Token 小技巧</p>
        <ul className="text-[10px] text-gray-600 space-y-1">
          <li>• 使用「閃電娘娘」模式可節省 87.5% 用量</li>
          <li>• 提問時直接說重點，避免冗長描述</li>
          <li>• 適時重置對話以清除歷史記錄</li>
        </ul>
      </div>
    </div>
  );
};
