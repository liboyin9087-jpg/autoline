import React, { useState, useRef } from 'react';
import { Send, Plus, SlidersHorizontal, Mic, Smile, X, Filter } from 'lucide-react';

// Emoji 快捷選擇器
const EMOJI_PRESETS = ['😊', '👍', '❤️', '😂', '🎉', '🙏', '💪', '✨', '🔥', '😎', '🤔', '😭', '😍', '🎊', '💯'];

// Filter 選項
const FILTER_OPTIONS = [
  { id: 'text', label: '純文字', icon: '📝' },
  { id: 'image', label: '圖片', icon: '🖼️' },
  { id: 'code', label: '程式碼', icon: '💻' },
  { id: 'analysis', label: '分析', icon: '📊' },
];

export const InputArea: React.FC<{ 
  onSend: (t: string, f: File[]) => void; 
  onShowToast: (m: string) => void; 
  isLoading: boolean; 
  selectedFiles: File[]; 
  onFilesChange: (f: File[]) => void; 
  settings: AppSettings;
}> = ({ onSend, onShowToast, isLoading, selectedFiles, onFilesChange, showMic = true, showEmoji = true }) => {
  
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const handleSend = () => { 
    if ((text.trim() || selectedFiles.length > 0) && !isLoading) { 
      onSend(text, selectedFiles); 
      setText(''); 
      onFilesChange([]); 
    } 
  };
  
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => { 
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (selectedFiles.length + newFiles.length > 10) {
        onShowToast('最多只能上傳 10 個檔案');
        return;
      }
      onFilesChange([...selectedFiles, ...newFiles]); 
    }
    e.target.value=''; 
  };
  
  // 麥克風錄音功能
  const handleMicClick = async () => {
    if (isRecording) {
      // 停止錄音
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `錄音_${Date.now()}.webm`, { type: 'audio/webm' });
        onFilesChange([...selectedFiles, audioFile]);
        onShowToast('✅ 錄音已新增');
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      onShowToast('🎤 錄音中...');
    } catch (error) {
      console.error('Mic error:', error);
      onShowToast('❌ 無法使用麥克風，請檢查權限設定');
    }
  };
  
  // Emoji 插入功能
  const handleEmojiClick = (emoji: string) => {
    setText(text + emoji);
    setShowEmojiPicker(false);
  };
  
  // Filter 切換功能
  const toggleFilter = (filterId: string) => {
    setActiveFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
    onShowToast(`${activeFilters.includes(filterId) ? '取消' : '啟用'} ${FILTER_OPTIONS.find(f => f.id === filterId)?.label} 模式`);
  };
  
  // Icon 樣式：金色/玉色
  const iconClass = "p-2 text-yellow-600 hover:bg-yellow-50 rounded-full transition-colors";
  const activeIconClass = "p-2 bg-yellow-100 text-yellow-700 rounded-full";
  
  return (
    <div className="bg-white/95 backdrop-blur-md px-4 py-3 border-t border-fairy-primary/10 sticky bottom-0 z-40 w-full shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      {/* Emoji 選擇器 */}
      {showEmojiPicker && (
        <div className="mb-3 p-4 bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">選擇表情符號</span>
            <button onClick={() => setShowEmojiPicker(false)} className="text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>
          <div className="grid grid-cols-8 gap-2">
            {EMOJI_PRESETS.map(emoji => (
              <button
                key={emoji}
                onClick={() => handleEmojiClick(emoji)}
                className="text-2xl hover:bg-gray-100 rounded-lg p-2 transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Filter 選單 */}
      {showFilterMenu && (
        <div className="mb-3 p-4 bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-700">回答類型篩選</span>
            <button onClick={() => setShowFilterMenu(false)} className="text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {FILTER_OPTIONS.map(option => (
              <button
                key={option.id}
                onClick={() => toggleFilter(option.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeFilters.includes(option.id)
                    ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-400'
                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{option.icon}</span>
                {option.label}
              </button>
            ))}
          </div>
          {activeFilters.length > 0 && (
            <div className="mt-3 text-xs text-gray-500">
              已啟用 {activeFilters.length} 個篩選器
            </div>
          )}
        </div>
      )}
      
      {/* 已選檔案列表 */}
      {selectedFiles.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {selectedFiles.map((file, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1 text-xs">
              <span className="truncate max-w-[120px]">{file.name}</span>
              <button 
                onClick={() => onFilesChange(selectedFiles.filter((_, i) => i !== idx))}
                className="text-gray-500 hover:text-red-500"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFile} multiple accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt" />
        
        {/* 左側功能鍵 */}
        <button onClick={() => fileInputRef.current?.click()} className={iconClass} title="上傳檔案">
          <Plus size={24}/>
        </button>
        
        <button 
          onClick={() => setShowFilterMenu(!showFilterMenu)} 
          className={`${showFilterMenu || activeFilters.length > 0 ? activeIconClass : iconClass} relative`}
          title="篩選器"
        >
          <Filter size={24}/>
          {activeFilters.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
              {activeFilters.length}
            </span>
          )}
        </button>
        
        {showMic && (
          <button 
            onClick={handleMicClick} 
            className={isRecording ? activeIconClass : iconClass}
            title={isRecording ? '停止錄音' : '開始錄音'}
          >
            <Mic size={24} className={isRecording ? 'animate-pulse' : ''} />
          </button>
        )}
        
        {showEmoji && (
          <button 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
            className={showEmojiPicker ? activeIconClass : iconClass}
            title="表情符號"
          >
            <Smile size={24}/>
          </button>
        )}
        
        {/* 輸入框 */}
        <div className="flex-1 bg-gray-50 rounded-2xl flex items-center px-4 py-2 border border-gray-100 focus-within:border-yellow-400 focus-within:ring-2 focus-within:ring-yellow-100 transition-all">
          <textarea 
            value={text} 
            onChange={e => setText(e.target.value)} 
            onKeyDown={e => { 
              if(e.key==='Enter' && !e.shiftKey) { 
                e.preventDefault(); 
                handleSend(); 
              }
            }} 
            placeholder={isRecording ? "錄音中..." : "輸入訊息..."} 
            disabled={isLoading || isRecording} 
            className="w-full bg-transparent border-none outline-none resize-none text-sm py-2 max-h-[120px] text-gray-700 placeholder-gray-400" 
            rows={1} 
          />
        </div>
        
        {/* 發送按鈕 (金色) */}
        <button 
          onClick={handleSend} 
          disabled={(!text.trim() && !selectedFiles.length) || isLoading} 
          className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-full shadow-md disabled:bg-gray-200 disabled:shadow-none transition-transform active:scale-95"
        >
          <Send size={20}/>
        </button>
      </div>
    </div>
  );
};
