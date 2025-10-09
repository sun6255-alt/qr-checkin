# 🎯 QR Code 簽到系統

一個簡單易用的活動簽到管理系統，支持 QR Code 掃描簽到和管理員權限控制。

## ✨ 功能特色

- 📱 **QR Code 掃描簽到** - 參與者掃描 QR Code 即可完成簽到
- 👥 **活動管理** - 創建和管理多個活動
- 📊 **統計報表** - 實時查看簽到統計
- 🔐 **權限控制** - 超級管理員和一般管理員分級管理
- 📱 **響應式設計** - 適配手機、平板、電腦
- 🔒 **安全認證** - 密碼加密存儲，會話管理

## 🚀 快速開始

### 🎯 部署選項

| 平台 | 類型 | 功能 | 難度 | 推薦 |
|------|------|------|------|------|
| **Netlify** | 雲平台 | ⭐ 完整功能 | ⭐ 超簡單 | ⭐⭐⭐⭐⭐ |
| **Vercel** | 雲平台 | ⭐ 完整功能 | ⭐ 簡單 | ⭐⭐⭐⭐⭐ |
| **GitHub Pages** | 靜態 | ⚠️ 展示頁面 | ⭐ 超簡單 | ⭐⭐ |
| **本地運行** | 開發 | ⭐ 完整功能 | ⭐ 中等 | ⭐⭐⭐⭐ |

### 方法一：雲平台部署（推薦）

#### 🚀 一鍵部署到 Vercel（最簡單）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/你的用戶名/qr-checkin-system&env=NODE_ENV,SESSION_SECRET,ADMIN_EMAIL&envDescription=QR%E7%B0%BD%E5%88%B0%E7%B3%BB%E7%B5%B1%E7%92%B0%E5%A2%83%E8%AE%8A%E9%87%8F&envLink=https://github.com/你的用戶名/qr-checkin-system#%E7%92%B0%E5%A2%83%E8%AE%8A%E9%87%8F%E8%AA%AA%E6%98%8E)

**點擊上方按鈕 → 使用 GitHub 登錄 → 填寫環境變量 → 開始部署**

#### 📁 專用部署資料夾
我們為你準備了專門的 Vercel 部署資料夾，包含所有必要工具：

```bash
# 進入 Vercel 部署專區
cd vercel-deployment

# 運行新手向導（推薦）
double-click: START_HERE.bat

# 或直接一鍵部署
double-click: 1click-deploy.bat
```

#### 🎯 快速部署步驟
1. **進入資料夾**：`vercel-deployment/`
2. **運行向導**：雙擊 `START_HERE.bat`
3. **選擇部署方式**：
   - 選項 1：超級簡單一鍵部署（2分鐘）
   - 選項 2：手動部署向導（10-15分鐘，適合學習）
4. **按提示操作**：填寫環境變量，等待完成

#### 🎯 或使用自動腳本
```bash
# Windows - 雙擊運行
deploy-to-github.bat

# 選擇平台並自動部署
```

#### 📋 手動部署
1. **Fork 這個倉庫**
2. **選擇平台**：
   - [Netlify](https://app.netlify.com) - ⚡ 一鍵部署
   - [Vercel](https://vercel.com) - 🚀 開發者友好
   - [Railway](https://railway.app) - 💎 支持數據庫
3. **連接 GitHub** 並部署

### 方法二：GitHub Pages（靜態展示）

```bash
# Windows
deploy-github-pages.bat

# 僅提供項目展示，無完整功能
```

### 方法三：本地部署

### 方法二：手動部署

1. **安裝依賴**
```bash
npm install
```

2. **配置環境**
```bash
cp .env.example .env
# 編輯 .env 文件
```

3. **啟動應用**
```bash
# 開發模式
npm run dev

# 生產模式
npm start
```

4. **訪問系統**
- 主頁：http://localhost:3000
- 管理後台：http://localhost:3000/admin/login

## 👤 默認管理員

- **用戶名**：superadmin
- **密碼**：admin123

⚠️ **重要**：首次登入後請立即修改密碼！

## 📖 使用說明

### 創建活動
1. 登入管理後台
2. 點擊「創建新活動」
3. 填寫活動信息
4. 系統自動生成 QR Code

### 簽到流程
1. 參與者掃描活動 QR Code
2. 填寫個人信息
3. 點擊「確認簽到」
4. 完成簽到！

### 查看統計
1. 登入管理後台
2. 查看活動列表
3. 點擊「查看簽到記錄」
4. 查看詳細統計信息

## 🔧 系統配置

### 環境變量

| 變量名 | 說明 | 默認值 |
|--------|------|--------|
| PORT | 服務端口 | 3000 |
| NODE_ENV | 環境模式 | development |
| DB_PATH | 數據庫路徑 | ./checkin.db |
| SESSION_SECRET | 會話密鑰 | 隨機生成 |
| DOMAIN | 網站域名 | http://localhost:3000 |

### 生產環境建議

1. **使用 HTTPS**
2. **配置反向代理**（Nginx）
3. **設置進程管理**（PM2）
4. **定期備份數據庫**
5. **設置防火牆規則**

## 📁 項目結構

```
├── app.js              # 主應用文件
├── views/              # 頁面模板
├── public/             # 靜態資源
├── checkin.db          # 數據庫文件
├── package.json        # 項目配置
├── .env.example        # 環境變量示例
├── deploy.sh           # Linux 部署腳本
├── deploy.bat          # Windows 部署腳本
└── deployment_guide.md # 詳細部署指南
```

## 🛡️ 安全建議

- [ ] 修改默認管理員密碼
- [ ] 使用強密碼策略
- [ ] 啟用 HTTPS
- [ ] 定期更新依賴
- [ ] 設置訪問限制
- [ ] 定期備份數據

## 🆘 常見問題

### Q: 忘記管理員密碼怎麼辦？
A: 可以通過數據庫直接重置密碼，或使用重置腳本。

### Q: 如何備份數據？
A: 直接複製 `checkin.db` 文件即可，系統支持熱備份。

### Q: 支持多少並發用戶？
A: 基於 SQLite，建議單活動不超過 1000 人同時簽到。

### Q: 可以自定義 QR Code 樣式嗎？
A: 可以修改 `views/qrcode.ejs` 模板文件。

## 📞 技術支持

如有問題，請檢查：
1. 應用日誌輸出
2. 數據庫連接狀態
3. 端口是否被佔用
4. 文件權限設置

## 📄 許可證

MIT License - 可自由使用和修改

---

⭐ 如果這個項目對你有幫助，請給個星星支持！