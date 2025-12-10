import React, { useState, useEffect } from 'react';
export const IntroOverlay: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [isFading, setIsFading] = useState(false);
  const handleEnd = () => { setIsFading(true); setTimeout(onComplete, 1000); };
  useEffect(() => {
    const timer = setTimeout(handleEnd, 2500);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-black transition-opacity duration-1000 ${isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <div className="flex flex-col items-center animate-pulse">
        <div className="text-6xl mb-4">☁️</div>
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-purple-200">仙女下凡來點名</h1>
      </div>
    </div>
  );
};
