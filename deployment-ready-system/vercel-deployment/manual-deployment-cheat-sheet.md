# 🛠️ 手動部署快速參考

## 一、環境準備

```bash
# 檢查 Node.js
node --version

# 檢查 npm
npm --version

# 安裝 Vercel CLI
npm install -g vercel
```

## 二、項目準備

```bash
# 確保項目文件完整
ls -la  # 檢查 app.js, package.json, views/, public/

# 複製 vercel.json（如果不存在）
cp vercel-deployment/vercel.json .
```

## 三、Vercel 登錄

```bash
# 登錄 Vercel（會打開瀏覽器）
vercel login

# 選擇登錄方式：GitHub / GitLab / Email
```

## 四、執行部署

### 選項 1：直接生產部署
```bash
vercel --prod
```

### 選項 2：預覽部署
```bash
vercel
```

## 五、配置環境變量

### 方法 1：命令行
```bash
vercel env add NODE_ENV
vercel env add SESSION_SECRET
vercel env add ADMIN_EMAIL
```

### 方法 2：Dashboard
1. 訪問 https://vercel.com/dashboard
2. 選擇項目 → Settings → Environment Variables
3. 添加以下變量：

| 變量名 | 值 | 說明 |
|--------|----|------|
| NODE_ENV | production | 生產環境 |
| SESSION_SECRET | 32位隨機字符串 | 會話密鑰 |
| ADMIN_EMAIL | 你的郵箱 | 管理員郵箱 |
| PORT | 3000 | 端口（可選） |
| DB_PATH | ./checkin.db | 數據庫路徑（可選） |

## 六、生成安全密鑰

### Windows (PowerShell)
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### macOS/Linux
```bash
openssl rand -base64 32
```

## 七、訪問測試

```
主頁：https://你的域名.vercel.app
管理：https://你的域名.vercel.app/admin/login
QR碼：https://你的域名.vercel.app/events/1/qrcode
```

## 八、默認憑證

```
用戶名：superadmin
密碼：admin123
```

⚠️ **首次登錄請立即修改密碼！**

## 九、常用命令

```bash
# 查看部署狀態
vercel ls

# 查看日誌
vercel logs

# 重新部署
vercel --prod

# 管理環境變量
vercel env

# 查看項目信息
vercel inspect
```

## 十、故障排除

| 問題 | 解決方案 |
|------|----------|
| Node.js 未安裝 | 訪問 nodejs.org 下載安裝 |
| Vercel CLI 安裝失敗 | 檢查網絡，使用管理員權限 |
| 登錄失敗 | 檢查網絡，清除瀏覽器緩存 |
| 部署失敗 | 檢查項目文件，查看錯誤日誌 |
| 環境變量配置錯誤 | 重新配置，確保密鑰安全 |

## 🎯 下一步

1. 綁定自定義域名
2. 配置 SSL 證書
3. 設置訪問統計
4. 邀請團隊成員

---

💡 **提示**：想要更詳細的指導？運行 `manual-deploy-step-by-step.bat` 獲得完整的交互式體驗！