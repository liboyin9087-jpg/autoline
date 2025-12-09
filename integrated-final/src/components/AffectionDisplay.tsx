import React from 'react';
import { Heart, Star } from 'lucide-react';
import { FairyAffection } from '../types';

interface AffectionDisplayProps {
  affection: FairyAffection;
  fairyName: string;
  fairyColor: string;
  compact?: boolean;
}

export const AffectionDisplay: React.FC<AffectionDisplayProps> = ({
  affection,
  fairyName,
  fairyColor,
  compact = false
}) => {
  const progressPercentage = (affection.level / 10) * 100;
  const nextLevelChats = (affection.level * 10) - affection.chatCount;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Heart className="w-4 h-4" style={{ color: fairyColor }} />
        <span className="text-sm font-medium" style={{ color: fairyColor }}>
          Lv.{affection.level}
        </span>
        <span className="text-xs text-gray-500">{affection.title}</span>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/80 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5" style={{ color: fairyColor }} fill={fairyColor} />
          <span className="font-bold text-gray-800">{fairyName} 的好感度</span>
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-500" fill="#eab308" />
          <span className="text-sm font-bold" style={{ color: fairyColor }}>
            Lv.{affection.level}
          </span>
        </div>
      </div>

      {/* 進度條 */}
      <div className="mb-2">
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-500 rounded-full"
            style={{
              width: `${progressPercentage}%`,
              background: `linear-gradient(90deg, ${fairyColor}99, ${fairyColor})`
            }}
          />
        </div>
      </div>

      {/* 稱號和統計 */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 rounded-lg text-xs font-medium text-white" style={{ backgroundColor: fairyColor }}>
            {affection.title}
          </span>
          <span className="text-gray-600">
            {affection.chatCount} 次對話
          </span>
        </div>
        {affection.level < 10 && (
          <span className="text-xs text-gray-500">
            再 {nextLevelChats} 次升級
          </span>
        )}
      </div>

      {/* 特殊回覆提示 */}
      {affection.specialResponses.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-600 mb-1">已解鎖特殊回覆：</div>
          <div className="flex flex-wrap gap-1">
            {affection.specialResponses.slice(0, 3).map((response, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs"
              >
                {response}
              </span>
            ))}
            {affection.specialResponses.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">
                +{affection.specialResponses.length - 3}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
