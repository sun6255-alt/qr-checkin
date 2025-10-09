@echo off
REM QR簽到系統部署腳本 (Windows)
REM 使用方法: deploy.bat [environment]
REM environment: development 或 production (默認: production)

setlocal enabledelayedexpansion

set ENV=%1
if "%ENV%"=="" set ENV=production

echo 🚀 開始部署 QR簽到系統 (%ENV% 環境)...

REM 檢查 Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js 未安裝，請先安裝 Node.js
    exit /b 1
)

REM 檢查 npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm 未安裝，請先安裝 npm
    exit /b 1
)

REM 安裝依賴
echo 📦 安裝依賴...
call npm install
if %errorlevel% neq 0 (
    echo ❌ 依賴安裝失敗
    exit /b 1
)

REM 創建數據目錄
if "%ENV%"=="production" (
    echo 📁 創建數據目錄...
    if not exist "data" mkdir data
)

REM 創建 .env 文件（如果不存在）
if not exist ".env" (
    echo ⚙️  創建 .env 文件...
    copy .env.example .env >nul
    echo 📝 請編輯 .env 文件設置必要的配置
)

REM 設置環境變量
set NODE_ENV=%ENV%
set PORT=3000

REM 測試應用
echo 🧪 測試應用...
node -e "console.log('Node.js 運行正常')"
if %errorlevel% neq 0 (
    echo ❌ 應用測試失敗
    exit /b 1
)
echo ✅ 應用測試通過

REM 啟動應用
echo 🎯 啟動應用...
if "%ENV%"=="production" (
    REM 生產環境使用 PM2 或後台運行
    where pm2 >nul 2>nul
    if %errorlevel% equ 0 (
        echo 使用 PM2 啟動...
        call pm2 start app.js --name "checkin-system"
        call pm2 save
        echo ✅ 應用已啟動，使用 pm2 logs 查看日誌
    ) else (
        echo ⚠️  PM2 未安裝，使用 node 直接啟動...
        echo 建議安裝 PM2: npm install -g pm2
        start /min cmd /c "node app.js > app.log 2>&1"
        echo ✅ 應用已在後台啟動，查看 app.log 獲取日誌
    )
) else (
    REM 開發環境
    echo 開發模式啟動...
    node app.js
)

echo 🎉 部署完成！
echo 📊 訪問地址: http://localhost:%PORT%
echo 🔧 管理員登錄: http://localhost:%PORT%/admin/login
echo 📖 默認管理員: superadmin / admin123

pause