import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, existsSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 8080;
const VERSION = '2.1.0-UNIVERSAL'; // 🟢 版本標記

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'dist')));

// 核心功能：自動將前端的 history/message 轉成 Gemini 的 contents
function normalizeToGeminiContents(body) {
    // 1. 如果已經是標準格式，直接用
    if (body.contents && Array.isArray(body.contents)) return body.contents;

    // 2. 開始轉換
    let contents = [];

    // 3. 處理歷史訊息 (history 或 messages)
    const sourceArray = body.history || body.messages || [];
    if (Array.isArray(sourceArray)) {
        sourceArray.forEach(msg => {
            const role = (msg.role === 'assistant' || msg.role === 'model') ? 'model' : 'user';
            const text = msg.text || msg.content || '';
            if (text) contents.push({ role, parts: [{ text }] });
        });
    }

    // 4. 處理當前訊息 (message 或 text)
    const currentMsg = body.message || body.text;
    if (currentMsg) {
        contents.push({ role: 'user', parts: [{ text: currentMsg }] });
    }

    // 5. 如果轉換後有東西，就回傳；否則回傳 null
    return contents.length > 0 ? contents : null;
}

// API Routes
app.post('/api/chat', async (req, res) => {
    try {
        console.log(`📨 [v${VERSION}] 收到請求, Keys:`, Object.keys(req.body));
        
        // 自動轉換格式
        const contents = normalizeToGeminiContents(req.body);

        // 如果轉換失敗 (代表前端傳了空的東西)
        if (!contents) {
            console.error('❌ 轉換失敗，格式無法識別');
            return res.status(400).json({ 
                error: 'contents normalization failed', 
                version: VERSION,
                received: Object.keys(req.body) 
            });
        }

        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) return res.status(500).json({ error: 'API Key Missing' });

        // 呼叫 Gemini
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents,
                    generationConfig: { maxOutputTokens: 8192 }
                })
            }
        );

        if (!response.ok) {
            const err = await response.text();
            return res.status(response.status).json({ error: 'Gemini Error', details: err });
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const usage = data.usageMetadata;

        // 回傳正確格式
        res.json({ text, usage, version: VERSION });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/status', (req, res) => res.json({ status: 'ok', version: VERSION }));

app.get('*', (req, res) => {
    const index = path.join(__dirname, 'dist', 'index.html');
    if (existsSync(index)) res.sendFile(index);
    else res.status(404).send('Build not found');
});

app.listen(PORT, '0.0.0.0', () => console.log(`✅ Server v${VERSION} running on port ${PORT}`));
