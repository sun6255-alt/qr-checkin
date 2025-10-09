# 🚀 QR Check-in System - Upload Ready

這是 QR 簽到系統的上傳就緒版本，包含所有部署到 Vercel 所需的文件。

## 📁 文件結構

```
upload-ready/
├── 📄 app.js                    # 主應用程序 (Express.js 服務器)
├── 📄 package.json              # 項目依賴配置 (已修復 JSON 格式)
├── 📄 package-lock.json         # 依賴版本鎖定
├── 📄 vercel.json               # Vercel 部署配置 (已修復格式錯誤)
├── 📁 views/                    # EJS 頁面模板 (13 個文件)
│   ├── admin-*.ejs              # 管理員頁面模板
│   ├── checkin.ejs              # 簽到頁面
│   ├── index.ejs                # 首頁
│   ├── qrcode.ejs               # QR 碼頁面
│   └── error.ejs                # 錯誤頁面
└── 📁 public/                   # 靜態資源
    ├── css/style.css            # 樣式文件
    └── index.html               # 靜態頁面
```

## 🎯 快速部署步驟

### 方法1：Vercel 網站直接上傳
1. 訪問 [vercel.com](https://vercel.com)
2. 點擊 "New Project"
3. 拖放整個 `upload-ready` 文件夾到上傳區域
4. 配置環境變量（見下方）
5. 點擊 "Deploy"

### 方法2：Vercel CLI 部署
```bash
# 1. 安裝 Vercel CLI
npm install -g vercel

# 2. 登錄 Vercel
vercel login

# 3. 部署
vercel --prod
```

### 方法3：Git 倉庫連接
1. 將此文件夾推送到 GitHub
2. 連接 GitHub 倉庫到 Vercel
3. 自動部署

## ⚙️ 環境變量配置

部署後，在 Vercel Dashboard 中設置以下環境變量：

### 必需變量：
```
NODE_ENV=production
SESSION_SECRET=你的32位密鑰（使用下方生成的）
ADMIN_EMAIL=你的管理員郵箱
```

### 可選變量：
```
PORT=3000
DB_PATH=./checkin.db
BCRYPT_ROUNDS=10
SESSION_MAX_AGE=3600000
```

## 🔑 生成安全密鑰

在終端中運行以下命令生成 32 位密鑰：
```bash
node -e "const crypto = require('crypto'); console.log(crypto.randomBytes(16).toString('hex'));"
```

## 🌐 部署成功後的訪問地址

- **主頁**：`https://你的項目名.vercel.app`
- **管理後台**：`https://你的項目名.vercel.app/admin/login`
- **QR碼頁面**：`https://你的項目名.vercel.app/events/1/qrcode`

## 🔑 默認管理員賬號

```
用戶名：superadmin
密碼：admin123
```

⚠️ **首次登錄後請立即修改密碼！**

## ✅ 文件驗證

在上傳前，你可以驗證文件完整性：

```bash
# 檢查 JSON 格式
node -e "console.log('package.json:', require('./package.json').name)"
node -e "console.log('vercel.json:', require('./vercel.json').version)"

# 檢查依賴
npm install --dry-run
```

## 🛠️ 技術棧

- **後端**：Node.js + Express.js
- **模板引擎**：EJS
- **數據庫**：SQLite3
- **部署平台**：Vercel
- **樣式**：CSS3

## 📋 功能特性

- ✅ 用戶簽到系統
- ✅ QR 碼生成與掃描
- ✅ 管理員後台
- ✅ 活動管理
- ✅ 權限控制
- ✅ 數據統計

## 🆘 常見問題

### Q: 上傳後顯示 JSON 解析錯誤？
A: 確保所有 JSON 文件格式正確，特別是 package.json 和 vercel.json

### Q: 部署成功但無法訪問？
A: 檢查環境變量是否正確配置，特別是 SESSION_SECRET

### Q: 管理員無法登錄？
A: 確認 ADMIN_EMAIL 環境變量設置正確

## 📞 技術支持

如果遇到問題：
1. 檢查 Vercel 部署日誌
2. 確認環境變量配置
3. 驗證文件完整性
4. 重新部署

---

🎉 **準備就緒！現在可以將此文件夾上傳到 Vercel 了！**