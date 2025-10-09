const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('checkin_system.db');

console.log('創建測試數據...\n');

// 創建管理員表
db.serialize(() => {
  // 創建管理員表
  db.run(`CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    approved_by INTEGER,
    approved_at DATETIME,
    reason TEXT
  )`);

  // 創建活動表
  db.run(`CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    location TEXT,
    qr_code_id TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    admin_id INTEGER NOT NULL,
    FOREIGN KEY (admin_id) REFERENCES admins (id)
  )`);

  // 創建用戶表
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    organization TEXT,
    department TEXT,
    position TEXT,
    id_number TEXT,
    birth_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 創建簽到表
  db.run(`CREATE TABLE IF NOT EXISTS checkins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    event_id INTEGER NOT NULL,
    admin_id INTEGER NOT NULL,
    checkin_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (event_id) REFERENCES events (id),
    FOREIGN KEY (admin_id) REFERENCES admins (id)
  )`);

  // 插入測試管理員（使用簡單的密碼，實際項目中應該使用 bcrypt 加密）
  const hashedPassword = '$2b$10$YourHashedPasswordHere'; // 簡化處理
  
  // 超級管理員
  db.run(`INSERT OR IGNORE INTO admins (username, password, email, name, role, status, approved_by, approved_at) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
          ['superadmin', hashedPassword, 'super@example.com', '超級管理員', 'super_admin', 'approved', 1, new Date().toISOString()]);
  
  // 一般管理員1
  db.run(`INSERT OR IGNORE INTO admins (username, password, email, name, role, status, approved_by, approved_at) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
          ['admin1', hashedPassword, 'admin1@example.com', '管理員一號', 'admin', 'approved', 1, new Date().toISOString()]);
  
  // 一般管理員2
  db.run(`INSERT OR IGNORE INTO admins (username, password, email, name, role, status, approved_by, approved_at) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
          ['admin2', hashedPassword, 'admin2@example.com', '管理員二號', 'admin', 'approved', 1, new Date().toISOString()]);

  console.log('測試數據創建完成！');
  
  // 顯示創建的管理員
  setTimeout(() => {
    db.all(`SELECT id, username, name, role, status FROM admins`, (err, rows) => {
      if (err) {
        console.error('查詢錯誤:', err);
        return;
      }
      
      console.log('創建的管理員:');
      rows.forEach(row => {
        console.log(`ID: ${row.id}, 用戶名: ${row.username}, 姓名: ${row.name}, 角色: ${row.role}, 狀態: ${row.status}`);
      });
      
      db.close();
    });
  }, 1000);
});