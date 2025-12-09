import React, { useState, useEffect } from 'react';
import { CheckCircle2, Sparkles, Zap, TrendingDown } from 'lucide-react';
import { AIPersona } from '../types';

interface PersonaData {
  name: string;
  img: string;
  color: string;
  description: string;
  tokenLimit?: number;
  savings?: number;
  recommended?: boolean;
}

interface PersonaSelectorProps {
  selected: AIPersona;
  onSelect: (persona: AIPersona) => void;
  personaData: Record<AIPersona, PersonaData>;
}

export const PersonaSelector: React.FC<PersonaSelectorProps> = ({ selected, onSelect, personaData }) => {
  const [hoveredPersona, setHoveredPersona] = useState<AIPersona | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Token 節省率配置
  const tokenSavings: Record<AIPersona, number> = {
    [AIPersona.CONCISE]: 87.5,
    [AIPersona.FRIEND]: 75,
    [AIPersona.CONSULTANT]: 60,
    [AIPersona.CREATIVE]: 35,
    [AIPersona.TECH]: 25,
  };
  
  // 推薦角色（新手友善）
  const recommendedPersonas: AIPersona[] = [AIPersona.FRIEND, AIPersona.CONSULTANT];
  
  const personas = Object.entries(personaData) as [AIPersona, PersonaData][];
  
  // 組件進入動畫
  useEffect(() => {
    setIsAnimating(true);
  }, []);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-2 mb-6">
        <Sparkles size={18} className="text-yellow-500 animate-pulse" />
        <h3 className="text-lg font-bold text-gray-800">選擇您的專屬仙女</h3>
        <Sparkles size={18} className="text-yellow-500 animate-pulse" />
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {personas.map(([id, data], index) => {
          const isSelected = selected === id;
          const isHovered = hoveredPersona === id;
          const savings = tokenSavings[id] || 0;
          const isRecommended = recommendedPersonas.includes(id);
          
          return (
            <button
              key={id}
              onClick={() => onSelect(id)}
              onMouseEnter={() => setHoveredPersona(id)}
              onMouseLeave={() => setHoveredPersona(null)}
              className={`
                relative overflow-hidden
                flex items-center gap-4 p-4
                rounded-2xl border-2
                transition-all duration-300
                ${isAnimating ? 'animate-fade-in-up' : ''}
                ${isSelected 
                  ? 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-amber-50 shadow-lg scale-[1.02]' 
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }
              `}
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              {/* 推薦標籤 */}
              {isRecommended && !isSelected && (
                <div className="absolute top-2 right-2 z-20 px-2 py-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1 animate-bounce">
                  <Sparkles size={12} />
                  推薦
                </div>
              )}
              
              {/* 選中側邊框 */}
              {isSelected && (
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                  style={{ backgroundColor: data.color }}
                />
              )}
              {/* 背景光暈效果 */}
              <div 
                className={`
                  absolute inset-0 opacity-0 transition-opacity duration-500
                  ${(isSelected || isHovered) && 'opacity-100'}
                `}
                style={{
                  background: `radial-gradient(circle at 80% 50%, ${data.color}15, transparent 70%)`
                }}
              />
              
              {/* 角色圖片 */}
              <div className={`
                relative z-10 w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0
                shadow-lg
                transition-transform duration-300
                ${(isSelected || isHovered) && 'scale-110'}
              `}>
                <img 
                  src={data.img} 
                  alt={data.name}
                  className="w-full h-full object-cover"
                />
                {/* 選中標記 */}
                {isSelected && (
                  <div className="absolute inset-0 bg-yellow-400/20 flex items-center justify-center">
                    <CheckCircle2 
                      size={32} 
                      className="text-yellow-500 drop-shadow-lg" 
                      fill="white"
                    />
                  </div>
                )}
              </div>
              
              {/* 文字資訊 */}
              <div className="relative z-10 flex-1 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={`
                    text-lg font-bold transition-colors
                    ${isSelected ? 'text-yellow-600' : 'text-gray-800'}
                  `}>
                    {data.name}
                  </h4>
                  {isSelected && (
                    <span className="px-2 py-0.5 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-full">
                      當前選擇
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {data.description}
                </p>
                
                {/* 模式標籤與 Token 節省率 */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: data.color }}
                    />
                    <span className="text-xs text-gray-500">
                      {id === AIPersona.CONSULTANT && '邏輯推理模式'}
                      {id === AIPersona.FRIEND && '情感支持模式'}
                      {id === AIPersona.CONCISE && '高效簡潔模式'}
                      {id === AIPersona.CREATIVE && '創意發想模式'}
                      {id === AIPersona.TECH && '技術專家模式'}
                    </span>
                  </div>
                  
                  {/* Token 節省率標籤 */}
                  <div className={`
                    flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                    ${savings >= 60 
                      ? 'bg-green-100 text-green-700' 
                      : savings >= 30 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-700'
                    }
                  `}>
                    <TrendingDown size={12} />
                    <span>省 {savings}%</span>
                  </div>
                </div>
              </div>
              
              {/* 右側箭頭 */}
              <div className={`
                relative z-10 text-gray-400 transition-all duration-300
                ${(isSelected || isHovered) && 'text-yellow-500 translate-x-1'}
              `}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </div>
            </button>
          );
        })}
      </div>
      
      {/* 提示文字 */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
        <p className="text-xs text-gray-600 text-center leading-relaxed">
          💡 <span className="font-medium">小提示：</span>
          不同仙女擅長的領域不同，您可以隨時切換以獲得最佳體驗
        </p>
      </div>
    </div>
  );
};
