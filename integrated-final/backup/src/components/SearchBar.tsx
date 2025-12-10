import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Calendar, User as UserIcon, Bot } from 'lucide-react';
import { Message, MessageRole } from '../types';

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  onMessageSelect: (messageId: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ isOpen, onClose, messages, onMessageSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | MessageRole>('all');
  const [results, setResults] = useState<Message[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = messages.filter(msg => {
      const matchesQuery = msg.text.toLowerCase().includes(query);
      const matchesRole = filterRole === 'all' || msg.role === filterRole;
      return matchesQuery && matchesRole;
    });

    setResults(filtered);
  }, [searchQuery, filterRole, messages]);

  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 right-0 bg-white shadow-xl border-b border-gray-200 z-40 animate-fade-in">
      <div className="max-w-4xl mx-auto p-4">
        {/* 搜尋輸入區 */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜尋對話內容..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-fairy-primary focus:ring-2 focus:ring-fairy-primary/20 transition-all"
            />
          </div>
          <button
            onClick={onClose}
            className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* 篩選選項 */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilterRole('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterRole === 'all'
                ? 'bg-fairy-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setFilterRole(MessageRole.USER)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              filterRole === MessageRole.USER
                ? 'bg-fairy-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <UserIcon size={14} />
            我的訊息
          </button>
          <button
            onClick={() => setFilterRole(MessageRole.MODEL)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              filterRole === MessageRole.MODEL
                ? 'bg-fairy-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Bot size={14} />
            AI 回覆
          </button>
        </div>

        {/* 搜尋結果 */}
        {searchQuery && (
          <div className="max-h-96 overflow-y-auto scrollbar-hide">
            {results.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 mb-3">找到 {results.length} 則訊息</p>
                {results.map((msg) => (
                  <button
                    key={msg.id}
                    onClick={() => {
                      onMessageSelect(msg.id);
                      onClose();
                    }}
                    className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {msg.role === MessageRole.USER ? (
                        <UserIcon size={12} className="text-fairy-primary" />
                      ) : (
                        <Bot size={12} className="text-fairy-primary" />
                      )}
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar size={10} />
                        {new Date(msg.timestamp).toLocaleDateString()} {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2 group-hover:text-gray-900">
                      {msg.text}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Search size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">找不到相關訊息</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
