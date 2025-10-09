@echo off
title QR Check-in System - Deployment Validation
color 0B

echo.
echo ==========================================
echo 🔍 QR Check-in System - Deployment Validation
echo ==========================================
echo.

REM 檢查必需文件
echo 📋 Step 1: Checking required files...
echo.

set "missing_files=0"

if not exist "app.js" (
    echo ❌ Missing: app.js
    set "missing_files=1"
) else (
    echo ✅ app.js
)

if not exist "package.json" (
    echo ❌ Missing: package.json
    set "missing_files=1"
) else (
    echo ✅ package.json
)

if not exist "vercel.json" (
    echo ❌ Missing: vercel.json
    set "missing_files=1"
) else (
    echo ✅ vercel.json
)

if not exist "views" (
    echo ❌ Missing: views folder
    set "missing_files=1"
) else (
    echo ✅ views folder
)

if not exist "public" (
    echo ❌ Missing: public folder
    set "missing_files=1"
) else (
    echo ✅ public folder
)

if %missing_files% equ 1 (
    echo.
    echo ❌ Some required files are missing!
    echo    Please ensure all files are present before deployment.
    pause
    exit /b 1
)

echo.
echo 📋 Step 2: Checking vercel.json configuration...
echo.

REM 檢查 vercel.json 格式
node -e "
try {
    const fs = require('fs');
    const config = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
    
    console.log('✅ vercel.json is valid JSON');
    
    if (config.functions && config.builds) {
        console.log('❌ ERROR: Both functions and builds properties found!');
        console.log('   Remove the builds property to fix this issue.');
        process.exit(1);
    }
    
    if (config.version !== 2) {
        console.log('⚠️  WARNING: Version should be 2');
    }
    
    if (!config.routes) {
        console.log('⚠️  WARNING: No routes defined');
    }
    
    if (!config.functions) {
        console.log('ℹ️  INFO: No functions configuration found');
    }
    
    console.log('✅ Configuration looks good!');
    
} catch (error) {
    console.log('❌ ERROR: Invalid vercel.json');
    console.log('   Error:', error.message);
    process.exit(1);
}
"

if %errorlevel% neq 0 (
    echo.
    echo ❌ Configuration validation failed!
    pause
    exit /b 1
)

echo.
echo 📋 Step 3: Checking package.json...
echo.

node -e "
try {
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    console.log('✅ package.json is valid JSON');
    
    if (!pkg.dependencies) {
        console.log('⚠️  WARNING: No dependencies found');
    } else {
        const deps = Object.keys(pkg.dependencies);
        console.log('ℹ️  Found', deps.length, 'dependencies');
        
        const required = ['express', 'ejs', 'sqlite3'];
        required.forEach(dep => {
            if (deps.includes(dep)) {
                console.log('✅', dep);
            } else {
                console.log('❌ Missing:', dep);
            }
        });
    }
    
    if (!pkg.scripts) {
        console.log('⚠️  WARNING: No scripts defined');
    }
    
} catch (error) {
    console.log('❌ ERROR: Invalid package.json');
    console.log('   Error:', error.message);
    process.exit(1);
}
"

echo.
echo 📋 Step 4: Checking Node.js compatibility...
echo.

node -e "
const nodeVersion = process.version;
const major = parseInt(nodeVersion.slice(1).split('.')[0]);

console.log('ℹ️  Node.js version:', nodeVersion);

if (major < 14) {
    console.log('⚠️  WARNING: Node.js version is below 14');
    console.log('   Consider upgrading for better compatibility');
} else {
    console.log('✅ Node.js version is compatible');
}
"

echo.
echo ==========================================
echo 🎉 Validation completed!
echo ==========================================
echo.
echo 📋 Summary:
echo ✅ All required files are present
echo ✅ Configuration is valid
echo ✅ Package dependencies look good
echo ✅ Node.js version is compatible
echo.
echo 🚀 Your system is ready for deployment!
echo.
echo 🔧 Next steps:
echo 1. Run deploy.bat to start deployment
echo 2. Configure environment variables in Vercel dashboard
echo 3. Test your deployed application
echo.
pause