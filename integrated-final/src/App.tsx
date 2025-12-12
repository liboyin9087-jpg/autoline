import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import { Toast } from './components/Toast';
import { SettingsModal } from './components/SettingsModal';
import { IntroOverlay } from './components/IntroOverlay';
import { QuickActionsManager } from './components/QuickActionsManager';
import { DivineFortune } from './components/DivineFortune';
import { FairyGroupChat } from './components/FairyGroupChat';
import { EasterEggEffectRenderer, EasterEggToast, useEasterEgg } from './components/EasterEggSystem';
import { LocationCategorySelector } from './components/LocationCategorySelector';
import { Message, MessageRole, AppMode, ToastState, AppSettings, AIPersona, MessageStatus, QuickAction } from './types';
import { sendMessageToGemini } from './services/geminiService';
import { extractArtifacts } from './utils/parser';
import {
  Users, MapPin, Plus, Camera, Image as ImageIcon, Mic, Smile,
  ChevronLeft, Search, Menu, Bell, X, FileText, ChevronRight, Edit3, Wand2
} from 'lucide-react';

const SETTINGS_KEY = 'line_ai_settings';

const GROUP_MEMBERS = [
  { id: 'user', name: '我 (User)', avatar: '', isMe: true },
  { id: 'consultant', name: '智慧仙姑', avatar: '/fairy_consultant.png', color: '#7c3aed' },
  { id: 'friend', name: '桃花仙子', avatar: '/qr_selfie_fairy.png', color: '#ec4899' },
  { id: 'concise', name: '閃電娘娘', avatar: '/fairy_food.png', color: '#f97316' },
  { id: 'creative', name: '雲夢仙子', avatar: '/tea_gossip_fairy.png', color: '#06b6d4' },
  { id: 'tech', name: '天機星君', avatar: '/fairy_tech.png', color: '#3b82f6' }
];

const PERSONA_DATA = {
  [AIPersona.CONSULTANT]: { name: "智慧仙姑", img: "/fairy_consultant.png" },
  [AIPersona.FRIEND]: { name: "桃花仙子", img: "/qr_selfie_fairy.png" },
  [AIPersona.CONCISE]: { name: "閃電娘娘", img: "/fairy_food.png" },
  [AIPersona.CREATIVE]: { name: "雲夢仙子", img: "/tea_gossip_fairy.png" },
  [AIPersona.TECH]: { name: "天機星君", img: "/fairy_tech.png" }
};

const DEFAULT_QUICK_ACTIONS: QuickAction[] = [
  { id: '1', icon: '📍', label: '定位導覽', subLabel: '周邊推薦', colorClass: 'bg-green-500', prompt: 'LOCATION_TRIGGER' },
  { id: '2', icon: '🎋', label: '今日運勢', subLabel: '每日一籤', colorClass: 'bg-purple-500', prompt: '__DIVINE_FORTUNE__' },
];

const App: React.FC = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    maxOutputTokens: 4096, persona: AIPersona.FRIEND, customMemory: "",
    enableMic: true, enableEmoji: true, quickActions: DEFAULT_QUICK_ACTIONS,
    dailyTokenLimit: 50000, tokenUsageStats: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'info', isVisible: false });
  const [inputMessage, setInputMessage] = useState('');
  const [pendingLocation, setPendingLocation] = useState<{lat: number, lng: number, address?: string} | null>(null);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showDivineFortune, setShowDivineFortune] = useState(false);
  const [showGroupChat, setShowGroupChat] = useState(false);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [isQuickActionsManagerOpen, setIsQuickActionsManagerOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { checkForEasterEgg, activeEffect, setActiveEffect, toastMessage: easterEggToast,
    showToast: showEasterEggToast, setShowToast: setShowEasterEggToast } = useEasterEgg();

  useEffect(() => {
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      try {
        setSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));
      } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }, [settings]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isLoading, pendingLocation]);

  const handleGetLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setToast({ message: "裝置不支援定位", type: "error", isVisible: true });
      return;
    }
    setToast({ message: "正在抓取座標...", type: "info", isVisible: true });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setPendingLocation({ lat: latitude, lng: longitude });
        setShowLocationSelector(true);
        setToast({ message: "✅ 已鎖定位置！", type: "success", isVisible: true });
      },
      (error) => {
        console.error(error);
        setToast({ message: "無法獲取位置，請確認 GPS 已開啟", type: "error", isVisible: true });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  const handleLocationCategorySelect = useCallback((category: any, location: any) => {
    const isOverseas = location.country && location.country !== '台灣' && location.country !== 'Taiwan';

    let prompt = category.prompt;
    if (category.id === 'random') {
      prompt = '請根據我目前的位置，給我一個驚喜推薦！可以是美食、景點、或任何你覺得值得探索的地方。';
    }

    const displayText = `📍 ${category.name}`;
    const apiText = `[系統資訊] 使用者座標：緯度 ${location.lat.toFixed(6)}, 經度 ${location.lng.toFixed(6)}
${isOverseas ? `[國外模式] 偵測到使用者位於：${location.country}` : ''}

[使用者需求] ${prompt}

**回答規則：**
1. 列出 2-3 個推薦地點
2. 每個包含：名稱、特色（30字內）、距離
3. **不要提及座標數字**
4. 使用「你附近有...」的表述
${isOverseas ? `5. **國外模式特別要求**：
   - 提供地點的中文名稱和原文名稱
   - 簡短說明如何前往（交通方式）
   - 提供 Google Maps 連結格式：https://www.google.com/maps/search/?api=1&query=緯度,經度
   - 所有說明都用繁體中文` : ''}
6. 總字數 250 字內
7. 使用當前角色語氣`;

    handleSend(displayText, apiText);
    setPendingLocation(null);
  }, []);

  const handleSend = async (displayText: string, apiText?: string) => {
    const text = displayText;
    if (!text.trim()) return;

    if (text === 'LOCATION_TRIGGER') {
      handleGetLocation();
      return;
    }

    if (text === '__DIVINE_FORTUNE__') {
      setShowDivineFortune(true);
      return;
    }

    const easterEgg = checkForEasterEgg(text);
    if (easterEgg?.effect === 'fairy_summon') {
      setShowGroupChat(true);
      return;
    }

    const messageId = Date.now().toString();
    const newUserMsg: Message = {
      id: messageId,
      role: MessageRole.USER,
      text: displayText,
      timestamp: new Date(),
      status: MessageStatus.SENT
    };

    const apiUserMsg: Message = {
      ...newUserMsg,
      text: apiText || displayText
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputMessage('');
    setIsLoading(true);
    setShowPlusMenu(false);

    try {
      const res = await sendMessageToGemini(
        [...messages, apiUserMsg],
        AppMode.LIFESTYLE,
        pendingLocation,
        settings
      );

      if (pendingLocation) setPendingLocation(null);

      const responseText = easterEgg?.customResponse ? `${easterEgg.customResponse}\n\n---\n\n${res.text}` : res.text;
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: MessageRole.MODEL,
        text: responseText,
        timestamp: new Date(),
        status: MessageStatus.SENT
      }]);
    } catch (e) {
      console.error(e);
      setToast({ message: "連線錯誤", type: "error", isVisible: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputMessage);
    }
  };

  const GroupInfoPage = () => (
    <div className="fixed inset-0 bg-[#f0f0f0] z-50 flex flex-col animate-in slide-in-from-right duration-300">
      <div className="bg-[#1e2329] text-white p-4 flex items-center shadow-md">
        <button onClick={() => setShowGroupInfo(false)} className="mr-4"><ChevronLeft /></button>
        <h2 className="font-bold text-lg flex-1">仙女聊天室 (6)</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="h-40 bg-gradient-to-r from-purple-400 to-pink-500 relative mb-4">
           <div className="absolute bottom-4 left-4 text-white font-bold text-2xl drop-shadow-md">仙女聊天室</div>
        </div>

        <div className="bg-white mb-4 p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-700">成員</h3>
            <span className="text-gray-400 text-sm">6</span>
          </div>
          <div className="space-y-4">
            {GROUP_MEMBERS.map(m => (
              <div key={m.id} className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-100 flex items-center justify-center">
                    {m.avatar ? <img src={m.avatar} className="w-full h-full object-cover" alt={m.name}/> : <Users size={20} className="text-gray-400"/>}
                 </div>
                 <span className="text-gray-800 flex-1">{m.name}</span>
                 {m.isMe && <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">我</span>}
              </div>
            ))}
            <div className="flex items-center gap-3 text-green-500 cursor-pointer">
              <div className="w-10 h-10 rounded-full border border-green-500 border-dashed flex items-center justify-center"><Plus /></div>
              <span>邀請成員</span>
            </div>
          </div>
        </div>

        <div className="bg-white mb-4">
           <div className="p-4 flex items-center justify-between border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center gap-3"><ImageIcon className="text-gray-600"/> <span>相簿</span></div>
              <ChevronRight className="text-gray-300" size={16}/>
           </div>
           <div className="p-4 flex items-center justify-between border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center gap-3"><FileText className="text-gray-600"/> <span>記事本</span></div>
              <ChevronRight className="text-gray-300" size={16}/>
           </div>
           <div className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer" onClick={() => { setIsSettingsOpen(true); setShowGroupInfo(false); }}>
              <div className="flex items-center gap-3"><Users className="text-gray-600"/> <span>AI 設定</span></div>
              <ChevronRight className="text-gray-300" size={16}/>
           </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-[#8c9eb2] font-sans overflow-hidden relative">
      {showIntro && <IntroOverlay onComplete={() => setShowIntro(false)} />}
      <Toast state={toast} onClose={() => setToast({ ...toast, isVisible: false })} />
      {showGroupInfo && <GroupInfoPage />}
      <EasterEggEffectRenderer effect={activeEffect} isActive={activeEffect !== 'none'} onComplete={() => setActiveEffect('none')} duration={3000} />
      <EasterEggToast message={easterEggToast} isVisible={showEasterEggToast} onClose={() => setShowEasterEggToast(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} settings={settings} onSave={setSettings} currentSessionTokens={0} personaData={PERSONA_DATA} />
      {isQuickActionsManagerOpen && <QuickActionsManager quickActions={settings.quickActions || DEFAULT_QUICK_ACTIONS} onSave={(actions) => setSettings(prev => ({ ...prev, quickActions: actions }))} onClose={() => setIsQuickActionsManagerOpen(false)} />}
      <DivineFortune isOpen={showDivineFortune} onClose={() => setShowDivineFortune(false)} onResult={(fortune) => handleSend(`🎋 第 ${fortune.number} 籤【${fortune.level}】- ${fortune.title}\n籤詩：「${fortune.poem}」\n請解讀`)} botName={PERSONA_DATA[settings.persona].name} botAvatar={PERSONA_DATA[settings.persona].img} />
      <FairyGroupChat isOpen={showGroupChat} onClose={() => setShowGroupChat(false)} userQuestion={inputMessage} onSelectResponse={(persona, response) => setMessages(prev => [...prev, { id: Date.now().toString(), role: MessageRole.MODEL, text: `**${PERSONA_DATA[persona]?.name}**：\n\n${response}`, timestamp: new Date(), status: MessageStatus.SENT }])} onSendAllResponses={(responses) => setMessages(prev => [...prev, { id: Date.now().toString(), role: MessageRole.MODEL, text: `🎭 **仙女會議**\n\n${responses.map(r => `**${r.name}**：${r.response}`).join('\n\n---\n\n')}`, timestamp: new Date(), status: MessageStatus.SENT }])} />
      <LocationCategorySelector isOpen={showLocationSelector} onClose={() => setShowLocationSelector(false)} onSelectCategory={handleLocationCategorySelect} location={pendingLocation} />

      <div className="bg-[#1e2329] text-white px-4 py-3 flex items-center justify-between shadow-sm z-20">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setShowGroupInfo(true)}>
          <ChevronLeft className="text-white" size={24} onClick={(e) => { e.stopPropagation(); }}/>
          <div className="flex flex-col">
            <div className="font-bold text-lg leading-tight flex items-center gap-1">
              仙女聊天室 <span className="text-sm font-normal opacity-80">(6)</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <Search size={20} className="opacity-80"/>
           <Menu size={20} className="opacity-80" onClick={() => setShowGroupInfo(true)}/>
        </div>
      </div>

      <div className="bg-[#fcfcfc] px-4 py-2 flex items-center justify-between border-b border-gray-200 z-10 shadow-sm opacity-90">
         <div className="flex items-center gap-2 overflow-hidden">
            <Bell size={14} className="text-gray-500 fill-gray-500 flex-shrink-0" />
            <span className="text-xs text-gray-700 truncate">公告：歡迎使用 AI 仙女助理 ✨</span>
         </div>
         <ChevronRight size={14} className="text-gray-400" />
      </div>

      <main className="flex-1 overflow-y-auto p-3 pb-20 scrollbar-hide">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-10">
            <div className="w-full px-4 max-w-md">
              <div className="flex items-center justify-between mb-4 opacity-70">
                <div className="flex items-center gap-2">
                  <div className="h-[1px] w-8 bg-purple-400"></div>
                  <p className="text-purple-600 font-bold text-xs">快速功能</p>
                  <div className="h-[1px] w-8 bg-purple-400"></div>
                </div>
                <button onClick={() => setIsQuickActionsManagerOpen(true)} className="text-xs text-purple-600 flex items-center gap-1">
                  <Edit3 size={12} /> 自訂
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {(settings.quickActions || DEFAULT_QUICK_ACTIONS).map(action => (
                  <button key={action.id} onClick={() => handleSend(action.prompt)} className="p-4 rounded-xl bg-white/80 backdrop-blur shadow-sm hover:shadow-md transition-all">
                    <div className="text-3xl mb-2">{action.icon}</div>
                    <div className="text-sm font-bold text-gray-800">{action.label}</div>
                    <div className="text-xs text-gray-500">{action.subLabel}</div>
                  </button>
                ))}
              </div>
              <div className="mt-4 p-3 bg-purple-50 rounded-xl">
                <p className="text-xs text-purple-700 flex items-center gap-2">
                  <Wand2 size={14} /> 試試說「下班」「發財」「debug」有驚喜 ✨
                </p>
              </div>
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.role === MessageRole.USER;
          const persona = PERSONA_DATA[settings.persona];
          const readCount = isMe ? (Math.random() > 0.5 ? 4 : 2) : 0;

          return (
            <div key={msg.id} className={`flex gap-2 mb-4 ${isMe ? 'flex-row-reverse' : ''}`}>
              {!isMe && (
                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full bg-white border border-gray-200 overflow-hidden">
                    <img src={persona.img} alt={persona.name} className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                {!isMe && <span className="text-xs text-gray-600 mb-1 ml-1">{persona.name}</span>}

                <div className="flex items-end gap-1 flex-row-reverse">
                  <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed shadow-sm break-words whitespace-pre-wrap
                    ${isMe ? 'bg-[#85e173] text-black rounded-tr-none' : 'bg-white text-black rounded-tl-none'}`}>
                    {msg.text}
                  </div>

                  <div className="flex flex-col items-end pb-1 gap-0.5">
                    {isMe && readCount > 0 && <span className="text-[10px] text-yellow-300 font-bold">已讀 {readCount}</span>}
                    <span className="text-[10px] text-gray-200">{msg.timestamp.getHours()}:{String(msg.timestamp.getMinutes()).padStart(2, '0')}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {pendingLocation && (
          <div className="flex justify-center mb-4 animate-bounce">
            <div className="bg-green-500 text-white text-xs px-3 py-1 rounded-full">
              📍 位置已鎖定，請選擇類別
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex gap-2 items-center text-xs text-gray-500 ml-12">
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></div>
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      <div className="bg-white border-t border-gray-200 px-3 py-2 z-30">
        <div className="flex items-end gap-2">
          <button onClick={() => setShowPlusMenu(!showPlusMenu)} className={`p-2 rounded-md ${showPlusMenu ? 'bg-gray-100' : ''}`}>
            <Plus size={24} className="text-[#1e2329]" />
          </button>
          <button className="p-2"><Camera size={24} className="text-[#1e2329] opacity-80" /></button>
          <button className="p-2"><ImageIcon size={24} className="text-[#1e2329] opacity-80" /></button>

          <div className="flex-1 min-h-[40px] bg-[#f0f0f0] rounded-2xl px-4 py-2 flex items-center">
            <input
              type="text"
              className="w-full bg-transparent outline-none text-sm"
              placeholder="輸入訊息..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <Smile size={20} className="text-gray-400 ml-2" />
          </div>

          {inputMessage.trim() ? (
            <button onClick={() => handleSend(inputMessage)} className="p-2 bg-[#1e2329] rounded-full text-white mb-1">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          ) : (
             <button className="p-2 mb-1"><Mic size={24} className="text-[#1e2329] opacity-80" /></button>
          )}
        </div>

        {showPlusMenu && (
          <div className="grid grid-cols-4 gap-4 mt-4 pb-2">
             <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={handleGetLocation}>
                <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center text-red-500"><MapPin /></div>
                <span className="text-xs text-gray-600">位置資訊</span>
             </div>
             <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => handleSend('__DIVINE_FORTUNE__')}>
                <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-500"><FileText /></div>
                <span className="text-xs text-gray-600">今日運勢</span>
             </div>
             <div className="flex flex-col items-center gap-2 opacity-50">
                <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-500"><Users /></div>
                <span className="text-xs text-gray-600">聯絡人</span>
             </div>
             <div className="flex flex-col items-center gap-2 opacity-50">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-500"><ImageIcon /></div>
                <span className="text-xs text-gray-600">檔案</span>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
