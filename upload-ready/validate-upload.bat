@echo off
title Upload Validation Tool
color 0A

echo.
echo ==========================================
echo 🔍 Upload-Ready Validation Tool
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

if not exist "package-lock.json" (
    echo ❌ Missing: package-lock.json
    set "missing_files=1"
) else (
    echo ✅ package-lock.json
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
    echo    Please ensure all files are present before uploading.
    pause
    exit /b 1
)

echo.
echo 📋 Step 2: Validating JSON files...
echo.

node -e "
try {
    // Validate package.json
    const pkg = require('./package.json');
    console.log('✅ package.json is valid JSON');
    
    // Check required fields
    if (!pkg.name) console.log('⚠️  WARNING: Missing name field');
    if (!pkg.version) console.log('⚠️  WARNING: Missing version field');
    if (!pkg.dependencies) console.log('⚠️  WARNING: Missing dependencies');
    
    // Check critical dependencies
    const deps = Object.keys(pkg.dependencies || {});
    const required = ['express', 'ejs', 'sqlite3'];
    required.forEach(dep => {
        if (deps.includes(dep)) {
            console.log('✅', dep, 'found');
        } else {
            console.log('❌ Missing dependency:', dep);
        }
    });
    
} catch (error) {
    console.log('❌ package.json Error:', error.message);
    process.exit(1);
}

try {
    // Validate vercel.json
    const vercel = require('./vercel.json');
    console.log('✅ vercel.json is valid JSON');
    
    // Check for common issues
    if (vercel.functions && vercel.builds) {
        console.log('❌ ERROR: Both functions and builds properties found!');
        console.log('   Remove the builds property to fix this issue.');
        process.exit(1);
    }
    
    if (!vercel.version) console.log('⚠️  WARNING: Missing version field');
    if (!vercel.routes) console.log('⚠️  WARNING: No routes defined');
    
} catch (error) {
    console.log('❌ vercel.json Error:', error.message);
    process.exit(1);
}
"

if %errorlevel% neq 0 (
    echo.
    echo ❌ JSON validation failed!
    pause
    exit /b 1
)

echo.
echo 📋 Step 3: Checking file structure...
echo.

REM 檢查 views 文件夾內容
dir views\*.ejs /b | find /c ".ejs" > temp_count.txt
set /p ejs_count=<temp_count.txt
del temp_count.txt

echo 📄 Found %ejs_count% EJS template files in views/

REM 檢查 public 文件夾內容
if exist "public\css\style.css" (
    echo ✅ CSS file found
) else (
    echo ⚠️  CSS file not found
)

if exist "public\index.html" (
    echo ✅ Static HTML found
) else (
    echo ⚠️  Static HTML not found
)

echo.
echo 📋 Step 4: File size check...
echo.

node -e "
const fs = require('fs');
const files = ['app.js', 'package.json', 'package-lock.json', 'vercel.json'];
let totalSize = 0;

files.forEach(file => {
    if (fs.existsSync(file)) {
        const stats = fs.statSync(file);
        const sizeKB = (stats.size / 1024).toFixed(2);
        totalSize += stats.size;
        console.log(\`📄 \${file}: \${sizeKB} KB\`);
    }
});

const totalSizeKB = (totalSize / 1024).toFixed(2);
console.log(\`📊 Total core files size: \${totalSizeKB} KB\`);

if (totalSize > 10 * 1024 * 1024) { // 10MB
    console.log('⚠️  WARNING: Total size is quite large for upload');
} else {
    console.log('✅ File sizes look good for upload');
}
"

echo.
echo ==========================================
echo 🎉 Validation completed!
echo ==========================================
echo.

if %missing_files% equ 0 (
    echo ✅ All checks passed! Your upload-ready package is ready.
    echo.
    echo 🚀 Next steps:
    echo 1. Zip this folder (optional)
    echo 2. Upload to Vercel
    echo 3. Configure environment variables
    echo 4. Deploy!
) else (
    echo ❌ Some issues found. Please fix them before uploading.
)

echo.
pause