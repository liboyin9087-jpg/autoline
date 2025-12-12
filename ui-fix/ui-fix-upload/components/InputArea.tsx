import React, { useState, useRef } from 'react';
import { Send, Plus, Mic, Smile, X, Filter } from 'lucide-react';

const EMOJI_PRESETS = ['😊', '👍', '❤️', '😂', '🎉', '🙏', '💪', '✨', '🔥', '😎', '🤔', '😭', '😍', '🎊', '💯'];
const FILTER_OPTIONS = [
  { id: 'text', label: '純文字', icon: '📝' },
  { id: 'image', label: '圖片', icon: '🖼️' },
  { id: 'code', label: '程式碼', icon: '💻' },
  { id: 'analysis', label: '分析', icon: '📊' },
];

interface InputAreaProps {
  onSend: (text: string, files: File[]) => void;
  onShowToast: (message: string) => void;
  isLoading: boolean;
  selectedFiles: File[];
  onFilesChange: (files: File[]) => void;
  showMic: boolean;
  showEmoji: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ 
  onSend, onShowToast, isLoading, selectedFiles, onFilesChange, showMic, showEmoji 
}) => {
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
    } 
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFilesChange([...selectedFiles, ...files]);
      onShowToast(`已選擇 ${files.length} 個檔案`);
    }
  };

  const removeFile = (index: number) => {
    onFilesChange(selectedFiles.filter((_, i) => i !== index));
  };

  const toggleFilter = (filterId: string) => {
    setActiveFilters(prev => prev.includes(filterId) ? prev.filter(f => f !== filterId) : [...prev, filterId]);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `recording-${Date.now()}.webm`, { type: 'audio/webm' });
        onFilesChange([...selectedFiles, audioFile]);
        onShowToast('錄音完成');
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorder.start();
      setIsRecording(true);
      onShowToast('開始錄音...');
    } catch (err) {
      onShowToast('無法存取麥克風');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-lg z-40">
      {selectedFiles.length > 0 && (
        <div className="px-4 py-2 border-b border-gray-100 flex gap-2 overflow-x-auto scrollbar-hide">
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex items-center gap-2 bg-fairy-primary/10 px-3 py-1.5 rounded-full text-sm whitespace-nowrap">
              <span className="max-w-[100px] truncate">{file.name}</span>
              <button onClick={() => removeFile(index)} className="text-gray-500 hover:text-red-500"><X size={14} /></button>
            </div>
          ))}
        </div>
      )}
      
      {showEmojiPicker && (
        <div className="absolute bottom-full left-0 right-0 bg-white border-t border-gray-100 p-3 shadow-lg">
          <div className="grid grid-cols-8 gap-2 max-w-md mx-auto">
            {EMOJI_PRESETS.map((emoji, i) => (
              <button key={i} onClick={() => { setText(prev => prev + emoji); setShowEmojiPicker(false); }} className="text-2xl hover:scale-125 transition-transform p-1">{emoji}</button>
            ))}
          </div>
        </div>
      )}
      
      {showFilterMenu && (
        <div className="absolute bottom-full left-0 right-0 bg-white border-t border-gray-100 p-3 shadow-lg">
          <div className="flex gap-2 justify-center flex-wrap">
            {FILTER_OPTIONS.map(option => (
              <button key={option.id} onClick={() => toggleFilter(option.id)} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${activeFilters.includes(option.id) ? 'bg-fairy-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                <span>{option.icon}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex items-center gap-2 p-3 max-w-4xl mx-auto">
        <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" multiple accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt" />
        
        <button onClick={() => fileInputRef.current?.click()} className="p-2.5 text-fairy-primary hover:bg-fairy-primary/10 rounded-full transition-colors" title="附加檔案"><Plus size={22} /></button>
        
        <button onClick={() => setShowFilterMenu(!showFilterMenu)} className={`p-2.5 rounded-full transition-colors ${showFilterMenu ? 'bg-fairy-primary text-white' : 'text-fairy-primary hover:bg-fairy-primary/10'}`} title="篩選"><Filter size={22} /></button>
        
        {showMic && (
          <button onClick={isRecording ? stopRecording : startRecording} className={`p-2.5 rounded-full transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'text-fairy-primary hover:bg-fairy-primary/10'}`} title={isRecording ? '停止錄音' : '語音輸入'}><Mic size={22} /></button>
        )}
        
        {showEmoji && (
          <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`p-2.5 rounded-full transition-colors ${showEmojiPicker ? 'bg-fairy-primary text-white' : 'text-fairy-primary hover:bg-fairy-primary/10'}`} title="表情符號"><Smile size={22} /></button>
        )}
        
        <div className="flex-1 relative">
          <textarea value={text} onChange={(e) => setText(e.target.value)} onKeyDown={handleKeyDown} placeholder="輸入訊息..." rows={1} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-fairy-primary/30 focus:border-fairy-primary transition-all text-sm" style={{ minHeight: '44px', maxHeight: '120px' }} />
        </div>
        
        <button onClick={handleSend} disabled={isLoading || (!text.trim() && selectedFiles.length === 0)} className="p-3 bg-fairy-primary text-white rounded-full shadow-md disabled:bg-gray-200 disabled:shadow-none transition-transform active:scale-95 hover:bg-fairy-dark"><Send size={20} /></button>
      </div>
    </div>
  );
};
