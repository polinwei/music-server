const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 開始進行 Node.js v26 官方一鍵原生 SEA 安全打包...');

try {
    const targetExe = path.join(__dirname, 'music-server.exe');
    if (fs.existsSync(targetExe)) {
        fs.unlinkSync(targetExe); // 刪除舊檔避免佔用
    }

    // 調用 Node 26 內建的一鍵編譯 + 注入功能
    execSync('node --build-sea sea-config.json', { stdio: 'inherit' });

    console.log('\n==================================================');
    console.log(' ✨ 封裝成功！已產出穩定運行的獨立執行檔：music-server.exe');
    console.log('==================================================\n');

} catch (error) {
    console.error('❌ 打包過程中發生錯誤：', error.message);
}
