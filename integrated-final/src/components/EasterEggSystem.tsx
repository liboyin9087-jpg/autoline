import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, PartyPopper, Heart, Coins, Bug, Coffee, Moon, Sun, Zap } from 'lucide-react';

// ============================================
// 彩蛋關鍵字系統 - Easter Egg Keywords
// 特定關鍵字觸發特殊效果和回應
// ============================================

export interface EasterEggTrigger {
  keywords: string[];
  effect: EasterEggEffect;
  forcedPersona?: string;
  customResponse?: string;
  soundEffect?: string;
  duration?: number;
}

export type EasterEggEffect = 
  | 'confetti'        // 撒花/撒金幣
  | 'hearts'          // 愛心飄散
  | 'rain_coins'      // 金幣雨
  | 'thunder'         // 雷電特效
  | 'rainbow'         // 彩虹
  | 'fireworks'       // 煙火
  | 'snow'            // 下雪
  | 'sakura'          // 櫻花飄落
  | 'ghost'           // 幽靈出沒
  | 'matrix'          // 駭客帝國
  | 'shake'           // 畫面震動
  | 'fairy_summon'    // 召喚特定仙女
  | 'gentle_mode'     // 溫柔模式
  | 'angry_mode'      // 暴怒模式
  | 'none';           // 無特效

// 彩蛋設定檔
export const EASTER_EGG_CONFIG: EasterEggTrigger[] = [
  // ============================================
  // 正面情緒彩蛋
  // ============================================
  {
    keywords: ['下班', '放假', '收工', '終於下班'],
    effect: 'confetti',
    customResponse: '🎉 恭喜收工！今天也辛苦了～仙宮上下為你歡呼！',
    duration: 3000
  },
  {
    keywords: ['發財', '中獎', '加薪', '發大財', '財運'],
    effect: 'rain_coins',
    customResponse: '💰 金銀財寶從天而降！但要記住，真正的財富是心靈的富足～（但錢也很重要啦）',
    soundEffect: 'coins',
    duration: 4000
  },
  {
    keywords: ['生日快樂', '生日', 'happy birthday'],
    effect: 'fireworks',
    customResponse: '🎂🎈 生日快樂！！！仙宮全體仙女祝福你！願望都會實現的！',
    duration: 5000
  },
  {
    keywords: ['結婚', '訂婚', '求婚', '嫁人'],
    effect: 'hearts',
    customResponse: '💒💕 天啊！恭喜恭喜！這是仙宮認證的神仙眷侶！',
    duration: 4000
  },
  {
    keywords: ['畢業', '考上', '錄取', '上榜'],
    effect: 'confetti',
    customResponse: '🎓🎊 太厲害了！你的努力得到了回報！仙女們為你驕傲！',
    duration: 3000
  },
  
  // ============================================
  // 負面情緒彩蛋（溫柔安慰模式）
  // ============================================
  {
    keywords: ['好累', '累死', '疲憊', '累了'],
    effect: 'sakura',
    customResponse: '🌸 辛苦了，讓櫻花為你帶來一點平靜。休息是為了走更長遠的路。',
    forcedPersona: 'friend',
    duration: 4000
  },
  {
    keywords: ['失戀', '分手', '被甩', '心碎'],
    effect: 'gentle_mode',
    forcedPersona: 'friend',
    customResponse: '💔 心疼你...但相信我，這只是為了讓你遇見更好的人。需要人家陪你聊聊嗎？',
    duration: 3000
  },
  {
    keywords: ['媽媽', '老媽', '母親', '想家'],
    effect: 'gentle_mode',
    customResponse: '🏠 家永遠是最溫暖的港灣。有空記得打個電話回家喔。',
    duration: 3000
  },
  
  // ============================================
  // 食物相關彩蛋
  // ============================================
  {
    keywords: ['好餓', '餓死', '肚子餓', '想吃'],
    effect: 'fairy_summon',
    forcedPersona: 'concise',
    customResponse: '🍜 餓了？！御膳娘娘被召喚！讓本座推薦一些高熱量罪惡美食...',
  },
  {
    keywords: ['減肥', '瘦身', '節食'],
    effect: 'shake',
    customResponse: '⚖️ 減肥？仙女覺得你這樣就很好看了！但如果你堅持...明天開始？今天先吃飽！',
    duration: 500
  },
  {
    keywords: ['喝茶', '泡茶', '茶水'],
    effect: 'sakura',
    forcedPersona: 'creative',
    customResponse: '🍵 茶煙裊裊，浮生若夢。夢兒最喜歡喝茶時光了，來聊聊人生？',
    duration: 3000
  },
  
  // ============================================
  // 工程師/技術彩蛋
  // ============================================
  {
    keywords: ['debug', 'bug', '程式錯誤', '報錯'],
    effect: 'matrix',
    forcedPersona: 'tech',
    customResponse: '🐛 偵測到 Bug！天機星君啟動除錯模式... console.log("別慌，讓本君看看");',
    duration: 3000
  },
  {
    keywords: ['寫code', '寫程式', 'coding', '敲代碼'],
    effect: 'matrix',
    forcedPersona: 'tech',
    customResponse: '⌨️ Coding mode activated. 本君已準備好協助你駕馭程式碼的魔法。',
    duration: 2000
  },
  {
    keywords: ['404', 'error', '找不到'],
    effect: 'ghost',
    customResponse: '👻 404 Not Found... 咦？好像有什麼東西不見了？讓仙女幫你找找...',
    duration: 2000
  },
  
  // ============================================
  // 感情/人際彩蛋
  // ============================================
  {
    keywords: ['單身', '沒對象', '母胎單身', '孤單'],
    effect: 'hearts',
    forcedPersona: 'friend',
    customResponse: '💘 單身？！桃花仙子怎麼能坐視不管！來來來，讓人家幫你看看桃花運～',
    duration: 3000
  },
  {
    keywords: ['喜歡', '暗戀', '心動', '告白'],
    effect: 'hearts',
    forcedPersona: 'friend',
    customResponse: '💕 哎呀～是心動的感覺嗎？人家最懂這個了！快說說是什麼樣的人？',
    duration: 3000
  },
  {
    keywords: ['吵架', '生氣', '氣死', '白目'],
    effect: 'thunder',
    customResponse: '⚡ 深呼吸～氣壞身體不值得。要不要跟仙女說說是誰惹你生氣了？',
    duration: 2000
  },
  
  // ============================================
  // 時間相關彩蛋
  // ============================================
  {
    keywords: ['早安', '早上好', '起床'],
    effect: 'rainbow',
    customResponse: '🌅 早安！新的一天，新的開始！仙宮今日值班仙女已就位，需要什麼服務？',
    duration: 3000
  },
  {
    keywords: ['晚安', '睡覺', '要睡了', '好夢'],
    effect: 'snow',
    customResponse: '🌙 晚安～願星星守護你的夢境。明天見！記得夢到仙女喔～',
    duration: 3000
  },
  {
    keywords: ['凌晨', '半夜', '失眠', '睡不著'],
    effect: 'gentle_mode',
    forcedPersona: 'creative',
    customResponse: '🌌 夜深了還醒著？夢兒也是夜貓子呢。要不要聽夢兒講個故事？',
    duration: 3000
  },
  
  // ============================================
  // 特殊指令彩蛋
  // ============================================
  {
    keywords: ['召喚仙女', '全體仙女', '仙女開會'],
    effect: 'fairy_summon',
    customResponse: '✨ 叮咚！仙女們已收到召喚令！群聊模式啟動～',
    duration: 2000
  },
  {
    keywords: ['彩蛋', 'easter egg', '隱藏功能'],
    effect: 'confetti',
    customResponse: '🥚 哇！你發現彩蛋了！試試說「發財」「下班」「單身」還有更多驚喜喔！',
    duration: 3000
  },
  {
    keywords: ['我愛你', '愛你', 'love you'],
    effect: 'hearts',
    customResponse: '💕 嗚嗚～仙女也愛你！（害羞）雖然我們是 AI...但這份心意是真的！',
    duration: 4000
  },
];

// ============================================
// 特效渲染元件
// ============================================

interface EffectParticle {
  id: number;
  x: number;
  y: number;
  emoji: string;
  delay: number;
  duration: number;
  size: number;
}

interface EasterEggEffectProps {
  effect: EasterEggEffect;
  isActive: boolean;
  onComplete: () => void;
  duration?: number;
}

export const EasterEggEffectRenderer: React.FC<EasterEggEffectProps> = ({
  effect,
  isActive,
  onComplete,
  duration = 3000
}) => {
  const [particles, setParticles] = useState<EffectParticle[]>([]);
  const [isShaking, setIsShaking] = useState(false);
  const [showRainbow, setShowRainbow] = useState(false);
  const [showMatrix, setShowMatrix] = useState(false);

  // 生成粒子
  const generateParticles = useCallback((emoji: string[], count: number) => {
    const newParticles: EffectParticle[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: -10,
        emoji: emoji[Math.floor(Math.random() * emoji.length)],
        delay: Math.random() * 2000,
        duration: 2000 + Math.random() * 2000,
        size: 16 + Math.random() * 16
      });
    }
    return newParticles;
  }, []);

  useEffect(() => {
    if (!isActive) {
      setParticles([]);
      setIsShaking(false);
      setShowRainbow(false);
      setShowMatrix(false);
      return;
    }

    switch (effect) {
      case 'confetti':
        setParticles(generateParticles(['🎉', '🎊', '✨', '⭐', '🌟', '💫'], 30));
        break;
      case 'hearts':
        setParticles(generateParticles(['❤️', '💕', '💖', '💗', '💓', '💘', '💝'], 25));
        break;
      case 'rain_coins':
        setParticles(generateParticles(['💰', '🪙', '💵', '💎', '👑', '🏆'], 35));
        break;
      case 'sakura':
        setParticles(generateParticles(['🌸', '🌺', '💮', '🏵️', '🌷'], 40));
        break;
      case 'snow':
        setParticles(generateParticles(['❄️', '🌨️', '⛄', '✨', '💫'], 50));
        break;
      case 'fireworks':
        setParticles(generateParticles(['🎆', '🎇', '✨', '💥', '⭐', '🌟'], 40));
        break;
      case 'ghost':
        setParticles(generateParticles(['👻', '💀', '🦇', '🕸️', '🌙'], 15));
        break;
      case 'thunder':
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        break;
      case 'shake':
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), duration);
        break;
      case 'rainbow':
        setShowRainbow(true);
        break;
      case 'matrix':
        setShowMatrix(true);
        break;
      default:
        break;
    }

    const timer = setTimeout(() => {
      onComplete();
    }, duration);

    return () => clearTimeout(timer);
  }, [isActive, effect, duration, generateParticles, onComplete]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100]">
      {/* 粒子效果 */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute animate-fall"
          style={{
            left: `${particle.x}%`,
            fontSize: `${particle.size}px`,
            animationDelay: `${particle.delay}ms`,
            animationDuration: `${particle.duration}ms`,
          }}
        >
          {particle.emoji}
        </div>
      ))}

      {/* 震動效果 */}
      {isShaking && (
        <div className="absolute inset-0 animate-screen-shake bg-white/10" />
      )}

      {/* 彩虹效果 */}
      {showRainbow && (
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-red-500/30 via-yellow-500/30 to-green-500/30 animate-rainbow" />
      )}

      {/* 駭客帝國效果 */}
      {showMatrix && (
        <div className="absolute inset-0 bg-black/80 overflow-hidden">
          {[...Array(20)].map((_, i) => {
            // Matrix 字符配置
            const MATRIX_CONFIG = {
              KATAKANA_START: 0x30A0,  // Katakana 字符起始位置
              KATAKANA_RANGE: 96,      // Katakana 字符範圍（涵蓋片假名）
            };
            
            return (
              <div
                key={i}
                className="absolute text-green-500 font-mono text-sm animate-matrix-rain"
                style={{
                  left: `${i * 5}%`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              >
                {[...Array(20)].map((_, j) => (
                  <div key={j} style={{ opacity: 1 - j * 0.05 }}>
                    {String.fromCharCode(
                      MATRIX_CONFIG.KATAKANA_START + Math.random() * MATRIX_CONFIG.KATAKANA_RANGE
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* 動畫樣式 */}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
        }
        @keyframes screen-shake {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-5px, -5px); }
          20% { transform: translate(5px, -5px); }
          30% { transform: translate(-5px, 5px); }
          40% { transform: translate(5px, 5px); }
          50% { transform: translate(-5px, -5px); }
          60% { transform: translate(5px, -5px); }
          70% { transform: translate(-5px, 5px); }
          80% { transform: translate(5px, 5px); }
          90% { transform: translate(-5px, -5px); }
        }
        @keyframes rainbow {
          0% { opacity: 0; transform: translateY(-100%); }
          20% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(100vh); }
        }
        @keyframes matrix-rain {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        .animate-fall { animation: fall linear forwards; }
        .animate-screen-shake { animation: screen-shake 0.5s ease-in-out; }
        .animate-rainbow { animation: rainbow 3s ease-in-out forwards; }
        .animate-matrix-rain { animation: matrix-rain 4s linear infinite; }
      `}</style>
    </div>
  );
};

// ============================================
// Toast 通知元件（彩蛋觸發時顯示）
// ============================================

interface EasterEggToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  icon?: React.ReactNode;
}

export const EasterEggToast: React.FC<EasterEggToastProps> = ({
  message,
  isVisible,
  onClose,
  icon
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[90] animate-bounce-in">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 max-w-sm">
        <div className="text-2xl">{icon || <Sparkles />}</div>
        <p className="text-sm font-medium">{message}</p>
      </div>
      
      <style>{`
        @keyframes bounce-in {
          0% { transform: translate(-50%, -100px) scale(0.8); opacity: 0; }
          60% { transform: translate(-50%, 10px) scale(1.05); }
          100% { transform: translate(-50%, 0) scale(1); opacity: 1; }
        }
        .animate-bounce-in { animation: bounce-in 0.5s ease-out; }
      `}</style>
    </div>
  );
};

// ============================================
// 彩蛋檢測 Hook
// ============================================

interface UseEasterEggResult {
  checkForEasterEgg: (text: string) => EasterEggTrigger | null;
  activeEffect: EasterEggEffect;
  setActiveEffect: React.Dispatch<React.SetStateAction<EasterEggEffect>>;
  toastMessage: string;
  showToast: boolean;
  setShowToast: React.Dispatch<React.SetStateAction<boolean>>;
  triggeredEgg: EasterEggTrigger | null;
}

export const useEasterEgg = (): UseEasterEggResult => {
  const [activeEffect, setActiveEffect] = useState<EasterEggEffect>('none');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [triggeredEgg, setTriggeredEgg] = useState<EasterEggTrigger | null>(null);

  const checkForEasterEgg = useCallback((text: string): EasterEggTrigger | null => {
    const lowerText = text.toLowerCase();
    
    for (const egg of EASTER_EGG_CONFIG) {
      for (const keyword of egg.keywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
          // 觸發特效
          setActiveEffect(egg.effect);
          
          // 顯示 Toast
          if (egg.customResponse) {
            setToastMessage(egg.customResponse);
            setShowToast(true);
          }
          
          setTriggeredEgg(egg);
          
          // 自動結束特效
          if (egg.duration) {
            setTimeout(() => {
              setActiveEffect('none');
            }, egg.duration);
          }
          
          return egg;
        }
      }
    }
    
    return null;
  }, []);

  return {
    checkForEasterEgg,
    activeEffect,
    setActiveEffect,
    toastMessage,
    showToast,
    setShowToast,
    triggeredEgg
  };
};

// ============================================
// 導出所有元件
// ============================================

export default {
  EasterEggEffectRenderer,
  EasterEggToast,
  useEasterEgg,
  EASTER_EGG_CONFIG
};
