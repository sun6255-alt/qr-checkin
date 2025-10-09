# 🚀 QR簽到系統 - Vercel部署專區

這個資料夾包含了所有用於部署 QR簽到系統到 Vercel 平台的文件和工具。

## 📁 文件結構

```
vercel-deployment/
├── 📋 README.md                    # 本文件 - 使用指南
├── ⚙️ vercel.json                  # Vercel 配置文件
├── 🎯 部署腳本/
│   ├── deploy-vercel-1click.bat    # 超簡單一鍵部署
│   ├── deploy-vercel-simple.bat    # 簡化版部署腳本
│   └── deploy-vercel.bat          # 完整版部署腳本
└── 📚 文檔指南/
    ├── vercel-deploy-button.md     # 一鍵部署按鈕說明
    ├── vercel-quick-deploy.md      # 快速部署指南
    ├── vercel-deployment-guide.md  # 完整部署指南
    └── vercel-summary.md           # 方案總結對比
```

## 🎯 快速開始

### 🥇 最簡單方案（推薦）

1. **雙擊運行**：`deploy-vercel-1click.bat`
2. **按提示操作**：腳本會自動完成所有設置
3. **填寫環境變量**：根據提示輸入必要信息
4. **等待部署完成**：通常需要 2-3 分鐘

### 🥈 一鍵部署按鈕

如果你已經將項目推送到 GitHub，可以使用一鍵部署按鈕：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/你的用戶名/qr-checkin-system&env=NODE_ENV,SESSION_SECRET,ADMIN_EMAIL)

**步驟**：
1. 點擊上方按鈕
2. 使用 GitHub 登錄 Vercel
3. 填寫環境變量
4. 點擊 Deploy 開始部署

### 🥉 手動部署（學習型）

想要完全掌握部署過程？使用我們的詳細手動部署向導：

```bash
manual-deploy-step-by-step.bat
```

這個向導會帶你一步步完成：
- ✅ 環境檢查和準備
- ✅ Vercel CLI 安裝和配置
- ✅ 項目文件準備
- ✅ Vercel 登錄和授權
- ✅ 執行部署
- ✅ 環境變量配置
- ✅ 部署驗證和測試

## 🔧 環境變量說明

### 必填變量
| 變量名 | 說明 | 示例 |
|--------|------|------|
| `NODE_ENV` | 環境模式 | `production` |
| `SESSION_SECRET` | 會話密鑰（32位以上） | `YourSuperSecretKey123456789ABC` |
| `ADMIN_EMAIL` | 管理員郵箱 | `admin@yourdomain.com` |

### 可選變量
| 變量名 | 說明 | 默認值 |
|--------|------|--------|
| `PORT` | 端口號 | `3000` |
| `DB_PATH` | 數據庫路徑 | `./checkin.db` |
| `BCRYPT_ROUNDS` | 加密強度 | `10` |
| `SESSION_MAX_AGE` | 會話超時（毫秒） | `3600000` |

## 🎉 部署成功後

### 🌟 你將獲得
- ✅ **免費域名**：`https://xxx.vercel.app`
- ✅ **自動 HTTPS**：SSL 證書自動配置
- ✅ **全球 CDN**：全球訪問加速
- ✅ **持續部署**：代碼更新自動部署
- ✅ **免費額度**：每月 100GB 流量

### 📱 訪問地址
- **主頁**：`https://你的域名.vercel.app`
- **管理後台**：`https://你的域名.vercel.app/admin/login`
- **QR 碼頁面**：`https://你的域名.vercel.app/events/1/qrcode`

### 👤 默認管理員
- **用戶名**：`superadmin`
- **密碼**：`admin123`

⚠️ **首次登錄後請立即修改密碼！**

## 🚀 部署方式對比

| 方式 | 難度 | 時間 | 適合人群 |
|------|------|------|----------|
| **一鍵按鈕** | ⭐ | 2分鐘 | 完全新手 |
| **1Click 腳本** | ⭐⭐ | 3分鐘 | 初學者 |
| **簡化腳本** | ⭐⭐⭐ | 5分鐘 | 有基礎者 |
| **完整腳本** | ⭐⭐⭐⭐ | 10分鐘 | 進階者 |

## 💡 溫馨提示

### 🎯 部署前準備
- ✅ 準備好 GitHub 賬號
- ✅ 想好管理員郵箱地址
- ✅ 生成安全的密鑰（32位以上）

### 🎯 部署後必做
- ✅ 立即修改默認管理員密碼
- ✅ 創建一個測試活動
- ✅ 測試 QR 碼簽到功能
- ✅ 分享給朋友試用

### 🔐 安全密鑰生成方法

#### Windows PowerShell
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

#### Mac/Linux
```bash
openssl rand -base64 32
```

## 🆘 常見問題

### Q: 部署失敗怎麼辦？
A: 檢查以下幾點：
- 確保 Node.js 已安裝
- 檢查網絡連接是否正常
- 確認環境變量填寫正確
- 查看 Vercel 控制台錯誤日誌

### Q: 忘記管理員密碼怎麼辦？
A: 可以重新設置環境變量或聯繫技術支持。

### Q: 可以綁定自定義域名嗎？
A: 當然可以！Vercel 支持自定義域名，詳情參考完整指南。

## 📚 相關資源

- [Vercel 官方網站](https://vercel.com)
- [Vercel 文檔](https://vercel.com/docs)
- [Vercel 定價](https://vercel.com/pricing)
- [部署故障排除](vercel-deployment-guide.md#常見問題)

---

**🎉 準備好了嗎？選擇一種方式開始你的 Vercel 部署之旅吧！** 🚀