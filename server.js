import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, existsSync, readdirSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 讀取版本號
let VERSION = '2.0.0';
try {
  const packageJson = JSON.parse(readFileSync(path.join(__dirname, 'package.json'), 'utf-8'));
  VERSION = packageJson.version;
} catch (e) {
  console.warn('⚠️ Could not read package.json');
}

const app = express();
const PORT = process.env.PORT || 8080;

// ===== 啟動診斷 =====
console.log('🚀 Server starting...');
console.log(`📁 Working directory: ${__dirname}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔑 API Key configured: ${!!process.env.GOOGLE_API_KEY}`);
console.log(`📦 Version: ${VERSION}`);

const distPath = path.join(__dirname, 'dist');
if (existsSync(distPath)) {
  console.log('✅ dist folder exists');
  const files = readdirSync(distPath);
  console.log('📁 dist contents:', files);
} else {
  console.error('❌ dist folder missing!');
}

// ===== Middleware =====
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 靜態文件服務
app.use(express.static(distPath));

// ===== API Routes =====

// 健康檢查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: VERSION 
  });
});

// 狀態檢查
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

// ===== 聊天 API（核心修復）=====
app.post('/api/chat', async (req, res) => {
  try {
    const { contents, systemInstruction, maxOutputTokens } = req.body;
    
    // 詳細日誌 - 方便除錯
    console.log('📨 收到聊天請求:', {
      bodyKeys: Object.keys(req.body),
      contentsType: typeof contents,
      contentsIsArray: Array.isArray(contents),
      contentsLength: Array.isArray(contents) ? contents.length : 'N/A',
      hasSystemInstruction: !!systemInstruction,
      maxOutputTokens
    });
    
    // 驗證 contents
    if (!contents) {
      console.error('❌ contents 未定義');
      return res.status(400).json({ 
        error: 'contents is required',
        received: Object.keys(req.body)
      });
    }
    
    if (!Array.isArray(contents)) {
      console.error('❌ contents 不是陣列，收到:', typeof contents);
      return res.status(400).json({ 
        error: 'contents must be an array',
        receivedType: typeof contents
      });
    }
    
    if (contents.length === 0) {
      console.error('❌ contents 是空陣列');
      return res.status(400).json({ error: 'contents cannot be empty' });
    }
    
    // 檢查 API Key
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.error('❌ GOOGLE_API_KEY 未設定');
      return res.status(500).json({ error: 'API key not configured' });
    }
    
    // 構建 Gemini API 請求
    const geminiRequest = {
      contents,
      generationConfig: {
        maxOutputTokens: maxOutputTokens || 8192,
        temperature: 0.9,
        topP: 0.95,
        topK: 40
      }
    };
    
    // 正確處理 systemInstruction 格式
    if (systemInstruction) {
      geminiRequest.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }
    
    console.log('📤 發送到 Gemini API...');
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiRequest)
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Gemini API 錯誤:', response.status, errorText);
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
      promptTokens: usage?.promptTokenCount,
      responseTokens: usage?.candidatesTokenCount
    });
    
    // ⚠️ 關鍵修復：回傳 text 而非 reply（與前端 App.tsx 對齊）
    res.json({ text, usage });
    
  } catch (error) {
    console.error('❌ Server 錯誤:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// SPA 路由支援
app.get('*', (req, res) => {
  const indexFile = path.join(__dirname, 'dist', 'index.html');
  if (existsSync(indexFile)) {
    res.sendFile(indexFile);
  } else {
    res.status(404).send('index.html not found');
  }
});

// 錯誤處理
app.use((err, req, res, next) => {
  console.error('❌ 未處理的錯誤:', err);
  res.status(500).json({ error: 'Something went wrong!' });
});

// ===== 啟動伺服器 =====
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
  console.log(`📁 Serving from: ${distPath}`);
});