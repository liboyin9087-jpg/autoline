import React from 'react';
import { X } from 'lucide-react';
import { FileArtifact } from '../types';
export const PreviewModal: React.FC<{ artifact: FileArtifact | null; onClose: () => void }> = ({ artifact, onClose }) => {
  if (!artifact) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-3xl h-[80vh] rounded-2xl flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b"><h3 className="font-bold">{artifact.filename}</h3><button onClick={onClose}><X /></button></div>
        <div className="flex-1 overflow-auto p-4 bg-gray-50"><pre className="text-xs font-mono whitespace-pre-wrap">{artifact.content}</pre></div>
      </div>
    </div>
  );
};
