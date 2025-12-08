export enum MessageRole { USER = 'user', MODEL = 'model' }
export enum AppMode { LIFESTYLE = 'lifestyle', PROFESSIONAL = 'professional' }
export enum MessageStatus { PENDING = 'pending', SENT = 'sent', FAILED = 'failed' }
export enum AIPersona {
  CONSULTANT = 'consultant', FRIEND = 'friend', CONCISE = 'concise', CREATIVE = 'creative', TECH = 'tech'
}

export interface QuickAction {
  id: string;
  icon: string;
  label: string;
  subLabel: string;
  colorClass: string;
  prompt: string;
  isCustom?: boolean;
}

export interface GenerationOptions { filename?: string; language?: string; }

export interface FairyAffection {
  persona: AIPersona;
  level: number;          // 好感度等級 1-10
  chatCount: number;      // 對話次數
  specialResponses: string[]; // 好感度達標解鎖的特殊回覆
  title: string;          // 稱號：陌生人 → 香客 → 弟子 → 道友 → 渡化緣
  lastInteraction: string; // 最後互動時間
}

export interface DailyLoginReward {
  date: string;
  fairy: AIPersona;
  fortune: string;
  luckyColor: string;
  luckyTime: string;
  taboo: string;
}

export interface AppSettings {
  maxOutputTokens: number; 
  persona: AIPersona; 
  customMemory: string;
  userAvatar?: string; 
  enableMic: boolean; 
  enableEmoji: boolean;
  quickActions?: QuickAction[];
  dailyTokenLimit?: number;
  tokenUsageStats?: { date: string; tokens: number; }[];
  fairyAffections?: FairyAffection[];
  dailyLoginRewards?: DailyLoginReward[];
  lastLoginDate?: string;
}

export interface FileArtifact { 
  id: string; 
  filename: string; 
  language: string; 
  content: string; 
  isComplete: boolean;
  imageUrl?: string;
}

export interface TokenUsage { 
  promptTokens: number; 
  responseTokens: number; 
  totalTokens: number; 
}

export interface Attachment { 
  id: string; 
  mimeType: string; 
  data: string; 
  filename?: string;
  size?: number;
}

export interface Message {
  id: string; 
  role: MessageRole; 
  text: string; 
  timestamp: Date;
  status?: MessageStatus;
  artifacts?: FileArtifact[]; 
  isThinking?: boolean; 
  usage?: TokenUsage; 
  groundingMetadata?: any; 
  attachments?: Attachment[];
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  persona: AIPersona;
}

export interface ChatState { 
  messages: Message[]; 
  isLoading: boolean; 
  error: string | null; 
  currentConversationId?: string;
}

export interface ToastState { 
  message: string; 
  type: 'info' | 'error' | 'success' | 'warning'; 
  isVisible: boolean; 
}
