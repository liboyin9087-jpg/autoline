import React from 'react';
export function QuickAction({ icon, label, subLabel, onClick, delay=0 }: any) {
  return (
    <button onClick={onClick} className="flex flex-col items-center p-2 animate-float" style={{animationDelay: `${delay*0.2}s`}}>
      <div className="w-full h-24 flex items-center justify-center drop-shadow-lg">{icon}</div>
      <div className="bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-fairy-primary mt-2 shadow-sm">{label}</div>
    </button>
  );
}
