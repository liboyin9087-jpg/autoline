import { FileArtifact } from '../types';
export const extractArtifacts = (text: string): FileArtifact[] => {
  const artifacts: FileArtifact[] = [];
  // 簡單的代碼區塊提取邏輯
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let match;
  let index = 0;
  while ((match = codeBlockRegex.exec(text)) !== null) {
    artifacts.push({
      id: `art-${Date.now()}-${index++}`,
      filename: `snippet.${match[1] || 'txt'}`,
      language: match[1] || 'text',
      content: match[2],
      isComplete: true
    });
  }
  return artifacts;
};
