#!/usr/bin/env node
/**
 * 圖片位置驗證工具（改良版）
 * 支援 --fix 選項
 * 用途：
 * node check-images.cjs        # 只檢查
 * node check-images.cjs --fix  # 檢查並嘗試修復
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const doFix = args.includes('--fix');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

console.log(`${colors.blue}========================================${colors.reset}`);
console.log(`${colors.blue}    圖片位置驗證工具 (支援 --fix)${colors.reset}`);
console.log(`${colors.blue}========================================${colors.reset}\n`);

const IMAGE_MAPPINGS = [
  { name: 'fairy_consultant.png', persona: '智慧仙姑', locations: ['public', 'dist'] },
  { name: 'qr_selfie_fairy.png', persona: '桃花仙子', locations: ['public', 'dist'] },
  { name: 'fairy_food.png', persona: '閃電娘娘', locations: ['public', 'dist'] },
  { name: 'tea_gossip_fairy.png', persona: '雲夢仙子', locations: ['public', 'dist'] },
  { name: 'fairy_tech.png', persona: '天機星君', locations: ['public', 'dist'] }
];

const rootDir = __dirname; 
const distDir = path.join(rootDir, 'dist');
const publicDir = path.join(rootDir, 'public');

// 遞迴搜尋檔案 (找尋 hash 版本)
function findFileRecursively(dir, needleBase) {
  if (!fs.existsSync(dir)) return null;
  let results = null;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const fullPath = path.join(dir, e.name);
    if (e.isDirectory()) {
      const found = findFileRecursively(fullPath, needleBase);
      if (found) return found;
    } else if (e.isFile()) {
      // 只要檔名開頭符合且是 png
      if (e.name.startsWith(needleBase) && e.name.endsWith('.png')) {
        return fullPath;
      }
    }
  }
  return null;
}

let allPassed = true;
let totalChecks = 0;
let passedChecks = 0;

IMAGE_MAPPINGS.forEach((mapping, index) => {
  console.log(`${index + 1}. ${colors.cyan}${mapping.name}${colors.reset} (${mapping.persona})`);
  
  // 1. 檢查 Public (來源)
  const publicPath = path.join(publicDir, mapping.name);
  totalChecks++;
  if (fs.existsSync(publicPath)) {
    const stats = fs.statSync(publicPath);
    console.log(`   ${colors.green}✓${colors.reset} /public/${mapping.name} (${(stats.size/1024).toFixed(2)} KB)`);
    passedChecks++;
  } else {
    console.log(`   ${colors.red}✗${colors.reset} /public/${mapping.name} (來源遺失)`);
    allPassed = false;
  }

  // 2. 檢查 Dist (目標)
  const distPath = path.join(distDir, mapping.name);
  totalChecks++;
  if (fs.existsSync(distPath)) {
    const stats = fs.statSync(distPath);
    console.log(`   ${colors.green}✓${colors.reset} /dist/${mapping.name} (${(stats.size/1024).toFixed(2)} KB)`);
    passedChecks++;
  } else {
    console.log(`   ${colors.yellow}⚠${colors.reset} /dist/${mapping.name} 不存在`);
    
    // 嘗試修復
    let fixed = false;
    const baseName = mapping.name.replace(/\.png$/, '');
    
    // A. 找 Hash 檔案
    const hashedFile = findFileRecursively(distDir, baseName);
    if (hashedFile) {
      console.log(`      -> 找到雜湊檔: ${path.relative(rootDir, hashedFile)}`);
      if (doFix) {
        try {
          fs.copyFileSync(hashedFile, distPath);
          console.log(`      ${colors.green}✓ [FIX] 已從雜湊檔還原${colors.reset}`);
          fixed = true;
          passedChecks++;
        } catch(e) { console.log(`      ${colors.red}✗ [FIX] 複製失敗: ${e.message}${colors.reset}`); }
      }
    } 
    
    // B. 從 Public 複製
    if (!fixed && !hashedFile && fs.existsSync(publicPath)) {
      console.log(`      -> 嘗試從 Public 還原`);
      if (doFix) {
        try {
          if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
          fs.copyFileSync(publicPath, distPath);
          console.log(`      ${colors.green}✓ [FIX] 已從 Public 複製${colors.reset}`);
          fixed = true;
          passedChecks++;
        } catch(e) { console.log(`      ${colors.red}✗ [FIX] 複製失敗: ${e.message}${colors.reset}`); }
      }
    }

    if (!fixed) allPassed = false;
  }
  console.log('');
});

console.log('----------------------------------------');
console.log(`檢查: ${totalChecks}, 通過: ${passedChecks}`);

if (!allPassed && !doFix) {
  console.log(`\n${colors.yellow}提示: 請執行 npm run check:images:fix 來自動修復${colors.reset}`);
  process.exit(1);
}

if (allPassed) {
  console.log(`\n${colors.green}所有檢查通過！${colors.reset}`);
}
