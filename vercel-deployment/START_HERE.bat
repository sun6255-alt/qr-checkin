@echo off
title 🎯 QR簽到系統 - Vercel部署向導
color 3F

echo.
echo    ╔══════════════════════════════════════════════════════════════╗
echo    ║                                                              ║
echo    ║              🎯 QR簽到系統 Vercel 部署向導                 ║
echo    ║                                                              ║
echo    ║                   新手友好 · 一步一步引導                    ║
echo    ║                                                              ║
echo    ╚══════════════════════════════════════════════════════════════╝
echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║                                                                  ║
echo ║  🎉 歡迎使用 QR簽到系統 Vercel 部署工具！                        ║
echo ║                                                                  ║
echo ║  這個向導將幫助你輕鬆將系統部署到 Vercel 平台：                 ║
echo ║                                                                  ║
echo ║  🌟 特點：                                                        ║
echo ║     ✅ 完全免費部署                                              ║
echo ║     ✅ 自動 HTTPS 加密                                            ║
echo ║     ✅ 全球 CDN 加速                                             ║
echo ║     ✅ 持續自動部署                                              ║
echo ║     ✅ 每月 100GB 免費流量                                       ║
echo ║                                                                  ║
echo ║  ⏱️  預計時間：3-5 分鐘                                         ║
echo ║  🎯 難度：超級簡單                                               ║
echo ║                                                                  ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
echo 📋 部署步驟：
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║                                                                  ║
echo ║  步驟 1️⃣：環境檢查（自動完成）                                  ║
echo ║         檢查 Node.js、npm 等必要環境                            ║
echo ║                                                                  ║
echo ║  步驟 2️⃣：選擇部署方式                                          ║
echo ║         根據你的技術水平選擇合適的方式                          ║
echo ║                                                                  ║
echo ║  步驟 3️⃣：配置環境變量                                         ║
echo ║         填寫必要的配置信息                                      ║
echo ║                                                                  ║
echo ║  步驟 4️⃣：等待部署完成                                         ║
echo ║         自動完成所有技術細節                                    ║
echo ║                                                                  ║
echo ║  步驟 5️⃣：開始使用！                                           ║
echo ║         獲得你的專屬網址                                       ║
echo ║                                                                  ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
echo 💡 準備好了嗎？我們開始吧！
echo.
echo 🚀 請選擇你的部署方式：
echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║                                                                  ║
echo ║  [1] 🎯 推薦：超簡單一鍵部署（最適合新手）                      ║
echo ║      自動完成所有步驟，只需填寫基本信息                        ║
echo ║                                                                  ║
echo ║  [2] 🛠️  手動部署向導（10-15分鐘）                             ║
echo ║      詳細的步驟指導，適合想學習的用戶                           ║
echo ║                                                                  ║
echo ║  [3] 🔍 先檢查環境，再選擇部署方式                              ║
echo ║      適合想先了解系統狀態的用戶                                 ║
echo ║                                                                  ║
echo ║  [4] 📚 查看詳細文檔和說明                                       ║
echo ║      了解所有部署選項和技術細節                                 ║
echo ║                                                                  ║
echo ║  [5] ❌ 退出部署                                                 ║
echo ║                                                                  ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.

choice /C 12345 /N /M "請選擇 (1-5):"

if %errorlevel% equ 1 goto ONE_CLICK
if %errorlevel% equ 2 goto MANUAL_DEPLOY
if %errorlevel% equ 3 goto CHECK_ENV
if %errorlevel% equ 4 goto DOCUMENTATION
if %errorlevel% equ 5 goto EXIT

:ONE_CLICK
echo.
echo 🎯 你選擇了：超簡單一鍵部署！
echo.
echo 🚀 即將啟動最簡單的部署方式...
echo.
echo ⚠️  請確保：
echo    ✓ 你有穩定的網絡連接
echo    ✓ 記住你的 GitHub 賬號密碼
echo    ✓ 準備好管理員郵箱地址
echo.
echo 💡 部署過程中：
echo    • 瀏覽器會打開，請用 GitHub 登錄
echo    • 按提示填寫環境變量
echo    • 耐心等待 2-3 分鐘
echo.
echo 🎉 準備好了嗎？按任意鍵開始部署...
pause >nul
call 1click-deploy.bat
goto END

:MANUAL_DEPLOY
echo.
echo 🛠️ 你選擇了：手動部署向導！
echo.
echo 🚀 即將啟動手動部署向導...
echo.
call manual-deploy-step-by-step.bat
goto END

:CHECK_FIRST
echo.
echo 🔍 你選擇了：先檢查環境
echo.
echo 🚀 即將啟動環境檢查工具...
echo.
call check-deployment.bat
goto END

:SHOW_DOCS
echo.
echo 📚 你選擇了：查看文檔
echo.
echo 📖 可用文檔：
echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║                                                                  ║
echo ║  📄 README.md                    # 主要使用指南                   ║
echo ║  📄 vercel-deploy-button.md    # 一鍵部署按鈕說明               ║
echo ║  📄 vercel-quick-deploy.md     # 快速部署指南                   ║
echo ║  📄 vercel-deployment-guide.md # 完整部署指南                   ║
echo ║  📄 vercel-summary.md          # 方案總結對比                   ║
echo ║                                                                  ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
echo 💡 建議閱讀順序：
echo    1. README.md（主要指南）
echo    2. vercel-quick-deploy.md（快速指南）
echo    3. 其他文檔（按需閱讀）
echo.
echo 🎯 現在要做什么？
echo    [1] 返回主菜單
echo    [2] 用記事本打開 README.md
echo    [3] 退出
echo.
choice /C 123 /N /M "請選擇 (1-3):"

if %errorlevel% equ 1 goto START
if %errorlevel% equ 2 (
    if exist "README.md" (
        start notepad README.md
    ) else (
        echo ❌ 找不到 README.md 文件
    )
    goto SHOW_DOCS
)
if %errorlevel% equ 3 goto EXIT

:EXIT
echo.
echo 👋 感謝使用 QR簽到系統 Vercel 部署工具！
echo.
echo 🌟 記住：
echo    • 部署超級簡單，不要想得太複雜
echo    • 有問題隨時可以重新運行這個向導
echo    • 享受你的 QR 簽到系統吧！
echo.
goto END

:END
echo.
echo 🎊 操作完成！
echo.
echo 💡 提示：
echo    • 可以隨時重新運行 START_HERE.bat 獲得幫助
echo    • 所有部署文件都在這個文件夾中
echo    • 祝你使用愉快！
echo.
pause