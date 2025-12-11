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
import { LocationCategorySelector } from './components/LocationCategorySelector';
import { Message, MessageRole, AppMode, ToastState, AppSettings, AIPersona, MessageStatus, QuickAction } from './types';
import { sendMessageToGemini } from './services/geminiService';
import { extractArtifacts } from './utils/parser';
import { Edit3, Users, Wand2, MapPin } from 'lucide-react';

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
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
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

  const handleLocationRequest = useCallback(() => {
    if ('geolocation' in navigator) {
      setToast({ message: "正在獲取位置...", type: "info", isVisible: true });
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setShowLocationSelector(true);
          setToast({ message: "位置獲取成功", type: "success", isVisible: true });
        },
        (error) => {
          console.error('Geolocation error:', error);
          setToast({ message: "無法獲取位置，請確認已開啟定位權限", type: "error", isVisible: true });
        }
      );
    } else {
      setToast({ message: "您的裝置不支援定位功能", type: "error", isVisible: true });
    }
  }, []);

  const handleSelectCategory = useCallback((category: any, location: { lat: number; lng: number; country?: string }) => {
    const locationText = location.country ? `在${location.country}` : `在我的位置`;
    const prompt = `📍 ${locationText}（座標：${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}），${category.prompt}。請提供詳細建議，包含地點名稱、特色說明和Google地圖連結。`;
    handleSend(prompt, []);
  }, []);

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
      <LocationCategorySelector isOpen={showLocationSelector} onClose={() => setShowLocationSelector(false)} onSelectCategory={handleSelectCategory} location={userLocation} />
      
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
              <div className="mt-4 mb-6">
                <button onClick={handleLocationRequest} className="w-full p-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3 font-bold">
                  <MapPin size={24} />
                  <span>📍 探索附近推薦</span>
                </button>
              </div>
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
