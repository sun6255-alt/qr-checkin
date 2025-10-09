@echo off
REM QR簽到系統一鍵部署到 GitHub 腳本
echo 🚀 QR簽到系統 GitHub 部署工具
echo ===================================
echo.

REM 檢查必要工具
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Git 未安裝，請先安裝 Git: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo 📋 步驟說明：
echo 1. 初始化 Git 倉庫
echo 2. 創建 GitHub 倉庫
echo 3. 推送代碼到 GitHub
echo 4. 一鍵部署到 Netlify
echo.

choice /C YN /M "準備好了嗎？"
if %errorlevel% equ 2 (
    echo 請準備好後再運行此腳本
    pause
    exit /b 1
)

echo.
echo 1️⃣ 初始化 Git 倉庫...
if not exist ".git" (
    git init
    git add .
    git commit -m "Initial commit: QR Check-in System"
    echo ✅ Git 倉庫初始化完成
) else (
    echo ℹ️  Git 倉庫已存在
)

echo.
echo 2️⃣ 創建 GitHub 倉庫...
echo 🔗 請在瀏覽器中打開: https://github.com/new
echo 📝 倉庫名稱建議: qr-checkin-system
echo ⚠️  不要勾選 "Initialize this repository with a README"
echo.
echo 創建完成後，複製倉庫地址（HTTPS 格式）
echo 看起來像: https://github.com/你的用戶名/qr-checkin-system.git
echo.

set /p REPO_URL="請輸入 GitHub 倉庫地址: "

if "%REPO_URL%"=="" (
    echo ❌ 未輸入倉庫地址
    pause
    exit /b 1
)

echo.
echo 3️⃣ 推送到 GitHub...
git remote add origin %REPO_URL% 2>nul
git push -u origin main

if %errorlevel% equ 0 (
    echo ✅ 推送成功！
) else (
    echo ⚠️  推送失敗，嘗試強制推送...
    git push -f origin main
)

echo.
echo 4️⃣ 部署到 Netlify...
echo 🔗 請在瀏覽器中打開: https://app.netlify.com
echo 👆 點擊 "New site from Git"
echo 📁 選擇 GitHub 並授權
echo 🎯 選擇你的 qr-checkin-system 倉庫
echo ⚙️  構建設置：
echo    - Build command: npm install
echo    - Publish directory: .
echo 🚀 點擊 "Deploy site"
echo.
echo 部署完成後，你會獲得一個類似的網址：
echo https://amazing-qr-checkin-123456.netlify.app
echo.

echo 🎉 恭喜！你的 QR 簽到系統已經部署完成！
echo.
echo 📋 下一步：
echo 1. 在 Netlify 控制台設置環境變量
echo 2. 測試你的線上簽到系統
echo 3. 創建第一個活動並分享 QR 碼！
echo.
echo 📖 詳細指南: github_deployment_guide.md

pause