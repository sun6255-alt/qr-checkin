# 🚀 QR Check-in System - Deployment Ready

這是 QR 簽到系統的部署就緒版本，包含所有必要的文件和部署腳本。

## 📁 文件結構

```
deployment-ready-system/
├── 📄 app.js                    # 主應用程序
├── 📄 package.json              # 項目依賴配置
├── 📄 package-lock.json         # 依賴版本鎖定
├── 📄 vercel.json               # Vercel 部署配置（已修復）
├── 📁 views/                    # 頁面模板文件
│   ├── admin-*.ejs              # 管理員頁面
│   ├── checkin.ejs              # 簽到頁面
│   ├── index.ejs                # 首頁
│   └── ...
├── 📁 public/                    # 靜態資源
│   ├── css/style.css            # 樣式文件
│   └── index.html               # 靜態頁面
└── 📁 vercel-deployment/         # 部署腳本和文檔
    ├── 1click-deploy.bat        # 一鍵部署腳本
    ├── manual-deploy-simple.bat # 手動部署腳本
    ├── START_HERE.bat           # 智能部署向導
    └── ...
```

## 🎯 快速部署

### 方法1：一鍵部署（最簡單）
```bash
cd vercel-deployment
START_HERE.bat
# 選擇選項1：超級簡單一鍵部署
```

### 方法2：手動部署（學習型）
```bash
cd vercel-deployment
manual-deploy-simple.bat
```

### 方法3：直接部署
```bash
# 安裝依賴
npm install

# 安裝 Vercel CLI
npm install -g vercel

# 登錄 Vercel
vercel login

# 部署
vercel --prod
```

## 🔧 環境變量配置

部署後需要配置以下環境變量：

### 必需變量：
- `NODE_ENV=production`
- `SESSION_SECRET=你的32位密鑰`
- `ADMIN_EMAIL=管理員郵箱`

### 可選變量：
- `PORT=3000`
- `DB_PATH=./checkin.db`
- `BCRYPT_ROUNDS=10`
- `SESSION_MAX_AGE=3600000`

## 🌐 訪問地址

部署成功後：
- **主頁**：`https://你的域名.vercel.app`
- **管理後台**：`https://你的域名.vercel.app/admin/login`
- **QR碼頁面**：`https://你的域名.vercel.app/events/1/qrcode`

## 🔑 默認管理員

```
用戶名：superadmin
密碼：admin123
```

⚠️ **重要：首次登錄請立即修改密碼！**

## 🛠️ 生成安全密鑰

### Windows (PowerShell)
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### macOS/Linux
```bash
openssl rand -base64 32
```

## 📚 部署文檔

詳細的部署指南請參考：`vercel-deployment/` 文件夾中的文檔。

## ⚠️ 重要提醒

1. ✅ 已修復 `vercel.json` 中的 `functions` 和 `builds` 衝突問題
2. ✅ 所有必需文件都已包含
3. ✅ 部署腳本已優化編碼問題
4. ✅ 提供多種部署方式選擇

## 🆘 遇到問題？

1. 查看 `vercel-deployment/manual-deployment-guide.md`
2. 檢查環境變量是否配置正確
3. 確保所有必需文件都存在
4. 聯繫技術支持

---

🎉 **準備就緒！開始你的 QR 簽到系統部署之旅吧！**