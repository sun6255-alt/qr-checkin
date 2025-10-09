@echo off
echo 🚀 QR 簽到系統 - Vercel 一鍵部署
echo ================================
echo.

echo 📋 正在準備 Vercel 部署...
echo.

REM 檢查 Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js 未安裝，請先安裝: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js 已安裝

REM 安裝 Vercel CLI
echo 📦 安裝 Vercel CLI...
npm install -g vercel

if %errorlevel% neq 0 (
    echo 📦 使用 npx 方式...
    set CMD=npx vercel
) else (
    set CMD=vercel
)

echo.
echo 🔗 開始 Vercel 部署...
echo 瀏覽器將自動打開，請：
echo 1. 登錄 Vercel（使用 GitHub 賬號）
echo 2. 導入你的項目
echo 3. 點擊 Deploy
echo.

%CMD%

echo.
echo ⚙️  部署完成後，請設置環境變量：
echo • NODE_ENV = production
echo • SESSION_SECRET = 你的隨機密鑰
echo • ADMIN_EMAIL = admin@yourdomain.com
echo.
echo 🎉 Vercel 部署完成！
pause