import React from 'react';
import { X, User, Crown } from 'lucide-react';

interface GroupMembersModalProps { isOpen: boolean; onClose: () => void; }
const MEMBERS = [
  { name: "智慧仙姑", role: "admin", desc: "理性分析，解答疑惑", color: "bg-purple-100 text-purple-600" },
  { name: "桃花仙子", role: "member", desc: "熱情親切，陪伴聆聽", color: "bg-pink-100 text-pink-600" },
  { name: "閃電娘娘", role: "member", desc: "極速回應，直達重點", color: "bg-orange-100 text-orange-600" },
  { name: "雲夢仙子", role: "member", desc: "靈感湧現，詩意表達", color: "bg-cyan-100 text-cyan-600" },
  { name: "天機星君", role: "member", desc: "技術專精，程式Debug", color: "bg-blue-100 text-blue-600" },
];
export const GroupMembersModal: React.FC<GroupMembersModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">群組成員 ({MEMBERS.length})</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full"><X size={20} /></button>
        </div>
        <div className="p-2 max-h-[60vh] overflow-y-auto">
          {MEMBERS.map((m, i) => (
            <div key={i} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${m.color}`}><User size={20} /></div>
              <div className="flex-1"><div className="flex items-center gap-2"><span className="font-bold text-gray-800">{m.name}</span>{m.role === 'admin' && <Crown size={14} className="text-yellow-500" />}</div><p className="text-xs text-gray-500">{m.desc}</p></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
