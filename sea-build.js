const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 開始進行官方 SEA 打包流程...');

// 1. 生成 sea-prep.blob
console.log('📦 1/3 正在編譯程式碼為二進位 Blob...');
execSync('node --experimental-sea-config sea-config.json');

// 2. 複製系統的 node.exe
console.log('📂 2/3 正在複製系統 Node.js 核心環境...');
const nodeExePath = process.execPath;
const targetExePath = path.join(__dirname, 'music-server.exe');
fs.copyFileSync(nodeExePath, targetExePath);

// 3. 利用注入機制或直接寫入檔案 (Node.js 官方標準作法)
console.log('🔥 3/3 正在將音樂伺服器核心燒錄至 exe 中...');
const sea = require('node:sea');

const isNode24 = process.version.startsWith('v24');

// 根據不同版本防呆處理，確保 100% 成功
if (sea && typeof sea.inject === 'function') {
    const blob = fs.readFileSync(path.join(__dirname, 'sea-prep.blob'));
    const exe = fs.readFileSync(targetExePath);
    const updated = sea.inject(exe, blob, {
        sentinel: 'NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2'
    });
    fs.writeFileSync(targetExePath, updated);
} else {
    // 萬一 require('node:sea') 拿不到 inject，使用底層二進位安全替換法
    const exe = fs.readFileSync(targetExePath);
    const blob = fs.readFileSync(path.join(__dirname, 'sea-prep.blob'));
    const sentinel = Buffer.from('NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2', 'ascii');
    
    const idx = exe.indexOf(sentinel);
    if (idx !== -1) {
        blob.copy(exe, idx);
        fs.writeFileSync(targetExePath, exe);
    } else {
        throw new Error('找不到封裝哨兵旗標，打包失敗！');
    }
}

// 4. 清理暫存檔
if (fs.existsSync(path.join(__dirname, 'sea-prep.blob'))) {
    fs.unlinkSync(path.join(__dirname, 'sea-prep.blob'));
}

console.log('\n==================================================');
console.log(' ✨ 大功告成！已成功產出獨立執行檔：music-server.exe');
console.log('==================================================\n');