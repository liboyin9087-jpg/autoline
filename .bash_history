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
  
  const handleMicClick = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => audioChunksRef.current.push(event.data);
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
  
  const handleEmojiClick = (emoji: string) => {
    setText(text + emoji);
    setShowEmojiPicker(false);
  };
  
  const toggleFilter = (filterId: string) => {
    setActiveFilters(prev => prev.includes(filterId) ? prev.filter(id => id !== filterId) : [...prev, filterId]);
    onShowToast(`${activeFilters.includes(filterId) ? '取消' : '啟用'} ${FILTER_OPTIONS.find(f => f.id === filterId)?.label} 模式`);
  };
  
  const iconClass = "p-2 text-yellow-600 hover:bg-yellow-50 rounded-full transition-colors";
  const activeIconClass = "p-2 bg-yellow-100 text-yellow-700 rounded-full";
  
  return (
    <div className="bg-white/95 backdrop-blur-md px-4 py-3 border-t border-fairy-primary/10 sticky bottom-0 z-40 w-full shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      {showEmojiPicker && (
        <div className="mb-3 p-4 bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">選擇表情符號</span>
            <button onClick={() => setShowEmojiPicker(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>
          <div className="grid grid-cols-8 gap-2">
            {EMOJI_PRESETS.map(emoji => (
              <button key={emoji} onClick={() => handleEmojiClick(emoji)} className="text-2xl hover:bg-gray-100 rounded-lg p-2 transition-colors">{emoji}</button>
            ))}
          </div>
        </div>
      )}
      
      {showFilterMenu && (
        <div className="mb-3 p-4 bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-700">回答類型篩選</span>
            <button onClick={() => setShowFilterMenu(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {FILTER_OPTIONS.map(option => (
              <button key={option.id} onClick={() => toggleFilter(option.id)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeFilters.includes(option.id) ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-400' : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'}`}>
                <span className="mr-2">{option.icon}</span>{option.label}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {selectedFiles.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {selectedFiles.map((file, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1 text-xs">
              <span className="truncate max-w-[120px]">{file.name}</span>
              <button onClick={() => onFilesChange(selectedFiles.filter((_, i) => i !== idx))} className="text-gray-500 hover:text-red-500"><X size={14} /></button>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFile} multiple accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt" />
        <button onClick={() => fileInputRef.current?.click()} className={iconClass} title="上傳檔案"><Plus size={24}/></button>
        <button onClick={() => setShowFilterMenu(!showFilterMenu)} className={`${showFilterMenu || activeFilters.length > 0 ? activeIconClass : iconClass} relative`} title="篩選器">
          <Filter size={24}/>
          {activeFilters.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">{activeFilters.length}</span>}
        </button>
        {showMic && <button onClick={handleMicClick} className={isRecording ? activeIconClass : iconClass} title={isRecording ? '停止錄音' : '開始錄音'}><Mic size={24} className={isRecording ? 'animate-pulse' : ''} /></button>}
        {showEmoji && <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={showEmojiPicker ? activeIconClass : iconClass} title="表情符號"><Smile size={24}/></button>}
        
        <div className="flex-1 bg-gray-50 rounded-2xl flex items-center px-4 py-2 border border-gray-100 focus-within:border-yellow-400 focus-within:ring-2 focus-within:ring-yellow-100 transition-all">
          <textarea 
            value={text} 
            onChange={e => setText(e.target.value)} 
            onKeyDown={e => { if(e.key==='Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}} 
            placeholder={isRecording ? "錄音中..." : "輸入訊息..."} 
            disabled={isLoading || isRecording} 
            className="w-full bg-transparent border-none outline-none resize-none text-sm py-2 max-h-[120px] text-gray-700 placeholder-gray-400" 
            rows={1} 
          />
        </div>
        
        <button onClick={handleSend} disabled={(!text.trim() && !selectedFiles.length) || isLoading} className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-full shadow-md disabled:bg-gray-200 disabled:shadow-none transition-transform active:scale-95"><Send size={20}/></button>
      </div>
    </div>
  );
};
EOF

cd ~/autoline-main/integrated-final
./deploy.sh
gcloud run services update line-ai-assistant   --set-env-vars GOOGLE_API_KEY=您的_API_KEY   --region asia-east1
# 1. 恢復正確的 App.tsx
cd ~/autoline-main/integrated-final/src
curl -o App.tsx https://raw.githubusercontent.com/anthropics/anthropic-cookbook/main/misc/empty.txt 2>/dev/null || true
cat > App.tsx << 'APPEOF'
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { MessageBubble } from './components/MessageBubble';
import { InputArea } from './components/InputArea';
import { Toast } from './components/Toast';
import { PreviewModal } from './components/PreviewModal';
import { SettingsModal } from './components/SettingsModal';
import { IntroOverlay } from './components/IntroOverlay';
import { SearchBar } from './components/SearchBar';
import { QuickActionsManager } from './components/QuickActionsManager';
import { DivineFortune } from './components/DivineFortune';
import { FairyGroupChat, GroupChatTrigger } from './components/FairyGroupChat';
import { EasterEggEffectRenderer, EasterEggToast, useEasterEgg } from './components/EasterEggSystem';
import { Message, MessageRole, AppMode, ToastState, AppSettings, AIPersona, MessageStatus, QuickAction } from './types';
import { sendMessageToGemini } from './services/geminiService';
import { extractArtifacts } from './utils/parser';
import { Edit3, Users, Wand2 } from 'lucide-react';

const STORAGE_KEY = 'line_ai_chat_history';
const SETTINGS_KEY = 'line_ai_settings';

const PERSONA_DATA = {
  [AIPersona.CONSULTANT]: { name: "智慧仙姑", img: "/fairy_consultant.png", color: "#7c3aed", description: "理性分析，解答疑惑" },
  [AIPersona.FRIEND]: { name: "桃花仙子", img: "/qr_selfie_fairy.png", color: "#ec4899", description: "熱情親切，陪伴聆聽" },
  [AIPersona.CONCISE]: { name: "閃電娘娘", img: "/fairy_food.png", color: "#f97316", description: "極速回應，直達重點" },
  [AIPersona.CREATIVE]: { name: "雲夢仙子", img: "/tea_gossip_fairy.png", color: "#06b6d4", description: "靈感湧現，詩意表達" },
  [AIPersona.TECH]: { name: "天機星君", img: "/fairy_tech.png", color: "#3b82f6", description: "技術專精，程式Debug" }
};

const PERSONA_UI_CONFIG = {
  [AIPersona.CONSULTANT]: { loading: "👵 智慧仙姑正在思考...", welcome: "施主你好，老身已就位。今日有何困惑？" },
  [AIPersona.FRIEND]: { loading: "💖 桃花仙子打字中...", welcome: "嗨嗨～親愛的！我在這💕 隨時聽你說！" },
  [AIPersona.CONCISE]: { loading: "⚡️ 閃電處理中...", welcome: "閃電娘娘在此。說重點。" },
  [AIPersona.CREATIVE]: { loading: "☁️ 雲夢尋靈感...", welcome: "雲深不知處... 旅人啊，我們來聊聊夢想。" },
  [AIPersona.TECH]: { loading: "🤖 System Computing...", welcome: "天機星君已上線。請輸入指令。" }
};

const DEFAULT_QUICK_ACTIONS: QuickAction[] = [
  { id: '1', icon: '🍑', label: '御膳房', subLabel: '附近美食', colorClass: 'bg-orange-400', prompt: '📍 請推薦附近 3 間高評價美食，請在 50 字內簡短回答。' },
  { id: '2', icon: '🎋', label: '天宮籤', subLabel: '今日運勢', colorClass: 'bg-purple-500', prompt: '__DIVINE_FORTUNE__' },
  { id: '3', icon: '🍵', label: '仙女錦囊', subLabel: '生活建議', colorClass: 'bg-green-500', prompt: '給我一個健康的生活建議，50字內。' },
  { id: '4', icon: '💠', label: '無字天書', subLabel: '解悶/代碼', colorClass: 'bg-blue-500', prompt: '講一個超級好笑的短笑話。' },
];

const QuickActionBtn = ({ icon, label, subLabel, colorClass, onClick }: { icon: React.ReactNode, label: string, subLabel: string, colorClass: string, onClick: () => void }) => (
  <button onClick={onClick} className="relative overflow-hidden group flex flex-col items-center justify-center p-4 rounded-2xl border border-white/40 bg-white/60 backdrop-blur-md shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 w-full aspect-[1/1]">
    <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-40 ${colorClass}`}></div>
    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-inner mb-3 bg-white/80 ${colorClass.replace('bg-', 'text-')}`}>{icon}</div>
    <span className="text-sm font-bold text-gray-800 tracking-wide">{label}</span>
    <span className="text-[10px] text-gray-500 mt-1">{subLabel}</span>
  </button>
);

const App: React.FC = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ 
    maxOutputTokens: 4096, persona: AIPersona.CONSULTANT, customMemory: "", 
    enableMic: true, enableEmoji: true, quickActions: [], dailyTokenLimit: 50000, tokenUsageStats: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<AppMode>(AppMode.LIFESTYLE);
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'info', isVisible: false });
  const [currentSessionTokens, setCurrentSessionTokens] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickActionsManagerOpen, setIsQuickActionsManagerOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showDivineFortune, setShowDivineFortune] = useState(false);
  const [showGroupChat, setShowGroupChat] = useState(false);
  const [groupChatQuestion, setGroupChatQuestion] = useState('');
  const { checkForEasterEgg, activeEffect, setActiveEffect, toastMessage: easterEggToast, showToast: showEasterEggToast, setShowToast: setShowEasterEggToast, triggeredEgg } = useEasterEgg();

  useEffect(() => { 
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed, enableMic: parsed.enableMic ?? true, enableEmoji: parsed.enableEmoji ?? true, quickActions: parsed.quickActions || DEFAULT_QUICK_ACTIONS }));
      } catch (e) { console.error(e); }
    } else {
      setSettings(prev => ({ ...prev, quickActions: DEFAULT_QUICK_ACTIONS }));
    }
    const savedMessages = localStorage.getItem(STORAGE_KEY);
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages).map((msg: any) => ({ ...msg, timestamp: new Date(msg.timestamp) })));
      } catch (e) { console.error(e); }
    }
  }, []);
  
  useEffect(() => { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }, [settings]);
  useEffect(() => { if (messages.length > 0) localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); }, [messages]);

  const handleReset = useCallback(() => {
    const uiConfig = PERSONA_UI_CONFIG[settings.persona] || PERSONA_UI_CONFIG[AIPersona.CONSULTANT];
    setMessages([{ id: 'welcome', role: MessageRole.MODEL, text: uiConfig.welcome, timestamp: new Date(), status: MessageStatus.SENT }]);
    setCurrentSessionTokens(0);
    setSelectedFiles([]);
    setToast({ message: "對話已重置", type: "success", isVisible: true });
  }, [settings.persona]);

  useEffect(() => {
    const uiConfig = PERSONA_UI_CONFIG[settings.persona] || PERSONA_UI_CONFIG[AIPersona.CONSULTANT];
    setMessages(prev => {
      if (prev.length === 0) return [{ id: 'welcome', role: MessageRole.MODEL, text: uiConfig.welcome, timestamp: new Date(), status: MessageStatus.SENT }];
      if (prev.length === 1 && prev[0].id === 'welcome') return [{ ...prev[0], text: uiConfig.welcome }];
      return prev;
    });
  }, [settings.persona]);

  const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleSend = async (text: string, files: File[]) => {
    if (!text.trim() && files.length === 0) return;
    if (text === '__DIVINE_FORTUNE__') { setShowDivineFortune(true); return; }
    const easterEgg = checkForEasterEgg(text);
    if (easterEgg?.effect === 'fairy_summon') { setGroupChatQuestion(text); setShowGroupChat(true); return; }

    const messageId = Date.now().toString();
    const attachments = await Promise.all(files.map(async (file) => ({ id: Math.random().toString(), mimeType: file.type, data: await fileToBase64(file), filename: file.name, size: file.size })));
    const newUserMsg: Message = { id: messageId, role: MessageRole.USER, text, timestamp: new Date(), status: MessageStatus.PENDING, attachments: attachments.length > 0 ? attachments : undefined };
    
    setMessages(prev => [...prev, newUserMsg]);
    setSelectedFiles([]);
    setIsLoading(true);

    try {
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, status: MessageStatus.SENT } : m));
      const res = await sendMessageToGemini([...messages, newUserMsg], mode, undefined, settings);
      const responseText = easterEgg?.customResponse ? `${easterEgg.customResponse}\n\n---\n\n${res.text}` : res.text;
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: MessageRole.MODEL, text: responseText, timestamp: new Date(), artifacts: extractArtifacts(responseText), usage: res.usage, status: MessageStatus.SENT }]);
      if (res.usage) setCurrentSessionTokens(prev => prev + res.usage.totalTokens);
    } catch (e) { 
      console.error(e); 
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, status: MessageStatus.FAILED } : m));
      setToast({ message: "連線錯誤，請重試", type: "error", isVisible: true }); 
    } finally { setIsLoading(false); }
  };

  const handleRetry = useCallback((messageId: string) => {
    const failedMessage = messages.find(m => m.id === messageId);
    if (!failedMessage) return;
    setMessages(prev => prev.filter(m => m.id !== messageId));
    handleSend(failedMessage.text, []);
  }, [messages]);

  const handleMessageSelect = useCallback((messageId: string) => {
    const element = messageRefs.current[messageId];
    if (element) { element.scrollIntoView({ behavior: 'smooth', block: 'center' }); element.classList.add('bg-yellow-100'); setTimeout(() => element.classList.remove('bg-yellow-100'), 2000); }
  }, []);

  const handleSaveQuickActions = useCallback((actions: QuickAction[]) => { setSettings(prev => ({ ...prev, quickActions: actions })); setToast({ message: "快速操作已更新", type: "success", isVisible: true }); }, []);
  const handleFortuneResult = useCallback((fortune: any) => { handleSend(`🎋 第 ${fortune.number} 籤【${fortune.level}】- ${fortune.title}\n籤詩：「${fortune.poem}」\n請解讀`, []); }, []);
  const handleGroupChatResponse = useCallback((persona: AIPersona, response: string) => { setMessages(prev => [...prev, { id: Date.now().toString(), role: MessageRole.MODEL, text: `**${PERSONA_DATA[persona]?.name}**：\n\n${response}`, timestamp: new Date(), status: MessageStatus.SENT }]); }, []);
  const handleGroupChatAllResponses = useCallback((responses: any[]) => { setMessages(prev => [...prev, { id: Date.now().toString(), role: MessageRole.MODEL, text: `🎭 **仙女會議**\n\n${responses.map(r => `**${r.name}**：${r.response}`).join('\n\n---\n\n')}`, timestamp: new Date(), status: MessageStatus.SENT }]); }, []);
  const handleStartGroupChat = useCallback(() => { const lastUserMessage = [...messages].reverse().find(m => m.role === MessageRole.USER); if (lastUserMessage) { setGroupChatQuestion(lastUserMessage.text); setShowGroupChat(true); } else { setToast({ message: "請先輸入問題", type: "info", isVisible: true }); } }, [messages]);

  const currentPersona = PERSONA_DATA[settings.persona] || PERSONA_DATA[AIPersona.CONSULTANT];
  const quickActions = settings.quickActions?.length > 0 ? settings.quickActions : DEFAULT_QUICK_ACTIONS;

  return (
    <div className="flex flex-col h-screen bg-fairy-bg font-sans overflow-hidden relative">
      {showIntro && <IntroOverlay onComplete={() => setShowIntro(false)} />}
      <EasterEggEffectRenderer effect={activeEffect} isActive={activeEffect !== 'none'} onComplete={() => setActiveEffect('none')} duration={triggeredEgg?.duration || 3000} />
      <EasterEggToast message={easterEggToast} isVisible={showEasterEggToast} onClose={() => setShowEasterEggToast(false)} />
      <Header mode={mode} onModeChange={setMode} onReset={handleReset} onOpenSettings={() => setIsSettingsOpen(true)} showBackButton={true} onBack={handleReset} onSearchToggle={() => setIsSearchOpen(!isSearchOpen)} isSearching={isSearchOpen} />
      <SearchBar isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} messages={messages} onMessageSelect={handleMessageSelect} />
      <Toast state={toast} onClose={() => setToast({ ...toast, isVisible: false })} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} settings={settings} onSave={setSettings} currentSessionTokens={currentSessionTokens} personaData={PERSONA_DATA} />
      {isQuickActionsManagerOpen && <QuickActionsManager quickActions={quickActions} onSave={handleSaveQuickActions} onClose={() => setIsQuickActionsManagerOpen(false)} />}
      <DivineFortune isOpen={showDivineFortune} onClose={() => setShowDivineFortune(false)} onResult={handleFortuneResult} botName={currentPersona.name} botAvatar={currentPersona.img} />
      <FairyGroupChat isOpen={showGroupChat} onClose={() => setShowGroupChat(false)} userQuestion={groupChatQuestion} onSelectResponse={handleGroupChatResponse} onSendAllResponses={handleGroupChatAllResponses} />
      
      <main className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto p-4 pb-20 scrollbar-hide">
        {messages.length <= 1 && !isLoading && (
          <div className="flex flex-col items-center justify-center animate-fade-in mt-6 mb-8">
            <div className="w-full px-4">
              <div className="flex justify-center mb-6"><GroupChatTrigger onClick={() => { setGroupChatQuestion(''); setShowGroupChat(true); }} /></div>
              <div className="flex items-center justify-between mb-4 opacity-70">
                <div className="flex items-center gap-2"><div className="h-[1px] w-8 bg-fairy-primary"></div><p className="text-fairy-primary font-bold text-xs tracking-widest">御賜法寶</p><div className="h-[1px] w-8 bg-fairy-primary"></div></div>
                <button onClick={() => setIsQuickActionsManagerOpen(true)} className="text-xs text-fairy-primary hover:text-fairy-dark flex items-center gap-1 font-medium"><Edit3 size={12} /> 自訂</button>
              </div>
              <div className="grid grid-cols-2 gap-4">{quickActions.map(action => (<QuickActionBtn key={action.id} icon={action.icon} label={action.label} subLabel={action.subLabel} colorClass={action.colorClass} onClick={() => handleSend(action.prompt, [])} />))}</div>
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100"><div className="flex items-center gap-2 mb-2"><Wand2 size={16} className="text-purple-500" /><span className="text-sm font-bold text-purple-700">隱藏彩蛋</span></div><p className="text-xs text-gray-600">試試說「下班」「發財」「單身」「debug」... 會有驚喜喔！✨</p></div>
            </div>
          </div>
        )}
        {messages.map(msg => (<div key={msg.id} ref={el => { messageRefs.current[msg.id] = el; }} className="transition-colors duration-300"><MessageBubble message={msg} userAvatar={settings.userAvatar} botAvatar={currentPersona.img} botName={currentPersona.name} onPreview={() => {}} onRetry={handleRetry} /></div>))}
        {isLoading && (<div className="flex justify-center my-4"><div className="bg-white/80 backdrop-blur px-5 py-2 rounded-full text-fairy-primary text-sm flex items-center gap-2 shadow-soft border border-fairy-primary/10 animate-pulse"><span className="animate-bounce text-lg">✨</span><span>{PERSONA_UI_CONFIG[settings.persona]?.loading}</span></div></div>)}
        <div ref={messagesEndRef} />
      </main>
      {messages.length > 1 && (<div className="absolute bottom-24 right-4 z-30"><button onClick={handleStartGroupChat} className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110" title="召喚全體仙女"><Users size={24} /></button></div>)}
      <InputArea onSend={handleSend} onShowToast={(m) => setToast({ message: m, type: 'info', isVisible: true })} isLoading={isLoading} selectedFiles={selectedFiles} onFilesChange={setSelectedFiles} showMic={settings.enableMic} showEmoji={settings.enableEmoji} />
    </div>
  );
};

export default App;
APPEOF

echo "✅ App.tsx 已修復"
# 設定正確的 API Key（用你真正的金鑰）
gcloud run services update line-ai-assistant   --region asia-east1   --set-env-vars GOOGLE_API_KEY="AIzaSyCNs0SuKTIDlIxF1jHwhcwzWUxQTaw--JA"
# 重新建置和部署
cd ~/autoline-main/integrated-final
npm run build
./deploy.sh
```

---

## 📋 你目前的服務 URL

你應該使用 **asia-east1** 這個：
```
https://line-ai-assistant-970949752172.asia-east1.run.app
# 解壓縮
cd ~
unzip -o ui-fix-upload.zip -d ui-fix
# 複製檔案到正確位置
cp ~/ui-fix/App.tsx ~/autoline-main/integrated-final/src/
cp ~/ui-fix/components/InputArea.tsx ~/autoline-main/integrated-final/src/components/
# 驗證檔案
echo "App.tsx 行數: $(wc -l ~/autoline-main/integrated-final/src/App.tsx)"
echo "InputArea.tsx 行數: $(wc -l ~/autoline-main/integrated-final/src/components/InputArea.tsx)"
# 設定正確的 API Key
gcloud run services update line-ai-assistant   --region asia-east1   --set-env-vars GOOGLE_API_KEY="AIzaSyCNs0SuKTIDlIxF1jHwhcwzWUxQTaw--JA"
# 重新部署
cd ~/autoline-main/integrated-final
npm run build
./deploy.sh
# 1. 將所有修改過的檔案加入暫存區
git add .
# 2. 提交變更（寫一個清楚的備註）
git commit -m "Fix: 修復 API 連線格式、開啟麥克風與 Filter 介面"
# 3. 推送到 GitHub 遠端倉庫
git push
git push -u origin main
gcloud run deploy line-ai-assistant --source . --region asia-east1
git status
# 再次確認所有檔案，包括配置檔，都被加入追蹤
git add . 
# 提交變更 (寫一個新的備註)
git commit -m "Fix: 重新檢查並加入所有缺失的建構設定檔"
# 推送至遠端
git push
# 確保在正確的資料夾
cd ~/autoline-main/integrated-final
# 將新檔案加入 git
git add prompts.js
# 提交
git commit -m "Fix: 補上遺失的 prompts.js 檔案以修復 Cloud Build"
# 推送 (這會立刻觸發 Cloud Build 重新建構)
git push
git pull origin main
git config pull.rebase false
git pull origin main
git push origin main
nano server.js
# 1. 建置
gcloud builds submit --tag gcr.io/gen-lang-client-0093815006/line-ai-assistant-970949752172:latest .
# 2. 部署 (成功後，全形斜線問題就會解決)
gcloud run deploy line-ai-assistant-970949752172   --image gcr.io/gen-lang-client-0093815006/line-ai-assistant-970949752172:latest   --region asia-east1   --platform managed   --allow-unauthenticated
# 1. 建置
gcloud builds submit --tag gcr.io/gen-lang-client-0093815006/line-ai-assistant-970949752172:latest .
# 2. 部署 (成功後，全形斜線問題就會解決)
gcloud run deploy line-ai-assistant-970949752172   --image gcr.io/gen-lang-client-0093815006/line-ai-assistant-970949752172:latest   --region asia-east1   --platform managed   --allow-unauthenticated
cd ~/autoline-main/integrated-final
cat <<EOF > .gcloudignore
.git
.gitignore
node_modules
dist
backup
*.md
LICENSE
README.md
Dockerfile
EOF

# 1. 建置 (因為加了忽略檔，這步會很快開始)
gcloud builds submit --tag gcr.io/gen-lang-client-0093815006/line-ai-assistant-970949752172:latest .
# 2. 部署
gcloud run deploy line-ai-assistant-970949752172   --image gcr.io/gen-lang-client-0093815006/line-ai-assistant-970949752172:latest   --region asia-east1   --platform managed   --allow-unauthenticated
cat <<EOF > .gcloudignore
.git
.gitignore
node_modules
dist
backup
*.md
LICENSE
README.md
EOF

# 1. 建置 (這次它會找到 Dockerfile)
gcloud builds submit --tag gcr.io/gen-lang-client-0093815006/line-ai-assistant-970949752172:latest .
# 2. 部署
gcloud run deploy line-ai-assistant-970949752172   --image gcr.io/gen-lang-client-0093815006/line-ai-assistant-970949752172:latest   --region asia-east1   --platform managed   --allow-unauthenticated
cd ~/autoline-main/integrated-final
npm install
npm run build
gcloud run deploy line-ai-assistant-970949752172   --image gcr.io/gen-lang-client-0093815006/line-ai-assistant-970949752172:latest   --region asia-east1   --platform managed   --allow-unauthenticated
# 1. 確保在正確資料夾
cd ~/autoline-main/integrated-final
# 2. 清理並編譯 (這時候電腦就會開心運作了)
rm -rf dist
npm run build
# 3. 建置映像檔
gcloud builds submit --tag gcr.io/gen-lang-client-0093815006/line-ai-assistant-970949752172:latest .
# 4. 部署
gcloud run deploy line-ai-assistant-970949752172   --image gcr.io/gen-lang-client-0093815006/line-ai-assistant-970949752172:latest   --region asia-east1   --platform managed   --allow-unauthenticated
# 1. 進入資料夾
cd ~/autoline-main/integrated-final
# 2. 清理並重新編譯 (這次刪掉了 index.css 引用，應該會成功)
rm -rf dist
npm run build
# 3. 建置映像檔
gcloud builds submit --tag gcr.io/gen-lang-client-0093815006/line-ai-assistant-970949752172:latest .
# 4. 部署
gcloud run deploy line-ai-assistant-970949752172   --image gcr.io/gen-lang-client-0093815006/line-ai-assistant-970949752172:latest   --region asia-east1   --platform managed   --allow-unauthenticated
gcloud run services update line-ai-assistant-970949752172   --region asia-east1   --set-env-vars GOOGLE_API_KEY="您的_GOOGLE_API_KEY"
# 1. 進入資料夾
cd ~/autoline-main/integrated-final
# 2. 重新編譯 (這步很重要)
rm -rf dist
npm run build
# 3. 建置映像檔
gcloud builds submit --tag gcr.io/gen-lang-client-0093815006/line-ai-assistant-970949752172:latest .
# 4. 部署 (成功後，定位和返回鍵就能用了)
gcloud run deploy line-ai-assistant-970949752172   --image gcr.io/gen-lang-client-0093815006/line-ai-assistant-970949752172:latest   --region asia-east1   --platform managed   --allow-unauthenticated
cd ~/autoline-main/integrated-final
# 1. 重新編譯
rm -rf dist
npm run build
# 2. 建置
gcloud builds submit --tag gcr.io/gen-lang-client-0093815006/line-ai-assistant-970949752172:latest .
# 3. 部署
gcloud run deploy line-ai-assistant-970949752172   --image gcr.io/gen-lang-client-0093815006/line-ai-assistant-970949752172:latest   --region asia-east1   --platform managed   --allow-unauthenticated
mv App_Fixed.tsx src/App.tsx
gcloud run deploy autoline --source .
gcloud run services list
gcloud run deploy line-ai-assistant-970949752172 --source . --region asia-east1
npm run build
# 1. 刪除原本建議的 autoline (台灣)
gcloud run services delete autoline --region asia-east1
# 2. 刪除歐洲區的 autoline
gcloud run services delete autoline --region europe-west1
# 3. 刪除歐洲區的 line-ai-assistant
gcloud run services delete line-ai-assistant --region europe-west1
# 4. 刪除舊的 line-ai-assistant (台灣)
gcloud run services delete line-ai-assistant --region asia-east1
git pull
ls
git add .
git init
git add .
git commit -m "Apply cloudbuild fix for specific service deployment"
git add .
git commit -m "Apply cloudbuild fix for specific service deployment"
git add . && git commit -m "Fix cloudbuild and force deploy" || echo "Commit skipped (no changes)" && git remote remove origin 2>/dev/null || true && git remote add origin https://github.com/liboyin9087-jpg/autoline.git && git push -u origin master -f
# 1. 撤銷剛剛那次失敗的提交 (但保留你的檔案修改)
git reset --soft HEAD~1
# 2. 把所有檔案從「準備提交區」拿出來 (清空暫存)
git reset
# 3. 建立忽略清單 (.gitignore)，告訴 Git 不要理會這些系統大檔案
echo ".cache/" > .gitignore
echo ".codeoss/" >> .gitignore
echo ".npm/" >> .gitignore
echo ".config/" >> .gitignore
echo ".docker/" >> .gitignore
echo ".gemini/" >> .gitignore
echo ".vscode/" >> .gitignore
echo "node_modules/" >> .gitignore
# 4. 重新加入檔案 (這次 Git 會自動略過上面那些大檔案)
git add .
# 5. 重新提交
git commit -m "Fix: Update cloudbuild and ignore system files"
# 6. 再次強制推送
git push -u origin master -f
