import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 讀取版本號從 package.json
const packageJson = JSON.parse(readFileSync(path.join(__dirname, 'package.json'), 'utf-8'));
const VERSION = packageJson.version;

const app = express();
const PORT = process.env.PORT || 8080;

// 簡單的記憶體存儲（生產環境應使用資料庫）
let devicesStore = [
  {
    id: '1',
    name: '我的 iPhone',
    model: 'iPhone 13 Pro',
    os: 'iOS',
    status: 'online',
    lastSeen: new Date().toISOString(),
    note: '主要設備'
  }
];

// CORS 配置 - 允許前端網域存取
const allowedOrigins = [
  'https://line-ai-assistant-970949752172-970949752172.asia-east1.run.app',
  'http://localhost:5173',  // 開發環境
  'http://localhost:8080',
  '*'  // 允許所有來源（開發用）
];

app.use(cors({
  origin: function (origin, callback) {
    // 允許沒有 origin 的請求（如 Postman、curl、同源請求）
    if (!origin) return callback(null, true);
    
    // 檢查是否在允許清單中
    if (allowedOrigins.includes('*')) {
      // 開發模式：允許所有來源
      callback(null, true);
    } else if (allowedOrigins.indexOf(origin) !== -1) {
      // 生產模式：僅允許白名單中的來源
      callback(null, true);
    } else {
      // 拒絕未授權的來源
      console.warn('⚠️ CORS 請求被拒絕，來自未授權的來源:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Body parser 中間件
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 靜態文件服務
app.use(express.static(path.join(__dirname, 'dist')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// 健康檢查端點
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 連線狀態檢查端點
app.get('/api/status', (req, res) => {
  res.json({
    server: 'running',
    apiKeyConfigured: !!process.env.GOOGLE_API_KEY,
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    version: VERSION
  });
});

// 手機管理 API 端點
// 獲取所有設備
app.get('/api/devices', (req, res) => {
  try {
    res.json({ success: true, devices: devicesStore });
  } catch (error) {
    console.error('❌ 獲取設備列表錯誤:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 新增設備
app.post('/api/devices', (req, res) => {
  try {
    const { name, model, os, note } = req.body;
    
    // 輸入驗證
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ success: false, error: '設備名稱為必填欄位' });
    }
    if (!model || typeof model !== 'string' || model.trim() === '') {
      return res.status(400).json({ success: false, error: '設備型號為必填欄位' });
    }
    if (!os || typeof os !== 'string' || !['iOS', 'Android', 'Other'].includes(os)) {
      return res.status(400).json({ success: false, error: '作業系統必須為 iOS、Android 或 Other' });
    }
    
    const newDevice = {
      id: Date.now().toString(),
      name: name.trim(),
      model: model.trim(),
      os,
      status: 'online',
      lastSeen: new Date().toISOString(),
      note: note ? note.trim() : ''
    };
    
    // 添加到存儲
    devicesStore.push(newDevice);
    
    res.json({ success: true, device: newDevice });
  } catch (error) {
    console.error('❌ 新增設備錯誤:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 更新設備狀態
app.put('/api/devices/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // 輸入驗證
    if (!status || !['online', 'offline'].includes(status)) {
      return res.status(400).json({ success: false, error: '狀態必須為 online 或 offline' });
    }
    
    // 查找並更新設備
    const device = devicesStore.find(d => d.id === id);
    if (!device) {
      return res.status(404).json({ success: false, error: '設備不存在' });
    }
    
    device.status = status;
    device.lastSeen = new Date().toISOString();
    
    res.json({ success: true, message: '設備狀態已更新', device });
  } catch (error) {
    console.error('❌ 更新設備錯誤:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 刪除設備
app.delete('/api/devices/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // 查找設備索引
    const index = devicesStore.findIndex(d => d.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: '設備不存在' });
    }
    
    // 從存儲中移除
    const deletedDevice = devicesStore.splice(index, 1)[0];
    
    res.json({ success: true, message: '設備已刪除', device: deletedDevice });
  } catch (error) {
    console.error('❌ 刪除設備錯誤:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 聊天 API 端點
app.post('/api/chat', async (req, res) => {
  try {
    const { contents, systemInstruction, maxOutputTokens } = req.body;
    
    console.log('📨 收到聊天請求:', {
      contentsLength: contents?.length,
      hasSystemInstruction: !!systemInstruction,
      maxOutputTokens
    });
    
    if (!Array.isArray(contents)) {
      return res.status(400).json({ error: 'contents must be an array' });
    }
    
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.error('❌ Google API Key 未設定');
      return res.status(500).json({ error: 'API key not configured' });
    }
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          systemInstruction,
          generationConfig: {
            maxOutputTokens: maxOutputTokens || 8192,
            temperature: 0.9,
            topP: 0.95,
            topK: 40
          }
        })
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Gemini API 錯誤:', errorText);
      return res.status(response.status).json({ 
        error: response.status === 429 ? 'API 配額已用完，請稍後再試' : 'API 請求失敗',
        details: errorText
      });
    }
    
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const usage = data.usageMetadata;
    
    console.log('✅ 回應成功:', {
      textLength: text.length,
      usage
    });
    
    res.json({ reply: text, usage });
  } catch (error) {
    console.error('❌ Server 錯誤:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// 手機管理介面路由
app.get('/management', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'management_interface.html'));
});

// 所有其他路由都返回 index.html（SPA 路由支援）
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error('❌ 未處理的錯誤:', err);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📁 Serving from: ${__dirname}/dist`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔑 API Key configured: ${!!process.env.GOOGLE_API_KEY}`);
});