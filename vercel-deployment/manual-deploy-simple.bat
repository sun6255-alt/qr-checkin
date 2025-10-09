@echo off
title QR Check-in System - Manual Deployment
echo.
echo ============================================
echo     QR Check-in System Manual Deployment    
echo ============================================
echo.
echo This wizard will guide you through manual deployment steps:
echo 1. Environment Check
echo 2. Install Vercel CLI
echo 3. Prepare Project
echo 4. Login to Vercel
echo 5. Deploy
echo 6. Configure Environment Variables
echo 7. Verify Deployment
echo.
echo Press any key to start...
pause >nul

:: Step 1: Environment Check
echo.
echo STEP 1: Environment Check
echo --------------------------
echo.
echo Checking Node.js...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node --version') do echo [OK] Node.js: %%i
) else (
    echo [ERROR] Node.js not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo Checking npm...
npm --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('npm --version') do echo [OK] npm: %%i
) else (
    echo [ERROR] npm not installed
    pause
    exit /b 1
)

:: Step 2: Install Vercel CLI
echo.
echo STEP 2: Install Vercel CLI
echo -------------------------
echo.
echo Installing Vercel CLI...
call npm install -g vercel

if %errorlevel% neq 0 (
    echo [ERROR] Failed to install Vercel CLI
    pause
    exit /b 1
)

echo [OK] Vercel CLI installed successfully

:: Step 3: Project Preparation
echo.
echo STEP 3: Project Preparation
echo ----------------------------
echo.
echo Preparing project files...

:: Copy vercel.json if not exists
cd ..
if not exist "vercel.json" (
    echo Creating vercel.json...
    if exist "vercel-deployment\vercel.json" (
        copy /Y "vercel-deployment\vercel.json" . >nul
        echo [OK] vercel.json copied from deployment folder
    ) else (
        echo [ERROR] vercel.json not found
        pause
        exit /b 1
    )
) else (
    echo [OK] vercel.json already exists
)

:: Check essential files
echo.
echo Checking project files...
set "missing_files=0"

if exist "app.js" (
    echo [OK] app.js found
) else (
    echo [ERROR] app.js missing
    set /a missing_files+=1
)

if exist "package.json" (
    echo [OK] package.json found
) else (
    echo [ERROR] package.json missing
    set /a missing_files+=1
)

if exist "views\" (
    echo [OK] views folder found
) else (
    echo [ERROR] views folder missing
    set /a missing_files+=1
)

if %missing_files% gtr 0 (
    echo [ERROR] Project files incomplete. Missing %missing_files% files
    pause
    exit /b 1
)

echo [OK] All project files verified

:: Step 4: Vercel Login
echo.
echo STEP 4: Vercel Login
echo --------------------
echo.
echo Logging in to Vercel...
echo A browser window will open for authentication.
echo Please choose your login method:
echo - GitHub (recommended)
echo - GitLab
echo - Email
echo.
pause

echo Opening login page...
call vercel login

if %errorlevel% neq 0 (
    echo [ERROR] Vercel login failed
    pause
    exit /b 1
)

echo [OK] Vercel login successful

:: Step 5: Deployment
echo.
echo STEP 5: Deployment
echo ------------------
echo.
echo Choose deployment type:
echo [1] Deploy to Production (recommended)
echo [2] Create Preview Deployment (test first)
echo.

choice /C 12 /N /M "Select deployment type (1-2):"

if %errorlevel% equ 1 (
    echo Deploying to production...
    call vercel --prod
) else (
    echo Creating preview deployment...
    call vercel
)

if %errorlevel% neq 0 (
    echo [ERROR] Deployment failed
    pause
    exit /b 1
)

echo [OK] Deployment successful!

:: Step 6: Environment Variables
echo.
echo STEP 6: Configure Environment Variables
echo --------------------------------------
echo.
echo Required environment variables:
echo - NODE_ENV=production
echo - SESSION_SECRET=your-32-char-secret-key
echo - ADMIN_EMAIL=your-admin-email
echo.
echo Optional variables:
echo - PORT=3000
echo - DB_PATH=./checkin.db
echo.
echo To configure, you can:
echo 1. Use Vercel Dashboard: https://vercel.com/dashboard
echo 2. Use command line: vercel env add VARIABLE_NAME
echo.
echo Press any key to continue...
pause

:: Step 7: Verification
echo.
echo STEP 7: Verification and Testing
echo ---------------------------------
echo.
echo [SUCCESS] Deployment completed!
echo.
echo Your application should be accessible at:
echo - Main: https://your-domain.vercel.app
echo - Admin: https://your-domain.vercel.app/admin/login
echo - QR Code: https://your-domain.vercel.app/events/1/qrcode
echo.
echo Default admin credentials:
echo - Username: superadmin
echo - Password: admin123
echo.
echo [IMPORTANT] Please change the default password after first login!
echo.
echo Testing checklist:
echo [ ] Visit main page
echo [ ] Login to admin panel
echo [ ] Create a test event
echo [ ] Test QR code generation
echo [ ] Test check-in functionality
echo.
echo Deployment guide complete!
echo For more help, see manual-deployment-guide.md
echo.
pause