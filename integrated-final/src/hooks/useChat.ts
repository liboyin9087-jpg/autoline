import { useState, useEffect } from 'react';
// 記得這裡要多導入 MessageRole
import { Message, AppSettings, MessageRole } from '../types';

export const useChat = (mode: string, settings: AppSettings) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 每次切換模式清空 (除了 assistant)
    if(mode !== 'assistant') {
      setMessages([{ 
        id: 'welcome', 
        role: MessageRole.MODEL, // 使用 Enum 匹配 types.ts
        text: '✨ 仙女已就位，請吩咐。', 
        timestamp: new Date() 
      } as Message]);
    }
  }, [mode]);

  const handleSend = async (text: string) => {
    // 修正重點：移除原本混入的奇怪文字，並使用 MessageRole
    const userMsg: Message = { 
      id: Date.now().toString(), 
      role: MessageRole.USER, // 使用 Enum
      text, 
      timestamp: new Date() 
      // 其他 status, artifacts 是選填的，這裡不填沒關係
    };

    setMessages(p => [...p, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: text, 
          mode, 
          history: messages.map(m => ({ role: m.role, content: m.text })),
          settings 
        })
      });
      const data = await res.json();
      
      setMessages(p => [...p, { 
        id: Date.now().toString(), 
        role: MessageRole.MODEL, // 使用 Enum
        text: data.reply, 
        timestamp: new Date() 
      } as Message]);

    } catch (e) {
      setMessages(p => [...p, { 
        id: Date.now().toString(), 
        role: MessageRole.MODEL, 
        text: "❌ 連線失敗", 
        timestamp: new Date() 
      } as Message]);
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, isLoading, handleSend, resetChat: () => setMessages([]) };
};