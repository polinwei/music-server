const webdav = require('webdav-server').v2;
const path = require('path');
const os = require('os');
const fs = require('fs');

const PORT = 8010;
const baseDir = process.pkg ? path.dirname(process.execPath) : __dirname;
const MUSIC_FOLDER = path.join(baseDir, 'Music');

if (!fs.existsSync(MUSIC_FOLDER)) {
    fs.mkdirSync(MUSIC_FOLDER, { recursive: true });
}

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

// 建立純淨的 WebDAV 伺服器，不掛載任何會報錯的內建 extensions
const server = new webdav.WebDAVServer({
    port: PORT
});

// 自製超輕量 Middleware：當 Chrome 瀏覽器發送 GET 請求時，自動顯示 Music 資料夾內的檔案
server.beforeRequest((ctx, next) => {
    if (ctx.request.method === 'GET' && ctx.request.url === '/') {
        fs.readdir(MUSIC_FOLDER, (err, files) => {
            ctx.response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            ctx.response.write('<h2>🎵 我的 Windows 音樂庫清單</h2><ul>');
            if (err || files.length === 0) {
                ctx.response.write('<li>目前資料夾內沒有歌曲，請放入 MP3 檔案。</li>');
            } else {
                files.forEach(file => {
                    ctx.response.write(`<li>📌 ${file}</li>`);
                });
            }
            ctx.response.write('</ul><p>iPhone 傳輸專用，請保持此視窗開啟。</p>');
            ctx.response.end();
        });
    } else {
        next(); // 其他 WebDAV 專用請求（PROPFIND 等）交給套件正常處理
    }
});

// 將實體音樂資料夾映射到 WebDAV 的根目錄 (/)
server.setFileSystem('/', new webdav.PhysicalFileSystem(MUSIC_FOLDER), (status) => {
    console.log("==================================================");
    console.log(" 🎵 Node.js Windows 個人音樂維護伺服器已成功啟動！");
    console.log(` 📂 正在分享資料夾: ${MUSIC_FOLDER}`);
    console.log(` 🌐 網頁/iPhone App 皆可連線：`);
    console.log(`    http://${localIP}:${PORT}`);
    console.log("==================================================");
    console.log("提示：請保持此視窗開啟。若要關閉，請直接按 Ctrl + C。");
});

server.start();