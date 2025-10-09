# 🚀 GitHub 部署完整指南

## 📋 部署選項比較

| 平台 | 免費額度 | 設置難度 | 數據庫支持 | 推薦度 |
|------|----------|----------|------------|--------|
| **Netlify** | 100GB/月 | ⭐⭐ 簡單 | ✅ SQLite | ⭐⭐⭐⭐⭐ |
| **Vercel** | 100GB/月 | ⭐⭐ 簡單 | ✅ SQLite | ⭐⭐⭐⭐⭐ |
| **GitHub Pages** | 1GB 靜態 | ⭐ 最簡單 | ❌ 不支持 | ⭐⭐ |
| **Railway** | $5/月額度 | ⭐⭐⭐ 中等 | ✅ 支持 | ⭐⭐⭐⭐ |
| **Render** | 750小時/月 | ⭐⭐⭐ 中等 | ✅ 支持 | ⭐⭐⭐⭐ |

## 🎯 推薦方案：Netlify 部署（最簡單）

### 步驟1：準備 GitHub 倉庫

#### 自動設置（推薦）
1. 雙擊運行 `setup-github.bat`
2. 按照提示創建 GitHub 倉庫
3. 複製倉庫地址
4. 運行 `setup-github-push.bat YOUR_REPOSITORY_URL`

#### 手動設置
```bash
# 在項目目錄打開終端
git init
git add .
git commit -m "Initial commit: QR Check-in System"

# 創建 GitHub 倉庫後，運行：
git remote add origin https://github.com/YOUR_USERNAME/qr-checkin-system.git
git push -u origin main
```

### 步驟2：一鍵部署到 Netlify

#### 方法一：使用 Netlify 網站（最簡單）
1. 訪問 https://app.netlify.com
2. 點擊 "New site from Git"
3. 選擇 GitHub
4. 授權並選擇你的倉庫
5. 設置構建參數：
   - **Build command**: `npm install`
   - **Publish directory**: `.`
   - **Functions directory**: `netlify/functions`
6. 點擊 "Deploy site"

#### 方法二：使用 Netlify CLI
```bash
# 安裝 Netlify CLI
npm install -g netlify-cli

# 登入 Netlify
netlify login

# 部署項目
netlify deploy --prod
```

### 步驟3：配置環境變量

在 Netlify 控制台：
1. 進入 Site settings → Environment variables
2. 添加以下變量：
```
NODE_ENV=production
SESSION_SECRET=your-super-secret-key-here
DOMAIN=https://your-site-name.netlify.app
```

### 步驟4：訪問你的網站

部署完成後，你會獲得一個類似的網址：
```
https://amazing-qr-checkin-123456.netlify.app
```

## 🚀 替代方案：Vercel 部署

### 步驟1：同樣先推送代碼到 GitHub

### 步驟2：一鍵部署到 Vercel
1. 訪問 https://vercel.com
2. 點擊 "New Project"
3. 導入 GitHub 倉庫
4. 設置構建參數：
   - **Framework Preset**: Node.js
   - **Build Command**: `npm install`
   - **Output Directory**: `.`
5. 點擊 "Deploy"

### 步驟3：配置環境變量
在 Vercel 控制台：
1. 進入 Settings → Environment Variables
2. 添加相同的環境變量

## 🔧 高級配置

### 自定義域名
1. 在 Netlify/Vercel 控制台添加自定義域名
2. 在你的域名提供商處設置 DNS
3. 等待 DNS 生效（通常幾分鐘到幾小時）

### HTTPS 設置
Netlify 和 Vercel 都會自動提供 HTTPS，無需額外配置。

### 數據庫持久化
對於生產環境，建議：
1. 使用 Netlify/Vercel 的數據庫插件
2. 連接外部數據庫（如 Supabase、PlanetScale）
3. 定期備份 SQLite 文件

## 📊 監控和分析

### Netlify Analytics
1. 在 Netlify 控制台啟用 Analytics
2. 查看訪問統計
3. 監控性能指標

### 應用監控
添加以下環境變量啟用詳細日誌：
```
DEBUG=true
LOG_LEVEL=info
```

## 🔄 持續部署

### 自動部署設置
每次推送代碼到 GitHub 時，Netlify/Vercel 會自動：
1. 拉取最新代碼
2. 運行構建命令
3. 部署新版本
4. 發送部署通知

### 回滾版本
如果新版本有問題：
1. 在 Netlify/Vercel 控制台
2. 進入 Deploys 頁面
3. 選擇之前的穩定版本
4. 點擊 "Publish deploy"

## 🆘 故障排除

### 常見問題

#### 1. 構建失敗
```
錯誤：Module not found
解決：檢查 package.json 依賴是否完整
```

#### 2. 環境變量缺失
```
錯誤：SESSION_SECRET not defined
解決：在控制台添加缺失的環境變量
```

#### 3. 數據庫錯誤
```
錯誤：SQLite read-only
解決：檢查文件權限或使用外部數據庫
```

### 日誌查看
1. 在 Netlify/Vercel 控制台
2. 進入 Functions 或 Deploy 頁面
3. 查看實時日誌

## 🎉 恭喜！

完成以上步驟後，你就擁有了一個：
- ✅ 可公開訪問的 QR 簽到系統
- ✅ 自動 HTTPS 加密
- ✅ 持續部署集成
- ✅ 全球 CDN 加速
- ✅ 免費託管服務

## 📞 後續支持

如果遇到問題：
1. 檢查 Netlify/Vercel 控制台日誌
2. 確認環境變量設置正確
3. 驗證 GitHub 倉庫權限
4. 查看本項目的文檔和常見問題

---

🎯 **現在就開始部署吧！** 整個過程只需要 5-10 分鐘。