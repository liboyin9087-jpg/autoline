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

// CORS 配置 - 允許所有來源（開發用）
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser 中間件
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 靜態文件服務
app.use(express.static(path.join(__dirname, 'dist')));

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