import React, { useState, useEffect } from 'react';
import { Cloud, Sparkles, Star, X } from 'lucide-react';
import { AIPersona } from '../types';

interface DailyLoginData {
  fairy: AIPersona;
  fairyName: string;
  fairyColor: string;
  luckyTime: string;
  luckyColor: string;
  taboo: string;
  fortune: string;
}

interface DailyLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFairy: (persona: AIPersona) => void;
  defaultFairy: AIPersona;
}

const PERSONA_NAMES = {
  [AIPersona.CONSULTANT]: "智慧仙姑",
  [AIPersona.FRIEND]: "桃花仙子",
  [AIPersona.CONCISE]: "閃電娘娘",
  [AIPersona.CREATIVE]: "雲夢仙子",
  [AIPersona.TECH]: "天機星君"
};

const PERSONA_COLORS = {
  [AIPersona.CONSULTANT]: "#7c3aed",
  [AIPersona.FRIEND]: "#ec4899",
  [AIPersona.CONCISE]: "#f97316",
  [AIPersona.CREATIVE]: "#06b6d4",
  [AIPersona.TECH]: "#3b82f6"
};

const LUCKY_TIMES = [
  "上午 7:00-9:00 (辰時)",
  "上午 9:00-11:00 (巳時)",
  "中午 11:00-13:00 (午時)",
  "下午 13:00-15:00 (未時)",
  "下午 15:00-17:00 (申時)",
  "下午 17:00-19:00 (酉時)",
  "晚上 19:00-21:00 (戌時)",
  "晚上 21:00-23:00 (亥時)"
];

const LUCKY_COLORS = [
  { name: "金黃色", color: "#fbbf24", emoji: "💛" },
  { name: "桃花粉", color: "#f9a8d4", emoji: "💗" },
  { name: "天空藍", color: "#38bdf8", emoji: "💙" },
  { name: "翡翠綠", color: "#4ade80", emoji: "💚" },
  { name: "紫霞紅", color: "#c084fc", emoji: "💜" },
  { name: "珊瑚橙", color: "#fb923c", emoji: "🧡" },
  { name: "銀月白", color: "#e5e7eb", emoji: "🤍" }
];

const TABOOS = [
  "不宜加班",
  "不宜熬夜",
  "不宜爭執",
  "不宜暴食",
  "不宜購物",
  "不宜久坐",
  "不宜煩憂",
  "不宜拖延"
];

const FORTUNES = [
  "今日運勢極佳，諸事順心",
  "平安吉祥，貴人相助",
  "宜靜不宜動，守得雲開",
  "桃花運旺，人緣極佳",
  "財運亨通，投資有成",
  "創意靈感湧現，大展身手",
  "工作順利，上司賞識",
  "學業進步，考運佳"
];

const generateDailyData = (date: Date, defaultFairy: AIPersona): DailyLoginData => {
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  
  // 使用日期作為種子來產生每日固定的隨機結果
  const pseudoRandom = (index: number) => {
    return Math.abs(Math.sin(seed * (index + 1)) * 10000) % 1;
  };
  
  const luckyColorIndex = Math.floor(pseudoRandom(1) * LUCKY_COLORS.length);
  const luckyColor = LUCKY_COLORS[luckyColorIndex];
  
  return {
    fairy: defaultFairy,
    fairyName: PERSONA_NAMES[defaultFairy],
    fairyColor: PERSONA_COLORS[defaultFairy],
    luckyTime: LUCKY_TIMES[Math.floor(pseudoRandom(2) * LUCKY_TIMES.length)],
    luckyColor: `${luckyColor.emoji} ${luckyColor.name}`,
    taboo: TABOOS[Math.floor(pseudoRandom(3) * TABOOS.length)],
    fortune: FORTUNES[Math.floor(pseudoRandom(4) * FORTUNES.length)]
  };
};

export const DailyLoginModal: React.FC<DailyLoginModalProps> = ({ 
  isOpen, 
  onClose, 
  onSelectFairy,
  defaultFairy 
}) => {
  const [dailyData, setDailyData] = useState<DailyLoginData>(
    generateDailyData(new Date(), defaultFairy)
  );
  const [isChangingFairy, setIsChangingFairy] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDailyData(generateDailyData(new Date(), defaultFairy));
      setIsChangingFairy(false);
    }
  }, [isOpen, defaultFairy]);

  const handleChangeFairy = () => {
    const fairies = Object.values(AIPersona);
    const currentIndex = fairies.indexOf(dailyData.fairy);
    const nextIndex = (currentIndex + 1) % fairies.length;
    const nextFairy = fairies[nextIndex];
    
    setDailyData({
      ...dailyData,
      fairy: nextFairy,
      fairyName: PERSONA_NAMES[nextFairy],
      fairyColor: PERSONA_COLORS[nextFairy]
    });
  };

  const handleEnter = () => {
    onSelectFairy(dailyData.fairy);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-3xl shadow-2xl border-2 border-white/60 overflow-hidden animate-in zoom-in-95 duration-300">
        {/* 裝飾性雲朵背景 */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <Cloud className="absolute top-4 left-4 w-16 h-16 text-purple-400" />
          <Cloud className="absolute top-8 right-8 w-12 h-12 text-pink-400" />
          <Cloud className="absolute bottom-8 left-12 w-14 h-14 text-blue-400" />
        </div>

        {/* 標題區域 */}
        <div className="relative pt-8 pb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Cloud className="w-6 h-6 text-purple-500" />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              仙宮早安
            </h2>
            <Cloud className="w-6 h-6 text-pink-500" />
          </div>
          <div className="flex items-center justify-center gap-1">
            <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
            <p className="text-sm text-gray-600">
              {new Date().toLocaleDateString('zh-TW', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
              })}
            </p>
            <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
          </div>
        </div>

        {/* 內容區域 */}
        <div className="relative px-8 pb-8 space-y-4">
          {/* 今日值班仙女 */}
          <div className="p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/80 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">今日值班仙女</span>
              <button
                onClick={handleChangeFairy}
                className="text-xs text-purple-600 hover:text-purple-700 font-medium underline"
              >
                換一位
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-md"
                style={{ backgroundColor: dailyData.fairyColor + '20' }}
              >
                <Star className="w-6 h-6" style={{ color: dailyData.fairyColor }} />
              </div>
              <div>
                <div className="font-bold text-lg" style={{ color: dailyData.fairyColor }}>
                  {dailyData.fairyName}
                </div>
                <div className="text-xs text-gray-500">
                  {dailyData.fortune}
                </div>
              </div>
            </div>
          </div>

          {/* 今日運勢資訊 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-white/50 rounded-xl border border-white/60">
              <span className="text-sm text-gray-600">⏰ 今日吉時</span>
              <span className="text-sm font-medium text-gray-800">{dailyData.luckyTime}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white/50 rounded-xl border border-white/60">
              <span className="text-sm text-gray-600">🎨 今日幸運色</span>
              <span className="text-sm font-medium text-gray-800">{dailyData.luckyColor}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white/50 rounded-xl border border-white/60">
              <span className="text-sm text-gray-600">⚠️ 今日禁忌</span>
              <span className="text-sm font-medium text-red-600">{dailyData.taboo}</span>
            </div>
          </div>

          {/* 按鈕區域 */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleEnter}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              進入仙宮 ✨
            </button>
          </div>

          {/* 小字提示 */}
          <p className="text-xs text-center text-gray-500 pt-2">
            每日運勢由仙宮天機自動生成
          </p>
        </div>
      </div>
    </div>
  );
};
