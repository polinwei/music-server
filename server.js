
// ==================== 設定區 ====================
const webdav = require('webdav-server').v2;
const http = require('http');
const path = require('path');
const os = require('os');
const fs = require('fs');

const PORT = 8010; // 伺服器監聽的 port

// 自動抓取執行檔所在目錄下的 "Music" 資料夾
// 如果是開發階段 (node server.js)，則會抓取當前專案目錄下的 Music 資料夾
// 1. 判斷是否為 Node.js 官方 SEA 環境
const isSea = process.isSEA ? process.isSEA() : false;

// 2. 判斷是否為 pkg 打包環境
const isPkg = process.pkg ? true : false;

// 3. 根據不同的執行環境，動態決定基礎目錄 (baseDir)
let baseDir;

if (isSea) {
    // 官方 SEA 打包後，process.execPath 就是 .exe 的絕對路徑
    baseDir = path.dirname(process.execPath);
} else if (isPkg) {
    // pkg 打包後，process.execPath 同樣是 .exe 的絕對路徑
    baseDir = path.dirname(process.execPath);
} else {
    // VS Code 開發偵錯或直接執行 node server.js 時，使用當前腳本所在的目錄
    baseDir = __dirname;
}

// 4. 最終指向 Music 資料夾
const MUSIC_FOLDER = path.join(baseDir, 'Music');
// 測試列印（可在偵錯時確認路徑是否正確）
console.log(`[環境偵測] SEA: ${isSea}, Pkg: ${isPkg}`);
console.log(`[資料夾路徑] ${MUSIC_FOLDER}`);


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
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
    return '127.0.0.1';
}
const localIP = getLocalIP();

// 建立 WebDAV 伺服器
// 1. 建立純淨的 WebDAV 核心實例 (不帶任何 port 參數，不讓它自己開伺服器)
const davServer = new webdav.WebDAVServer();

// 將實體音樂資料夾映射到 WebDAV 的根目錄 (/)
davServer.setFileSystem('/', new webdav.PhysicalFileSystem(MUSIC_FOLDER), (status) => {
    // 檔案系統掛載成功
});

// 2. 使用 Node.js 內建的 http 模組來掌控最外層的請求
const httpServer = http.createServer((req, res) => {
    // 如果是網頁瀏覽器發送的標準 GET 請求，且直接瀏覽根目錄
    if (req.method === 'GET' && req.url === '/') {
        fs.readdir(MUSIC_FOLDER, (err, files) => {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.write('<h2>🎵 Windows 個人音樂維護伺服器</h2><ul>');
            if (err || files.length === 0) {
                res.write('<li>目前資料夾內沒有歌曲，請放入 MP3 檔案。</li>');
            } else {
                files.forEach(file => {
                    res.write(`<li>📌 ${file}</li>`);
                });
            }
            res.write('</ul><p>iPhone 傳輸專用，請保持此視窗開啟。</p>');
            res.end();
        });
    } else {
        // 3. 所有其他請求（例如 iPhone App 發出的 WebDAV 專屬指令）全部轉交給 WebDAV 核心處理
        davServer.execute(req, res);
    }
});

// 3. 啟動伺服器監聽
httpServer.listen(PORT, () => {
    console.log("==================================================");
    console.log(" 🎵 Node.js Windows 個人音樂維護伺服器已成功啟動！");
    console.log(` 📂 正在分享資料夾: ${MUSIC_FOLDER}`);
    console.log(` 🌐 網頁/iPhone App 皆可連線：`);
    console.log(`    http://${localIP}:${PORT}`);
    console.log("==================================================");
    console.log("提示：請保持此視窗開啟。若要關閉，請直接按 Ctrl + C。");
});
