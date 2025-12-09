import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Sparkles, Share2, RotateCcw, Volume2, VolumeX, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode.react';

// ============================================
// 神籤系統 - Divine Fortune System
// 三種抽籤方式：搖籤筒、擲筊、轉盤卜卦
// ============================================

interface DivineFortuneProps {
  isOpen: boolean;
  onClose: () => void;
  onResult: (fortune: FortuneResult) => void;
  botName?: string;
  botAvatar?: string;
}

interface FortuneResult {
  number: number;
  level: '上上籤' | '上籤' | '中籤' | '下籤' | '下下籤';
  title: string;
  poem: string;
  interpretation: string;
  advice: string;
  luckyItem: string;
  luckyColor: string;
  luckyDirection: string;
}

// 籤詩資料庫
const FORTUNE_DATABASE: FortuneResult[] = [
  {
    number: 1,
    level: '上上籤',
    title: '龍飛鳳舞',
    poem: '雲開見月明，萬事皆順心',
    interpretation: '如同撥雲見日，所有困難都將迎刃而解',
    advice: '大膽行動，時機已到',
    luckyItem: '金色飾品',
    luckyColor: '金黃',
    luckyDirection: '東方'
  },
  {
    number: 7,
    level: '上籤',
    title: '春風得意',
    poem: '桃花朵朵開，貴人自然來',
    interpretation: '人際運勢大開，會有意想不到的助力',
    advice: '多參加社交活動',
    luckyItem: '手寫卡片',
    luckyColor: '粉紅',
    luckyDirection: '南方'
  },
  {
    number: 13,
    level: '中籤',
    title: '穩中求進',
    poem: '腳踏實地行，一步一腳印',
    interpretation: '雖無大起大落，但穩紮穩打是最佳策略',
    advice: '保持現狀，等待時機',
    luckyItem: '木質文具',
    luckyColor: '棕色',
    luckyDirection: '中央'
  },
  {
    number: 23,
    level: '中籤',
    title: '守得雲開',
    poem: '風雨終有時，彩虹在後方',
    interpretation: '目前的困難是暫時的，堅持就有轉機',
    advice: '多休息，養精蓄銳',
    luckyItem: '藍色水晶',
    luckyColor: '天藍',
    luckyDirection: '北方'
  },
  {
    number: 33,
    level: '下籤',
    title: '韜光養晦',
    poem: '月有陰晴缺，靜待花再開',
    interpretation: '近期不宜衝動決策，低調行事為上',
    advice: '三思而後行',
    luckyItem: '黑曜石',
    luckyColor: '深藍',
    luckyDirection: '西方'
  },
  {
    number: 42,
    level: '上籤',
    title: '財源廣進',
    poem: '金玉滿堂來，努力有回報',
    interpretation: '付出的努力即將看到成果，財運亨通',
    advice: '可考慮投資或創業',
    luckyItem: '招財貓',
    luckyColor: '金色',
    luckyDirection: '東南'
  },
  {
    number: 49,
    level: '上上籤',
    title: '鴻運當頭',
    poem: '紫氣東來照，萬事如意順',
    interpretation: '大吉大利，做什麼都會順利',
    advice: '把握機會，勇往直前',
    luckyItem: '紅色配件',
    luckyColor: '紫紅',
    luckyDirection: '東北'
  },
  {
    number: 56,
    level: '中籤',
    title: '平安是福',
    poem: '平淡見真章，知足常樂也',
    interpretation: '沒有驚喜但也沒有驚嚇，平穩度過',
    advice: '珍惜眼前人',
    luckyItem: '家人照片',
    luckyColor: '米白',
    luckyDirection: '家中'
  },
  {
    number: 64,
    level: '下籤',
    title: '逆水行舟',
    poem: '山高路遠兮，需有耐心行',
    interpretation: '會遇到一些阻礙，但不是不可克服',
    advice: '尋求他人協助',
    luckyItem: '指南針',
    luckyColor: '墨綠',
    luckyDirection: '西南'
  },
  {
    number: 77,
    level: '上籤',
    title: '貴人相助',
    poem: '山窮水盡時，柳暗花明村',
    interpretation: '在最需要幫助的時候，會有貴人出現',
    advice: '不要拒絕別人的好意',
    luckyItem: '幸運符',
    luckyColor: '翠綠',
    luckyDirection: '西北'
  },
];

// 籤等級對應顏色
const LEVEL_COLORS = {
  '上上籤': 'from-yellow-400 to-amber-500',
  '上籤': 'from-green-400 to-emerald-500',
  '中籤': 'from-blue-400 to-cyan-500',
  '下籤': 'from-gray-400 to-slate-500',
  '下下籤': 'from-purple-400 to-violet-500',
};

const LEVEL_BG = {
  '上上籤': 'bg-gradient-to-br from-yellow-50 to-amber-100',
  '上籤': 'bg-gradient-to-br from-green-50 to-emerald-100',
  '中籤': 'bg-gradient-to-br from-blue-50 to-cyan-100',
  '下籤': 'bg-gradient-to-br from-gray-50 to-slate-100',
  '下下籤': 'bg-gradient-to-br from-purple-50 to-violet-100',
};

type RitualMethod = 'shake' | 'blocks' | 'wheel' | null;

export const DivineFortune: React.FC<DivineFortuneProps> = ({
  isOpen,
  onClose,
  onResult,
  botName = '智慧仙姑',
  botAvatar
}) => {
  const [method, setMethod] = useState<RitualMethod>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [result, setResult] = useState<FortuneResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // 搖籤筒狀態
  const [shakeCount, setShakeCount] = useState(0);
  const [stickOut, setStickOut] = useState(false);
  
  // 擲筊狀態
  const [blocks, setBlocks] = useState<['yang' | 'yin' | null, 'yang' | 'yin' | null]>([null, null]);
  const [throwCount, setThrowCount] = useState(0);
  const [blocksResult, setBlocksResult] = useState<'聖筊' | '笑筊' | '怒筊' | null>(null);
  
  // 轉盤狀態
  const [wheelRotation, setWheelRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  // 重置所有狀態
  const resetAll = useCallback(() => {
    setMethod(null);
    setIsAnimating(false);
    setResult(null);
    setShowResult(false);
    setShakeCount(0);
    setStickOut(false);
    setBlocks([null, null]);
    setThrowCount(0);
    setBlocksResult(null);
    setWheelRotation(0);
    setIsSpinning(false);
  }, []);

  // 關閉時重置
  useEffect(() => {
    if (!isOpen) {
      setTimeout(resetAll, 300);
    }
  }, [isOpen, resetAll]);

  // 播放音效
  const playSound = useCallback((type: 'shake' | 'drop' | 'throw' | 'spin' | 'reveal') => {
    if (!soundEnabled) return;
    // 實際專案中可以用 Howler.js 或 Web Audio API
    // 這裡用簡單的 Audio API 示意
    const sounds: Record<string, string> = {
      shake: '/sounds/shake.mp3',
      drop: '/sounds/drop.mp3',
      throw: '/sounds/throw.mp3',
      spin: '/sounds/spin.mp3',
      reveal: '/sounds/reveal.mp3',
    };
    try {
      const audio = new Audio(sounds[type]);
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (e) {}
  }, [soundEnabled]);

  // 隨機抽籤
  const drawFortune = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * FORTUNE_DATABASE.length);
    return FORTUNE_DATABASE[randomIndex];
  }, []);

  // ============================================
  // 方法一：搖籤筒
  // ============================================
  const handleShake = useCallback(() => {
    if (isAnimating || stickOut) return;
    
    playSound('shake');
    setShakeCount(prev => prev + 1);
    setIsAnimating(true);
    
    setTimeout(() => {
      setIsAnimating(false);
      // 搖 3 次以上有機率掉出籤
      if (shakeCount >= 2 && Math.random() > 0.3) {
        playSound('drop');
        setStickOut(true);
        setTimeout(() => {
          const fortune = drawFortune();
          setResult(fortune);
          playSound('reveal');
          setTimeout(() => setShowResult(true), 500);
        }, 800);
      }
    }, 600);
  }, [isAnimating, stickOut, shakeCount, playSound, drawFortune]);

  // ============================================
  // 方法二：擲筊
  // ============================================
  const handleThrowBlocks = useCallback(() => {
    if (isAnimating || throwCount >= 3) return;
    
    playSound('throw');
    setIsAnimating(true);
    setBlocks([null, null]);
    
    // 模擬擲筊動畫
    setTimeout(() => {
      const block1: 'yang' | 'yin' = Math.random() > 0.5 ? 'yang' : 'yin';
      const block2: 'yang' | 'yin' = Math.random() > 0.5 ? 'yang' : 'yin';
      setBlocks([block1, block2]);
      
      // 判斷結果
      let blockResult: '聖筊' | '笑筊' | '怒筊';
      if (block1 !== block2) {
        blockResult = '聖筊'; // 一陽一陰
      } else if (block1 === 'yang') {
        blockResult = '笑筊'; // 兩陽（笑杯）
      } else {
        blockResult = '怒筊'; // 兩陰（怒杯）
      }
      
      setBlocksResult(blockResult);
      setThrowCount(prev => prev + 1);
      setIsAnimating(false);
      
      // 聖筊時可以抽籤
      if (blockResult === '聖筊') {
        setTimeout(() => {
          const fortune = drawFortune();
          setResult(fortune);
          playSound('reveal');
          setTimeout(() => setShowResult(true), 500);
        }, 1000);
      }
    }, 1200);
  }, [isAnimating, throwCount, playSound, drawFortune]);

  // ============================================
  // 方法三：轉盤卜卦
  // ============================================
  const handleSpinWheel = useCallback(() => {
    if (isSpinning) return;
    
    playSound('spin');
    setIsSpinning(true);
    
    // 隨機旋轉角度
    const extraSpins = 5 + Math.floor(Math.random() * 3); // 5-7 圈
    const finalAngle = Math.floor(Math.random() * 360);
    const totalRotation = wheelRotation + (extraSpins * 360) + finalAngle;
    
    setWheelRotation(totalRotation);
    
    // 等待動畫結束
    setTimeout(() => {
      setIsSpinning(false);
      const fortune = drawFortune();
      setResult(fortune);
      playSound('reveal');
      setTimeout(() => setShowResult(true), 500);
    }, 4000);
  }, [isSpinning, wheelRotation, playSound, drawFortune]);

  // 分享圖片生成的 ref
  const shareCardRef = useRef<HTMLDivElement>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // 分享功能 - 增強版：生成精美分享圖
  const handleShare = useCallback(async () => {
    if (!result || !shareCardRef.current) return;
    
    try {
      setIsGeneratingImage(true);
      
      // 使用 html2canvas 將分享卡片轉為圖片
      const canvas = await html2canvas(shareCardRef.current, {
        scale: 2,
        backgroundColor: null,
        logging: false,
        useCORS: true,
      });
      
      // 轉換為 blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setIsGeneratingImage(false);
          return;
        }
        
        const file = new File([blob], `仙宮籤_${result.number}.png`, { type: 'image/png' });
        
        // 優先使用原生分享 API
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: '一池0仙宮 - 天宮籤',
              text: `我抽到了【${result.level}】✨`
            });
          } catch (err) {
            // 用戶取消分享
            console.log('分享取消');
          }
        } else {
          // Fallback: 下載圖片
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `仙宮籤_${result.number}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          alert('✅ 籤詩圖片已下載！');
        }
        
        setIsGeneratingImage(false);
      }, 'image/png');
    } catch (error) {
      console.error('生成分享圖失敗:', error);
      setIsGeneratingImage(false);
      
      // Fallback 到純文字分享
      const shareText = `🎋 一池0仙宮 - 天宮籤\n\n第${result.number}籤【${result.level}】\n✨ ${result.title}\n\n「${result.poem}」\n\n📜 ${result.interpretation}\n💡 ${result.advice}\n\n🍀 幸運物：${result.luckyItem}\n🎨 幸運色：${result.luckyColor}\n🧭 幸運方位：${result.luckyDirection}\n\n#一池0仙宮 #仙女籤詩`;
      
      if (navigator.share) {
        navigator.share({
          title: '一池0仙宮 - 天宮籤',
          text: shareText,
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(shareText);
        alert('籤詩已複製到剪貼簿！');
      }
    }
  }, [result]);

  // 確認籤詩並發送到對話
  const handleConfirm = useCallback(() => {
    if (result) {
      onResult(result);
      onClose();
    }
  }, [result, onResult, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 主容器 */}
      <div className="relative w-full max-w-md bg-gradient-to-b from-amber-50 to-orange-50 rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
        {/* 頂部裝飾 */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-amber-200/50 to-transparent" />
        
        {/* 關閉和音效按鈕 */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 bg-white/80 rounded-full shadow-md hover:bg-white transition-colors"
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <button
            onClick={onClose}
            className="p-2 bg-white/80 rounded-full shadow-md hover:bg-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="relative p-6 pt-8">
          {/* 標題 */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1 bg-amber-100 rounded-full mb-3">
              <Sparkles size={16} className="text-amber-600" />
              <span className="text-sm font-medium text-amber-700">天宮神籤</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              {!method ? '選擇抽籤方式' : 
               method === 'shake' ? '搖籤筒' :
               method === 'blocks' ? '擲筊問卦' : '轉盤卜卦'}
            </h2>
            {!method && (
              <p className="text-sm text-gray-500 mt-2">誠心祈求，仙女指引</p>
            )}
          </div>

          {/* ============================================ */}
          {/* 選擇抽籤方式 */}
          {/* ============================================ */}
          {!method && !showResult && (
            <div className="space-y-4">
              {/* 方式一：搖籤筒 */}
              <button
                onClick={() => setMethod('shake')}
                className="w-full p-5 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all group border-2 border-transparent hover:border-amber-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                    🎋
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-bold text-gray-800 text-lg">搖籤筒</h3>
                    <p className="text-sm text-gray-500">傳統經典，搖落天機</p>
                  </div>
                  <div className="text-amber-400 group-hover:translate-x-1 transition-transform">→</div>
                </div>
              </button>

              {/* 方式二：擲筊 */}
              <button
                onClick={() => setMethod('blocks')}
                className="w-full p-5 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all group border-2 border-transparent hover:border-amber-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-rose-500 rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                    🥠
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-bold text-gray-800 text-lg">擲筊問卦</h3>
                    <p className="text-sm text-gray-500">聖筊確認，神明首肯</p>
                  </div>
                  <div className="text-amber-400 group-hover:translate-x-1 transition-transform">→</div>
                </div>
              </button>

              {/* 方式三：轉盤 */}
              <button
                onClick={() => setMethod('wheel')}
                className="w-full p-5 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all group border-2 border-transparent hover:border-amber-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-violet-500 rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                    🎡
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-bold text-gray-800 text-lg">轉盤卜卦</h3>
                    <p className="text-sm text-gray-500">命運之輪，一轉定乾坤</p>
                  </div>
                  <div className="text-amber-400 group-hover:translate-x-1 transition-transform">→</div>
                </div>
              </button>
            </div>
          )}

          {/* ============================================ */}
          {/* 搖籤筒介面 */}
          {/* ============================================ */}
          {method === 'shake' && !showResult && (
            <div className="flex flex-col items-center py-6">
              {/* 籤筒 */}
              <div 
                className={`relative w-32 h-48 cursor-pointer transition-transform ${
                  isAnimating ? 'animate-shake' : 'hover:scale-105'
                }`}
                onClick={handleShake}
              >
                {/* 籤筒本體 */}
                <div className="absolute inset-0 bg-gradient-to-b from-amber-700 to-amber-900 rounded-t-xl rounded-b-3xl shadow-xl">
                  <div className="absolute inset-2 top-4 bg-gradient-to-b from-amber-800 to-amber-950 rounded-t-lg rounded-b-2xl" />
                  {/* 籤筒裝飾 */}
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 w-16 h-16">
                    <div className="text-4xl text-center">☯️</div>
                  </div>
                </div>
                
                {/* 籤（掉出效果） */}
                {stickOut && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-3 h-24 bg-gradient-to-b from-amber-200 to-amber-300 rounded-t-full animate-stick-out shadow-lg">
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1 h-4 bg-red-500 rounded-full" />
                  </div>
                )}
                
                {/* 籤束 */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 flex gap-0.5">
                  {[...Array(7)].map((_, i) => (
                    <div 
                      key={i}
                      className={`w-1.5 h-12 bg-amber-200 rounded-t-full ${
                        isAnimating ? 'animate-bounce' : ''
                      }`}
                      style={{ animationDelay: `${i * 50}ms` }}
                    />
                  ))}
                </div>
              </div>
              
              <p className="mt-6 text-gray-600 text-center">
                {stickOut ? '籤已落下！' : `點擊籤筒搖動 (已搖 ${shakeCount} 次)`}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {stickOut ? '正在解讀天機...' : '誠心搖動，直到籤落'}
              </p>
              
              {/* 返回按鈕 */}
              <button
                onClick={() => setMethod(null)}
                className="mt-6 px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
              >
                ← 選擇其他方式
              </button>
            </div>
          )}

          {/* ============================================ */}
          {/* 擲筊介面 */}
          {/* ============================================ */}
          {method === 'blocks' && !showResult && (
            <div className="flex flex-col items-center py-6">
              {/* 筊杯 */}
              <div className="flex gap-8 mb-6">
                {[0, 1].map((idx) => (
                  <div
                    key={idx}
                    className={`w-20 h-28 rounded-full transition-all duration-500 ${
                      isAnimating ? 'animate-flip' : ''
                    } ${
                      blocks[idx] === 'yang' 
                        ? 'bg-gradient-to-b from-red-400 to-red-600 shadow-lg' 
                        : blocks[idx] === 'yin'
                        ? 'bg-gradient-to-t from-red-400 to-red-600 shadow-lg transform rotate-180'
                        : 'bg-gradient-to-b from-gray-300 to-gray-400'
                    }`}
                    style={{
                      borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                    }}
                  >
                    <div className="h-full flex items-center justify-center text-white text-2xl font-bold">
                      {blocks[idx] === 'yang' ? '陽' : blocks[idx] === 'yin' ? '陰' : '?'}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* 結果顯示 */}
              {blocksResult && (
                <div className={`px-6 py-2 rounded-full text-lg font-bold mb-4 ${
                  blocksResult === '聖筊' ? 'bg-green-100 text-green-700' :
                  blocksResult === '笑筊' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {blocksResult}！
                  {blocksResult === '聖筊' && ' 神明應允 ✓'}
                  {blocksResult === '笑筊' && ' 再擲一次'}
                  {blocksResult === '怒筊' && ' 誠心再問'}
                </div>
              )}
              
              <button
                onClick={handleThrowBlocks}
                disabled={isAnimating || throwCount >= 3 && blocksResult !== '聖筊'}
                className="px-8 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-full font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isAnimating ? '擲筊中...' : `擲筊 (${throwCount}/3)`}
              </button>
              
              <p className="mt-4 text-sm text-gray-500 text-center">
                {blocksResult === '聖筊' 
                  ? '正在為您解籤...'
                  : '擲出聖筊（一陽一陰）即可抽籤'}
              </p>
              
              {throwCount >= 3 && blocksResult !== '聖筊' && (
                <div className="mt-4 p-4 bg-amber-50 rounded-xl text-center">
                  <p className="text-amber-700">今日緣分未到，改日再來</p>
                  <button
                    onClick={resetAll}
                    className="mt-2 text-sm text-amber-600 underline"
                  >
                    重新開始
                  </button>
                </div>
              )}
              
              <button
                onClick={() => setMethod(null)}
                className="mt-6 px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
              >
                ← 選擇其他方式
              </button>
            </div>
          )}

          {/* ============================================ */}
          {/* 轉盤介面 */}
          {/* ============================================ */}
          {method === 'wheel' && !showResult && (
            <div className="flex flex-col items-center py-6">
              {/* 轉盤 */}
              <div className="relative w-64 h-64 mb-6">
                {/* 外框 */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 shadow-2xl" />
                
                {/* 轉盤本體 */}
                <div 
                  className="absolute inset-2 rounded-full overflow-hidden transition-transform"
                  style={{
                    transform: `rotate(${wheelRotation}deg)`,
                    transitionDuration: isSpinning ? '4s' : '0s',
                    transitionTimingFunction: 'cubic-bezier(0.17, 0.67, 0.12, 0.99)',
                  }}
                >
                  {/* 分區 */}
                  {['上上籤', '上籤', '中籤', '下籤', '中籤', '上籤', '上上籤', '中籤'].map((level, i) => (
                    <div
                      key={i}
                      className="absolute w-full h-full"
                      style={{
                        transform: `rotate(${i * 45}deg)`,
                        clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 50%)',
                        background: i % 2 === 0 
                          ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' 
                          : 'linear-gradient(135deg, #fcd34d, #fbbf24)',
                      }}
                    >
                      <span 
                        className="absolute text-xs font-bold text-amber-900"
                        style={{
                          top: '15%',
                          left: '60%',
                          transform: 'rotate(22.5deg)',
                        }}
                      >
                        {level}
                      </span>
                    </div>
                  ))}
                  
                  {/* 中心 */}
                  <div className="absolute inset-1/4 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 shadow-inner flex items-center justify-center">
                    <span className="text-3xl">☯️</span>
                  </div>
                </div>
                
                {/* 指針 */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
                  <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-red-600 drop-shadow-lg" />
                </div>
              </div>
              
              <button
                onClick={handleSpinWheel}
                disabled={isSpinning}
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-full font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSpinning ? '命運轉動中...' : '轉動命運之輪'}
              </button>
              
              <p className="mt-4 text-sm text-gray-500">
                點擊轉動，聽天由命
              </p>
              
              <button
                onClick={() => setMethod(null)}
                className="mt-6 px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
              >
                ← 選擇其他方式
              </button>
            </div>
          )}

          {/* ============================================ */}
          {/* 結果顯示 */}
          {/* ============================================ */}
          {showResult && result && (
            <div className="animate-fade-in">
              {/* 籤詩卡片 */}
              <div className={`rounded-2xl overflow-hidden shadow-xl ${LEVEL_BG[result.level]}`}>
                {/* 頂部 */}
                <div className={`bg-gradient-to-r ${LEVEL_COLORS[result.level]} p-4 text-white text-center`}>
                  <div className="text-sm opacity-80">第 {result.number} 籤</div>
                  <div className="text-2xl font-bold mt-1">{result.level}</div>
                </div>
                
                {/* 籤詩內容 */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-center text-gray-800 mb-4">
                    ✨ {result.title}
                  </h3>
                  
                  {/* 詩句 - 直式呈現 */}
                  <div className="bg-white/60 rounded-xl p-4 mb-4 text-center">
                    <p className="text-lg font-serif text-gray-700 tracking-widest leading-loose">
                      「{result.poem}」
                    </p>
                  </div>
                  
                  {/* 解籤 */}
                  <div className="space-y-3 text-sm">
                    <div className="flex gap-2">
                      <span className="text-amber-600 font-bold">📜 解籤：</span>
                      <span className="text-gray-700">{result.interpretation}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-amber-600 font-bold">💡 建議：</span>
                      <span className="text-gray-700">{result.advice}</span>
                    </div>
                  </div>
                  
                  {/* 幸運資訊 */}
                  <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-2 text-xs text-center">
                    <div className="bg-white/50 rounded-lg p-2">
                      <div className="text-gray-500">幸運物</div>
                      <div className="font-bold text-gray-700">{result.luckyItem}</div>
                    </div>
                    <div className="bg-white/50 rounded-lg p-2">
                      <div className="text-gray-500">幸運色</div>
                      <div className="font-bold text-gray-700">{result.luckyColor}</div>
                    </div>
                    <div className="bg-white/50 rounded-lg p-2">
                      <div className="text-gray-500">幸運方位</div>
                      <div className="font-bold text-gray-700">{result.luckyDirection}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 操作按鈕 */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-all text-gray-700 font-medium"
                >
                  <Share2 size={18} />
                  分享籤詩
                </button>
                <button
                  onClick={resetAll}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-all text-gray-700 font-medium"
                >
                  <RotateCcw size={18} />
                  重抽
                </button>
              </div>
              
              <button
                onClick={handleConfirm}
                className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
              >
                請仙女解讀籤詩 ✨
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* 動畫樣式 */}
      <style>{`
        @keyframes scale-in {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-10deg); }
          75% { transform: rotate(10deg); }
        }
        @keyframes stick-out {
          0% { transform: translateX(-50%) translateY(100%); }
          60% { transform: translateX(-50%) translateY(-20%); }
          100% { transform: translateX(-50%) translateY(0); }
        }
        @keyframes flip {
          0% { transform: rotateX(0) translateY(0); }
          50% { transform: rotateX(180deg) translateY(-50px); }
          100% { transform: rotateX(360deg) translateY(0); }
        }
        .animate-scale-in { animation: scale-in 0.3s ease-out; }
        .animate-shake { animation: shake 0.3s ease-in-out; }
        .animate-stick-out { animation: stick-out 0.8s ease-out forwards; }
        .animate-flip { animation: flip 1.2s ease-in-out; }
      `}</style>
    </div>
  );
};

export default DivineFortune;
