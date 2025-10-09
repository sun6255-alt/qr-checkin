@echo off
title 🔍 QR簽到系統 - 部署前檢查
color 1F

echo.
echo    ╔══════════════════════════════════════════════════════════════╗
echo    ║                                                              ║
echo    ║              🔍 部署前環境檢查工具                          ║
echo    ║                                                              ║
echo    ╚══════════════════════════════════════════════════════════════╝
echo.

set "missing=0"
set "warnings=0"

:: 檢查Node.js
echo 📋 檢查Node.js環境...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node --version') do echo ✅ Node.js版本：%%i
) else (
    echo ❌ Node.js未安裝
    echo 📥 下載地址：https://nodejs.org/
    set /a missing+=1
)

:: 檢查npm
echo.
echo 📋 檢查npm...
npm --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('npm --version') do echo ✅ npm版本：%%i
) else (
    echo ❌ npm未安裝
    set /a missing+=1
)

:: 檢查Git
echo.
echo 📋 檢查Git...
git --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('git --version') do echo ✅ Git版本：%%i
) else (
    echo ⚠️ Git未安裝（建議安裝，可選）
    echo 📥 下載地址：https://git-scm.com/
    set /a warnings+=1
)

:: 檢查上級目錄的關鍵文件
echo.
echo 📋 檢查項目文件...
cd ..

:: 檢查package.json
if exist "package.json" (
    echo ✅ package.json存在
) else (
    echo ❌ package.json缺失
    set /a missing+=1
)

:: 檢查app.js
if exist "app.js" (
    echo ✅ app.js存在
) else (
    echo ❌ app.js缺失
    set /a missing+=1
)

:: 檢查views文件夾
if exist "views\" (
    echo ✅ views文件夾存在
) else (
    echo ❌ views文件夾缺失
    set /a missing+=1
)

:: 檢查public文件夾
if exist "public\" (
    echo ✅ public文件夾存在
) else (
    echo ⚠️ public文件夾缺失（可能影響樣式）
    set /a warnings+=1
)

:: 返回vercel-deployment目錄
cd vercel-deployment

:: 檢查部署文件
echo.
echo 📋 檢查部署文件...

:: 檢查vercel.json
if exist "vercel.json" (
    echo ✅ vercel.json存在
) else (
    echo ❌ vercel.json缺失
    set /a missing+=1
)

:: 檢查部署腳本
if exist "1click-deploy.bat" (
    echo ✅ 1click-deploy.bat存在
) else (
    echo ❌ 1click-deploy.bat缺失
    set /a missing+=1
)

:: 顯示檢查結果
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    📊 檢查結果總結                          ║
echo ╠══════════════════════════════════════════════════════════════╣

if %missing% equ 0 (
    if %warnings% equ 0 (
        echo ║                    ✅ 環境檢查通過！                       ║
        echo ║                                                              ║
        echo ║ 🎉 所有必要的組件都已準備就緒，可以開始部署！              ║
        echo ║                                                              ║
        echo ║ 💡 建議：雙擊運行 1click-deploy.bat 開始部署               ║
    ) else (
        echo ║                ⚠️ 環境檢查通過（有警告）                   ║
        echo ║                                                              ║
        echo ║ ✅ 必要的組件都已準備就緒，可以開始部署                   ║
        echo ║ ⚠️  但有 %warnings% 個警告項目，建議處理                   ║
    )
) else (
    echo ║                    ❌ 環境檢查失敗！                       ║
    echo ║                                                              ║
    echo ║ ❌ 缺失 %missing% 個必要組件                               ║
    if %warnings% gtr 0 (
        echo ║ ⚠️  有 %warnings% 個警告項目                             ║
    )
    echo ║                                                              ║
    echo ║ 📋 請解決上述問題後再嘗試部署                             ║
)

echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

if %missing% equ 0 (
    echo 💡 下一步：
    echo   1. 雙擊運行 1click-deploy.bat 開始部署
    echo   2. 或者查看 README.md 了解其他部署方式
    echo.
    choice /C YN /M "是否立即開始部署"
    if %errorlevel% equ 1 (
        echo 🚀 啟動部署程序...
        call 1click-deploy.bat
    )
) else (
    echo 📚 幫助資源：
    echo   - 安裝Node.js：https://nodejs.org/
    echo   - 安裝Git：https://git-scm.com/
    echo   - 完整指南：vercel-deployment-guide.md
)

echo.
pause