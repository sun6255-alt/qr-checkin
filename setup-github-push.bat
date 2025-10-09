@echo off
REM QR簽到系統推送到 GitHub 腳本
REM 使用方法: setup-github-push.bat YOUR_REPOSITORY_URL

set REPO_URL=%1

if "%REPO_URL%"=="" (
    echo ❌ 請提供 GitHub 倉庫地址
    echo 使用方法: setup-github-push.bat https://github.com/yourname/qr-checkin-system.git
    pause
    exit /b 1
)

echo 🚀 推送到 GitHub 倉庫: %REPO_URL%

REM 檢查 Git 是否安裝
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Git 未安裝，請先安裝 Git
    pause
    exit /b 1
)

REM 添加遠程倉庫
echo 🔗 添加遠程倉庫...
git remote add origin %REPO_URL% 2>nul
if %errorlevel% neq 0 (
    echo ⚠️  遠程倉庫已存在或添加失敗，嘗試更新...
    git remote set-url origin %REPO_URL%
)

REM 創建 main 分支（如果不存在）
echo 🌿 檢查分支...
git branch | findstr "main" >nul
if %errorlevel% neq 0 (
    git branch | findstr "master" >nul
    if %errorlevel% equ 0 (
        echo 🔄 重命名 master 分支為 main...
        git branch -m master main
    ) else (
        echo 🌱 創建 main 分支...
        git checkout -b main
    )
)

REM 添加所有文件
echo 📁 添加文件...
git add .

REM 提交更改
echo 💾 提交更改...
git commit -m "feat: QR Check-in System with admin permissions" || echo ⚠️  沒有新更改需要提交

REM 推送到 GitHub
echo 🚀 推送到 GitHub...
git push -u origin main

if %errorlevel% equ 0 (
    echo ✅ 推送成功！
    echo.
    echo 🎉 GitHub 倉庫設置完成！
    echo 📋 下一步：
    echo 1. 訪問你的 GitHub 倉庫
    echo 2. 設置 Netlify 或 Vercel 自動部署
    echo 3. 享受你的 QR 簽到系統！
) else (
    echo ❌ 推送失敗，請檢查：
    echo - GitHub 倉庫地址是否正確
    echo - 是否有網絡連接
    echo - GitHub 賬號是否已登入
    echo.
    echo 🔧 手動修復後運行：
    echo git push -u origin main
)

pause