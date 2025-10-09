@echo off
title 🚀 QR簽到系統 - 超簡單一鍵部署
color 2F

echo.
echo    ╔══════════════════════════════════════════════════════════════╗
echo    ║                                                              ║
echo    ║              🚀 QR簽到系統一鍵部署到Vercel                 ║
echo    ║                                                              ║
echo    ║                  超級簡單 · 3分鐘完成                      ║
echo    ║                                                              ║
echo    ╚══════════════════════════════════════════════════════════════╝
echo.

:: 檢查Node.js
echo 🔍 檢查環境中...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未檢測到Node.js
    echo 📥 請先安裝Node.js：https://nodejs.org/
    pause
    exit /b
)
echo ✅ Node.js已安裝

:: 安裝Vercel CLI
echo.
echo 📦 正在安裝Vercel CLI...
call npm install -g vercel

if %errorlevel% neq 0 (
    echo ❌ Vercel CLI安裝失敗
    echo 🌐 請檢查網絡連接
    pause
    exit /b
)
echo ✅ Vercel CLI安裝完成

:: 複製必要的文件到上層目錄
echo.
echo 📁 準備部署文件...
copy /Y vercel.json ..\ >nul
echo ✅ 配置文件準備完成

:: 切換到上層目錄
cd ..

:: 開始部署
echo.
echo 🚀 正在啟動Vercel部署...
echo.
echo 📋 接下來的步驟：
echo ╔══════════════════════════════════════════════════════════════╗
echo ║ 1️⃣  瀏覽器將打開，請使用GitHub賬號登錄Vercel              ║
echo ║ 2️⃣  選擇導入Git倉庫或直接部署                            ║
echo ║ 3️⃣  配置環境變量（見下方說明）                           ║
echo ║ 4️⃣  點擊Deploy開始部署                                   ║
echo ║ 5️⃣  等待2-3分鐘完成部署                                 ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 🔧 環境變量配置：
echo ┌────────────────────────────────────────────────────────────┐
echo │ NODE_ENV=production                                        │
echo │ SESSION_SECRET=你的32位密鑰（必填，要安全）                  │
echo │ ADMIN_EMAIL=管理員郵箱（必填）                              │
echo │ PORT=3000（可選）                                          │
echo │ DB_PATH=./checkin.db（可選）                               │
echo └────────────────────────────────────────────────────────────┘
echo.
echo 💡 快速生成32位密鑰（在PowerShell中執行）：
echo -join ((48..57) + (65..90) + (97..122) ^| Get-Random -Count 32 ^| % {[char]$_})
echo.
echo 🎉 準備好了嗎？按任意鍵開始部署...
pause >nul

:: 執行部署
call vercel --prod

:: 檢查部署結果
if %errorlevel% equ 0 (
    echo.
    echo ┌────────────────────────────────────────────────────────────┐
    echo │                                                          │
    echo │                    🎉 部署成功！                         │
    echo │                                                          │
    echo │ 📱 你的應用已經部署到Vercel                            │
    echo │                                                          │
    echo │ 🔗 訪問地址：                                          │
    echo │ https://你的域名.vercel.app                             │
    echo │                                                          │
    echo │ 🔑 管理員登錄：                                        │
    echo │ https://你的域名.vercel.app/admin/login                 │
    echo │                                                          │
    echo │ 👤 默認賬號：                                           │
    echo │ 用戶名：superadmin                                       │
    echo │ 密碼：admin123                                           │
    echo │                                                          │
    echo │ ⚠️  首次登錄請立即修改密碼！                            │
    echo │                                                          │
    echo └────────────────────────────────────────────────────────────┘
) else (
    echo.
    echo ❌ 部署失敗，請檢查錯誤信息
    echo 📚 參考文檔：vercel-deployment-guide.md
)

echo.
echo 📚 更多幫助：
echo   - 完整指南：vercel-deployment\vercel-deployment-guide.md
echo   - 快速指南：vercel-deployment\vercel-quick-deploy.md
echo   - 故障排除：查看Vercel控制台日誌
echo.
pause