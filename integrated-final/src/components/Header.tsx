import React, { useRef, useEffect } from 'react';
import { Menu, Search, MapPin, Terminal, ArrowLeft, Settings, Users } from 'lucide-react';
import { AppMode } from '../../types';

interface HeaderProps {
  mode: AppMode; onModeChange: (mode: AppMode) => void;
  isSearching: boolean; searchQuery: string; onSearchToggle: (isOpen: boolean) => void; onSearchChange: (query: string) => void;
  onOpenSettings: () => void; onReset: () => void; showBackButton: boolean; onOpenGroupMembers: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  mode, onModeChange, isSearching, searchQuery, onSearchToggle, onSearchChange, onOpenSettings,
  onReset, showBackButton, onOpenGroupMembers
}) => {
  const isPro = mode === AppMode.PROFESSIONAL;
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (isSearching && inputRef.current) inputRef.current.focus(); }, [isSearching]);

  return (
    <header className="h-14 flex items-center justify-between px-4 sticky top-0 z-50 shadow-sm transition-colors duration-300" style={{ backgroundColor: isPro ? '#1e293b' : '#2c3e50' }}>
       {isSearching ? (
         <div className="flex items-center w-full gap-2 animate-fade-in">
           <button onClick={() => { onSearchToggle(false); onSearchChange(''); }} className="text-white/80"><ArrowLeft className="w-6 h-6" /></button>
           <input ref={inputRef} type="text" value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} placeholder="搜尋..." className="flex-1 bg-white/10 text-white border-none rounded-full py-1.5 px-4 text-sm outline-none" />
         </div>
       ) : (
         <>
           <div className="flex items-center gap-3">
             <button onClick={showBackButton ? onReset : undefined} className="text-white/80 hover:text-white">
               {showBackButton ? <ArrowLeft className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
             </button>
             <div onClick={onOpenGroupMembers} className="cursor-pointer active:opacity-70 transition-opacity">
               <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">仙女會議室 {isPro ? 'Pro' : ''} <Users size={14} className="opacity-70"/></h1>
             </div>
           </div>
           <div className="flex items-center gap-2">
              <div className="bg-black/20 p-1 rounded-full flex items-center relative mr-1">
                <div className={`absolute w-7 h-7 bg-white rounded-full shadow-md transition-all duration-300 ease-out ${isPro ? 'translate-x-8' : 'translate-x-0'}`}></div>
                <button onClick={() => onModeChange(AppMode.LIFESTYLE)} className={`w-8 h-8 flex justify-center items-center z-10 ${!isPro ? 'text-green-600' : 'text-gray-400'}`}><MapPin size={16} /></button>
                <button onClick={() => onModeChange(AppMode.PROFESSIONAL)} className={`w-8 h-8 flex justify-center items-center z-10 ${isPro ? 'text-blue-600' : 'text-gray-400'}`}><Terminal size={16} /></button>
              </div>
              <button onClick={() => onSearchToggle(true)} className="text-white/80 p-1"><Search className="w-5 h-5" /></button>
              <button onClick={onOpenSettings} className="text-white/80 p-1"><Settings className="w-5 h-5" /></button>
           </div>
         </>
       )}
    </header>
  );
};
