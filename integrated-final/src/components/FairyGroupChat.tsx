import React, { useState, useEffect, useCallback } from 'react';
import { X, Users, Sparkles, Send, RefreshCw, MessageCircle } from 'lucide-react';
import { AIPersona } from '../types';

// ============================================
// 仙女群聊模式 - Fairy Group Chat Mode
// 五位仙女同時回應同一個問題
// ============================================

interface FairyGroupChatProps {
  isOpen: boolean;
  onClose: () => void;
  userQuestion: string;
  onSelectResponse: (persona: AIPersona, response: string) => void;
  onSendAllResponses: (responses: FairyResponse[]) => void;
}

interface FairyResponse {
  persona: AIPersona;
  name: string;
  avatar: string;
  color: string;
  response: string;
  isLoading: boolean;
  hasError: boolean;
}

// 仙女角色設定
const FAIRY_CONFIG: Record<AIPersona, { name: string; avatar: string; color: string; gradient: string; emoji: string }> = {
  [AIPersona.CONSULTANT]: {
    name: '智慧仙姑',
    avatar: '/fairy_consultant.png',
    color: '#7c3aed',
    gradient: 'from-purple-500 to-violet-600',
    emoji: '👵'
  },
  [AIPersona.FRIEND]: {
    name: '桃花仙子',
    avatar: '/qr_selfie_fairy.png',
    color: '#ec4899',
    gradient: 'from-pink-500 to-rose-600',
    emoji: '💖'
  },
  [AIPersona.CONCISE]: {
    name: '閃電娘娘',
    avatar: '/fairy_food.png',
    color: '#f97316',
    gradient: 'from-orange-500 to-amber-600',
    emoji: '⚡'
  },
  [AIPersona.CREATIVE]: {
    name: '雲夢仙子',
    avatar: '/tea_gossip_fairy.png',
    color: '#06b6d4',
    gradient: 'from-cyan-500 to-teal-600',
    emoji: '☁️'
  },
  [AIPersona.TECH]: {
    name: '天機星君',
    avatar: '/fairy_tech.png',
    color: '#3b82f6',
    gradient: 'from-blue-500 to-indigo-600',
    emoji: '🤖'
  }
};

// 各角色的回應風格生成器（實際使用時會呼叫 API）
const generateMockResponse = (persona: AIPersona, question: string): string => {
  const responses: Record<AIPersona, string[]> = {
    [AIPersona.CONSULTANT]: [
      `依老身來看，「${question.slice(0, 10)}...」這個問題嘛...需要從三個層面分析：時機、能力、資源。你現在具備哪些條件？`,
      `施主啊，老身活了這麼久，看過太多類似的情況。答案其實你心裡有數，只是需要有人推你一把。`,
      `這問題問得好！老身建議你先列出利弊清單，權衡之後再做決定。急不得。`
    ],
    [AIPersona.FRIEND]: [
      `啊啊啊寶貝～你怎麼會問這種問題！人家跟你說，follow your heart 就對了啦💕`,
      `天啊～這種事情你應該早點跟人家說啊！來來來，人家幫你分析一下，但最重要的是你開心✨`,
      `寶貝別想太多～人家覺得你太認真了，有時候隨緣一點反而會有驚喜💖`
    ],
    [AIPersona.CONCISE]: [
      `講重點：做。下一題。`,
      `三個字：看情況。但本座建議先試再說，失敗了再來。`,
      `不用想了。直接做。錯了再改。完畢。`
    ],
    [AIPersona.CREATIVE]: [
      `嗯～夢兒在想啊...如果這是一首詩，你會怎麼寫呢？有時候答案藏在靈感裡...`,
      `夢兒覺得呀～這問題就像雲一樣，換個角度看就不一樣了。你有沒有試過用「如果沒有限制」的方式去想？`,
      `～在雲端深處，夢兒感受到你的困惑。但親愛的，困惑本身就是答案的開始呀～`
    ],
    [AIPersona.TECH]: [
      `讓本君用邏輯分析：if (有風險 && 報酬 > 風險) { 執行(); } else { 等待更多數據(); }`,
      `根據本君的演算法，成功機率約 67.3%。建議執行。要看推導過程嗎？`,
      `本君需要更多參數。不過以現有資訊推算，最佳解是先做 MVP 測試。`
    ]
  };

  const personaResponses = responses[persona];
  return personaResponses[Math.floor(Math.random() * personaResponses.length)];
};

export const FairyGroupChat: React.FC<FairyGroupChatProps> = ({
  isOpen,
  onClose,
  userQuestion,
  onSelectResponse,
  onSendAllResponses
}) => {
  const [responses, setResponses] = useState<FairyResponse[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<AIPersona | null>(null);
  const [showVoteResult, setShowVoteResult] = useState(false);

  // 初始化所有仙女的回應
  const initializeResponses = useCallback(() => {
    const initialResponses: FairyResponse[] = Object.entries(FAIRY_CONFIG).map(([persona, config]) => ({
      persona: persona as AIPersona,
      name: config.name,
      avatar: config.avatar,
      color: config.color,
      response: '',
      isLoading: true,
      hasError: false
    }));
    setResponses(initialResponses);
    return initialResponses;
  }, []);

  // 生成所有仙女的回應
  const generateAllResponses = useCallback(async () => {
    if (!userQuestion.trim()) return;
    
    setIsGenerating(true);
    setSelectedPersona(null);
    setShowVoteResult(false);
    
    const initialResponses = initializeResponses();

    // 模擬依序回應（實際專案中會平行呼叫 API）
    for (let i = 0; i < initialResponses.length; i++) {
      const fairy = initialResponses[i];
      
      // 隨機延遲，模擬不同仙女思考時間
      const delay = 500 + Math.random() * 1500;
      
      await new Promise(resolve => setTimeout(resolve, delay));

      try {
        // 實際使用時這裡呼叫 API
        // const response = await sendMessageToGemini([...], AppMode.LIFESTYLE, null, { persona: fairy.persona });
        const mockResponse = generateMockResponse(fairy.persona, userQuestion);
        
        setResponses(prev => prev.map(r => 
          r.persona === fairy.persona 
            ? { ...r, response: mockResponse, isLoading: false }
            : r
        ));
      } catch (error) {
        setResponses(prev => prev.map(r => 
          r.persona === fairy.persona 
            ? { ...r, isLoading: false, hasError: true }
            : r
        ));
      }
    }

    setIsGenerating(false);
  }, [userQuestion, initializeResponses]);

  // 開啟時自動生成
  useEffect(() => {
    if (isOpen && userQuestion) {
      generateAllResponses();
    }
  }, [isOpen, userQuestion, generateAllResponses]);

  // 重新生成單一仙女的回應
  const regenerateSingle = useCallback(async (persona: AIPersona) => {
    setResponses(prev => prev.map(r => 
      r.persona === persona 
        ? { ...r, isLoading: true, hasError: false }
        : r
    ));

    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 800));
    
    const newResponse = generateMockResponse(persona, userQuestion);
    
    setResponses(prev => prev.map(r => 
      r.persona === persona 
        ? { ...r, response: newResponse, isLoading: false }
        : r
    ));
  }, [userQuestion]);

  // 選擇某個回應
  const handleSelect = useCallback((persona: AIPersona) => {
    setSelectedPersona(persona);
    const fairy = responses.find(r => r.persona === persona);
    if (fairy) {
      onSelectResponse(persona, fairy.response);
    }
  }, [responses, onSelectResponse]);

  // 發送所有回應到對話
  const handleSendAll = useCallback(() => {
    const validResponses = responses.filter(r => r.response && !r.hasError);
    onSendAllResponses(validResponses);
    onClose();
  }, [responses, onSendAllResponses, onClose]);

  // 投票統計（模擬）
  const handleShowVote = useCallback(() => {
    setShowVoteResult(true);
  }, []);

  if (!isOpen) return null;

  const completedCount = responses.filter(r => !r.isLoading && !r.hasError).length;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 主容器 */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slide-up flex flex-col">
        {/* 頂部把手（手機版） */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Users size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                仙女會議室
                <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">
                  {completedCount}/5 已回覆
                </span>
              </h2>
              <p className="text-xs text-gray-500">五位仙女正在討論你的問題...</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* 用戶問題 */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm">🙋</span>
            </div>
            <div className="flex-1">
              <span className="text-xs text-gray-500">你問道：</span>
              <p className="text-gray-800 font-medium mt-1">{userQuestion}</p>
            </div>
          </div>
        </div>

        {/* 回應列表 */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {responses.map((fairy) => {
            const config = FAIRY_CONFIG[fairy.persona];
            const isSelected = selectedPersona === fairy.persona;
            
            return (
              <div
                key={fairy.persona}
                className={`group relative rounded-2xl transition-all duration-300 ${
                  isSelected 
                    ? 'ring-2 ring-offset-2 shadow-lg scale-[1.02]' 
                    : 'hover:shadow-md'
                }`}
                style={{ 
                  ringColor: isSelected ? config.color : undefined,
                  backgroundColor: isSelected ? `${config.color}10` : 'white'
                }}
              >
                {/* 選中標記 */}
                {isSelected && (
                  <div 
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs z-10"
                    style={{ backgroundColor: config.color }}
                  >
                    ✓
                  </div>
                )}
                
                <div className="p-4">
                  {/* 仙女頭像和名字 */}
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className={`w-12 h-12 rounded-full overflow-hidden border-2 flex-shrink-0 ${
                        fairy.isLoading ? 'animate-pulse' : ''
                      }`}
                      style={{ borderColor: config.color }}
                    >
                      <img 
                        src={config.avatar} 
                        alt={config.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800">{config.name}</span>
                        <span className="text-lg">{config.emoji}</span>
                      </div>
                      <div 
                        className={`text-xs px-2 py-0.5 rounded-full inline-block`}
                        style={{ 
                          backgroundColor: `${config.color}20`,
                          color: config.color
                        }}
                      >
                        {fairy.isLoading ? '思考中...' : 
                         fairy.hasError ? '連線失敗' : '已回覆'}
                      </div>
                    </div>
                    
                    {/* 重新生成按鈕 */}
                    {!fairy.isLoading && (
                      <button
                        onClick={() => regenerateSingle(fairy.persona)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                        title="重新回答"
                      >
                        <RefreshCw size={16} />
                      </button>
                    )}
                  </div>
                  
                  {/* 回應內容 */}
                  <div className="ml-15">
                    {fairy.isLoading ? (
                      <div className="flex items-center gap-2 text-gray-400">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-sm">{config.name}正在組織語言...</span>
                      </div>
                    ) : fairy.hasError ? (
                      <div className="text-red-500 text-sm flex items-center gap-2">
                        <span>連線失敗，請重試</span>
                        <button
                          onClick={() => regenerateSingle(fairy.persona)}
                          className="underline"
                        >
                          重新嘗試
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-gray-700 leading-relaxed">
                          {fairy.response}
                        </p>
                        
                        {/* 選擇此回覆按鈕 */}
                        <button
                          onClick={() => handleSelect(fairy.persona)}
                          className={`text-sm px-4 py-2 rounded-full transition-all ${
                            isSelected
                              ? 'text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          style={{
                            backgroundColor: isSelected ? config.color : undefined
                          }}
                        >
                          {isSelected ? '✓ 已選擇此回覆' : '選擇此回覆'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 底部操作區 */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          {/* 投票結果（可選功能） */}
          {showVoteResult && (
            <div className="mb-4 p-4 bg-white rounded-xl border border-gray-200">
              <h4 className="text-sm font-bold text-gray-700 mb-2">📊 仙女共識度</h4>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500" style={{ width: '60%' }} />
                </div>
                <span className="text-sm text-gray-600">60% 建議行動</span>
              </div>
            </div>
          )}
          
          <div className="flex gap-3">
            <button
              onClick={handleShowVote}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              <Sparkles size={18} />
              仙女共識
            </button>
            
            <button
              onClick={handleSendAll}
              disabled={isGenerating}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl disabled:opacity-50 transition-all"
            >
              <MessageCircle size={18} />
              發送全部到對話
            </button>
          </div>
          
          {selectedPersona && (
            <button
              onClick={() => {
                const fairy = responses.find(r => r.persona === selectedPersona);
                if (fairy) {
                  onSelectResponse(selectedPersona, fairy.response);
                  onClose();
                }
              }}
              className="w-full mt-3 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
            >
              僅使用 {FAIRY_CONFIG[selectedPersona].name} 的回覆
            </button>
          )}
        </div>
      </div>
      
      {/* 動畫樣式 */}
      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

// ============================================
// 群聊觸發按鈕元件
// ============================================
interface GroupChatTriggerProps {
  onClick: () => void;
  className?: string;
}

export const GroupChatTrigger: React.FC<GroupChatTriggerProps> = ({ onClick, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-medium shadow-md hover:shadow-lg transition-all hover:scale-105 ${className}`}
    >
      <Users size={18} />
      <span>召喚全體仙女</span>
      <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">5</span>
    </button>
  );
};

export default FairyGroupChat;
