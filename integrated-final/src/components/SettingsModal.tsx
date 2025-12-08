import React, { useState, useEffect, useRef } from 'react';
import { X, User, Brain, Camera, Trash2, Mic, Smile, CheckCircle2, Zap, LayoutGrid, TrendingUp } from 'lucide-react';
import { AppSettings, AIPersona } from '../types';
import { TokenStats } from './TokenStats';
import { PersonaSelector } from './PersonaSelector';

interface PersonaData {
  name: string;
  img: string;
  color: string;
  description: string;
}

// 從 App.tsx 傳入的角色資料
interface SettingsModalProps {
  isOpen: boolean; 
  onClose: () => void; 
  settings: AppSettings; 
  onSave: (s: AppSettings) => void;
  currentSessionTokens?: number;
  personaData: Record<AIPersona, PersonaData>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  settings, 
  onSave, 
  currentSessionTokens = 0,
  personaData 
}) => {
  const [local, setLocal] = useState(settings);
  const [activeTab, setActiveTab] = useState<'persona' | 'stats'>('persona');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => setLocal(settings), [settings, isOpen]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const r = new FileReader();
      r.onloadend = () => setLocal({ ...local, userAvatar: r.result as string });
      r.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* 標題列 */}
        <div className="bg-gradient-to-r from-yellow-400 to-amber-500 px-5 py-4 flex justify-between items-center text-white shrink-0">
          <div className="flex gap-2 items-center">
            <User className="w-5 h-5" /> 
            <h2 className="font-bold text-lg">仙女變身設定</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* 分頁切換 */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-5">
          <button
            onClick={() => setActiveTab('persona')}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'persona' 
                ? 'text-yellow-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            角色設定
            {activeTab === 'persona' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-500"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative flex items-center justify-center gap-2 ${
              activeTab === 'stats' 
                ? 'text-yellow-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <TrendingUp size={14} />
            使用統計
            {activeTab === 'stats' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-500"></div>
            )}
          </button>
        </div>

        <div className="p-5 space-y-6 overflow-y-auto scrollbar-hide flex-1">
          
          {activeTab === 'persona' ? (
            <>
              {/* 1. 用戶頭像設定 */}
              <div className="flex flex-col items-center">
                <div className="relative group w-20 h-20 rounded-full border-4 border-yellow-50 overflow-hidden bg-gray-100 flex justify-center items-center shadow-md cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  {local.userAvatar ? <img src={local.userAvatar} className="w-full h-full object-cover" /> : <User size={32} className="text-gray-400" />}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Camera className="text-white" size={20}/></div>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUpload} />
                <span className="text-xs text-gray-400 mt-2 font-medium">點擊更換您的頭像</span>
              </div>

              <hr className="border-gray-100" />

              {/* 2. 回覆長度限制 (Token Slider) */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-2xl border border-gray-200">
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-1">
                    <Zap size={16} className="text-yellow-500"/> 回覆長度限制
                  </label>
                  <span className="text-xs text-yellow-600 font-mono bg-white border border-yellow-200 px-2 py-0.5 rounded-md shadow-sm">
                    {local.maxOutputTokens} tokens
                  </span>
                </div>
                <input 
                  type="range" min="512" max="8192" step="512" 
                  value={local.maxOutputTokens} 
                  onChange={(e) => setLocal({ ...local, maxOutputTokens: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1 px-1">
                  <span>短 (512)</span>
                  <span>長 (8192)</span>
                </div>
              </div>

              {/* 3. 新的角色選擇介面 */}
              <PersonaSelector
                selected={local.persona}
                onSelect={(persona) => setLocal({ ...local, persona })}
                personaData={personaData}
              />

              {/* 4. 記憶設定 */}
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-2">
                  <Brain size={16} className="inline mr-1"/> 給仙女的記憶小抄
                </label>
                <textarea 
                  value={local.customMemory} 
                  onChange={(e) => setLocal({...local, customMemory: e.target.value})} 
                  className="w-full p-3 border border-gray-200 rounded-xl bg-white h-20 text-sm resize-none focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 transition-all placeholder-gray-400" 
                  placeholder="例如：我叫 Alex，工程師，喜歡喝拿鐵..." 
                />
              </div>

              {/* 5. 開關 */}
              <div className="flex gap-3">
                <label className={`flex-1 flex justify-between items-center p-3 border rounded-xl transition-all cursor-pointer ${local.enableMic ? 'bg-yellow-50 border-yellow-300' : 'bg-gray-50 border-gray-200 hover:border-gray-300'}`}>
                  <span className="text-xs flex gap-1 font-medium text-gray-600"><Mic size={14}/> 語音輸入</span>
                  <input type="checkbox" className="accent-yellow-500" checked={local.enableMic} onChange={e => setLocal({...local, enableMic: e.target.checked})}/>
                </label>
                <label className={`flex-1 flex justify-between items-center p-3 border rounded-xl transition-all cursor-pointer ${local.enableEmoji ? 'bg-yellow-50 border-yellow-300' : 'bg-gray-50 border-gray-200 hover:border-gray-300'}`}>
                  <span className="text-xs flex gap-1 font-medium text-gray-600"><Smile size={14}/> 表情符號</span>
                  <input type="checkbox" className="accent-yellow-500" checked={local.enableEmoji} onChange={e => setLocal({...local, enableEmoji: e.target.checked})}/>
                </label>
              </div>
            </>
          ) : (
            <>
              {/* Token 使用統計分頁 */}
              <TokenStats settings={local} currentSessionTokens={currentSessionTokens} />
              
              {/* 每日上限設定 */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-2xl border border-gray-200">
                <label className="text-sm font-bold text-gray-700 block mb-3">
                  設定每日 Token 上限
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={local.dailyTokenLimit || 50000}
                    onChange={(e) => setLocal({ ...local, dailyTokenLimit: Number(e.target.value) })}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
                    min="1000"
                    step="1000"
                  />
                  <span className="text-xs text-gray-500 font-medium">tokens</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  當達到此上限時會收到提醒通知
                </p>
              </div>
            </>
          )}
        </div>

        {/* 底部按鈕 */}
        <div className="bg-gray-50 px-5 py-4 flex justify-end gap-3 border-t border-gray-100 shrink-0">
          <button 
            onClick={onClose} 
            className="px-5 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
          >
            取消
          </button>
          <button 
            onClick={() => { onSave(local); onClose(); }} 
            className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 rounded-xl shadow-sm transition-all active:scale-95"
          >
            確認變身
          </button>
        </div>
      </div>
    </div>
  );
};

