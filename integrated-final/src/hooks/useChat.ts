import { useState, useEffect } from 'react';
import { Message, AppSettings } from '../../types';

export const useChat = (mode: string, settings: AppSettings) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 每次切換模式清空 (除了 assistant)
    if(mode !== 'assistant') setMessages([{ id: 'welcome', role: 'model', text: '✨ 仙女已就位，請吩咐。', timestamp: new Date() }]);
  }, [mode]);

  const handleSend = async (text: string) => {
    const userMsg = { id: Date.now().toString(), role: 'user', text, timestamp: new Date() };
    setMessages(p => [...p, userMsg as any]);
    setIsLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: text, 
          mode, 
          history: messages.map(m => ({ role: m.role, content: m.text })),
          settings // 傳送設定給後端
        })
      });
      const data = await res.json();
      setMessages(p => [...p, { id: Date.now().toString(), role: 'model', text: data.reply, timestamp: new Date() }]);
    } catch (e) {
      setMessages(p => [...p, { id: Date.now().toString(), role: 'model', text: "❌ 連線失敗", timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };
  return { messages, isLoading, handleSend, resetChat: () => setMessages([]) };
};
