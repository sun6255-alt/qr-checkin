@echo off
title JSON File Fixer
color 0E

echo.
echo ==========================================
echo 🔧 JSON File Fixer
echo ==========================================
echo.

REM 檢查當前目錄的 package.json
if exist "package.json" (
    echo 📋 Checking package.json...
    node -e "
    try {
        const fs = require('fs');
        const content = fs.readFileSync('package.json', 'utf8');
        const pkg = JSON.parse(content);
        console.log('✅ package.json is valid JSON');
        
        // 檢查常見問題
        let issues = [];
        if (!pkg.name) issues.push('Missing name field');
        if (!pkg.version) issues.push('Missing version field');
        if (!pkg.dependencies) issues.push('Missing dependencies');
        if (!pkg.main) issues.push('Missing main field');
        
        if (issues.length > 0) {
            console.log('⚠️  Warnings found:');
            issues.forEach(issue => console.log('   - ' + issue));
        }
        
    } catch (error) {
        console.log('❌ JSON Error:', error.message);
        console.log('');
        console.log('🔧 Common fixes:');
        console.log('1. Missing comma after dependencies object');
        console.log('2. Trailing comma in objects/arrays');
        console.log('3. Unclosed brackets or quotes');
        console.log('');
        console.log('💡 Try using a JSON validator online');
    }
    "
) else (
    echo ❌ package.json not found in current directory
)

echo.
echo 📋 Checking vercel.json...
if exist "vercel.json" (
    node -e "
    try {
        const fs = require('fs');
        const content = fs.readFileSync('vercel.json', 'utf8');
        const config = JSON.parse(content);
        console.log('✅ vercel.json is valid JSON');
        
        // 檢查常見問題
        if (config.functions && config.builds) {
            console.log('❌ ERROR: Both functions and builds properties found!');
            console.log('   Remove the builds property to fix this issue.');
        }
        
    } catch (error) {
        console.log('❌ JSON Error:', error.message);
    }
    "
) else (
    echo ❌ vercel.json not found in current directory
)

echo.
echo ==========================================
echo 🎉 JSON validation completed!
echo ==========================================
echo.
pause