@echo off
echo.
echo 🔍 Quick Validation for Upload
echo ==============================
echo.

echo 📋 Checking files...
dir *.js *.json *.bat
echo.
echo 📁 Checking folders...
dir views public
echo.
echo 📊 File sizes:
for %%f in (app.js package.json vercel.json) do (
    if exist "%%f" (
        echo %%f: 
        powershell -Command "Get-Item '%%f' | Select-Object Name, @{Name='Size(KB)';Expression={[math]::Round($_.Length/1KB,2)}} | Format-Table -AutoSize"
    )
)
echo.
echo ✅ Basic check complete!
echo 🚀 Ready for upload to Vercel!
pause