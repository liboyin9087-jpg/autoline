import React from 'react';
import { FileText, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { FileArtifact } from '../types';

export const FileArtifactCard: React.FC<{ 
  artifact: FileArtifact; 
  onPreview: (a: FileArtifact) => void;
  imageUrl?: string; // 新增：圖片 URL 支援
}> = ({ artifact, onPreview, imageUrl }) => {
  // 判斷是否為圖片檔案
  const isImage = artifact.language?.toLowerCase().includes('image') || 
                  artifact.filename?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ||
                  imageUrl;

  return (
    <div 
      onClick={() => onPreview(artifact)} 
      className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors group overflow-hidden"
    >
      {/* 左側圖示或圖片預覽 */}
      {isImage && imageUrl ? (
        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 shadow-sm border border-gray-100">
          <img 
            src={imageUrl} 
            alt={artifact.filename} 
            className="w-full h-full object-cover"
            onError={(e) => {
              // 圖片載入失敗時顯示預設圖標
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.innerHTML = `
                <div class="w-full h-full bg-white flex items-center justify-center">
                  <svg class="text-fairy-primary" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke-width="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <path d="M21 15l-5-5L5 21" stroke-width="2"/>
                  </svg>
                </div>
              `;
            }}
          />
        </div>
      ) : (
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-100 shadow-sm flex-shrink-0">
          {isImage ? (
            <ImageIcon className="text-fairy-primary" size={20} />
          ) : (
            <FileText className="text-fairy-primary" size={20} />
          )}
        </div>
      )}
      
      {/* 檔案資訊 */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-800 truncate">
          {artifact.filename}
        </div>
        <div className="text-xs text-gray-500">
          {artifact.language || '檔案'}
          {artifact.isComplete ? ' • 已完成' : ' • 處理中...'}
        </div>
      </div>
      
      {/* 右側預覽圖標 */}
      <ExternalLink 
        size={16} 
        className="text-gray-400 group-hover:text-fairy-primary transition-colors flex-shrink-0" 
      />
    </div>
  );
};
