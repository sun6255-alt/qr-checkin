@echo off
REM QR簽到系統 GitHub 設置腳本 (Windows)
echo 🚀 開始設置 GitHub 倉庫...

REM 檢查 Git 是否安裝
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Git 未安裝，請先安裝 Git: https://git-scm.com/download/win
    pause
    exit /b 1
)

REM 初始化 Git 倉庫
if not exist ".git" (
    echo 📁 初始化 Git 倉庫...
    git init
    git add .
    git commit -m "Initial commit: QR Check-in System"
    echo ✅ Git 倉庫初始化完成
) else (
    echo ℹ️  Git 倉庫已存在
)

echo.
echo 📋 下一步操作：
echo 1. 訪問 https://github.com/new 創建新倉庫
echo 2. 倉庫名稱建議：qr-checkin-system
echo 3. 不要勾選 "Initialize this repository with a README"
echo 4. 創建完成後，複製倉庫地址（類似：https://github.com/yourname/qr-checkin-system.git）
echo.
echo 🔗 然後運行以下命令（將 YOUR_REPOSITORY_URL 替換為你的倉庫地址）：
echo git remote add origin YOUR_REPOSITORY_URL
echo git push -u origin main
echo.
echo 或者直接運行：setup-github-push.bat YOUR_REPOSITORY_URL
echo.
pause