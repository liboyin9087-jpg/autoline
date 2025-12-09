import React, { useState, useEffect } from 'react';
import { X, User, Sparkles, Mic, Smile, SlidersHorizontal, Trash2 } from 'lucide-react';
import { AppSettings } from '../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  useEffect(() => { setLocalSettings(settings); }, [settings]);
  
  const handleSave = () => { onSave(localSettings); onClose(); };
  const handleReset = () => { if(confirm("確定清除紀錄？")) { localStorage.removeItem('line_ai_chat_history'); window.location.reload(); } };
  const cost = ((localSettings.maxOutputTokens * 10 * 30) / 1000) * 0.001;

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-fairy-primary px-4 py-3 text-white flex justify-between items-center">
          <h2 className="font-bold flex gap-2"><SlidersHorizontal/> 仙宮設定</h2>
          <button onClick={onClose}><X/></button>
        </div>
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
           <div>
             <label className="text-sm font-bold block mb-1">記憶小抄</label>
             <textarea value={localSettings.customMemory} onChange={e=>setLocalSettings({...localSettings, customMemory: e.target.value})} className="w-full border rounded p-2 text-sm h-20" placeholder="告訴仙女你的名字或喜好..."/>
           </div>
           <div>
             <label className="text-sm font-bold block mb-1">回應長度: {localSettings.maxOutputTokens}</label>
             <input type="range" min="100" max="1000" step="100" value={localSettings.maxOutputTokens} onChange={e=>setLocalSettings({...localSettings, maxOutputTokens: parseInt(e.target.value)})} className="w-full"/>
             <p className="text-xs text-red-500 mt-1">預估月成本: ${cost.toFixed(4)} USD</p>
           </div>
           <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
              <span className="text-sm flex gap-2"><Mic size={16}/> 語音輸入 (UI)</span>
              <input type="checkbox" checked={localSettings.enableMic} onChange={e=>setLocalSettings({...localSettings, enableMic: e.target.checked})}/>
           </div>
           <button onClick={handleReset} className="w-full py-2 text-red-500 border border-red-200 rounded hover:bg-red-50 flex justify-center gap-2"><Trash2 size={16}/> 清除紀錄</button>
        </div>
        <div className="p-4 border-t flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-gray-500">取消</button>
          <button onClick={handleSave} className="px-4 py-2 bg-fairy-primary text-white rounded font-bold">儲存</button>
        </div>
      </div>
    </div>
  );
};
