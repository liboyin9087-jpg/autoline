import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, MessageRole, FileArtifact, MessageStatus } from '../types';
import { FileArtifactCard } from './FileArtifactCard';
import { EmotionSticker } from './EmotionSticker';
import { User, Zap, Check, CheckCheck, AlertCircle, RefreshCw, Paperclip, Copy } from 'lucide-react';

// 格式化時間顯示
const formatTime = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  
  if (minutes < 1) return '剛剛';
  if (minutes < 60) return `${minutes}分鐘前`;
  if (minutes < 1440) {
    const hours = Math.floor(minutes / 60);
    return `${hours}小時前`;
  }
  
  return date.toLocaleTimeString('zh-TW', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

export const MessageBubble: React.FC<{ 
  message: Message; 
  userAvatar?: string; 
  botAvatar?: string; 
  botName?: string; 
  onPreview: (a: FileArtifact) => void;
  onRetry?: (messageId: string) => void;
}> = ({ message, userAvatar, botAvatar, botName, onPreview, onRetry }) => {
  const isModel = message.role === MessageRole.MODEL;
  const [showCopyToast, setShowCopyToast] = useState(false);
  
  // 複製訊息到剪貼簿
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 2000);
    } catch (err) {
      console.error('複製失敗:', err);
    }
  };
  
  // 狀態圖示渲染
  const renderStatusIcon = () => {
    if (isModel) return null;
    
    switch (message.status) {
      case MessageStatus.PENDING:
        return <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" title="傳送中" />;
      case MessageStatus.SENT:
        return <CheckCheck size={14} className="text-white/70" title="已送達" />;
      case MessageStatus.FAILED:
        return <AlertCircle size={14} className="text-red-200" title="傳送失敗" />;
      default:
        return <Check size={14} className="text-white/70" title="已傳送" />;
    }
  };
  
  return (
    <div className={`flex w-full mb-6 animate-fade-in ${isModel ? 'justify-start' : 'justify-end'}`}>
      {/* AI 頭像 */}
      {isModel && (
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border-2 border-fairy-primary/20 mr-2 flex-shrink-0 shadow-sm mt-1 overflow-hidden">
           <img src={botAvatar || "https://api.dicebear.com/7.x/big-ears-neutral/svg?seed=Granny"} alt="AI" className="w-full h-full object-cover" />
        </div>
      )}

      <div className={`flex flex-col max-w-[80%] sm:max-w-[75%] md:max-w-[70%]`}>
        {/* 名字標籤 */}
        {isModel && <span className="text-[11px] text-gray-500 mb-1 ml-2 font-medium">{botName || "智慧仙姑"}</span>}
        
        <div className={`group relative px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-soft
          ${isModel 
            ? 'bg-white text-gray-800 rounded-tl-none border border-white' 
            : message.status === MessageStatus.FAILED 
              ? 'bg-red-500 text-white rounded-tr-none shadow-md border border-red-600'
              : 'bg-fairy-primary text-white rounded-tr-none shadow-md'
          }`}>
            
            {/* 複製按鈕（僅 AI 訊息且滑鼠懸停時顯示） */}
            {isModel && message.status === MessageStatus.SENT && (
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                title="複製訊息"
              >
                <Copy size={14} className="text-gray-600" />
              </button>
            )}
            
            {/* 複製成功提示 */}
            {showCopyToast && (
              <div className="absolute -top-8 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded shadow-lg animate-fade-in">
                已複製
              </div>
            )}
            
            {/* 附件預覽 */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mb-3 space-y-2">
                {message.attachments.map(att => (
                  <div key={att.id} className="flex items-center gap-2 bg-white/10 rounded-lg p-2 text-xs">
                    <Paperclip size={14} />
                    <span className="truncate flex-1">{att.filename || '附件'}</span>
                    {att.size && <span className="text-[10px] opacity-70">{(att.size / 1024).toFixed(1)}KB</span>}
                  </div>
                ))}
              </div>
            )}
            
            <div className={`markdown-container overflow-hidden ${!isModel && 'text-white'}`}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
            </div>
            
            {/* 😊 情緒表情貼圖（僅 AI 訊息） */}
            {isModel && message.status === MessageStatus.SENT && (
              <EmotionSticker text={message.text} className="my-2" />
            )}
            
            {/* Token 顯示 (只顯示在 AI 回覆且有數據時) */}
            {isModel && message.usage && (
              <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-1 opacity-60">
                  <Zap size={10} className="text-yellow-500" />
                  <span className="text-[10px] text-gray-400 font-mono">
                    仙氣: {message.usage.totalTokens}
                  </span>
                </div>
                <span className="text-[10px] text-gray-400">
                  約 {Math.ceil(message.usage.totalTokens / 2)} 字
                </span>
              </div>
            )}
            
            {/* 失敗時的重試按鈕 */}
            {!isModel && message.status === MessageStatus.FAILED && onRetry && (
              <button
                onClick={() => onRetry(message.id)}
                className="mt-2 flex items-center gap-1 text-xs text-white/90 hover:text-white bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors"
              >
                <RefreshCw size={12} />
                <span>重試</span>
              </button>
            )}
          </div>

        {message.artifacts && <div className="mt-2 space-y-2">{message.artifacts.map(a => <FileArtifactCard key={a.id} artifact={a} onPreview={onPreview} />)}</div>}
        
        {/* 時間戳記和狀態 */}
        <div className={`flex items-center gap-2 mt-1 px-2 ${isModel ? 'justify-start' : 'justify-end'}`}>
          <span className="text-[10px] text-gray-400">
            {formatTime(message.timestamp)}
          </span>
          {!isModel && (
            <div className="flex items-center">
              {renderStatusIcon()}
            </div>
          )}
        </div>
      </div>

      {/* 用戶頭像 */}
      {!isModel && (
        <div className="w-10 h-10 rounded-full bg-fairy-primary flex items-center justify-center border-2 border-fairy-primary/30 ml-2 flex-shrink-0 shadow-sm mt-1 overflow-hidden">
          {userAvatar ? (
            <img src={userAvatar} alt="User" className="w-full h-full object-cover" />
          ) : (
            <User size={22} className="text-white" />
          )}
        </div>
      )}
    </div>
  );
};
