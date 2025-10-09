# 🛠️ QR簽到系統 - 手動部署到 Vercel 完整指南

這個指南將帶你一步一步手動完成 Vercel 部署，適合想要深入了解每個步驟的用戶。

## 📋 手動部署流程概覽

```
準備環境 → 安裝工具 → 配置項目 → 創建Git倉庫 → 部署到Vercel → 配置環境變量 → 完成！
```

---

## 步驟 1️⃣：準備環境

### 檢查必要軟件

#### ✅ 檢查 Node.js
```bash
# 打開命令提示符或PowerShell，輸入：
node --version

# 應該顯示版本號，例如：v18.17.0
# 如果未安裝，訪問：https://nodejs.org/
```

#### ✅ 檢查 npm
```bash
npm --version

# 應該顯示版本號，例如：9.6.7
```

#### ✅ 檢查 Git（可選但建議）
```bash
git --version

# 應該顯示版本號，例如：git version 2.40.0
# 如果未安裝，訪問：https://git-scm.com/
```

---

## 步驟 2️⃣：安裝 Vercel CLI

### 全局安裝 Vercel 命令行工具
```bash
# 使用 npm 安裝 Vercel CLI
npm install -g vercel

# 驗證安裝
vercel --version

# 應該顯示版本號，例如：28.0.0
```

### 登錄 Vercel
```bash
# 登錄到你的 Vercel 賬號
vercel login

# 這會打開瀏覽器，讓你使用 GitHub、GitLab 或 Email 登錄
```

---

## 步驟 3️⃣：配置項目

### 創建 vercel.json 配置文件

在你的項目根目錄創建 `vercel.json` 文件：

```json
{
  "version": 2,
  "name": "qr-checkin-system",
  "builds": [
    {
      "src": "app.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "app.js"
    }
  ],
  "env": {
    "NODE_ENV": "production",
    "SESSION_SECRET": "your-super-secret-key-here-32-characters-min",
    "ADMIN_EMAIL": "admin@yourdomain.com",
    "PORT": "3000",
    "DB_PATH": "./checkin.db",
    "BCRYPT_ROUNDS": "10",
    "SESSION_MAX_AGE": "3600000"
  },
  "functions": {
    "app.js": {
      "maxLambdaSize": "50mb"
    }
  }
}
```

### 確保項目結構正確
```
你的項目/
├── app.js              # 主應用文件
├── package.json        # 依賴配置
├── vercel.json        # Vercel 配置
├── views/             # EJS 模板文件
├── public/            # 靜態文件
└── checkin.db         # SQLite 數據庫（可選）
```

---

## 步驟 4️⃣：創建 Git 倉庫（推薦）

### 初始化 Git 倉庫
```bash
# 進入項目目錄
cd 你的項目路徑

# 初始化 Git
git init

# 添加所有文件
git add .

# 提交代碼
git commit -m "Initial commit - QR Checkin System"
```

### 推送到 GitHub
```bash
# 在 GitHub 上創建新倉庫
# 然後執行以下命令（替換為你的倉庫地址）
git remote add origin https://github.com/你的用戶名/qr-checkin-system.git

# 推送到 GitHub
git push -u origin main
```

---

## 步驟 5️⃣：部署到 Vercel

### 方法一：使用 CLI 部署（推薦）

#### 選項 A：從本地部署
```bash
# 在項目根目錄執行
vercel

# 按照提示操作：
# 1. 確認部署範圍（當前目錄）
# 2. 選擇項目（或創建新項目）
# 3. 配置環境變量
# 4. 確認部署設置
```

#### 選項 B：從 GitHub 部署
```bash
# 使用 GitHub 倉庫部署
vercel --prod

# 如果第一次使用，會提示你導入 GitHub 倉庫
```

### 方法二：使用 Vercel Dashboard

1. **訪問**：https://vercel.com
2. **點擊**："New Project"
3. **導入**：你的 GitHub 倉庫
4. **配置**：環境變量
5. **部署**：點擊 Deploy 按鈕

---

## 步驟 6️⃣：配置環境變量

### 必填環境變量
```bash
# 環境模式
NODE_ENV=production

# 會話密鑰（必須安全，32位以上）
SESSION_SECRET=your-super-secret-key-here-32-characters-min

# 管理員郵箱
ADMIN_EMAIL=admin@yourdomain.com
```

### 可選環境變量
```bash
# 端口（Vercel 會自動處理）
PORT=3000

# 數據庫路徑
DB_PATH=./checkin.db

# 加密強度
BCRYPT_ROUNDS=10

# 會話超時（毫秒）
SESSION_MAX_AGE=3600000
```

### 生成安全的 SESSION_SECRET

#### Windows (PowerShell)
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

#### Mac/Linux
```bash
openssl rand -base64 32
```

---

## 步驟 7️⃣：驗證部署

### 檢查部署狀態
```bash
# 查看部署日誌
vercel logs

# 查看項目列表
vercel list
```

### 測試應用
1. **訪問主頁**：`https://你的域名.vercel.app`
2. **測試管理後台**：`https://你的域名.vercel.app/admin/login`
3. **測試 QR 碼**：`https://你的域名.vercel.app/events/1/qrcode`

### 默認登錄信息
- **用戶名**：`superadmin`
- **密碼**：`admin123`

⚠️ **首次登錄後請立即修改密碼！**

---

## 🔧 高級配置

### 自定義域名

1. **在 Vercel Dashboard 中**：
   - 進入項目設置
   - 點擊 "Domains"
   - 添加你的域名

2. **DNS 配置**：
   - 添加 CNAME 記錄指向 `.vercel.app`
   - 或修改 A 記錄到 Vercel IP

### 環境管理

#### 開發環境
```bash
# 本地開發
vercel dev
```

#### 預覽環境
```bash
# 創建預覽部署
vercel
```

#### 生產環境
```bash
# 部署到生產環境
vercel --prod
```

### 團隊協作
```bash
# 邀請團隊成員
vercel teams invite 用戶郵箱

# 切換團隊
vercel teams switch
```

---

## 🚨 常見問題解決

### 問題 1：部署失敗
```bash
# 檢查日誌
vercel logs

# 重新部署
vercel --prod
```

### 問題 2：環境變量錯誤
```bash
# 查看當前環境變量
vercel env list

# 添加環境變量
vercel env add 變量名

# 刪除環境變量
vercel env rm 變量名
```

### 問題 3：構建錯誤
```bash
# 檢查 package.json
npm install
npm run build  # 如果有構建腳本
```

### 問題 4：數據庫連接問題
- 確保 `checkin.db` 文件在正確位置
- 檢查文件權限
- 確認 `DB_PATH` 環境變量設置正確

---

## 📊 部署後檢查清單

### ✅ 功能測試
- [ ] 主頁能正常訪問
- [ ] 管理員能正常登錄
- [ ] 能創建新活動
- [ ] QR 碼能正常顯示
- [ ] 簽到功能正常
- [ ] 數據能正常保存

### ✅ 安全檢查
- [ ] 修改了默認管理員密碼
- [ ] 設置了安全的 SESSION_SECRET
- [ ] 配置了正確的管理員郵箱
- [ ] 啟用了 HTTPS

### ✅ 性能優化
- [ ] 啟用了 CDN
- [ ] 壓縮了靜態資源
- [ ] 優化了圖片大小

---

## 🎯 下一步

### 🚀 進階功能
- [ ] 綁定自定義域名
- [ ] 設置自定義郵箱
- [ ] 配置高級安全設置
- [ ] 設置監控和告警

### 📚 學習資源
- [Vercel 官方文檔](https://vercel.com/docs)
- [Vercel 最佳實踐](https://vercel.com/guides)
- [Node.js 部署指南](https://nodejs.org/en/docs/guides/)

---

## 💡 小貼士

### 🎯 部署最佳實踐
1. **總是使用 Git**：方便版本控制和回滾
2. **測試環境變量**：確保所有變量都正確設置
3. **監控日誌**：定期查看應用日誌
4. **備份數據**：定期備份 SQLite 數據庫

### 🔧 調試技巧
```bash
# 查看實時日誌
vercel logs --follow

# 查看特定部署的日誌
vercel logs 部署ID

# 重新構建
vercel --force
```

---

**🎉 恭喜你！現在你已經掌握了手動部署 QR 簽到系統到 Vercel 的全部技能！** 🚀

如果遇到任何問題，請參考上面的故障排除部分，或查看完整的部署文檔。