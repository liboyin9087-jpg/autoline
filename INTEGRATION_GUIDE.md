# 🎭 仙女下凡來點名 - 三大新功能整合指南

## 📋 功能概覽

本次更新新增三個核心功能，大幅提升應用程式的互動性和話題傳播力：

| 功能 | 說明 | 病毒傳播潛力 |
|------|------|--------------|
| 🎋 神籤系統 | 三種抽籤方式：搖籤筒、擲筊、轉盤 | ⭐⭐⭐⭐⭐ |
| 👥 仙女群聊 | 五位仙女同時回應同一問題 | ⭐⭐⭐⭐⭐ |
| 🎯 彩蛋關鍵字 | 特定詞彙觸發特效和驚喜回應 | ⭐⭐⭐⭐ |

---

## 🗂️ 檔案結構

```
components/
├── DivineFortune.tsx      # 神籤系統元件
├── FairyGroupChat.tsx     # 仙女群聊模式
├── EasterEggSystem.tsx    # 彩蛋關鍵字系統
└── ... (其他既有元件)

App.updated.tsx            # 整合後的主程式（請將內容複製到 App.tsx）
```

---

## 🔧 整合步驟

### 步驟 1：複製元件檔案

將以下三個新檔案複製到 `components/` 目錄：

1. `DivineFortune.tsx`
2. `FairyGroupChat.tsx`
3. `EasterEggSystem.tsx`

### 步驟 2：更新 App.tsx

將 `App.updated.tsx` 的內容複製到 `App.tsx`，或手動整合以下變更：

#### 2.1 新增 Import

```tsx
import { DivineFortune } from './components/DivineFortune';
import { FairyGroupChat, GroupChatTrigger } from './components/FairyGroupChat';
import { 
  EasterEggEffectRenderer, 
  EasterEggToast, 
  useEasterEgg 
} from './components/EasterEggSystem';
import { Wand2 } from 'lucide-react';
```

#### 2.2 新增狀態變數

```tsx
// 神籤系統
const [showDivineFortune, setShowDivineFortune] = useState(false);

// 群聊模式
const [showGroupChat, setShowGroupChat] = useState(false);
const [groupChatQuestion, setGroupChatQuestion] = useState('');

// 彩蛋系統
const { 
  checkForEasterEgg, 
  activeEffect, 
  setActiveEffect,
  toastMessage: easterEggToast,
  showToast: showEasterEggToast,
  setShowToast: setShowEasterEggToast,
  triggeredEgg
} = useEasterEgg();
```

#### 2.3 更新 handleSend 函數

在 `handleSend` 函數開頭加入：

```tsx
// 檢查神籤觸發
if (text === '__DIVINE_FORTUNE__') {
  setShowDivineFortune(true);
  return;
}

// 彩蛋檢測
const easterEgg = checkForEasterEgg(text);
```

#### 2.4 新增 Modal 元件

在 return 內加入：

```tsx
{/* 神籤系統 */}
<DivineFortune
  isOpen={showDivineFortune}
  onClose={() => setShowDivineFortune(false)}
  onResult={handleFortuneResult}
  botName={currentPersona.name}
  botAvatar={currentPersona.img}
/>

{/* 群聊模式 */}
<FairyGroupChat
  isOpen={showGroupChat}
  onClose={() => setShowGroupChat(false)}
  userQuestion={groupChatQuestion}
  onSelectResponse={handleGroupChatResponse}
  onSendAllResponses={handleGroupChatAllResponses}
/>

{/* 彩蛋特效 */}
<EasterEggEffectRenderer
  effect={activeEffect}
  isActive={activeEffect !== 'none'}
  onComplete={() => setActiveEffect('none')}
  duration={triggeredEgg?.duration || 3000}
/>

<EasterEggToast
  message={easterEggToast}
  isVisible={showEasterEggToast}
  onClose={() => setShowEasterEggToast(false)}
/>
```

### 步驟 3：新增必要的 CSS

在 `tailwind.config.js` 或全域 CSS 中加入：

```css
/* 神籤系統動畫 */
@keyframes shake {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-10deg); }
  75% { transform: rotate(10deg); }
}

@keyframes stick-out {
  0% { transform: translateX(-50%) translateY(100%); }
  60% { transform: translateX(-50%) translateY(-20%); }
  100% { transform: translateX(-50%) translateY(0); }
}

@keyframes flip {
  0% { transform: rotateX(0) translateY(0); }
  50% { transform: rotateX(180deg) translateY(-50px); }
  100% { transform: rotateX(360deg) translateY(0); }
}

/* 彩蛋系統動畫 */
@keyframes fall {
  0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
  100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
}

@keyframes screen-shake {
  0%, 100% { transform: translate(0, 0); }
  10%, 30%, 50%, 70%, 90% { transform: translate(-5px, -5px); }
  20%, 40%, 60%, 80% { transform: translate(5px, 5px); }
}

@keyframes bounce-in {
  0% { transform: translate(-50%, -100px) scale(0.8); opacity: 0; }
  60% { transform: translate(-50%, 10px) scale(1.05); }
  100% { transform: translate(-50%, 0) scale(1); opacity: 1; }
}

@keyframes slide-up {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes matrix-rain {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100vh); }
}

@keyframes rainbow {
  0% { opacity: 0; transform: translateY(-100%); }
  20% { opacity: 1; transform: translateY(0); }
  80% { opacity: 1; }
  100% { opacity: 0; transform: translateY(100vh); }
}

.animate-shake { animation: shake 0.3s ease-in-out; }
.animate-stick-out { animation: stick-out 0.8s ease-out forwards; }
.animate-flip { animation: flip 1.2s ease-in-out; }
.animate-fall { animation: fall linear forwards; }
.animate-screen-shake { animation: screen-shake 0.5s ease-in-out; }
.animate-bounce-in { animation: bounce-in 0.5s ease-out; }
.animate-slide-up { animation: slide-up 0.3s ease-out; }
.animate-matrix-rain { animation: matrix-rain 4s linear infinite; }
.animate-rainbow { animation: rainbow 3s ease-in-out forwards; }
```

---

## 🎋 功能一：神籤系統詳解

### 三種抽籤方式

| 方式 | 操作 | 儀式感 | 適合場景 |
|------|------|--------|----------|
| 搖籤筒 | 點擊籤筒搖動，搖到籤掉出 | ⭐⭐⭐⭐⭐ | 傳統控、求正式解籤 |
| 擲筊問卦 | 擲出聖筊才能抽籤 | ⭐⭐⭐⭐ | 求神明確認、增加緊張感 |
| 轉盤卜卦 | 轉動命運之輪 | ⭐⭐⭐ | 快速抽籤、現代風格 |

### 籤詩資料庫

預設包含 10 支籤詩，涵蓋「上上籤」到「下籤」。可在 `DivineFortune.tsx` 的 `FORTUNE_DATABASE` 中擴充：

```tsx
const FORTUNE_DATABASE: FortuneResult[] = [
  {
    number: 1,
    level: '上上籤',
    title: '龍飛鳳舞',
    poem: '雲開見月明，萬事皆順心',
    interpretation: '如同撥雲見日，所有困難都將迎刃而解',
    advice: '大膽行動，時機已到',
    luckyItem: '金色飾品',
    luckyColor: '金黃',
    luckyDirection: '東方'
  },
  // 可繼續新增...
];
```

### 分享功能

籤詩自動產生分享文案，包含：
- 籤號和籤等
- 籤詩和解釋
- 幸運物、幸運色、幸運方位
- Hashtag（#一池0仙宮 #仙女籤詩）

---

## 👥 功能二：仙女群聊詳解

### 運作流程

1. 用戶輸入問題
2. 系統同時呼叫 5 個不同 persona 的 API（或模擬回應）
3. 顯示所有仙女的回覆
4. 用戶可選擇單一回覆或發送全部到對話

### 呼叫時機

- 首頁點擊「召喚全體仙女」按鈕
- 對話中點擊右下角群聊按鈕
- 輸入「召喚仙女」「全體仙女」觸發彩蛋

### API 整合

目前使用模擬回應。正式環境請修改 `generateMockResponse` 函數，改為平行呼叫 Gemini API：

```tsx
// 實際使用時這裡呼叫 API
const response = await sendMessageToGemini(
  [...], 
  AppMode.LIFESTYLE, 
  null, 
  { persona: fairy.persona }
);
```

---

## 🎯 功能三：彩蛋關鍵字詳解

### 彩蛋列表

| 關鍵字 | 特效 | 回應 |
|--------|------|------|
| 下班、放假、收工 | 🎉 撒花 | 恭喜收工！今天也辛苦了～ |
| 發財、中獎、加薪 | 💰 金幣雨 | 金銀財寶從天而降！ |
| 生日快樂 | 🎆 煙火 | 生日快樂！！！ |
| 單身、沒對象 | 💕 愛心飄散 | 桃花仙子被召喚！ |
| debug、bug | 🟢 駭客帝國 | 天機星君除錯模式啟動 |
| 好餓、肚子餓 | 召喚閃電娘娘 | 御膳娘娘被召喚！ |
| 早安、起床 | 🌈 彩虹 | 新的一天，新的開始！ |
| 晚安、睡覺 | ❄️ 下雪 | 願星星守護你的夢境 |

### 新增彩蛋

在 `EasterEggSystem.tsx` 的 `EASTER_EGG_CONFIG` 中新增：

```tsx
{
  keywords: ['你的關鍵字'],
  effect: 'confetti', // 特效類型
  customResponse: '你的回應文字',
  forcedPersona: 'friend', // 可選：強制切換角色
  duration: 3000 // 特效持續時間
}
```

### 可用特效

- `confetti` - 撒花/彩帶
- `hearts` - 愛心飄散
- `rain_coins` - 金幣雨
- `thunder` - 雷電震動
- `rainbow` - 彩虹
- `fireworks` - 煙火
- `snow` - 下雪
- `sakura` - 櫻花飄落
- `ghost` - 幽靈
- `matrix` - 駭客帝國
- `shake` - 畫面震動
- `fairy_summon` - 召喚特定仙女
- `gentle_mode` - 溫柔模式

---

## 🔊 音效整合（選用）

如需音效，請在 `public/sounds/` 目錄放置以下檔案：

- `shake.mp3` - 搖籤筒音效
- `drop.mp3` - 籤掉落音效
- `throw.mp3` - 擲筊音效
- `spin.mp3` - 轉盤音效
- `reveal.mp3` - 揭曉音效
- `coins.mp3` - 金幣音效

---

## 📱 響應式設計

所有元件已針對手機和桌面版優化：

- Modal 在手機上從底部滑入（`rounded-t-3xl`）
- 桌面版置中顯示（`rounded-3xl`）
- 觸控友善的按鈕尺寸（最小 44x44px）

---

## 🚀 部署檢查清單

- [ ] 確認所有新元件已正確 import
- [ ] 確認 CSS 動畫已加入
- [ ] 測試神籤三種方式都能正常運作
- [ ] 測試群聊模式 API 呼叫
- [ ] 測試彩蛋關鍵字觸發
- [ ] 確認分享功能正常
- [ ] 手機和桌面版 UI 測試

---

## 📈 預期效果

這三個功能的設計目標：

1. **提高用戶停留時間**：神籤和群聊增加互動深度
2. **促進社群分享**：籤詩分享圖、彩蛋驚喜截圖
3. **創造話題討論**：「大叔仙女幫我抽籤」「五個仙女吵架」
4. **增加回訪率**：每日運勢、隱藏彩蛋收集

---

## 🐛 已知問題

1. 群聊模式目前使用模擬回應，需整合實際 API
2. 擲筊三次未成功後需要重新開始
3. 轉盤指針定位在極端角度可能不準確

---

如有任何問題，歡迎隨時詢問！✨
