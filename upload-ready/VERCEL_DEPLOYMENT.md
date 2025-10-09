# Vercel 部署指南

## 🚀 快速部署

### 1. 準備環境變量
在 Vercel 控制台設置以下環境變量：

```
SESSION_SECRET=your-32-character-secret-key-here
NODE_ENV=production
PORT=3000
```

### 2. 部署步驟

1. 將代碼推送到 GitHub
2. 在 Vercel 導入項目
3. 設置環境變量
4. 部署完成！

## 📋 默認管理員賬號

部署完成後，使用以下賬號登錄：
- **用戶名**: `superadmin`
- **密碼**: `admin123`

## ⚠️ 重要說明

此版本使用內存數據庫，適合：
- ✅ 測試和演示
- ✅ 小型活動
- ✅ 臨時使用

不適合：
- ❌ 長期生產環境
- ❌ 大量數據存儲
- ❌ 需要數據持久化的場景

## 🔧 高級配置

如需數據持久化，建議：
1. 使用外部數據庫（如 PlanetScale, Supabase）
2. 修改 `app-vercel.js` 連接配置
3. 更新環境變量

## 📞 技術支持

如有問題，請檢查：
- Vercel 函數日誌
- 環境變量配置
- 依賴包版本