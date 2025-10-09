@echo off
title Create Upload ZIP Package
color 0B

echo.
echo ==========================================
echo 📦 Create Upload ZIP Package
echo ==========================================
echo.

REM 檢查 upload-ready 文件夾是否存在
if not exist "upload-ready" (
    echo ❌ upload-ready folder not found!
    echo    Please run the upload preparation first.
    pause
    exit /b 1
)

echo 📁 Creating ZIP package for upload...
echo.

REM 進入 upload-ready 文件夾
cd upload-ready

REM 創建 ZIP 文件（使用 PowerShell 壓縮）
echo 📦 Compressing files...
powershell -Command "Compress-Archive -Path '*','views','public' -DestinationPath '../upload-ready.zip' -Force"

if %errorlevel% equ 0 (
    echo.
    echo ✅ ZIP package created successfully!
    echo 📍 Location: upload-ready.zip
    echo.
    
    REM 顯示文件大小
    powershell -Command "
    $file = Get-Item 'upload-ready.zip'
    $sizeMB = [math]::Round($file.Length / 1MB, 2)
    Write-Host '📊 Package size:' $sizeMB 'MB'
    "
    
    echo.
    echo 🎯 Ready for upload to Vercel!
    echo.
    echo 📤 Upload instructions:
    echo 1. Go to https://vercel.com
    echo 2. Click 'New Project'
    echo 3. Drag and drop upload-ready.zip
    echo 4. Configure environment variables
    echo 5. Deploy!
    
) else (
    echo.
    echo ❌ Failed to create ZIP package!
    echo    Please check if PowerShell is available.
)

REM 返回原目錄
cd ..

echo.
echo ==========================================
echo 🎉 Process completed!
echo ==========================================
echo.
pause