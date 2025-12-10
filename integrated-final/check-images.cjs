#!/usr/bin/env node

/**
 * 圖片位置驗證工具
 * 檢查所有功能圖片是否存在於正確位置
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

console.log(`${colors.blue}========================================${colors.reset}`);
console.log(`${colors.blue}    圖片位置驗證工具${colors.reset}`);
console.log(`${colors.blue}========================================${colors.reset}\n`);

// 定義需要檢查的圖片及其對應功能
const IMAGE_MAPPINGS = [
  {
    name: 'fairy_consultant.png',
    persona: '智慧仙姑 (AIPersona.CONSULTANT)',
    description: '理性分析，解答疑惑',
    locations: ['public', 'dist']
  },
  {
    name: 'qr_selfie_fairy.png',
    persona: '桃花仙子 (AIPersona.FRIEND)',
    description: '熱情親切，陪伴聆聽',
    locations: ['public', 'dist']
  },
  {
    name: 'fairy_food.png',
    persona: '閃電娘娘 (AIPersona.CONCISE)',
    description: '極速回應，直達重點',
    locations: ['public', 'dist']
  },
  {
    name: 'tea_gossip_fairy.png',
    persona: '雲夢仙子 (AIPersona.CREATIVE)',
    description: '靈感湧現，詩意表達',
    locations: ['public', 'dist']
  },
  {
    name: 'fairy_tech.png',
    persona: '天機星君 (AIPersona.TECH)',
    description: '技術專精，程式Debug',
    locations: ['public', 'dist']
  }
];

console.log('📋 圖片對應關係：\n');

let allPassed = true;
let totalChecks = 0;
let passedChecks = 0;

IMAGE_MAPPINGS.forEach((mapping, index) => {
  console.log(`${index + 1}. ${colors.blue}${mapping.name}${colors.reset}`);
  console.log(`   角色: ${mapping.persona}`);
  console.log(`   描述: ${mapping.description}`);
  console.log(`   位置檢查:`);

  mapping.locations.forEach(location => {
    totalChecks++;
    const imagePath = path.join(__dirname, location, mapping.name);
    const exists = fs.existsSync(imagePath);

    if (exists) {
      const stats = fs.statSync(imagePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      console.log(`   ${colors.green}✓${colors.reset} /${location}/${mapping.name} (${sizeKB} KB)`);
      passedChecks++;
    } else {
      console.log(`   ${colors.red}✗${colors.reset} /${location}/${mapping.name} (不存在)`);
      allPassed = false;
    }
  });

  console.log();
});

// 檢查程式碼引用
console.log(`${colors.blue}========================================${colors.reset}`);
console.log(`${colors.blue}    程式碼引用檢查${colors.reset}`);
console.log(`${colors.blue}========================================${colors.reset}\n`);

const filesToCheck = [
  'App.tsx',
  'src/components/FairyGroupChat.tsx'
];

filesToCheck.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`📄 檢查檔案: ${file}`);
    const content = fs.readFileSync(filePath, 'utf-8');

    IMAGE_MAPPINGS.forEach(mapping => {
      if (content.includes(mapping.name)) {
        console.log(`   ${colors.green}✓${colors.reset} 引用 ${mapping.name}`);
      }
    });
    console.log();
  }
});

// 總結
console.log(`${colors.blue}========================================${colors.reset}`);
console.log(`${colors.blue}    檢查結果總結${colors.reset}`);
console.log(`${colors.blue}========================================${colors.reset}\n`);

console.log(`總檢查項目: ${totalChecks}`);
console.log(`通過項目: ${passedChecks}`);
console.log(`失敗項目: ${totalChecks - passedChecks}\n`);

if (allPassed) {
  console.log(`${colors.green}✓ 所有圖片位置檢查通過！${colors.reset}\n`);
  console.log('📝 圖片載入說明：');
  console.log('   - 開發環境：圖片從 /public 目錄載入');
  console.log('   - 生產環境：圖片從 /dist 目錄載入（需先執行 npm run build）');
  console.log('   - 引用方式：使用 "/圖片名稱" 格式（例如："/fairy_consultant.png"）\n');
  process.exit(0);
} else {
  console.log(`${colors.red}✗ 部分圖片檢查失敗${colors.reset}\n`);
  console.log('❌ 請檢查以下項目：');
  console.log('   1. public 目錄是否包含所有必要圖片？');
  console.log('   2. 是否已執行 npm run build 建置前端？');
  console.log('   3. 圖片檔名是否正確（區分大小寫）？\n');
  process.exit(1);
}
