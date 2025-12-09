import React, { useState, useRef } from 'react';
import { Send, Plus, Smile, Mic, SlidersHorizontal } from 'lucide-react';
import { GenerationOptions } from '../types';

interface InputAreaProps {
  onSend: (text: string, files: File[], options?: GenerationOptions) => void;
  onShowToast: (message: string, type: 'info' | 'error') => void;
  isLoading: boolean; selectedFiles: File[]; onFilesChange: (files: File[]) => void;
  showMic?: boolean; showEmoji?: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ 
  onSend, onShowToast, isLoading, selectedFiles, onFilesChange, showMic = true, showEmoji = true 
}) => {
  const [text, setText] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleSend = () => { if ((text.trim() || selectedFiles.length > 0) && !isLoading) { onSend(text, selectedFiles, undefined); setText(''); onFilesChange([]); setShowOptions(false); } };
  const showNotImplemented = () => onShowToast("功能開發中！", 'info');

  return (
    <div className="bg-white px-4 py-3 border-t border-gray-200 sticky bottom-0 z-40 w-full shadow-lg">
      {selectedFiles.length > 0 && (<div className="flex gap-2 mb-2 overflow-x-auto pb-2">{selectedFiles.map((f,i)=><div key={i} className="text-xs bg-gray-100 p-1 rounded border">{f.name}</div>)}</div>)}
      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => onFilesChange([...selectedFiles, ...Array.from(e.target.files||[])])} multiple />
        <button onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full mb-1"><Plus size={24} /></button>
        {/* 這裡移除了 hidden sm:block，確保手機看得到 */}
        {showMic && <button onClick={showNotImplemented} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full mb-1"><Mic size={24} /></button>}
        {showEmoji && <button onClick={showNotImplemented} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full mb-1"><Smile size={24} /></button>}
        <div className="flex-1 bg-gray-100 rounded-2xl flex items-center px-4 py-2 border focus-within:border-line transition-colors">
          <textarea ref={textareaRef} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())} placeholder="輸入訊息..." disabled={isLoading} className="w-full bg-transparent border-none outline-none resize-none text-sm max-h-[120px]" rows={1} />
        </div>
        <button onClick={handleSend} disabled={(!text.trim() && selectedFiles.length === 0) || isLoading} className={`p-3 rounded-full mb-1 ${(!text.trim() && selectedFiles.length === 0) || isLoading ? 'bg-gray-200 text-gray-400' : 'bg-green-500 text-white'}`}><Send size={20} /></button>
      </div>
    </div>
  );
};
