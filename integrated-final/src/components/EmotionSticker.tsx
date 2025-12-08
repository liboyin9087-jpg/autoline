import React from 'react';

export type EmotionType = 'happy' | 'thinking' | 'shocked' | 'tea';

interface EmotionStickerProps {
  emotion: EmotionType;
  className?: string;
}

// 情緒關鍵字映射
export const EMOTION_KEYWORDS: { [key in EmotionType]: string[] } = {
  happy: ['開心', '高興', '哈哈', '太好了', '棒', '讚', '😊', '😄', '🎉', '✨'],
  thinking: ['想想', '思考', '嗯', '讓我想想', '考慮', '研究', '🤔', '💭'],
  shocked: ['什麼', '驚訝', '天啊', '不會吧', '真的嗎', '😮', '😲', '🤯'],
  tea: ['八卦', '吃瓜', '看戲', '有料', '爆料', '🍵', '☕']
};

// 表情貼圖路徑（如果實際圖片不存在，使用 emoji fallback）
const EMOTION_STICKERS: { [key in EmotionType]: { path: string; fallback: string } } = {
  happy: { path: '/stickers/fairy_happy.gif', fallback: '🎉' },
  thinking: { path: '/stickers/fairy_think.gif', fallback: '🤔' },
  shocked: { path: '/stickers/fairy_shock.gif', fallback: '😮' },
  tea: { path: '/stickers/fairy_tea.gif', fallback: '🍵' }
};

export const EmotionSticker: React.FC<EmotionStickerProps> = ({ emotion, className = '' }) => {
  const sticker = EMOTION_STICKERS[emotion];
  const [imageError, setImageError] = React.useState(false);

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      {!imageError ? (
        <img
          src={sticker.path}
          alt={emotion}
          className="w-16 h-16 object-contain"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className="text-4xl">{sticker.fallback}</span>
      )}
    </div>
  );
};

// 偵測文字中的情緒並返回對應的表情類型
export const detectEmotion = (text: string): EmotionType | null => {
  for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return emotion as EmotionType;
    }
  }
  return null;
};
