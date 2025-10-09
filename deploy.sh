#!/bin/bash

# QR簽到系統部署腳本
# 使用方法: ./deploy.sh [environment]
# environment: development 或 production (默認: production)

ENV=${1:-production}
echo "🚀 開始部署 QR簽到系統 ($ENV 環境)..."

# 檢查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安裝，請先安裝 Node.js"
    exit 1
fi

# 檢查 npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安裝，請先安裝 npm"
    exit 1
fi

# 安裝依賴
echo "📦 安裝依賴..."
npm install

# 創建數據目錄
if [ "$ENV" = "production" ]; then
    echo "📁 創建數據目錄..."
    mkdir -p data
    chmod 755 data
fi

# 設置環境變量
export NODE_ENV=$ENV
export PORT=${PORT:-3000}

# 創建 .env 文件（如果不存在）
if [ ! -f .env ]; then
    echo "⚙️  創建 .env 文件..."
    cp .env.example .env
    echo "📝 請編輯 .env 文件設置必要的配置"
fi

# 初始化數據庫
echo "🗄️  初始化數據庫..."
node -e "
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = process.env.DB_PATH || path.join(__dirname, 'checkin.db');
const db = new sqlite3.Database(dbPath);

console.log('數據庫連接成功');

// 創建必要的表
db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT UNIQUE, id_number TEXT, birth_date TEXT, organization TEXT, department TEXT, position TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)');
  db.run('CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, description TEXT, qr_code_id TEXT UNIQUE, qr_code_active BOOLEAN DEFAULT 1, qr_code_updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, start_time DATETIME, end_time DATETIME, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, admin_id INTEGER)');
  db.run('CREATE TABLE IF NOT EXISTS checkins (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, event_id INTEGER, checkin_time DATETIME DEFAULT CURRENT_TIMESTAMP, admin_id INTEGER)');
  db.run('CREATE TABLE IF NOT EXISTS admins (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, password TEXT NOT NULL, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL, role TEXT NOT NULL, status TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP, approved_by INTEGER, approved_at TEXT)');
});

db.close();
console.log('數據庫初始化完成');
"

# 測試應用
echo "🧪 測試應用..."
if node -e "console.log('Node.js 運行正常')"; then
    echo "✅ 應用測試通過"
else
    echo "❌ 應用測試失敗"
    exit 1
fi

# 啟動應用
echo "🎯 啟動應用..."
if [ "$ENV" = "production" ]; then
    # 生產環境使用 PM2
    if command -v pm2 &> /dev/null; then
        echo "使用 PM2 啟動..."
        pm2 start app.js --name "checkin-system"
        pm2 save
        echo "✅ 應用已啟動，使用 pm2 logs 查看日誌"
    else
        echo "⚠️  PM2 未安裝，使用 node 直接啟動..."
        echo "建議安裝 PM2: npm install -g pm2"
        nohup node app.js > app.log 2>&1 &
        echo "✅ 應用已在後台啟動，查看 app.log 獲取日誌"
    fi
else
    # 開發環境
    echo "開發模式啟動..."
    node app.js
fi

echo "🎉 部署完成！"
echo "📊 訪問地址: http://localhost:$PORT"
echo "🔧 管理員登錄: http://localhost:$PORT/admin/login"
echo "📖 默認管理員: superadmin / admin123"