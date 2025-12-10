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
  console.warn('⚠️ Could not read package.json version');
}

const app = express();
const PORT = process.env.PORT || 8080;

// ===== 啟動時檢查 =====
console.log('🚀 Server starting...');
console.log(`📁 Working directory: ${__dirname}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔑 API Key configured: ${!!process.env.GOOGLE_API_KEY}`);
console.log(`📦 Version: ${VERSION}`);

// 檢查 dist 資料夾
const distPath = path.join(__dirname, 'dist');
if (existsSync(distPath)) {
  console.log('✅ dist folder exists');
  try {
    const distFiles = readdirSync(distPath);
    console.log('📁 dist contents:', distFiles);
    
    const assetsPath = path.join(distPath, 'assets');
    if (existsSync(assetsPath)) {
      const assetFiles = readdirSync(assetsPath);
      console.log('📁 assets contents:', assetFiles);
    } else {
      console.error('❌ assets folder missing!');
    }
    
    const indexPath = path.join(distPath, 'index.html');
    if (existsSync(indexPath)) {
      console.log('✅ index.html exists');
    } else {
      console.error('❌ index.html missing!');
    }
  } catch (e) {
    console.error('❌ Error reading dist folder:', e.message);
  }
} else {
  console.error('❌ dist folder does not exist!');
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
app.use(express.static(path.join(__dirname, 'dist')));

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
    version: VERSION,
    distExists: existsSync(distPath)
  });
});

// 聊天 API
app.post('/api/chat', async (req, res) => {
  try {
    const { contents, systemInstruction, maxOutputTokens } = req.body;
    
    console.log('📨 Chat request received:', {
      contentsLength: contents?.length,
      hasSystemInstruction: !!systemInstruction,
      maxOutputTokens
    });
    
    if (!Array.isArray(contents)) {
      return res.status(400).json({ error: 'contents must be an array' });
    }
    
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.error('❌ GOOGLE_API_KEY not configured');
      return res.status(500).json({ error: 'API key not configured' });
    }
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
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
      console.error('❌ Gemini API error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: response.status === 429 ? 'API 配額已用完，請稍後再試' : 'API 請求失敗',
        details: errorText
      });
    }
    
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const usage = data.usageMetadata;
    
    console.log('✅ Response success:', {
      textLength: text.length,
      usage
    });
    
    // 回傳格式與前端 App.tsx 對應（使用 text 而非 reply）
    res.json({ text, usage });
    
  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// SPA 路由支援 - 所有其他請求返回 index.html
app.get('*', (req, res) => {
  const indexFile = path.join(__dirname, 'dist', 'index.html');
  if (existsSync(indexFile)) {
    res.sendFile(indexFile);
  } else {
    res.status(404).send('index.html not found. Build may have failed.');
  }
});

// 錯誤處理
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({ error: 'Something went wrong!' });
});

// ===== Start Server =====
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
  console.log(`📁 Serving static files from: ${distPath}`);
});
