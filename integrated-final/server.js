// 簡易 Express 靜態伺服器，並在啟動時檢查 dist 是否存在，將結果寫入日誌，方便 Cloud Run 偵錯
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;
const DIST_DIR = path.join(__dirname, 'dist');

// 啟動前檢查 dist 資料夾
function checkDist() {
  try {
    const stat = fs.statSync(DIST_DIR);
    if (!stat.isDirectory()) {
      console.warn(`[startup-check] ${DIST_DIR} exists but is not a directory`);
      return false;
    }
    const files = fs.readdirSync(DIST_DIR);
    console.log(`[startup-check] dist found at ${DIST_DIR}, contains ${files.length} item(s):`, files.slice(0, 50));
    return true;
  } catch (err) {
    console.error(`[startup-check] dist NOT found at ${DIST_DIR}:`, err.message);
    return false;
  }
}

const hasDist = checkDist();

if (!hasDist) {
  // 紀錄詳細錯誤（Cloud Run 日誌會顯示），但仍啟動以便 debug（視需要可改為 process.exit(1)）
  console.warn('[startup-check] Dist folder missing — the app may not serve static assets correctly.');
}

// 提供靜態檔案
app.use(express.static(DIST_DIR));

// fallback to index.html for SPA routing
app.get('*', (req, res) => {
  const indexPath = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(500).send('index.html not found. Build may have failed. Check startup logs.');
  }
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT} (NODE_ENV=${process.env.NODE_ENV || 'undefined'})`);
  console.log(`Serving from ${DIST_DIR}. dist presence: ${hasDist}`);
});
