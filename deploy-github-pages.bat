@echo off
echo 🚀 QR 簽到系統 - GitHub Pages 部署工具
echo ======================================
echo.

REM 檢查 Git
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Git 未安裝，請先安裝 Git: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo 📋 部署步驟說明：
echo 1. 創建 GitHub 倉庫
echo 2. 推送代碼到 GitHub
echo 3. 啟用 GitHub Pages
echo 4. 獲得訪問地址
echo.
echo ⚠️  注意：GitHub Pages 只支持靜態頁面
echo 🎯 要獲得完整功能，請使用 Netlify 或 Vercel
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
echo 3️⃣ 準備推送代碼...
git add .
git commit -m "Initial commit: QR Check-in System with GitHub Pages support"

echo.
echo 4️⃣ 推送到 GitHub...
git remote add origin %REPO_URL% 2>nul
git branch -M main
git push -u origin main

if %errorlevel% equ 0 (
    echo ✅ 推送成功！
) else (
    echo ⚠️  推送失敗，嘗試強制推送...
    git push -f origin main
)

echo.
echo 5️⃣ 啟用 GitHub Pages...
echo 🔗 請按以下步驟操作：
echo.
echo 1. 訪問你的倉庫: %REPO_URL%
echo 2. 點擊右上角的 "Settings" 標籤
echo 3. 滾動到最下方的 "Pages" 部分
echo 4. Source 選擇 "Deploy from a branch"
echo 5. Branch 選擇 "main" 和 "/ (root)"
echo 6. 點擊 "Save"
echo.
echo ⏰ 等待 2-5 分鐘部署完成
echo 🌐 訪問地址: https://[你的用戶名].github.io/[倉庫名]/
echo.

echo 6️⃣ 自動部署設置...
echo ✅ GitHub Actions 已配置，將自動部署到 GitHub Pages
echo 📁 靜態文件位於: public-static/index.html
echo.

echo 🎉 恭喜！GitHub Pages 部署配置完成！
echo.
echo 📋 下一步：
echo 1. 手動啟用 GitHub Pages（按照上面步驟）
echo 2. 等待部署完成（2-5 分鐘）
echo 3. 訪問你的靜態頁面
echo 4. 考慮部署到 Netlify 獲得完整功能
echo.
echo 📖 詳細指南: github-pages-guide.md
echo 🚀 完整功能部署: github_deployment_guide.md

pause