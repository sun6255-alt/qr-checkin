# 🚀 QR簽到系統部署指南

## 📋 部署前準備

### 1. 系統要求
- Node.js 16+ 
- SQLite3
- 512MB+ RAM
- 1GB+ 存儲空間

### 2. 環境配置

創建 `.env` 文件：
```env
# 服務器配置
PORT=3000
NODE_ENV=production

# 數據庫配置
DB_PATH=./data/checkin.db

# 會話配置
SESSION_SECRET=your-super-secret-key-here

# 郵件配置（可選）
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# 域名配置
DOMAIN=https://your-domain.com
```

## 🌐 部署選項

### 選項1：雲端服務器部署（推薦）

#### 步驟1：購買雲端服務器
- **推薦平台**：DigitalOcean, AWS Lightsail, 阿里雲
- **最低配置**：1 CPU, 1GB RAM, 25GB SSD
- **操作系統**：Ubuntu 20.04 LTS

#### 步驟2：服務器設置
```bash
# 連接到服務器
ssh root@your-server-ip

# 更新系統
apt update && apt upgrade -y

# 安裝 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# 安裝 PM2（進程管理器）
npm install -g pm2

# 安裝 Nginx（反向代理）
apt install nginx -y
```

#### 步驟3：部署應用
```bash
# 創建應用目錄
mkdir -p /var/www/checkin-system
cd /var/www/checkin-system

# 上傳代碼（使用 git 或直接複製）
git clone your-repo-url .
# 或
scp -r * root@your-server-ip:/var/www/checkin-system/

# 安裝依賴
npm install --production

# 創建數據目錄
mkdir -p /var/www/checkin-system/data

# 設置權限
chown -R www-data:www-data /var/www/checkin-system
```

#### 步驟4：配置 PM2
```bash
# 創建 PM2 配置文件
echo 'module.exports = {
  apps: [{
    name: "checkin-system",
    script: "./app.js",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "500M",
    env: {
      NODE_ENV: "production",
      PORT: 3000
    }
  }]
}' > ecosystem.config.js

# 啟動應用
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 步驟5：配置 Nginx
```nginx
# /etc/nginx/sites-available/checkin-system
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # 靜態文件緩存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# 啟用配置
ln -s /etc/nginx/sites-available/checkin-system /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 選項2：免費托管平台

#### Netlify 部署（適合靜態網站）
1. 註冊 Netlify 賬號
2. 連接 GitHub 倉庫
3. 自動部署設置

#### Vercel 部署（適合 Node.js）
1. 安裝 Vercel CLI
```bash
npm i -g vercel
```

2. 部署命令
```bash
vercel --prod
```

### 選項3：本地網絡部署

#### 步驟1：端口轉發
```bash
# 在路由器設置端口轉發
# 外部端口: 80 -> 內部端口: 3000
# 內部IP: 你的電腦IP
```

#### 步驟2：動態域名
- 使用 No-IP 或 DuckDNS
- 設置自動更新客戶端

## 🔒 安全配置

### 1. HTTPS 設置
```bash
# 使用 Let's Encrypt 免費 SSL
certbot --nginx -d your-domain.com
```

### 2. 防火牆配置
```bash
# UFW 防火牆
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

### 3. 數據庫安全
```bash
# 設置數據庫文件權限
chmod 600 /var/www/checkin-system/data/checkin.db
chown www-data:www-data /var/www/checkin-system/data/checkin.db
```

## 📊 性能優化

### 1. 啟用緩存
```javascript
// 在 app.js 中添加
const compression = require('compression');
app.use(compression());
```

### 2. 數據庫優化
```sql
-- 添加索引
CREATE INDEX idx_events_qr_code ON events(qr_code_id);
CREATE INDEX idx_checkins_event ON checkins(event_id);
CREATE INDEX idx_checkins_user ON checkins(user_id);
```

### 3. 靜態資源優化
```javascript
// 使用 CDN 或設置長期緩存
app.use(express.static('public', {
  maxAge: '1y',
  etag: false
}));
```

## 🔄 維護指南

### 日常維護
```bash
# 查看日誌
pm2 logs checkin-system

# 重啟應用
pm2 restart checkin-system

# 備份數據庫
cp /var/www/checkin-system/data/checkin.db /backup/checkin-$(date +%Y%m%d).db
```

### 自動備份腳本
```bash
# 創建備份腳本 /etc/cron.daily/backup-checkin
echo '#!/bin/bash
DATE=$(date +%Y%m%d)
BACKUP_DIR="/backup"
DB_PATH="/var/www/checkin-system/data/checkin.db"

cp $DB_PATH $BACKUP_DIR/checkin-$DATE.db
find $BACKUP_DIR -name "checkin-*.db" -mtime +30 -delete
' > /etc/cron.daily/backup-checkin

chmod +x /etc/cron.daily/backup-checkin
```

## 🆘 故障排除

### 常見問題
1. **端口被佔用**：`lsof -ti:3000 | xargs kill -9`
2. **權限問題**：`chown -R www-data:www-data /var/www/checkin-system`
3. **數據庫鎖定**：重啟應用或刪除 .db-journal 文件

### 監控工具
- **PM2 監控**：`pm2 monit`
- **系統資源**：`htop`
- **網絡連接**：`netstat -tlnp`

## 📞 技術支持

如果遇到問題，請檢查：
1. 應用日誌：`pm2 logs`
2. 系統日誌：`journalctl -u nginx`
3. 數據庫狀態：檢查文件權限和完整性

---

**💡 建議**：先從本地測試開始，確保功能正常後再進行生產部署！