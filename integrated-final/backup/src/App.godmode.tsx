import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// 類型定義
interface AIMode {
  name: string;
  systemInstruction: string;
  maxTokens: number;
  icon: string;
}

interface AIModes {
  [key: string]: AIMode;
}

interface GroupMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

interface Group {
  id: string;
  name: string;
  avatar: string;
  members: GroupMember[];
}

interface Message {
  type: 'system' | 'user' | 'ai' | 'error';
  text: string;
  usage?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
  mode?: string;
}

interface EmojiGroups {
  [key: string]: string[];
}

type ConnectionStatus = 'checking' | 'connected' | 'error';

// AI 模式配置（自動 token 調整）
const AI_MODES: AIModes = {
  normal: {
    name: '一般諮詢師',
    systemInstruction: '你是一位專業的 LINE 諮詢師，提供實用且友善的建議。',
    maxTokens: 2048,
    icon: '💬'
  },
  creative: {
    name: '創意作家',
    systemInstruction: '你是一位富有創意的作家，擅長用生動的語言和豐富的想像力來表達。',
    maxTokens: 4096,
    icon: '✨'
  },
  technical: {
    name: '技術專家',
    systemInstruction: '你是一位技術專家，提供詳細的技術解答和程式碼範例。',
    maxTokens: 8192,
    icon: '💻'
  },
  scholar: {
    name: '學術研究員',
    systemInstruction: '你是一位學術研究員，提供深入、結構化的分析和研究。',
    maxTokens: 8192,
    icon: '📚'
  }
};

// 群組模擬數據
const MOCK_GROUPS: Group[] = [
  {
    id: 'group1',
    name: '專案討論群',
    avatar: '👥',
    members: [
      { id: 'm1', name: 'Alice', avatar: '👩', role: 'PM' },
      { id: 'm2', name: 'Bob', avatar: '👨', role: 'Developer' },
      { id: 'm3', name: 'Carol', avatar: '👩‍💼', role: 'Designer' },
      { id: 'm4', name: 'Dave', avatar: '👨‍💻', role: 'Developer' }
    ]
  },
  {
    id: 'group2',
    name: '家族群組',
    avatar: '👨‍👩‍👧‍👦',
    members: [
      { id: 'f1', name: '爸爸', avatar: '👨', role: '一家之主' },
      { id: 'f2', name: '媽媽', avatar: '👩', role: '家庭主婦' },
      { id: 'f3', name: '姊姊', avatar: '👧', role: '大學生' },
      { id: 'f4', name: '弟弟', avatar: '👦', role: '高中生' }
    ]
  },
  {
    id: 'group3',
    name: '運動同好會',
    avatar: '⚽',
    members: [
      { id: 's1', name: 'Kevin', avatar: '🏃', role: '隊長' },
      { id: 's2', name: 'Linda', avatar: '🏃‍♀️', role: '隊員' },
      { id: 's3', name: 'Mike', avatar: '🏃', role: '隊員' }
    ]
  }
];

// Emoji 選單
const EMOJI_GROUPS: EmojiGroups = {
  'smiles': ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘'],
  'gestures': ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👏', '🙌', '👐', '🤲', '🙏', '✍️', '💪', '🦾'],
  'hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖'],
  'nature': ['🌸', '🌺', '🌻', '🌹', '🌷', '🌼', '🌱', '🌿', '☘️', '🍀', '🌾', '🌵', '🌴', '🌳', '🌲', '🎋']
};

function App() {
  const [selectedMode, setSelectedMode] = useState<string>('normal');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showGroupMembers, setShowGroupMembers] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('checking');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // 檢查後端連線狀態
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('/api/health');
        if (response.ok) {
          setConnectionStatus('connected');
          console.log('✅ 後端連線成功');
        } else {
          setConnectionStatus('error');
          console.error('❌ 後端回應異常');
        }
      } catch (error) {
        setConnectionStatus('error');
        console.error('❌ 無法連接後端:', error);
      }
    };
    
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // 自動滾動到最新訊息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 返回主畫面
  const handleBackToMain = () => {
    if (showGroupMembers) {
      setShowGroupMembers(false);
    } else if (selectedGroup) {
      setSelectedGroup(null);
      setMessages([]);
    }
  };

  // 選擇群組
  const handleSelectGroup = (group: Group) => {
    setSelectedGroup(group);
    setShowGroupMembers(false);
    setMessages([
      {
        type: 'system',
        text: `已進入 ${group.name}，目前有 ${group.members.length} 位成員`
      }
    ]);
  };

  // 顯示群組成員
  const handleShowMembers = () => {
    setShowGroupMembers(true);
  };

  // 發送訊息
  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;
    if (connectionStatus !== 'connected') {
      alert('無法連接到後端服務，請檢查連線狀態');
      return;
    }

    const userMessage: Message = { type: 'user', text: inputText };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const mode = AI_MODES[selectedMode];
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: inputText }]
            }
          ],
          systemInstruction: {
            parts: [{ text: mode.systemInstruction }]
          },
          maxOutputTokens: mode.maxTokens
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        type: 'ai',
        text: data.reply,
        usage: data.usage,
        mode: selectedMode
      }]);
    } catch (error) {
      console.error('發送訊息失敗:', error);
      setMessages(prev => [...prev, {
        type: 'error',
        text: `發送失敗: ${error instanceof Error ? error.message : '未知錯誤'}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // 插入 Emoji
  const handleInsertEmoji = (emoji: string) => {
    setInputText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // 開始錄音
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event: BlobEvent) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        console.log('錄音完成，檔案大小:', audioBlob.size);
        setInputText(prev => prev + ' [語音訊息]');
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('無法開始錄音:', error);
      alert('無法存取麥克風，請檢查權限設定');
    }
  };

  // 停止錄音
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // 清除訊息
  const handleClearMessages = () => {
    if (window.confirm('確定要清除所有訊息嗎？')) {
      setMessages([]);
    }
  };

  // 主畫面 - AI 模式選擇
  if (!selectedGroup) {
    return (
      <div className="app">
        <div className="header">
          <div className="header-title">LINE AI God Mode</div>
          <div className={`connection-status ${connectionStatus}`}>
            {connectionStatus === 'connected' && '🟢 已連線'}
            {connectionStatus === 'checking' && '🟡 檢查中...'}
            {connectionStatus === 'error' && '🔴 連線失敗'}
          </div>
        </div>

        <div className="mode-selection">
          <h2>選擇 AI 模式</h2>
          <div className="modes-grid">
            {Object.entries(AI_MODES).map(([key, mode]) => (
              <div
                key={key}
                className={`mode-card ${selectedMode === key ? 'active' : ''}`}
                onClick={() => setSelectedMode(key)}
              >
                <div className="mode-icon">{mode.icon}</div>
                <div className="mode-name">{mode.name}</div>
                <div className="mode-tokens">Max {mode.maxTokens} tokens</div>
              </div>
            ))}
          </div>

          <h2 style={{ marginTop: '2rem' }}>選擇群組</h2>
          <div className="groups-list">
            {MOCK_GROUPS.map(group => (
              <div
                key={group.id}
                className="group-item"
                onClick={() => handleSelectGroup(group)}
              >
                <div className="group-avatar">{group.avatar}</div>
                <div className="group-info">
                  <div className="group-name">{group.name}</div>
                  <div className="group-members">{group.members.length} 位成員</div>
                </div>
                <div className="group-arrow">→</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 群組成員列表畫面
  if (showGroupMembers) {
    return (
      <div className="app">
        <div className="header">
          <button className="back-button" onClick={handleBackToMain}>
            ← 返回
          </button>
          <div className="header-title">{selectedGroup.name}</div>
        </div>

        <div className="members-list">
          <h3>群組成員 ({selectedGroup.members.length})</h3>
          {selectedGroup.members.map(member => (
            <div key={member.id} className="member-item">
              <div className="member-avatar">{member.avatar}</div>
              <div className="member-info">
                <div className="member-name">{member.name}</div>
                <div className="member-role">{member.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 聊天畫面
  return (
    <div className="app">
      <div className="header">
        <button className="back-button" onClick={handleBackToMain}>
          ← 返回
        </button>
        <div 
          className="header-title clickable"
          onClick={handleShowMembers}
          title="點擊查看成員"
        >
          {selectedGroup.avatar} {selectedGroup.name}
        </div>
        <div className="header-actions">
          <span className="mode-badge">{AI_MODES[selectedMode].icon} {AI_MODES[selectedMode].name}</span>
          <button className="clear-button" onClick={handleClearMessages}>清除</button>
        </div>
      </div>

      <div className="messages-container">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.type}`}>
            {msg.type === 'system' && (
              <div className="system-message">{msg.text}</div>
            )}
            {msg.type === 'user' && (
              <div className="user-message">
                <div className="message-bubble">{msg.text}</div>
              </div>
            )}
            {msg.type === 'ai' && (
              <div className="ai-message">
                <div className="ai-avatar">{msg.mode && AI_MODES[msg.mode].icon}</div>
                <div className="message-content">
                  <div className="message-bubble">{msg.text}</div>
                  {msg.usage && (
                    <div className="message-stats">
                      輸入: {msg.usage.promptTokenCount} | 輸出: {msg.usage.candidatesTokenCount} | 總計: {msg.usage.totalTokenCount}
                    </div>
                  )}
                </div>
              </div>
            )}
            {msg.type === 'error' && (
              <div className="error-message">{msg.text}</div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="message ai">
            <div className="ai-avatar">{AI_MODES[selectedMode].icon}</div>
            <div className="message-bubble typing">思考中...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {showEmojiPicker && (
        <div className="emoji-picker">
          <div className="emoji-header">
            <span>選擇 Emoji</span>
            <button onClick={() => setShowEmojiPicker(false)}>✕</button>
          </div>
          {Object.entries(EMOJI_GROUPS).map(([category, emojis]) => (
            <div key={category} className="emoji-category">
              <div className="emoji-grid">
                {emojis.map((emoji, i) => (
                  <button
                    key={i}
                    className="emoji-button"
                    onClick={() => handleInsertEmoji(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="input-container">
        <button 
          className="input-action-button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          title="插入 Emoji"
        >
          😊
        </button>
        
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="輸入訊息..."
          disabled={isLoading}
        />

        <button
          className={`mic-button ${isRecording ? 'recording' : ''}`}
          onMouseDown={handleStartRecording}
          onMouseUp={handleStopRecording}
          onTouchStart={handleStartRecording}
          onTouchEnd={handleStopRecording}
          title="按住錄音"
        >
          🎤
        </button>
        
        <button 
          className="send-button"
          onClick={handleSendMessage}
          disabled={!inputText.trim() || isLoading}
        >
          發送
        </button>
      </div>
    </div>
  );
}

export default App;