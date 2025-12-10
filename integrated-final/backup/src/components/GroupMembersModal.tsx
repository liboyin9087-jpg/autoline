import React from 'react';
import { X, Search, UserPlus } from 'lucide-react';

// 定義成員資料
const MEMBERS = [
  { name: "你 (凡人)", isMe: true, img: "" }, // 用戶自己
  { name: "智慧仙姑", role: "中立顧問", img: "https://api.dicebear.com/7.x/big-ears-neutral/svg?seed=Granny&backgroundColor=e3ece8" },
  { name: "桃花仙子", role: "親切朋友", img: "https://api.dicebear.com/7.x/big-smile/svg?seed=Peach&backgroundColor=ffe4e6" },
  { name: "閃電娘娘", role: "精簡高效", img: "https://api.dicebear.com/7.x/micah/svg?seed=Flash&backgroundColor=ffedd5" },
  { name: "雲夢仙子", role: "創意靈感", img: "https://api.dicebear.com/7.x/lorelei/svg?seed=Dream&backgroundColor=e0f2fe" },
  { name: "天機星君", role: "技術專家", img: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Tech&backgroundColor=f3f4f6" }
];

export const GroupMembersModal: React.FC<{ isOpen: boolean; onClose: () => void; userAvatar?: string }> = ({ isOpen, onClose, userAvatar }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      {/* 經典 LINE 白色彈窗 */}
      <div className="bg-white w-full max-w-sm h-[80vh] rounded-xl flex flex-col relative shadow-2xl overflow-hidden mx-4 text-gray-800">
        
        {/* 頂部標題列 */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">成員 ({MEMBERS.length})</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
            <X className="text-gray-800" size={24} />
          </button>
        </div>

        {/* 搜尋框 (淺灰底) */}
        <div className="px-4 py-3 bg-white">
          <div className="bg-[#f0f0f0] rounded-lg flex items-center px-3 py-2">
            <Search size={18} className="text-gray-400 mr-2" />
            <input type="text" placeholder="以姓名搜尋" className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-400" />
          </div>
        </div>

        {/* 成員列表 */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="text-xs font-bold text-gray-500 mt-2 mb-3">群組成員</div>
          <div className="space-y-4">
            {MEMBERS.map((member, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 border border-gray-100 relative">
                  {/* 頭像顯示邏輯 */}
                  {(member.isMe && userAvatar) ? (
                    <img src={userAvatar} className="w-full h-full object-cover" />
                  ) : member.img ? (
                    <img src={member.img} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center text-[10px] text-gray-500">無</div>
                  )}
                </div>
                <div className="flex flex-col border-b border-gray-50 flex-1 pb-3">
                  <span className="text-[15px] font-medium text-gray-900">{member.name}</span>
                  {member.role && <span className="text-[11px] text-gray-400">{member.role}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 右下角綠色按鈕 (LINE Green) */}
        <div className="absolute bottom-6 right-6">
          <button className="bg-[#06c755] w-14 h-14 rounded-full shadow-lg hover:bg-[#05b34c] transition-transform active:scale-95 flex items-center justify-center">
            <UserPlus size={24} className="text-white" />
          </button>
        </div>

      </div>
    </div>
  );
};
