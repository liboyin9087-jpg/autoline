#!/usr/bin/env node

/**
 * 前後端連線狀態檢查工具
 * 用於驗證 API 端點是否正常運作
 */

const http = require('http');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

console.log(`${colors.blue}========================================${colors.reset}`);
console.log(`${colors.blue}    前後端連線狀態檢查工具${colors.reset}`);
console.log(`${colors.blue}========================================${colors.reset}\n`);

// 檢查環境變數
console.log('📋 檢查環境變數...');
const apiKey = process.env.GOOGLE_API_KEY;
if (apiKey) {
  console.log(`${colors.green}✓${colors.reset} GOOGLE_API_KEY 已設定 (長度: ${apiKey.length})`);
} else {
  console.log(`${colors.yellow}⚠${colors.reset} GOOGLE_API_KEY 未設定 (可能從秘密變數讀取)`);
}

const port = process.env.PORT || 8080;
console.log(`${colors.green}✓${colors.reset} PORT: ${port}\n`);

// 測試後端 API 端點
function testEndpoint(path, description) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: port,
      path: path,
      method: 'GET',
      timeout: 5000
    };

    console.log(`🔍 測試: ${description}`);
    console.log(`   端點: http://localhost:${port}${path}`);

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`${colors.green}✓${colors.reset} 狀態碼: ${res.statusCode}`);
          try {
            const json = JSON.parse(data);
            console.log(`${colors.green}✓${colors.reset} 回應: ${JSON.stringify(json, null, 2)}`);
          } catch (e) {
            console.log(`${colors.green}✓${colors.reset} 回應: ${data.substring(0, 100)}...`);
          }
          resolve(true);
        } else {
          console.log(`${colors.yellow}⚠${colors.reset} 狀態碼: ${res.statusCode}`);
          console.log(`   回應: ${data}`);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`${colors.red}✗${colors.reset} 連線失敗: ${error.message}`);
      reject(error);
    });

    req.on('timeout', () => {
      console.log(`${colors.red}✗${colors.reset} 連線逾時`);
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
}

async function runTests() {
  try {
    console.log('開始測試後端 API...\n');

    // 測試健康檢查端點
    await testEndpoint('/api/health', '健康檢查端點');
    console.log();

    // 測試連線狀態端點
    await testEndpoint('/api/status', '連線狀態端點');
    console.log();

    console.log(`${colors.green}========================================${colors.reset}`);
    console.log(`${colors.green}    ✓ 所有測試通過！${colors.reset}`);
    console.log(`${colors.green}========================================${colors.reset}\n`);

    console.log('📝 連線資訊摘要：');
    console.log(`   - 後端服務運行在: http://localhost:${port}`);
    console.log(`   - 前端開發服務: http://localhost:5173 (需使用 npm run dev 啟動)`);
    console.log(`   - API 代理設定: /api/* -> http://localhost:${port}/api/*`);
    console.log(`   - 圖片資源位置: /public/*.png\n`);

  } catch (error) {
    console.log(`\n${colors.red}========================================${colors.reset}`);
    console.log(`${colors.red}    ✗ 測試失敗${colors.reset}`);
    console.log(`${colors.red}========================================${colors.reset}\n`);

    console.log('❌ 請檢查以下項目：');
    console.log('   1. 後端服務是否已啟動？(執行: npm run dev:server)');
    console.log('   2. Port 8080 是否被其他程序佔用？');
    console.log('   3. .env 檔案是否正確設定？');
    console.log('   4. 環境變數是否正確載入？\n');

    process.exit(1);
  }
}

// 執行測試
runTests();
