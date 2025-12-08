export enum AppMode {
  LIFESTYLE = 'lifestyle',
  PROFESSIONAL = 'professional' // 這裡對應 assistant/tech 等模式
}

export enum AIPersona {
  CONSULTANT = 'consultant', // 智慧仙姑
  FRIEND = 'beauty',         // 桃花仙子
  CONCISE = 'concise',       // 閃電娘娘 (未使用，可留作擴充)
  CREATIVE = 'gossip',       // 茶水仙人 (對應 creative/gossip)
  TECH = 'tech',             // 天機星君
  FOOD = 'food'              // 御膳娘娘
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface AppSettings {
  maxOutputTokens: number;
  persona: string;
  customMemory: string;
  userAvatar?: string;
  enableMic: boolean;
  enableEmoji: boolean;
}
