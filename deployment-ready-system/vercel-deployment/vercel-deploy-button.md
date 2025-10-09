# 🚀 一鍵部署到 Vercel

## ⭐ 超簡單部署方式

### 🎯 一鍵部署按鈕

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/你的用戶名/qr-checkin-system&env=NODE_ENV,SESSION_SECRET,ADMIN_EMAIL,DB_PATH,BCRYPT_ROUNDS,SESSION_MAX_AGE&envDescription=QR%E7%B0%BD%E5%88%B0%E7%B3%BB%E7%B5%B1%E7%92%B0%E5%A2%83%E8%AE%8A%E9%87%8F&envLink=https://github.com/你的用戶名/qr-checkin-system#環境變量說明)

### 📋 使用步驟

1. **點擊上方按鈕** ⬆️
2. **使用 GitHub 登錄** Vercel
3. **填寫環境變量**（見下方說明）
4. **點擊 Deploy** 開始部署
5. **等待 2-3 分鐘** 完成部署

---

## 🔧 環境變量說明

### 必填變量

| 變量名 | 說明 | 示例值 |
|--------|------|--------|
| **NODE_ENV** | 環境模式 | `production` |
| **SESSION_SECRET** | 會話密鑰（32位以上） | `YourSuperSecretKey123456789ABC` |
| **ADMIN_EMAIL** | 管理員郵箱 | `admin@yourdomain.com` |

### 可選變量

| 變量名 | 說明 | 默認值 |
|--------|------|--------|
| **DB_PATH** | 數據庫路徑 | `./checkin.db` |
| **BCRYPT_ROUNDS** | 加密強度 | `10` |
| **SESSION_MAX_AGE** | 會話超時（毫秒） | `3600000` |

---

## 🎯 快速生成密鑰

### 方法一：在線生成
訪問：https://passwordsgenerator.net/
- 長度：32位
- 包含：大小寫字母 + 數字

### 方法二：命令行生成

#### Windows (PowerShell)
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

#### Mac/Linux
```bash
openssl rand -base64 32
```

---

## 🌐 部署前準備

### 1. Fork 這個倉庫
1. 訪問原始倉庫
2. 點擊右上角的 "Fork"
3. 等待 Fork 完成

### 2. 獲取你的倉庫地址
```
https://github.com/你的用戶名/qr-checkin-system
```

### 3. 自定義一鍵部署按鈕
將下方代碼中的 `你的用戶名` 替換為你的 GitHub 用戶名：

```markdown
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/你的用戶名/qr-checkin-system&env=NODE_ENV,SESSION_SECRET,ADMIN_EMAIL&envDescription=QR%E7%B0%BD%E5%88%B0%E7%B3%BB%E7%B5%B1%E7%92%B0%E5%A2%83%E8%AE%8A%E9%87%8F)
```

---

## 🎉 部署成功後

### 🌟 你將獲得
- ✅ **免費域名**：`https://qr-checkin-system-xxx.vercel.app`
- ✅ **自動 HTTPS**：SSL 證書自動配置
- ✅ **全球 CDN**：全球訪問加速
- ✅ **持續部署**：代碼更新自動部署
- ✅ **免費額度**：每月 100GB 流量

### 📱 訪問地址
- **主頁**：`https://你的域名.vercel.app`
- **管理後台**：`https://你的域名.vercel.app/admin/login`
- **QR 碼頁面**：`https://你的域名.vercel.app/events/1/qrcode`

### 👤 默認管理員
- **用戶名**：superadmin
- **密碼**：admin123

⚠️ **首次登錄後請立即修改密碼！**

---

## 🚀 替代方案

如果一鍵按鈕有問題，可以使用：

### 方案1：手動導入
1. 訪問 https://vercel.com
2. 點擊 "New Project"
3. 導入你的 GitHub 倉庫
4. 配置環境變量
5. 點擊 Deploy

### 方案2：CLI 部署
```bash
# 安裝 Vercel CLI
npm install -g vercel

# 登錄
vercel login

# 部署
vercel --prod
```

### 方案3：使用腳本
```bash
# Windows
double-click: deploy-vercel-simple.bat
```

---

## 📚 相關鏈接

- [Vercel 官方網站](https://vercel.com)
- [Vercel 文檔](https://vercel.com/docs)
- [Vercel 定價](https://vercel.com/pricing)
- [部署指南](vercel-quick-deploy.md)
- [故障排除](vercel-deployment-guide.md)

---

## 💡 溫馨提示

### 🎯 部署前
- ✅ 確保代碼已推送到 GitHub
- ✅ 準備好環境變量值
- ✅ 了解基本配置

### 🎯 部署後
- ✅ 測試所有功能
- ✅ 修改默認密碼
- ✅ 創建第一個活動
- ✅ 分享給朋友使用

### 🎯 進階使用
- 🌐 綁定自定義域名
- 📊 查看訪問統計
- 🔧 配置高級設置
- 🚀 探索更多功能

---

**🎉 準備好了嗎？點擊上方按鈕開始一鍵部署！** 🚀