# 🚀 Vercel 快速部署指南

## 📋 3分鐘快速部署

### 選項1：一鍵腳本部署（最簡單）
```cmd
# Windows 用戶
雙擊運行：deploy-vercel-simple.bat
```

### 選項2：手動步驟部署

#### 步驟1：準備代碼
確保你的代碼已經在文件夾中，並且包含：
- ✅ `app.js` - 主程序
- ✅ `package.json` - 依賴配置
- ✅ `vercel.json` - Vercel 配置（已創建）

#### 步驟2：安裝 Vercel CLI
```bash
# 安裝 Vercel 命令行工具
npm install -g vercel

# 或使用 npx（不須安裝）
npx vercel
```

#### 步驟3：登錄 Vercel
```bash
# 登錄 Vercel（使用 GitHub 賬號）
vercel login
```

#### 步驟4：部署項目
```bash
# 在項目目錄下運行
vercel

# 或一步到位部署到生產環境
vercel --prod
```

#### 步驟5：配置環境變量
部署完成後，在 Vercel 控制台設置：
```
NODE_ENV=production
SESSION_SECRET=你的隨機密鑰（32位以上）
ADMIN_EMAIL=admin@yourdomain.com
```

---

## 🎯 最推薦：GitHub + Vercel 自動部署

### 步驟1：推送代碼到 GitHub
```bash
# 如果還沒有 Git 倉庫
git init
git add .
git commit -m "Ready for Vercel deployment"

# 推送到 GitHub（需要先創建倉庫）
git remote add origin https://github.com/你的用戶名/qr-checkin-system.git
git push -u origin main
```

### 步驟2：一鍵導入 Vercel
1. 訪問：https://vercel.com
2. 點擊 "New Project"
3. 選擇 "Import Git Repository"
4. 選擇你的 GitHub 倉庫
5. 點擊 "Deploy"

### 步驟3：配置環境變量
在 Vercel 項目設置中添加環境變量，然後重新部署。

---

## 📱 詳細操作截圖指南

### 1. 訪問 Vercel
打開瀏覽器，訪問：https://vercel.com

### 2. 註冊/登錄
- 點擊 "Sign Up"
- 選擇 "Continue with GitHub"
- 授權 Vercel 訪問你的 GitHub

### 3. 創建新項目
- 登錄後點擊 "New Project"
- 選擇 "Import Git Repository"
- 找到你的 `qr-checkin-system` 倉庫

### 4. 配置項目
- **Project Name**: qr-checkin-system（或自定義）
- **Framework Preset**: 自動檢測（Node.js）
- **Root Directory**: ./（保持默認）
- **Build Command**: npm install
- **Output Directory**: .

### 5. 設置環境變量
點擊 "Environment Variables"，添加：
```
NODE_ENV=production
SESSION_SECRET=這裡填寫一個隨機字符串（32位以上）
ADMIN_EMAIL=admin@example.com
DB_PATH=./checkin.db
```

### 6. 部署
點擊 "Deploy"，等待 2-3 分鐘完成部署。

---

## 🔧 生成安全密鑰

### Windows 用戶
```powershell
# 在 PowerShell 中運行
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### 在線生成器
訪問：https://passwordsgenerator.net/ 生成 32 位隨機密鑰

---

## 🌐 部署成功後

### 訪問你的應用
- **主頁**：`https://你的項目名.vercel.app`
- **管理後台**：`https://你的項目名.vercel.app/admin/login`
- **QR 碼頁面**：`https://你的項目名.vercel.app/events/1/qrcode`

### 管理員登錄
- **用戶名**：superadmin
- **密碼**：admin123

⚠️ **首次登錄後請立即修改密碼！**

---

## 🆘 常見問題解決

### ❌ 部署失敗
```bash
# 查看錯誤日誌
vercel logs

# 重新部署
vercel --force
```

### ❌ 環境變量錯誤
1. 檢查 Vercel 控制台中的環境變量
2. 確保 SESSION_SECRET 足夠長（32位以上）
3. 重新部署項目

### ❌ 數據庫問題
Vercel 的文件系統是臨時的，數據不會持久保存。對於生產環境，建議：
- 使用外部數據庫服務
- 定期備份數據
- 考慮使用 Railway 或 Render（支持持久化存儲）

---

## 🎨 自定義域名（可選）

### 步驟1：購買域名
在阿里云、騰訊雲等平台購買域名。

### 步驟2：配置 DNS
在 Vercel 項目設置中添加自定義域名，然後：
1. 複製 Vercel 提供的 DNS 記錄
2. 在你的域名提供商處添加這些 DNS 記錄
3. 等待 DNS 生效（通常幾分鐘到幾小時）

---

## 📊 性能優化建議

### 1. 啟用壓縮
在 `app.js` 中添加：
```javascript
const compression = require('compression');
app.use(compression());
```

### 2. 設置緩存
```javascript
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=300');
  next();
});
```

### 3. 使用 CDN
Vercel 自動提供全球 CDN 加速，無需額外配置。

---

## 🚀 立即開始

**選擇你的部署方式：**

1. **🎯 最簡單**：運行 `deploy-vercel-simple.bat`
2. **📱 最推薦**：GitHub + Vercel 自動部署
3. **⚡ 最快速**：使用 `npx vercel` 命令

整個過程只需要 **3-5 分鐘**，你就能擁有一個全球可訪問的 QR 簽到系統！

---

**🎉 部署完成後，記得：**
1. ✅ 測試所有功能
2. 🔑 修改默認密碼
3. 📱 創建第一個活動
4. 🎯 分享 QR 碼給參與者

**遇到問題？** 查看 [完整部署指南](github_deployment_guide.md) 或 [Vercel 文檔](https://vercel.com/docs)

🚀 **現在就開始你的 Vercel 部署之旅！**