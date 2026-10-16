const webdav = require('webdav-server').v2;
const path = require('path');
const os = require('os');
const fs = require('fs');

// ==================== 設定區 ====================
const PORT = 8010;

// 自動抓取執行檔所在目錄下的 "Music" 資料夾
// 如果是開發階段 (node server.js)，則會抓取當前專案目錄下的 Music 資料夾
const baseDir = process.pkg ? path.dirname(process.execPath) : __dirname;
const MUSIC_FOLDER = path.join(baseDir, 'Music');
// ================================================

// 自動建立音樂資料夾（如果不存在的話）
if (!fs.existsSync(MUSIC_FOLDER)) {
    fs.mkdirSync(MUSIC_FOLDER, { recursive: true });
}

// 取得本機 192.168.X.X 的區域網路 IP
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const devName in interfaces) {
        const iface = interfaces[devName];
        for (let i = 0; i < iface.length; i++) {
            const alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '128.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
    return '127.0.0.1';
}

const localIP = getLocalIP();

// 建立 WebDAV 伺服器
const server = new webdav.WebDAVServer({
    port: PORT
});

// 將實體音樂資料夾映射到 WebDAV 的根目錄 (/)
server.setFileSystem('/', new webdav.PhysicalFileSystem(MUSIC_FOLDER), (status) => {
    console.log("==================================================");
    console.log(" 🎵 Node.js Windows 個人音樂維護伺服器已啟動！");
    console.log(` 📂 正在分享資料夾: ${MUSIC_FOLDER}`);
    console.log(` 🌐 請在 iPhone App (如 Evermusic) 中輸入此 WebDAV 網址：`);
    console.log(`    http://${localIP}:${PORT}`);
    console.log("==================================================");
    console.log("提示：請保持此視窗開啟。若要關閉，請直接關閉視窗或按 Ctrl + C。");
});

// 啟動伺服器
server.start(() => {
    // 伺服器成功在指定 Port 監聽
});