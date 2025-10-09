@echo off
title 🚀 QR簽到系統 - 一鍵部署到Vercel
color 2F

echo.
echo    ╔══════════════════════════════════════════════════════════════╗
echo    ║                                                              ║
echo    ║              🚀 QR簽到系統一鍵部署到Vercel                 ║
echo    ║                                                              ║
echo    ╚══════════════════════════════════════════════════════════════╝
echo.

:: 檢查Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未檢測到Node.js，請先安裝Node.js
    echo 📥 下載地址：https://nodejs.org/
    pause
    exit /b
)

echo ✅ Node.js已安裝

:: 安裝Vercel CLI
echo.
echo 📦 正在安裝Vercel CLI...
call npm install -g vercel

if %errorlevel% neq 0 (
    echo ❌ Vercel CLI安裝失敗，請檢查網絡連接
    pause
    exit /b
)

echo ✅ Vercel CLI安裝完成

:: 創建vercel.json（如果不存在）
if not exist "vercel.json" (
    echo.
    echo 📝 創建vercel.json配置文件...
    echo {
    echo   "version": 2,
    echo   "name": "qr-checkin-system",
    echo   "builds": [
    echo     {
    echo       "src": "app.js",
    echo       "use": "@vercel/node"
    echo     }
    echo   ],
    echo   "routes": [
    echo     {
    echo       "src": "/(.*)",
    echo       "dest": "app.js"
    echo     }
    echo   ],
    echo   "env": {
    echo     "NODE_ENV": "production",
    echo     "SESSION_SECRET": "your-secret-key-here",
    echo     "ADMIN_EMAIL": "admin@example.com"
    echo   }
    echo } > vercel.json
    echo ✅ vercel.json已創建
)

:: 開始部署
echo.
echo 🚀 正在啟動Vercel部署...
echo.
echo 📋 接下來的步驟：
echo 1️⃣  瀏覽器將打開，請使用GitHub賬號登錄Vercel
echo 2️⃣  選擇導入Git倉庫或直接部署
echo 3️⃣  配置環境變量（見下方說明）
echo 4️⃣  點擊Deploy開始部署
echo.
echo 🔧 環境變量配置：
echo ┌─────────────────────────────────────────┐
echo │ NODE_ENV=production                     │
echo │ SESSION_SECRET=你的32位密鑰             │
echo │ ADMIN_EMAIL=管理員郵箱                   │
echo │ PORT=3000                               │
echo │ DB_PATH=./checkin.db                     │
echo └─────────────────────────────────────────┘
echo.
echo 💡 提示：SESSION_SECRET可以使用以下命令生成：
echo    Windows PowerShell: -join ((48..57) + (65..90) + (97..122) ^| Get-Random -Count 32 ^| % {[char]$_})
echo.
echo 🎉 準備好了嗎？按任意鍵開始部署...
pause >nul

:: 執行部署
call vercel --prod

echo.
echo ┌─────────────────────────────────────────┐
echo │                                         │
echo │         🎉 部署完成！                  │
echo │                                         │
echo │ 📱 訪問地址：                          │
echo │ https://你的域名.vercel.app             │
echo │                                         │
echo │ 🔑 管理員登錄：                        │
echo │ https://你的域名.vercel.app/admin/login │
echo │                                         │
echo │ 👤 默認賬號：                          │
echo │ 用戶名：superadmin                      │
echo │ 密碼：admin123                          │
echo │                                         │
echo │ ⚠️  首次登錄請立即修改密碼！           │
echo │                                         │
echo └─────────────────────────────────────────┘
echo.
echo 📚 更多幫助：
echo   - 完整指南：vercel-deployment-guide.md
echo   - 快速指南：vercel-quick-deploy.md
echo   - 一鍵按鈕：vercel-deploy-button.md
echo.
pause