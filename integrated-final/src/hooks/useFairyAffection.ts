import { useState, useEffect, useCallback } from 'react';
import { AIPersona, FairyAffection } from '../types';

const AFFECTION_STORAGE_KEY = 'fairy_affection_system';

// 好感度等級對應的稱號
const AFFECTION_TITLES = {
  1: "陌生人",
  2: "過路客",
  3: "香客",
  4: "常客",
  5: "弟子",
  6: "知己",
  7: "道友",
  8: "摯友",
  9: "知音",
  10: "渡化緣"
};

// 特殊回覆（根據好感度解鎖）
const SPECIAL_RESPONSES: { [key: number]: string[] } = {
  3: ["你來啦～", "又見面了呢"],
  5: ["徒兒，今天想聊什麼？", "你總是能讓我開心"],
  7: ["道友，好久不見！", "與你對話總是愉快"],
  10: ["摯愛的緣分啊", "你我已是靈魂伴侶"]
};

const initializeAffection = (persona: AIPersona): FairyAffection => ({
  persona,
  level: 1,
  chatCount: 0,
  specialResponses: [],
  title: AFFECTION_TITLES[1],
  lastInteraction: new Date().toISOString()
});

export const useFairyAffection = () => {
  const [affections, setAffections] = useState<{ [key in AIPersona]: FairyAffection }>(() => {
    const stored = localStorage.getItem(AFFECTION_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    
    // 初始化所有仙女的好感度
    const initial: any = {};
    Object.values(AIPersona).forEach(persona => {
      initial[persona] = initializeAffection(persona);
    });
    return initial;
  });

  // 保存到 localStorage
  useEffect(() => {
    localStorage.setItem(AFFECTION_STORAGE_KEY, JSON.stringify(affections));
  }, [affections]);

  // 增加聊天次數和好感度
  const incrementChatCount = useCallback((persona: AIPersona) => {
    setAffections(prev => {
      const current = prev[persona] || initializeAffection(persona);
      const newChatCount = current.chatCount + 1;
      
      // 計算新的好感度等級（每10次對話升1級，最高10級）
      const newLevel = Math.min(10, Math.floor(newChatCount / 10) + 1);
      
      // 解鎖特殊回覆
      const newSpecialResponses = [...current.specialResponses];
      if (SPECIAL_RESPONSES[newLevel] && !newSpecialResponses.includes(...SPECIAL_RESPONSES[newLevel])) {
        newSpecialResponses.push(...SPECIAL_RESPONSES[newLevel]);
      }
      
      return {
        ...prev,
        [persona]: {
          ...current,
          chatCount: newChatCount,
          level: newLevel,
          title: AFFECTION_TITLES[newLevel],
          specialResponses: newSpecialResponses,
          lastInteraction: new Date().toISOString()
        }
      };
    });
  }, []);

  // 獲取特定仙女的好感度
  const getAffection = useCallback((persona: AIPersona): FairyAffection => {
    return affections[persona] || initializeAffection(persona);
  }, [affections]);

  // 獲取隨機特殊回覆
  const getSpecialResponse = useCallback((persona: AIPersona): string | null => {
    const affection = affections[persona];
    if (!affection || affection.specialResponses.length === 0) {
      return null;
    }
    const randomIndex = Math.floor(Math.random() * affection.specialResponses.length);
    return affection.specialResponses[randomIndex];
  }, [affections]);

  return {
    affections,
    incrementChatCount,
    getAffection,
    getSpecialResponse
  };
};
