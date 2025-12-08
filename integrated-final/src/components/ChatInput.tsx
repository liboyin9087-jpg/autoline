import React, { useState } from 'react';
import { Send, Mic, Plus, Smile } from 'lucide-react';

export function ChatInput({ onSend, isLoading }: any) {
  const [input, setInput] = useState('');

  const handleMicClick = () => {
    // [FIX] 模擬語音輸入：隨機填入文字
    const phrases = ["今天的幸運色是什麼？", "我想聽一個笑話", "這附近有什麼好吃的？", "幫我算命！", "我很無聊陪我聊天"];
    const randomText = phrases[Math.floor(Math.random() * phrases.length)];
    setInput(randomText);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#f0f0f0] border-t border-gray-300 px-3 py-2 flex items-center gap-2 z-50 pb-safe">
      <button className="text-[#8e949e] p-1"><Plus size={24}/></button>
      
      <div className="flex-1 relative">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Aa"
          className="w-full bg-white border-none rounded-full py-2 px-4 text-sm focus:outline-none"
          disabled={isLoading}
        />
        <button className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8e949e]">
            <Smile size={20}/>
        </button>
      </div>

      {input.trim() ? (
        <button 
          onClick={() => { onSend(input); setInput(''); }}
          disabled={isLoading}
          className="text-[#00B900] p-1" // LINE Green send button
        >
          <Send size={24} fill="#00B900" />
        </button>
      ) : (
        <button 
          onClick={handleMicClick}
          className="text-[#8e949e] p-1"
          title="語音(隨機咒語)"
        >
          <Mic size={24} />
        </button>
      )}
    </div>
  );
}
