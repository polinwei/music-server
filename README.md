# music-server
Windows 端用 nodejs 自建 WebDAV 音樂伺服器，讓 iPhone 端可以收聽

# 開發概念
不去維護 iOS 內建的 Apple Music 庫，而是開發一個給自己專用的 Windows 傳輸工具。在 iPhone 上則直接安裝 App Store 現成的、支援 WebDAV / SMB 或雲端同步的第三方音樂播放器（例如免費的 Navidrome 相關客戶端、VLC 或 MusicStreamer）。

# 系統架構圖 (System Architecture)
```mermaid
flowchart LR
    %% 定義區塊：Windows 電腦
    subgraph Windows ["💻 Windows 電腦"]
        direction TB
        1["1. 音樂資料夾 (MP3/AAC 檔案)"]
        2["2. 自製 Python / Node.js 腳本<br>(負責自動整理標籤、產出清單)"]
        3["3. 輕量 WebDAV 伺服器 (網頁協議)"]
        
        1 --> 2
        2 --> 3
    end

    %% 定義區塊：iPhone 手機
    subgraph iPhone ["📱 iPhone 手機"]
        direction TB
        4["4. 免費現成音樂 App<br>(支援 WebDAV 連線)<br>- 瀏覽歌單與目錄<br>- 一鍵「下載全部」到手機本地"]
        5["5. 離線播放 (斷網也能聽)"]
        
        4 --> 5
    end

    %% 建立兩者之間的雙向連線
    3 <== "Wi-Fi 傳輸" ==> 4

    %% 設定樣式讓圖表更好看
    style Windows fill:#f9f9f9,stroke:#333,stroke-width:2px
    style iPhone fill:#f5faff,stroke:#0066cc,stroke-width:2px
```
