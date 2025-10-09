@echo off
title QR Check-in System - Quick Deploy
color 0A

echo.
echo ==========================================
echo 🚀 QR Check-in System - Quick Deploy
echo ==========================================
echo.

REM 檢查 Node.js
echo 📋 Step 1: Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found! Please install Node.js first.
    echo    Visit: https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js found

REM 檢查 npm
echo 📋 Step 2: Checking npm installation...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm not found! Please install npm first.
    pause
    exit /b 1
)
echo ✅ npm found

REM 安裝依賴
echo 📋 Step 3: Installing dependencies...
echo Installing project dependencies...
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies!
    pause
    exit /b 1
)
echo ✅ Dependencies installed successfully

REM 檢查 Vercel CLI
echo 📋 Step 4: Checking Vercel CLI...
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Installing Vercel CLI globally...
    npm install -g vercel
    if %errorlevel% neq 0 (
        echo ❌ Failed to install Vercel CLI!
        echo    Try running: npm install -g vercel
        pause
        exit /b 1
    )
)
echo ✅ Vercel CLI ready

REM 檢查 vercel.json
echo 📋 Step 5: Checking deployment configuration...
if not exist "vercel.json" (
    echo ❌ vercel.json not found!
    echo    Please ensure vercel.json exists in the current directory.
    pause
    exit /b 1
)
echo ✅ Deployment configuration found

REM 顯示部署信息
echo.
echo ==========================================
echo 📋 Deployment Information:
echo ==========================================
echo 📁 Project: QR Check-in System
echo 🎯 Platform: Vercel
echo 🔧 Configuration: vercel.json
echo 📦 Dependencies: package.json
echo.

REM 提示用戶選擇部署方式
echo Choose deployment method:
echo [1] Deploy to Production (推薦)
echo [2] Deploy to Preview
echo [3] Cancel
echo.
set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" goto PRODUCTION
if "%choice%"=="2" goto PREVIEW
if "%choice%"=="3" goto CANCEL

echo Invalid choice!
pause
exit /b 1

:PRODUCTION
echo.
echo 🚀 Starting production deployment...
echo    This will deploy to your production domain
echo.
vercel --prod
goto SUCCESS

:PREVIEW
echo.
echo 🧪 Starting preview deployment...
echo    This will create a preview deployment
echo.
vercel
goto SUCCESS

:CANCEL
echo Deployment cancelled.
pause
exit /b 0

:SUCCESS
echo.
echo ==========================================
echo 🎉 Deployment completed!
echo ==========================================
echo.
echo 📚 Next steps:
echo 1. Configure environment variables in Vercel dashboard
echo 2. Test your deployment
echo 3. Set up custom domain (optional)
echo.
echo 🔧 Environment variables to configure:
echo - NODE_ENV=production
echo - SESSION_SECRET=your_32_char_secret_key
echo - ADMIN_EMAIL=your_admin_email
echo.
echo 📖 For detailed instructions, see README.md
echo.
pause