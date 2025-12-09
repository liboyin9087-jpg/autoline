import { AppMode, Message, MessageRole, AppSettings, AIPersona } from "../types";

const PERSONA_PROMPTS: Record<string, string> = {
  [AIPersona.CONSULTANT]: `[ROLE]智慧仙姑 [STYLE]語氣沉穩、像個有智慧的長輩。自稱「老身」。口頭禪「依我看...」。任務：理性分析問題。`,
  [AIPersona.FRIEND]: `[ROLE]桃花仙子 [STYLE]熱情、愛用Emoji✨、像好姐妹一樣。自稱「人家」。任務：給予安慰和陪伴。`,
  [AIPersona.CONCISE]: `[ROLE]閃電娘娘 [STYLE]急躁、極簡、不說廢話。自稱「本座」。口頭禪「講重點」。任務：三秒內給答案。`,
  [AIPersona.CREATIVE]: `[ROLE]雲夢仙子 [STYLE]說話比較浪漫、有畫面感。自稱「夢兒」。任務：提供靈感。`,
  [AIPersona.TECH]: `[ROLE]天機星君 [STYLE]把程式碼當魔法的工程師。自稱「本君」。任務：解決技術問題。`
};

// 強制白話文指令
const SYSTEM_INSTRUCTION_BASE = `
=== 最高指令 ===
1. 語言：必須使用「白話繁體中文」。
2. 禁忌：**絕對禁止** 使用晦澀難懂的文言文或古詩詞。用戶看不懂。
3. 風格：保留角色的語氣（如自稱），但內容要通俗易懂，像現代人在LINE群組聊天一樣自然。
4. 長度：若非必要，請保持回答精簡，不要長篇大論。
`;

// 根據不同 Persona 優化 Token 使用量（問題4修正）
const getOptimalTokens = (persona: AIPersona): number => {
  const tokenMap: Record<AIPersona, number> = {
    [AIPersona.CONCISE]: 512,     // 閃電娘娘：極簡回答（節省 87.5%）
    [AIPersona.FRIEND]: 1024,      // 桃花仙子：中等長度（節省 75%）
    [AIPersona.CONSULTANT]: 1640,  // 智慧仙姑：詳細分析（節省 60%）
    [AIPersona.CREATIVE]: 2660,    // 雲夢仙子：創意內容（節省 35%）
    [AIPersona.TECH]: 3072         // 天機星君：技術解說（節省 25%）
  };
  return tokenMap[persona] || 2048;
};

const buildContents = (history: Message[]): any[] => {
  return history.map((msg, index) => {
    const parts: any[] = [{ text: msg.text }];
    if (msg.attachments) {
        msg.attachments.forEach(att => {
            if (index === history.length - 1) parts.push({ inlineData: { mimeType: att.mimeType, data: att.data } });
            else parts.push({ text: `[Attachment: ${att.filename}]` });
        });
    }
    return { role: msg.role === MessageRole.USER ? 'user' : 'model', parts };
  });
};

export const sendMessageToGemini = async (history: Message[], mode: AppMode, userLocation: any, settings?: AppSettings) => {
  let systemInstruction = SYSTEM_INSTRUCTION_BASE;
  const persona = settings?.persona || AIPersona.CONSULTANT;
  systemInstruction += `\n\n=== 當前附身角色 ===\n${PERSONA_PROMPTS[persona]}`;
  if (settings?.customMemory) systemInstruction += `\n\n=== 用戶記憶 ===\n"${settings.customMemory}"`;
  if (userLocation) systemInstruction += `\n\n=== 用戶位置 ===\nLat:${userLocation.lat}, Lng:${userLocation.lng}`;

  // 使用智能 Token 優化（問題4修正）
  const optimalTokens = settings?.maxOutputTokens || getOptimalTokens(persona);

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        contents: buildContents(history), 
        systemInstruction, 
        maxOutputTokens: optimalTokens 
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Gemini Service Error:', error);
    throw error;
  }
};
