@echo off
title 🛠️ QR簽到系統 - 手動部署向導
color 5F

echo.
echo    ╔══════════════════════════════════════════════════════════════╗
echo    ║                                                              ║
echo    ║              🛠️ QR簽到系統手動部署向導                     ║
echo    ║                                                              ║
echo    ║              一步一步 · 詳細指導 · 完全掌握                  ║
echo    ║                                                              ║
echo    ╚══════════════════════════════════════════════════════════════╝
echo.
echo ╔══════════════════════════════════════════════════════════════════════╗
echo ║                                                                      ║
echo ║  📋 這個向導將帶你完成手動部署的每個步驟：                          ║
echo ║                                                                      ║
echo ║  步驟 1️⃣：環境準備和工具安裝                                       ║
echo ║  步驟 2️⃣：項目配置和文件準備                                       ║
echo ║  步驟 3️⃣：Git 倉庫創建（可選）                                     ║
echo ║  步驟 4️⃣：Vercel CLI 登錄和配置                                   ║
echo ║  步驟 5️⃣：執行部署                                                 ║
echo ║  步驟 6️⃣：環境變量配置                                             ║
echo ║  步驟 7️⃣：驗證和測試                                               ║
echo ║                                                                      ║
echo ║  💡 預計時間：10-15 分鐘                                           ║
echo ║  🎯 難度：中等（適合想學習的用戶）                                 ║
echo ║                                                                      ║
echo ╚══════════════════════════════════════════════════════════════════════╝
echo.
echo ⚠️  開始前請確保：
echo    ✓ 你有穩定的網絡連接
echo    ✓ 記住你的 GitHub 賬號密碼
echo    ✓ 準備好管理員郵箱地址
echo    ✓ 有基本的命令行操作經驗
echo.
echo 🎉 準備好了嗎？按任意鍵開始手動部署之旅...
pause >nul

:: 步驟 1：環境檢查
echo.
echo ┌────────────────────────────────────────────────────────────────────┐
echo │                                                                  │
echo │                    步驟 1️⃣：環境準備和檢查                      │
echo │                                                                  │
echo └────────────────────────────────────────────────────────────────────┘
echo.

echo 🔍 正在檢查必要環境...

:: 檢查 Node.js
echo.
echo 📋 檢查 Node.js...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node --version') do echo ✅ Node.js 版本：%%i
) else (
    echo ❌ Node.js 未安裝
    echo 📥 請訪問 https://nodejs.org/ 下載並安裝
    echo 🔄 安裝完成後重新運行此腳本
    pause
    exit /b 1
)

:: 檢查 npm
echo.
echo 📋 檢查 npm...
npm --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('npm --version') do echo ✅ npm 版本：%%i
) else (
    echo ❌ npm 未安裝
    echo 📥 Node.js 安裝後 npm 會自動安裝
    pause
    exit /b 1
)

:: 步驟 2：安裝 Vercel CLI
echo.
echo ┌────────────────────────────────────────────────────────────────────┐
echo │                                                                  │
echo │                  步驟 2️⃣：安裝 Vercel CLI                        │
echo │                                                                  │
echo └────────────────────────────────────────────────────────────────────┘
echo.

echo 📦 正在安裝 Vercel CLI...
call npm install -g vercel

if %errorlevel% neq 0 (
    echo ❌ Vercel CLI 安裝失敗
    echo 🌐 請檢查網絡連接
    pause
    exit /b 1
)

echo ✅ Vercel CLI 安裝完成

:: 檢查 Vercel CLI
echo.
echo 📋 檢查 Vercel CLI...
vercel --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('vercel --version') do echo ✅ Vercel CLI 版本：%%i
) else (
    echo ❌ Vercel CLI 安裝異常
    pause
    exit /b 1
)

:: 步驟 3：項目配置
echo.
echo ┌────────────────────────────────────────────────────────────────────┐
echo │                                                                  │
echo │                    步驟 3️⃣：項目配置                            │
echo │                                                                  │
echo └────────────────────────────────────────────────────────────────────┘
echo.

echo 📝 正在準備項目文件...

:: 複製 vercel.json 到上層目錄
cd ..
if not exist "vercel.json" (
    echo 📋 創建 vercel.json 配置文件...
    if exist "vercel-deployment\vercel.json" (
        copy /Y "vercel-deployment\vercel.json" . >nul
        echo ✅ vercel.json 已從部署文件夾複製
    ) else (
        echo ❌ 找不到 vercel.json 文件
        echo 🔄 請確保在正確的項目目錄中
        pause
        exit /b 1
    )
) else (
    echo ✅ vercel.json 已存在
)

:: 檢查關鍵文件
echo.
echo 📋 檢查項目文件...
set "missing_files=0"

if exist "app.js" (
    echo ✅ app.js 存在
) else (
    echo ❌ app.js 缺失
    set /a missing_files+=1
)

if exist "package.json" (
    echo ✅ package.json 存在
) else (
    echo ❌ package.json 缺失
    set /a missing_files+=1
)

if exist "views\" (
    echo ✅ views 文件夾存在
) else (
    echo ❌ views 文件夾缺失
    set /a missing_files+=1
)

if %missing_files% gtr 0 (
    echo.
    echo ❌ 項目文件不完整，缺失 %missing_files% 個關鍵文件
    echo 🔄 請確保項目完整後再試
    pause
    exit /b 1
)

echo ✅ 項目文件檢查通過

:: 步驟 4：Vercel 登錄
echo.
echo ┌────────────────────────────────────────────────────────────────────┐
echo │                                                                  │
echo │                    步驟 4️⃣：Vercel 登錄                         │
echo │                                                                  │
echo └────────────────────────────────────────────────────────────────────┘
echo.

echo 🔐 正在登錄 Vercel...
echo.
echo 📋 接下來會打開瀏覽器，請選擇以下方式登錄：
echo ╔══════════════════════════════════════════════════════════════════════╗
echo ║                                                                      ║
echo ║  🔑 登錄方式選擇：                                                   ║
echo ║                                                                      ║
echo ║  ✓ GitHub（推薦）  - 使用 GitHub 賬號登錄                          ║
echo ║  ✓ GitLab         - 使用 GitLab 賬號登錄                           ║
echo ║  ✓ Email          - 使用郵箱登錄                                  ║
echo ║                                                                      ║
echo ║  💡 建議使用 GitHub 登錄，方便後續與倉庫集成                     ║
echo ║                                                                      ║
echo ╚══════════════════════════════════════════════════════════════════════╝
echo.
echo 🚀 準備好後按任意鍵開始登錄...
pause >nul

echo 🌐 正在打開登錄頁面...
call vercel login

if %errorlevel% neq 0 (
    echo ❌ Vercel 登錄失敗
    echo 🔄 請檢查網絡連接後重試
    pause
    exit /b 1
)

echo ✅ Vercel 登錄成功

:: 步驟 5：執行部署
echo.
echo ┌────────────────────────────────────────────────────────────────────┐
echo │                                                                  │
echo │                    步驟 5️⃣：執行部署                           │
echo │                                                                  │
echo └────────────────────────────────────────────────────────────────────┘
echo.

echo 🚀 開始部署到 Vercel...
echo.
echo 📋 部署選項說明：
echo ╔══════════════════════════════════════════════════════════════════════╗
echo ║                                                                      ║
echo ║  🎯 部署方式選擇：                                                   ║
echo ║                                                                      ║
echo ║  [1] 🚀 直接部署到生產環境（推薦）                                   ║
echo ║      立即部署並發布，獲得正式網址                                   ║
echo ║                                                                      ║
echo ║  [2] 👀 先創建預覽部署                                               ║
echo ║      先生成預覽版本，測試後再發布                                   ║
echo ║                                                                      ║
echo ║  💡 建議：第一次部署選擇預覽，確認沒問題後再發布到生產環境         ║
echo ║                                                                      ║
echo ╚══════════════════════════════════════════════════════════════════════╝
echo.

choice /C 12 /N /M "請選擇部署方式 (1-2):"

if %errorlevel% equ 1 (
    echo 🎯 選擇：直接部署到生產環境
    echo 🚀 開始生產環境部署...
    call vercel --prod
) else (
    echo 👀 選擇：創建預覽部署
    echo 🧪 開始預覽環境部署...
    call vercel
)

if %errorlevel% neq 0 (
    echo ❌ 部署失敗
    echo 📚 請查看錯誤信息，或參考文檔解決
    pause
    exit /b 1
)

echo ✅ 部署成功！

:: 步驟 6：環境變量配置
echo.
echo ┌────────────────────────────────────────────────────────────────────┐
echo │                                                                  │
echo │                  步驟 6️⃣：配置環境變量                           │
echo │                                                                  │
echo └────────────────────────────────────────────────────────────────────┘
echo.

echo 🔧 正在配置環境變量...
echo.
echo 📋 需要配置的環境變量：
echo ╔══════════════════════════════════════════════════════════════════════╗
echo ║                                                                      ║
echo ║  🔑 必填變量：                                                       ║
echo ║     NODE_ENV=production                                             ║
echo ║     SESSION_SECRET=你的32位密鑰（必須安全）                          ║
echo ║     ADMIN_EMAIL=管理員郵箱                                          ║
echo ║                                                                      ║
echo ║  ⚙️  可選變量：                                                      ║
echo ║     PORT=3000                                                       ║
echo ║     DB_PATH=./checkin.db                                            ║
echo ║     BCRYPT_ROUNDS=10                                                ║
echo ║     SESSION_MAX_AGE=3600000                                         ║
echo ║                                                                      ║
echo ║  💡 提示：SESSION_SECRET 必須是安全的隨機字符串                       ║
echo ║                                                                      ║
echo ╚══════════════════════════════════════════════════════════════════════╝
echo.
echo 🎯 現在配置環境變量：
echo.
echo 1️⃣  使用 Vercel Dashboard（推薦）：
echo    • 訪問 https://vercel.com/dashboard
 echo   • 選擇你的項目
 echo   • 點擊 "Settings" → "Environment Variables"
echo    • 添加所有必需的變量
 echo.
echo 2️⃣  或使用命令行：
echo    vercel env add NODE_ENV
echo    vercel env add SESSION_SECRET
echo    vercel env add ADMIN_EMAIL
echo.
echo 🚀 準備好後按任意鍵繼續...
pause >nul

:: 步驟 7：驗證和測試
echo.
echo ┌────────────────────────────────────────────────────────────────────┐
echo │                                                                  │
echo │                  步驟 7️⃣：驗證和測試                             │
echo │                                                                  │
echo └────────────────────────────────────────────────────────────────────┘
echo.

echo 🎉 恭喜！部署已經完成！
echo.
echo 📱 你的應用信息：
echo ╔══════════════════════════════════════════════════════════════════════╗
echo ║                                                                      ║
echo ║ 🌐 訪問地址：                                                        ║
echo ║    主頁： https://你的域名.vercel.app                               ║
echo ║    管理： https://你的域名.vercel.app/admin/login                   ║
echo ║    QR碼： https://你的域名.vercel.app/events/1/qrcode               ║
echo ║                                                                      ║
echo ║ 👤 默認管理員：                                                      ║
echo ║    用戶名： superadmin                                               ║
echo ║    密碼： admin123                                                   ║
echo ║                                                                      ║
echo ║ ⚠️  重要提醒：                                                       ║
echo ║    • 首次登錄請立即修改密碼                                         ║
echo ║    • 確保環境變量配置正確                                           ║
echo ║    • 測試所有功能是否正常                                           ║
echo ║                                                                      ║
echo ╚══════════════════════════════════════════════════════════════════════╝
echo.
echo 🧪 建議測試項目：
echo    ✅ 訪問主頁，確認頁面加載正常
echo    ✅ 登錄管理後台，測試管理功能
echo    ✅ 創建一個測試活動
echo    ✅ 測試 QR 碼生成和掃描
echo    ✅ 測試簽到功能
echo.
echo 📚 後續操作：
echo    • 綁定自定義域名（可選）
echo    • 查看訪問統計
echo    • 配置高級設置
echo    • 邀請團隊成員
echo.
echo 🎊 手動部署完成！享受你的 QR 簽到系統吧！
echo.
echo 💡 如需幫助，請查看：
echo    - manual-deployment-guide.md（本指南）
echo    - vercel-deployment-guide.md（完整文檔）
echo    - https://vercel.com/docs（官方文檔）
echo.
pause