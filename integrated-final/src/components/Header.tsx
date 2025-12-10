import React, { useState } from 'react';
import { Settings, Users, RotateCcw, ArrowLeft, Phone, Video, MoreVertical, Search } from 'lucide-react'; 
import { AppMode } from '../types';

export const Header: React.FC<{ 
  mode: AppMode; 
  onModeChange: (m: AppMode) => void; 
  onReset: () => void;
  onOpenSettings: () => void;
  onOpenGroupSettings?: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
  onSearchToggle?: () => void;
  isSearching?: boolean;
}> = ({ 
  onOpenSettings, 
  onReset, 
  onOpenGroupSettings, 
  showBackButton = false, 
  onBack,
  onSearchToggle,
  isSearching = false
}) => {
  const [showGroupMenu, setShowGroupMenu] = useState(false);
  
  return (
    <header className="bg-white/90 backdrop-blur-md px-4 py-3 sticky top-0 z-30 flex justify-between items-center shadow-sm border-b border-fairy-primary/10">
      <div className="flex items-center gap-3">
        {showBackButton && (
          <button 
            onClick={onBack || onReset} 
            className="p-2 text-gray-600 hover:text-fairy-primary hover:bg-fairy-primary/10 rounded-full transition-colors -ml-2" 
            title="返回上一頁"
          >
            <ArrowLeft size={22} />
          </button>
        )}
        
        <button 
          onClick={onOpenGroupSettings || (() => setShowGroupMenu(!showGroupMenu))}
          className="bg-fairy-accent/10 text-fairy-accent p-2 rounded-full border border-fairy-accent/20 hover:bg-fairy-accent/20 transition-colors"
        >
          <Users size={20} />
        </button>
        
        <div className="flex flex-col">
          <h1 className="font-bold text-gray-800 text-base tracking-wide flex items-center gap-1">
            一池0仙宮 <span className="text-xs text-gray-400 font-normal">(6)</span>
          </h1>
          <span className="text-[10px] text-gray-400">智慧仙姑, 桃花仙子...</span>
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        {/* 搜尋按鈕 */}
        {onSearchToggle && (
          <button 
            onClick={onSearchToggle}
            className={`p-2 rounded-full transition-colors ${
              isSearching 
                ? 'bg-fairy-primary text-white' 
                : 'text-gray-400 hover:text-fairy-primary hover:bg-fairy-primary/10'
            }`}
            title="搜尋對話"
          >
            <Search size={20} />
          </button>
        )}
        
        {/* 次要功能按鈕 - 收納到選單中 */}
        <div className="relative">
          <button 
            onClick={() => setShowGroupMenu(!showGroupMenu)}
            className="p-2 text-gray-400 hover:text-fairy-primary hover:bg-fairy-primary/10 rounded-full transition-colors"
            title="更多選項"
          >
            <MoreVertical size={20} />
          </button>
          
          {showGroupMenu && (
            <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 p-2 min-w-[180px] z-50 animate-fade-in">
              <button className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg flex items-center gap-3 text-sm text-gray-700">
                <Phone size={16} />
                語音通話
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg flex items-center gap-3 text-sm text-gray-700">
                <Video size={16} />
                視訊通話
              </button>
              <button 
                onClick={onOpenGroupSettings}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg flex items-center gap-3 text-sm text-gray-700"
              >
                <Users size={16} />
                群組設定
              </button>
              <div className="border-t border-gray-100 my-1"></div>
              <button 
                onClick={() => { setShowGroupMenu(false); onReset(); }}
                className="w-full text-left px-4 py-2 hover:bg-red-50 rounded-lg flex items-center gap-3 text-sm text-red-600"
              >
                <RotateCcw size={16} />
                清除所有訊息
              </button>
            </div>
          )}
        </div>
        
        {/* 設定按鈕 - 保持在主要位置 */}
        <button 
          onClick={onOpenSettings} 
          className="p-2 text-fairy-primary hover:bg-fairy-primary/10 rounded-full transition-colors"
          title="設定"
        >
          <Settings size={22} />
        </button>
      </div>
    </header>
  );
};
