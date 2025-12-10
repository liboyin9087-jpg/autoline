import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, existsSync, readdirSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'dist')));

// 核心修復：更強健的 contents 格式轉換 (解決問題 2)
function normalizeToGeminiContents(body) {
    // 情況 A: 已經是標準 Gemini contents 格式
    if (body.contents && Array.isArray(body.contents)) {
        return body.contents;
    }

    // 情況 B: 來自管理介面或舊版 App (history + message)
    let contents = [];

    // 處理 history (即使是 undefined 或空陣列也沒關係)
    if (body.history && Array.isArray(body.history)) {
        body.history.forEach(msg => {
            if (msg.text || msg.content) {
                contents.push({
                    role: (msg.role === 'assistant' || msg.role === 'model') ? 'model' : 'user',
                    parts: [{ text: msg.text || msg.content || '' }]
                });
            }
        });
    }

    // 處理當前訊息 (body.message 或 body.text)
    const currentMsgText = body.message || body.text;
    if (currentMsgText) {
        contents.push({
            role: 'user',
            parts: [{ text: currentMsgText }]
        });
    }
    
    // 如果處理完還是空的，且原始 body.messages 存在 (App 另一種格式)
    if (contents.length === 0 && body.messages && Array.isArray(body.messages)) {
        return body.messages.map(msg => ({
            role: (msg.role === 'assistant' || msg.role === 'model') ? 'model' : 'user',
            parts: [{ text: msg.text || msg.content || '' }]
        }));
    }

    return contents.length > 0 ? contents : null;
}

// API Routes
app.post('/api/chat', async (req, res) => {
    try {
        console.log('📨 Request Body Keys:', Object.keys(req.body));

        // 1. 轉換並驗證 contents
        const contents = normalizeToGeminiContents(req.body);

        if (!contents || !Array.isArray(contents) || contents.length === 0) {
            console.error('❌ contents 轉換失敗或為空');
            return res.status(400).json({ 
                error: 'contents must be a non-empty array',
                receivedBody: JSON.stringify(req.body).substring(0, 200) // Log 部分內容除錯
            });
        }

        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) return res.status(500).json({ error: 'API Key 未設定' });

        // 2. 呼叫 Gemini
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents,
                    generationConfig: {
                        maxOutputTokens: 8192,
                        temperature: 0.9
                    }
                })
            }
        );

        if (!response.ok) {
            const errText = await response.text();
            console.error('Gemini API Error:', errText);
            return res.status(response.status).json({ error: 'Gemini Error', details: errText });
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const usage = data.usageMetadata;

        // 3. 核心修復：回傳正確格式 { text } (解決問題 1)
        console.log('✅ 回傳成功，格式為 { text, usage }');
        res.json({ text, usage }); 

    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/status', (req, res) => res.json({ status: 'ok', version: '2.0.1-fixed' }));
app.get('*', (req, res) => {
    const index = path.join(__dirname, 'dist', 'index.html');
    if (existsSync(index)) res.sendFile(index);
    else res.status(404).send('Build not found');
});

app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
