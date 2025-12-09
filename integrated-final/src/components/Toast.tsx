import React, { useEffect } from 'react';
import { ToastState } from '../types';
export const Toast: React.FC<{ state: ToastState; onClose: () => void }> = ({ state, onClose }) => {
  useEffect(() => { if(state.isVisible){const t=setTimeout(onClose,3000); return ()=>clearTimeout(t);} }, [state.isVisible, onClose]);
  if (!state.isVisible) return null;
  const colors = { info: 'bg-gray-800', error: 'bg-red-500', success: 'bg-fairy-primary', warning: 'bg-yellow-500' };
  return <div className={`fixed top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-white text-sm shadow-lg z-[60] animate-fade-in ${colors[state.type]}`}>{state.message}</div>;
};
