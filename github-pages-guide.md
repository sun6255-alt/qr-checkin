# 🚀 QR 簽到系統 - GitHub Pages 部署指南

## 📋 概述

GitHub Pages 是一個免費的靜態網站託管服務，但由於 QR 簽到系統是 Node.js 應用，需要後端和數據庫支持，**GitHub Pages 只能提供有限的靜態展示功能**。

## ⚠️ 重要限制

### ❌ GitHub Pages 不支持：
- Node.js 後端運行
- 數據庫（SQLite）
- 用戶註冊/登錄
- QR 碼動態生成
- 簽到功能
- 管理員後台

### ✅ GitHub Pages 支持：
- 靜態展示頁面
- 項目介紹
- 使用說明
- 鏈接到完整版本

## 🚀 快速部署步驟

### 1️⃣ 準備工作
```bash
# 確保代碼已提交到 GitHub
git add .
git commit -m "Ready for GitHub Pages"
git push origin main
```

### 2️⃣ 啟用 GitHub Pages

1. **訪問倉庫設置**
   - 打開你的 GitHub 倉庫
   - 點擊 `Settings` 標籤

2. **配置 Pages**
   - 滾動到 `Pages` 部分
   - Source 選擇 `Deploy from a branch`
   - Branch 選擇 `gh-pages` / `main`
   - 點擊 `Save`

3. **等待部署**
   - 幾分鐘後訪問：`https://[你的用戶名].github.io/[倉庫名]`

### 3️⃣ 自動部署（推薦）

我們已經創建了 GitHub Actions 工作流，會自動：
- 構建靜態頁面
- 部署到 GitHub Pages
- 提供訪問鏈接

## 🎯 獲取完整功能

### 推薦平台（免費）

#### 1. Netlify（最簡單）
```
訪問：https://app.netlify.com
步驟：
1. 點擊 "New site from Git"
2. 選擇 GitHub
3. 選擇你的倉庫
4. 構建設置：
   - Build command: npm install
   - Publish directory: .
5. 點擊 "Deploy site"
```

#### 2. Vercel（開發者友好）
```
訪問：https://vercel.com
步驟：
1. 使用 GitHub 登錄
2. 導入項目
3. 保持默認設置
4. 點擊 "Deploy"
```

#### 3. Railway（支持數據庫）
```
訪問：https://railway.app
步驟：
1. 創建賬號
2. 新建項目
3. 從 GitHub 部署
4. 添加數據庫服務
```

## 📊 平台對比

| 平台 | 免費額度 | 數據庫支持 | 部署難度 | 推薦指數 |
|------|----------|------------|----------|----------|
| **Netlify** | 充足 | ✅ | ⭐ | ⭐⭐⭐⭐⭐ |
| **Vercel** | 充足 | ✅ | ⭐ | ⭐⭐⭐⭐⭐ |
| **Railway** | 充足 | ✅✅ | ⭐⭐ | ⭐⭐⭐⭐ |
| **Render** | 充足 | ✅ | ⭐⭐ | ⭐⭐⭐⭐ |
| **Heroku** | 有限 | ✅ | ⭐⭐ | ⭐⭐ |

## 🔧 環境變量配置

部署到支持後端的平台時，需要設置：

```env
# 基礎配置
PORT=3000
NODE_ENV=production
SESSION_SECRET=你的隨機密鑰
DB_PATH=./data/checkin.db

# 管理員配置
ADMIN_EMAIL=admin@example.com
BCRYPT_ROUNDS=10
SESSION_MAX_AGE=3600000
```

## 📱 部署後的功能

部署到支持後端的平台後，你將獲得：

### ✅ 完整功能
- 🎯 創建活動
- 📱 生成 QR 碼
- 👥 用戶簽到
- 📊 實時統計
- 🔐 管理員系統
- 📈 數據導出

### 🌟 額外優勢
- 🌍 全球訪問
- 🔒 自動 HTTPS
- ⚡ CDN 加速
- 📱 移動端適配
- 🔄 持續部署

## 🚀 一鍵部署

使用我們的腳本：
```bash
# Windows
double-click: deploy-to-github.bat

# 選擇平台
1. Netlify (推薦)
2. Vercel
3. Railway
4. 其他
```

## 📚 相關文檔

- [完整部署指南](github_deployment_guide.md)
- [使用說明書](user_guide.md)
- [系統架構文檔](README.md)

## 💡 建議流程

1. **先用 GitHub Pages** - 展示項目
2. **部署到 Netlify** - 獲得完整功能
3. **分享你的應用** - 讓世界使用

## 🎉 成功指標

- ✅ GitHub Pages 靜態頁面正常顯示
- ✅ 可以訪問項目介紹
- ✅ 有清晰的部署指引
- ✅ 用戶能輕鬆找到完整版本

---

**記住：GitHub Pages 是展示窗口，真正的功能需要部署到支持後端的平台！** 🚀