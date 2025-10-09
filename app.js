// 本地開發入口文件
require('dotenv').config(); // 加載環境變量
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const QRCode = require('qrcode');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const flash = require('connect-flash');
const fs = require('fs');

// 初始化應用
const app = express();
const port = process.env.PORT || 3000;

// 設置視圖引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 中間件
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// 設置會話
app.use(session({
  secret: process.env.SESSION_SECRET || 'qr-checkin-system-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    maxAge: parseInt(process.env.SESSION_MAX_AGE) || 3600000, // 1小時
    secure: process.env.NODE_ENV === 'production' // 生產環境使用 HTTPS
  },
  name: 'checkin.sid'
}));

// 設置閃存訊息
app.use(flash());

// 全局變量中間件
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.admin = req.session.admin || null;
  next();


// 初始化數據庫 - 支持環境變量配置
const dbPath = process.env.DB_PATH ? path.resolve(process.env.DB_PATH) : path.join(__dirname, 'checkin.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('無法連接到數據庫', err.message);
  } else {
    console.log(`已連接到SQLite數據庫: ${dbPath}`);
    initDatabase();
  }
});

// 創建數據庫表
function initDatabase() {
  db.serialize(() => {
    // 用戶表
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      id_number TEXT,
      birth_date TEXT,
      organization TEXT,
      department TEXT,
      position TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 活動表
    db.run(`CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      qr_code_id TEXT UNIQUE,
      qr_code_active BOOLEAN DEFAULT 1,
      qr_code_updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      start_time DATETIME,
      end_time DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 簽到記錄表
    db.run(`CREATE TABLE IF NOT EXISTS checkins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      event_id INTEGER,
      checkin_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (event_id) REFERENCES events (id)
    )`);
    
    // 創建管理者表
    db.run(`CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL, -- 'super' 或 'normal'
      status TEXT NOT NULL, -- 'pending', 'approved', 'disabled', 'rejected'
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      approved_by INTEGER,
      approved_at TEXT,
      FOREIGN KEY (approved_by) REFERENCES admins (id)
    )`, function(err) {
      if (err) {
        console.error('創建管理者表錯誤:', err.message);
        return;
      }
      
      // 檢查是否已有超級管理者
      db.get("SELECT * FROM admins WHERE role = 'super' LIMIT 1", (err, admin) => {
        if (err) {
          console.error('查詢超級管理者錯誤:', err.message);
          return;
        }
        
        // 如果沒有超級管理者，創建一個默認的
        if (!admin) {
          // 創建默認超級管理者 (用戶名: superadmin, 密碼: admin123)
          const hashedPassword = bcrypt.hashSync('admin123', 10);
          
          db.run(`INSERT INTO admins (username, password, email, name, role, status) 
                  VALUES (?, ?, ?, ?, ?, ?)`, 
                  ['superadmin', hashedPassword, 'admin@example.com', '超級管理者', 'super', 'approved'], 
                  function(err) {
                    if (err) {
                      console.error('創建超級管理者時出錯:', err.message);
                    } else {
                      console.log('已創建默認超級管理者，用戶名: superadmin, 密碼: admin123');
                    }
                  });
        }
      });
    });
  });
}

// 路由 - 首頁
// 首頁路由
app.get('/', (req, res) => {
  res.render('index');
});

// 管理者認證中間件
const isAuthenticated = (req, res, next) => {
  if (req.session.admin) {
    return next();
  }
  req.flash('error_msg', '請先登入');
  res.redirect('/admin/login');
};

// 超級管理者認證中間件
const isSuperAdmin = (req, res, next) => {
  if (req.session.admin && req.session.admin.role === 'super') {
    return next();
  }
  req.flash('error_msg', '需要超級管理者權限');
  res.redirect('/admin/dashboard');
};

// 管理者登入頁面
app.get('/admin/login', (req, res) => {
  if (req.session.admin) {
    return res.redirect('/admin/dashboard');
  }
  res.render('admin-login', { 
    error_msg: req.flash('error_msg'),
    success_msg: req.flash('success_msg')
  });
});

// 管理者登入處理
app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  db.get('SELECT * FROM admins WHERE username = ?', [username], (err, admin) => {
    if (err) {
      req.flash('error_msg', '登入時發生錯誤');
      return res.redirect('/admin/login');
    }
    
    if (!admin) {
      req.flash('error_msg', '用戶名或密碼錯誤');
      return res.redirect('/admin/login');
    }
    
    if (admin.status !== 'approved') {
      req.flash('error_msg', '您的帳號尚未被核准或已被停用');
      return res.redirect('/admin/login');
    }
    
    bcrypt.compare(password, admin.password, (err, isMatch) => {
      if (err) {
        req.flash('error_msg', '登入時發生錯誤');
        return res.redirect('/admin/login');
      }
      
      if (!isMatch) {
        req.flash('error_msg', '用戶名或密碼錯誤');
        return res.redirect('/admin/login');
      }
      
      // 登入成功，設置會話
      req.session.admin = {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        email: admin.email,
        role: admin.role
      };
      
      req.flash('success_msg', '登入成功');
      res.redirect('/admin/dashboard');
    });
  });
});

// 管理者登出
app.get('/admin/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

// 管理者註冊頁面
app.get('/admin/register', (req, res) => {
  if (req.session.admin) {
    return res.redirect('/admin/dashboard');
  }
  res.render('admin-register');
});

// 管理者註冊處理
app.post('/admin/register', (req, res) => {
  const { username, password, confirm_password, name, email, reason } = req.body;
  
  // 驗證
  if (password !== confirm_password) {
    req.flash('error_msg', '密碼與確認密碼不一致');
    return res.redirect('/admin/register');
  }
  
  if (password.length < 8) {
    req.flash('error_msg', '密碼長度必須至少8位字元');
    return res.redirect('/admin/register');
  }
  
  // 檢查用戶名是否已存在
  db.get('SELECT * FROM admins WHERE username = ?', [username], (err, admin) => {
    if (err) {
      req.flash('error_msg', '註冊時發生錯誤');
      return res.redirect('/admin/register');
    }
    
    if (admin) {
      req.flash('error_msg', '此用戶名已被使用');
      return res.redirect('/admin/register');
    }
    
    // 加密密碼
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        req.flash('error_msg', '註冊時發生錯誤');
        return res.redirect('/admin/register');
      }
      
      const newAdmin = {
        id: uuidv4(),
        username,
        password: hashedPassword,
        name,
        email,
        role: 'normal',
        status: 'pending',
        created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
        reason
      };
      
      db.run(`INSERT INTO admins (id, username, password, name, email, role, status, created_at, reason) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [newAdmin.id, newAdmin.username, newAdmin.password, newAdmin.name, 
         newAdmin.email, newAdmin.role, newAdmin.status, newAdmin.created_at, newAdmin.reason],
        function(err) {
          if (err) {
            req.flash('error_msg', '註冊時發生錯誤');
            return res.redirect('/admin/register');
          }
          
          req.flash('success_msg', '註冊申請已提交，請等待超級管理者審核');
          res.redirect('/admin/login');
        }
      );
    });
  });
});

// 管理者儀表板
app.get('/admin/dashboard', isAuthenticated, (req, res) => {
  // 獲取統計數據
  let eventCountQuery;
  let checkinCountQuery;
  let params = [];
  
  if (req.session.admin.role === 'super') {
    // 超級管理員可以看到所有統計
    eventCountQuery = 'SELECT COUNT(*) as eventCount FROM events';
    checkinCountQuery = 'SELECT COUNT(*) as checkinCount FROM checkins';
  } else {
    // 普通管理員只能看到自己創建活動的統計
    eventCountQuery = 'SELECT COUNT(*) as eventCount FROM events WHERE admin_id = ?';
    checkinCountQuery = `SELECT COUNT(*) as checkinCount 
                         FROM checkins c 
                         JOIN events e ON c.event_id = e.id 
                         WHERE e.admin_id = ?`;
    params = [req.session.admin.id];
  }
  
  db.get(eventCountQuery, params, (err, eventStats) => {
    if (err) {
      req.flash('error_msg', '獲取數據時發生錯誤');
      return res.render('admin-dashboard', { 
        stats: { eventCount: 0, userCount: 0, checkinCount: 0 },
        recentEvents: [],
        recentCheckins: [],
        pendingAdmins: []
      });
    }
    
    db.get('SELECT COUNT(*) as userCount FROM users', [], (err, userStats) => {
      if (err) {
        req.flash('error_msg', '獲取數據時發生錯誤');
        return res.render('admin-dashboard', { 
          stats: { eventCount: eventStats.eventCount, userCount: 0, checkinCount: 0 },
          recentEvents: [],
          recentCheckins: [],
          pendingAdmins: []
        });
      }
      
      db.get(checkinCountQuery, params, (err, checkinStats) => {
        if (err) {
          req.flash('error_msg', '獲取數據時發生錯誤');
          return res.render('admin-dashboard', { 
            stats: { eventCount: eventStats.eventCount, userCount: userStats.userCount, checkinCount: 0 },
            recentEvents: [],
            recentCheckins: [],
            pendingAdmins: []
          });
        }
        
        // 獲取最近活動
        let recentEventsQuery;
        let recentEventsParams = [];
        
        if (req.session.admin.role === 'super') {
          recentEventsQuery = `SELECT e.id, e.title, COUNT(c.id) as checkin_count 
                              FROM events e 
                              LEFT JOIN checkins c ON e.id = c.event_id 
                              GROUP BY e.id 
                              ORDER BY e.created_at DESC LIMIT 5`;
        } else {
          recentEventsQuery = `SELECT e.id, e.title, COUNT(c.id) as checkin_count 
                              FROM events e 
                              LEFT JOIN checkins c ON e.id = c.event_id 
                              WHERE e.admin_id = ?
                              GROUP BY e.id 
                              ORDER BY e.created_at DESC LIMIT 5`;
          recentEventsParams = [req.session.admin.id];
        }
        
        db.all(recentEventsQuery, recentEventsParams, (err, recentEvents) => {
          if (err) recentEvents = [];
          
          // 獲取最近簽到
          let recentCheckinsQuery;
          let recentCheckinsParams = [];
          
          if (req.session.admin.role === 'super') {
            recentCheckinsQuery = `SELECT c.id, u.name as user_name, e.title as event_name, c.checkin_time 
                                  FROM checkins c 
                                  JOIN users u ON c.user_id = u.id 
                                  JOIN events e ON c.event_id = e.id 
                                  ORDER BY c.checkin_time DESC LIMIT 5`;
          } else {
            recentCheckinsQuery = `SELECT c.id, u.name as user_name, e.title as event_name, c.checkin_time 
                                  FROM checkins c 
                                  JOIN users u ON c.user_id = u.id 
                                  JOIN events e ON c.event_id = e.id 
                                  WHERE e.admin_id = ?
                                  ORDER BY c.checkin_time DESC LIMIT 5`;
            recentCheckinsParams = [req.session.admin.id];
          }
          
          db.all(recentCheckinsQuery, recentCheckinsParams, (err, recentCheckins) => {
            if (err) recentCheckins = [];
            
            // 如果是超級管理者，獲取待審核申請
            let pendingAdmins = [];
            if (req.session.admin.role === 'super') {
              db.all(`SELECT * FROM admins WHERE status = 'pending' ORDER BY created_at DESC`, [], (err, results) => {
                if (!err) pendingAdmins = results;
                
                res.render('admin-dashboard', {
                  stats: {
                    eventCount: eventStats.eventCount,
                    userCount: userStats.userCount,
                    checkinCount: checkinStats.checkinCount
                  },
                  recentEvents,
                  recentCheckins,
                  pendingAdmins
                });
              });
            } else {
              res.render('admin-dashboard', {
                stats: {
                  eventCount: eventStats.eventCount,
                  userCount: userStats.userCount,
                  checkinCount: checkinStats.checkinCount
                },
                recentEvents,
                recentCheckins,
                pendingAdmins
              });
            }
          });
        });
      });
    });
  });
});

// 待審核管理者申請頁面
app.get('/admin/pending', isAuthenticated, isSuperAdmin, (req, res) => {
  db.all(`SELECT * FROM admins WHERE status = 'pending' ORDER BY created_at DESC`, [], (err, pendingAdmins) => {
    if (err) {
      req.flash('error_msg', '獲取數據時發生錯誤');
      return res.render('admin-pending', { pendingAdmins: [] });
    }
    
    res.render('admin-pending', { pendingAdmins });
  });
});

// 核准管理者申請
app.post('/admin/approve/:id', isAuthenticated, isSuperAdmin, (req, res) => {
  const adminId = req.params.id;
  const superAdminId = req.session.admin.id;
  const approvedAt = moment().format('YYYY-MM-DD HH:mm:ss');
  
  db.run(`UPDATE admins SET status = 'approved', approved_by = ?, approved_at = ? WHERE id = ?`,
    [superAdminId, approvedAt, adminId],
    function(err) {
      if (err) {
        req.flash('error_msg', '核准申請時發生錯誤');
      } else {
        req.flash('success_msg', '已核准管理者申請');
      }
      res.redirect('/admin/pending');
    }
  );
});

// 拒絕管理者申請
app.post('/admin/reject/:id', isAuthenticated, isSuperAdmin, (req, res) => {
  const adminId = req.params.id;
  
  db.run(`DELETE FROM admins WHERE id = ? AND status = 'pending'`, [adminId], function(err) {
    if (err) {
      req.flash('error_msg', '拒絕申請時發生錯誤');
    } else {
      req.flash('success_msg', '已拒絕管理者申請');
    }
    res.redirect('/admin/pending');
  });
});

// 管理者帳號管理頁面
app.get('/admin/admins', isAuthenticated, isSuperAdmin, (req, res) => {
  db.all(`SELECT * FROM admins ORDER BY role DESC, created_at DESC`, [], (err, admins) => {
    if (err) {
      req.flash('error_msg', '獲取數據時發生錯誤');
      return res.render('admin-admins', { admins: [] });
    }
    
    res.render('admin-admins', { admins });
  });
});

// 停用管理者帳號
app.post('/admin/disable/:id', isAuthenticated, isSuperAdmin, (req, res) => {
  const adminId = req.params.id;
  
  db.run(`UPDATE admins SET status = 'disabled' WHERE id = ? AND role != 'super'`, [adminId], function(err) {
    if (err) {
      req.flash('error_msg', '停用帳號時發生錯誤');
    } else {
      req.flash('success_msg', '已停用管理者帳號');
    }
    res.redirect('/admin/admins');
  });
});

// 啟用管理者帳號
app.post('/admin/enable/:id', isAuthenticated, isSuperAdmin, (req, res) => {
  const adminId = req.params.id;
  
  db.run(`UPDATE admins SET status = 'approved' WHERE id = ?`, [adminId], function(err) {
    if (err) {
      req.flash('error_msg', '啟用帳號時發生錯誤');
    } else {
      req.flash('success_msg', '已啟用管理者帳號');
    }
    res.redirect('/admin/admins');
  });
});

// 刪除管理者帳號
app.post('/admin/delete/:id', isAuthenticated, isSuperAdmin, (req, res) => {
  const adminId = req.params.id;
  
  db.run(`DELETE FROM admins WHERE id = ? AND role != 'super'`, [adminId], function(err) {
    if (err) {
      req.flash('error_msg', '刪除帳號時發生錯誤');
    } else {
      req.flash('success_msg', '已刪除管理者帳號');
    }
    res.redirect('/admin/admins');
  });
});

// 路由 - 管理員頁面（活動管理）
app.get('/admin', isAuthenticated, (req, res) => {
  // 根據管理員角色獲取不同的活動
  let query;
  let params = [];
  
  if (req.session.admin.role === 'super') {
    // 超級管理員可以看到所有活動
    query = 'SELECT * FROM events ORDER BY created_at DESC';
  } else {
    // 普通管理員只能看到自己創建的活動
    query = 'SELECT * FROM events WHERE admin_id = ? ORDER BY created_at DESC';
    params = [req.session.admin.id];
  }
  
  db.all(query, params, (err, events) => {
    if (err) {
      return res.status(500).send('數據庫錯誤');
    }
    res.render('admin', { events, admin: req.session.admin });
  });
});



// 路由 - 簽到記錄頁面
app.get('/admin/checkins', isAuthenticated, (req, res) => {
  let query;
  let params = [];
  
  if (req.session.admin.role === 'super') {
    // 超級管理員可以看到所有簽到記錄
    query = `SELECT 
              c.*,
              e.title as event_name,
              u.name as user_name,
              u.email as user_email,
              u.organization as user_organization,
              u.department as user_department,
              u.position as user_position,
              datetime(c.checkin_time) as checkin_time
            FROM checkins c
            JOIN events e ON c.event_id = e.id
            JOIN users u ON c.user_id = u.id
            ORDER BY c.checkin_time DESC`;
  } else {
    // 普通管理員只能看到自己創建活動的簽到記錄
    query = `SELECT 
              c.*,
              e.title as event_name,
              u.name as user_name,
              u.email as user_email,
              u.organization as user_organization,
              u.department as user_department,
              u.position as user_position,
              datetime(c.checkin_time) as checkin_time
            FROM checkins c
            JOIN events e ON c.event_id = e.id
            JOIN users u ON c.user_id = u.id
            WHERE e.admin_id = ?
            ORDER BY c.checkin_time DESC`;
    params = [req.session.admin.id];
  }
  
  db.all(query, params, (err, checkins) => {
    if (err) {
      req.flash('error_msg', '獲取簽到記錄時發生錯誤');
      return res.render('admin-checkins', { checkins: [], admin: req.session.admin });
    }
    res.render('admin-checkins', { checkins, admin: req.session.admin });
  });
});

// 路由 - 創建新活動
app.post('/events', isAuthenticated, (req, res) => {
  const { title, description, start_time, end_time } = req.body;
  const qrCodeId = uuidv4();
  const adminId = req.session.admin.id; // 獲取當前登入管理員的ID
  
  db.run(
    'INSERT INTO events (title, description, qr_code_id, start_time, end_time, admin_id) VALUES (?, ?, ?, ?, ?, ?)',
    [title, description, qrCodeId, start_time, end_time, adminId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.redirect('/admin');
    }
  );
});

// 路由 - 獲取活動QR碼
app.get('/events/:id/qrcode', (req, res) => {
  const eventId = req.params.id;
  
  // 檢查是否已登錄
  if (!req.session.admin) {
    return res.redirect('/admin/login');
  }
  
  db.get('SELECT * FROM events WHERE id = ?', [eventId], (err, event) => {
    if (err || !event) {
      return res.status(404).send('活動未找到');
    }
    
    // 檢查權限 - 一般管理員只能查看自己創建的活動
    if (req.session.admin.role !== 'super_admin' && event.admin_id !== req.session.admin.id) {
      return res.status(403).render('error', { message: '您無權查看此活動的QR碼' });
    }
    
    // 生成包含簽到URL的QR碼
    const checkinUrl = `${req.protocol}://${req.get('host')}/checkin/${event.qr_code_id}`;
    
    QRCode.toDataURL(checkinUrl, (err, url) => {
      if (err) {
        return res.status(500).send('生成QR碼錯誤');
      }
      
      // 傳遞管理員信息到模板
      res.render('qrcode', { 
        event, 
        qrCodeUrl: url, 
        checkinUrl,
        admin: req.session.admin 
      });
    });
  });
});

// 路由 - 更新活動QR碼
app.post('/events/:id/update-qrcode', (req, res) => {
  const eventId = req.params.id;
  
  db.get('SELECT * FROM events WHERE id = ?', [eventId], (err, event) => {
    if (err || !event) {
      return res.status(404).json({ error: '活動未找到' });
    }
    
    // 生成新的QR碼ID
    const newQrCodeId = uuidv4();
    const now = moment().format('YYYY-MM-DD HH:mm:ss');
    
    // 更新數據庫中的QR碼ID和更新時間
    db.run(
      'UPDATE events SET qr_code_id = ?, qr_code_updated_at = ? WHERE id = ?',
      [newQrCodeId, now, eventId],
      function(err) {
        if (err) {
          return res.status(500).json({ error: '更新QR碼失敗' });
        }
        
        res.redirect(`/events/${eventId}/qrcode`);
      }
    );
  });
});

// 路由 - 簽到頁面
app.get('/checkin/:qrCodeId', (req, res) => {
  const qrCodeId = req.params.qrCodeId;
  
  db.get('SELECT * FROM events WHERE qr_code_id = ?', [qrCodeId], (err, event) => {
    if (err || !event) {
      return res.status(404).render('error', { message: '無效的QR碼或活動不存在' });
    }
    
    res.render('checkin', { event });
  });
});

// 路由 - 處理簽到
app.post('/checkin/:qrCodeId', (req, res) => {
  const qrCodeId = req.params.qrCodeId;
  const { name, email, organization, department, position, id_number, birth_date } = req.body;
  
  db.get('SELECT * FROM events WHERE qr_code_id = ?', [qrCodeId], (err, event) => {
    if (err || !event) {
      return res.status(404).render('error', { message: '無效的QR碼或活動不存在' });
    }
    
    // 檢查活動是否屬於當前管理員（僅限一般管理員）
    if (req.session.admin.role !== 'super_admin' && event.admin_id !== req.session.admin.id) {
      return res.status(403).render('error', { message: '您無權為此活動進行簽到' });
    }
    
    // 檢查活動是否在有效時間內
    const now = moment();
    const startTime = moment(event.start_time);
    const endTime = moment(event.end_time);
    
    if (now < startTime || now > endTime) {
      return res.render('error', { message: '活動不在有效時間內，無法簽到' });
    }
    
    // 檢查用戶是否已存在
    db.get('SELECT id FROM users WHERE email = ?', [email], (err, existingUser) => {
      if (err) {
        return res.status(500).render('error', { message: '數據庫錯誤' });
      }
      
      if (existingUser) {
        // 用戶已存在，檢查是否已簽到
        db.get('SELECT id FROM checkins WHERE user_id = ? AND event_id = ?', 
          [existingUser.id, event.id], (err, existingCheckin) => {
          if (err) {
            return res.status(500).render('error', { message: '數據庫錯誤' });
          }
          
          if (existingCheckin) {
            return res.render('error', { message: '您已經簽到過了，無需重複簽到' });
          }
          
          // 更新用戶信息
          db.run('UPDATE users SET name = ?, organization = ?, department = ?, position = ?, id_number = ?, birth_date = ? WHERE id = ?',
            [name, organization, department, position, id_number, birth_date, existingUser.id], function(err) {
            if (err) {
              return res.status(500).render('error', { message: '更新用戶信息失敗' });
            }
            
            // 記錄簽到
            db.run('INSERT INTO checkins (user_id, event_id, admin_id) VALUES (?, ?, ?)', 
              [existingUser.id, event.id, event.admin_id], (err) => {
              if (err) {
                return res.status(500).render('error', { message: '簽到失敗' });
              }
              
              res.render('success', { name, event: event.title });
            });
          });
        });
      } else {
        // 新用戶，創建用戶記錄
        db.run('INSERT INTO users (name, email, organization, department, position, id_number, birth_date) VALUES (?, ?, ?, ?, ?, ?, ?)', 
          [name, email, organization, department, position, id_number, birth_date], function(err) {
          if (err) {
            return res.status(500).render('error', { message: '創建用戶失敗' });
          }
          
          const userId = this.lastID;
          
          // 記錄簽到
          db.run('INSERT INTO checkins (user_id, event_id, admin_id) VALUES (?, ?, ?)', 
            [userId, event.id, event.admin_id], (err) => {
            if (err) {
              return res.status(500).render('error', { message: '簽到失敗' });
            }
            
            res.render('success', { name, event: event.title });
          });
        });
      }
    });
  });
});

// 路由 - 查看簽到記錄
app.get('/events/:eventId/checkins', (req, res) => {
  const eventId = req.params.eventId;
  
  // 先獲取活動資訊
  db.get('SELECT * FROM events WHERE id = ?', [eventId], (err, event) => {
    if (err) {
      return res.status(500).send('數據庫錯誤');
    }
    
    if (!event) {
      return res.status(404).render('error', { message: '活動不存在' });
    }
    
    // 再獲取簽到記錄
    const query = `
      SELECT users.name, users.email, users.organization, users.department, users.position, 
             users.id_number, users.birth_date, checkins.checkin_time 
      FROM checkins 
      JOIN users ON checkins.user_id = users.id 
      WHERE checkins.event_id = ? 
      ORDER BY checkins.checkin_time DESC
    `;
    
    db.all(query, [eventId], (err, checkins) => {
      if (err) {
        return res.status(500).send('數據庫錯誤');
      }
      
      res.render('checkins', { checkins, event });
    });
  });
});

// 路由 - 導出簽到記錄
app.get('/events/:eventId/checkins/export', (req, res) => {
  const eventId = req.params.eventId;
  const format = req.query.format || 'csv'; // csv 或 excel
  
  const query = `
    SELECT users.name, users.email, users.organization, users.department, users.position, 
           checkins.checkin_time 
    FROM checkins 
    JOIN users ON checkins.user_id = users.id 
    WHERE checkins.event_id = ? 
    ORDER BY checkins.checkin_time DESC
  `;
  
  db.all(query, [eventId], (err, checkins) => {
    if (err) {
      return res.status(500).send('數據庫錯誤');
    }
    
    if (format === 'csv') {
      // 導出CSV格式
      const csvHeader = '姓名,Email,機關/單位,部門,職稱,簽到時間\n';
      const csvData = checkins.map(row => 
        `"${row.name}","${row.email}","${row.organization || ''}","${row.department || ''}","${row.position || ''}","${row.checkin_time}"`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="簽到記錄_${eventId}_${moment().format('YYYY-MM-DD')}.csv"`);
      res.send('\uFEFF' + csvHeader + csvData); // \uFEFF 是UTF-8 BOM，確保Excel正確識別中文
    } else {
      // 導出Excel格式（簡單的HTML表格格式）
      const htmlHeader = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" 
              xmlns:x="urn:schemas-microsoft-com:office:excel" 
              xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8">
          <style>
            table { border-collapse: collapse; }
            th, td { border: 1px solid black; padding: 8px; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <table>
            <tr>
              <th>姓名</th>
              <th>Email</th>
              <th>機關/單位</th>
              <th>部門</th>
              <th>職稱</th>
              <th>簽到時間</th>
            </tr>
      `;
      
      const htmlRows = checkins.map(row => `
        <tr>
          <td>${row.name}</td>
          <td>${row.email}</td>
          <td>${row.organization || ''}</td>
          <td>${row.department || ''}</td>
          <td>${row.position || ''}</td>
          <td>${row.checkin_time}</td>
        </tr>
      `).join('');
      
      const htmlFooter = `
          </table>
        </body>
        </html>
      `;
      
      res.setHeader('Content-Type', 'application/vnd.ms-excel; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="簽到記錄_${eventId}_${moment().format('YYYY-MM-DD')}.xls"`);
      res.send(htmlHeader + htmlRows + htmlFooter);
    }
  });
});

// 路由 - 404處理
app.use((req, res) => {
  res.status(404).render('error', { message: '頁面不存在' });
});

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { message: '系統錯誤，請稍後再試' });
});

// 啟動服務器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服務器運行在 http://localhost:${PORT}`);

const bodyParser = require('body-parser');
const path = require('path');
const QRCode = require('qrcode');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const flash = require('connect-flash');
const fs = require('fs');

// 初始化應用
const app = express();
const port = process.env.PORT || 3000;

// 設置視圖引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 中間件
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// 設置會話
app.use(session({
  secret: process.env.SESSION_SECRET || 'qr-checkin-system-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    maxAge: parseInt(process.env.SESSION_MAX_AGE) || 3600000, // 1小時
    secure: process.env.NODE_ENV === 'production' // 生產環境使用 HTTPS
  },
  name: 'checkin.sid'
}));

// 設置閃存訊息
app.use(flash());

// 全局變量中間件
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.admin = req.session.admin || null;
  next();
});

// 初始化數據庫 - 支持環境變量配置
const dbPath = process.env.DB_PATH ? path.resolve(process.env.DB_PATH) : path.join(__dirname, 'checkin.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('無法連接到數據庫', err.message);
  } else {
    console.log(`已連接到SQLite數據庫: ${dbPath}`);
    initDatabase();
  }
});

// 創建數據庫表
function initDatabase() {
  db.serialize(() => {
    // 用戶表
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      id_number TEXT,
      birth_date TEXT,
      organization TEXT,
      department TEXT,
      position TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 活動表
    db.run(`CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      qr_code_id TEXT UNIQUE,
      qr_code_active BOOLEAN DEFAULT 1,
      qr_code_updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      start_time DATETIME,
      end_time DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 簽到記錄表
    db.run(`CREATE TABLE IF NOT EXISTS checkins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      event_id INTEGER,
      checkin_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (event_id) REFERENCES events (id)
    )`);
    
    // 創建管理者表
    db.run(`CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL, -- 'super' 或 'normal'
      status TEXT NOT NULL, -- 'pending', 'approved', 'disabled', 'rejected'
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      approved_by INTEGER,
      approved_at TEXT,
      FOREIGN KEY (approved_by) REFERENCES admins (id)
    )`, function(err) {
      if (err) {
        console.error('創建管理者表錯誤:', err.message);
        return;
      }
      
      // 檢查是否已有超級管理者
      db.get("SELECT * FROM admins WHERE role = 'super' LIMIT 1", (err, admin) => {
        if (err) {
          console.error('查詢超級管理者錯誤:', err.message);
          return;
        }
        
        // 如果沒有超級管理者，創建一個默認的
        if (!admin) {
          // 創建默認超級管理者 (用戶名: superadmin, 密碼: admin123)
          const hashedPassword = bcrypt.hashSync('admin123', 10);
          
          db.run(`INSERT INTO admins (username, password, email, name, role, status) 
                  VALUES (?, ?, ?, ?, ?, ?)`, 
                  ['superadmin', hashedPassword, 'admin@example.com', '超級管理者', 'super', 'approved'], 
                  function(err) {
                    if (err) {
                      console.error('創建超級管理者時出錯:', err.message);
                    } else {
                      console.log('已創建默認超級管理者，用戶名: superadmin, 密碼: admin123');
                    }
                  });
        }
      });
    });
  });
}

// 路由 - 首頁
// 首頁路由
app.get('/', (req, res) => {
  res.render('index');
});

// 管理者認證中間件
const isAuthenticated = (req, res, next) => {
  if (req.session.admin) {
    return next();
  }
  req.flash('error_msg', '請先登入');
  res.redirect('/admin/login');
};

// 超級管理者認證中間件
const isSuperAdmin = (req, res, next) => {
  if (req.session.admin && req.session.admin.role === 'super') {
    return next();
  }
  req.flash('error_msg', '需要超級管理者權限');
  res.redirect('/admin/dashboard');
};

// 管理者登入頁面
app.get('/admin/login', (req, res) => {
  if (req.session.admin) {
    return res.redirect('/admin/dashboard');
  }
  res.render('admin-login', { 
    error_msg: req.flash('error_msg'),
    success_msg: req.flash('success_msg')
  });
});

// 管理者登入處理
app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  db.get('SELECT * FROM admins WHERE username = ?', [username], (err, admin) => {
    if (err) {
      req.flash('error_msg', '登入時發生錯誤');
      return res.redirect('/admin/login');
    }
    
    if (!admin) {
      req.flash('error_msg', '用戶名或密碼錯誤');
      return res.redirect('/admin/login');
    }
    
    if (admin.status !== 'approved') {
      req.flash('error_msg', '您的帳號尚未被核准或已被停用');
      return res.redirect('/admin/login');
    }
    
    bcrypt.compare(password, admin.password, (err, isMatch) => {
      if (err) {
        req.flash('error_msg', '登入時發生錯誤');
        return res.redirect('/admin/login');
      }
      
      if (!isMatch) {
        req.flash('error_msg', '用戶名或密碼錯誤');
        return res.redirect('/admin/login');
      }
      
      // 登入成功，設置會話
      req.session.admin = {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        email: admin.email,
        role: admin.role
      };
      
      req.flash('success_msg', '登入成功');
      res.redirect('/admin/dashboard');
    });
  });
});

// 管理者登出
app.get('/admin/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

// 管理者註冊頁面
app.get('/admin/register', (req, res) => {
  if (req.session.admin) {
    return res.redirect('/admin/dashboard');
  }
  res.render('admin-register');
});

// 管理者註冊處理
app.post('/admin/register', (req, res) => {
  const { username, password, confirm_password, name, email, reason } = req.body;
  
  // 驗證
  if (password !== confirm_password) {
    req.flash('error_msg', '密碼與確認密碼不一致');
    return res.redirect('/admin/register');
  }
  
  if (password.length < 8) {
    req.flash('error_msg', '密碼長度必須至少8位字元');
    return res.redirect('/admin/register');
  }
  
  // 檢查用戶名是否已存在
  db.get('SELECT * FROM admins WHERE username = ?', [username], (err, admin) => {
    if (err) {
      req.flash('error_msg', '註冊時發生錯誤');
      return res.redirect('/admin/register');
    }
    
    if (admin) {
      req.flash('error_msg', '此用戶名已被使用');
      return res.redirect('/admin/register');
    }
    
    // 加密密碼
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        req.flash('error_msg', '註冊時發生錯誤');
        return res.redirect('/admin/register');
      }
      
      const newAdmin = {
        id: uuidv4(),
        username,
        password: hashedPassword,
        name,
        email,
        role: 'normal',
        status: 'pending',
        created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
        reason
      };
      
      db.run(`INSERT INTO admins (id, username, password, name, email, role, status, created_at, reason) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [newAdmin.id, newAdmin.username, newAdmin.password, newAdmin.name, 
         newAdmin.email, newAdmin.role, newAdmin.status, newAdmin.created_at, newAdmin.reason],
        function(err) {
          if (err) {
            req.flash('error_msg', '註冊時發生錯誤');
            return res.redirect('/admin/register');
          }
          
          req.flash('success_msg', '註冊申請已提交，請等待超級管理者審核');
          res.redirect('/admin/login');
        }
      );
    });
  });
});

// 管理者儀表板
app.get('/admin/dashboard', isAuthenticated, (req, res) => {
  // 獲取統計數據
  let eventCountQuery;
  let checkinCountQuery;
  let params = [];
  
  if (req.session.admin.role === 'super') {
    // 超級管理員可以看到所有統計
    eventCountQuery = 'SELECT COUNT(*) as eventCount FROM events';
    checkinCountQuery = 'SELECT COUNT(*) as checkinCount FROM checkins';
  } else {
    // 普通管理員只能看到自己創建活動的統計
    eventCountQuery = 'SELECT COUNT(*) as eventCount FROM events WHERE admin_id = ?';
    checkinCountQuery = `SELECT COUNT(*) as checkinCount 
                         FROM checkins c 
                         JOIN events e ON c.event_id = e.id 
                         WHERE e.admin_id = ?`;
    params = [req.session.admin.id];
  }
  
  db.get(eventCountQuery, params, (err, eventStats) => {
    if (err) {
      req.flash('error_msg', '獲取數據時發生錯誤');
      return res.render('admin-dashboard', { 
        stats: { eventCount: 0, userCount: 0, checkinCount: 0 },
        recentEvents: [],
        recentCheckins: [],
        pendingAdmins: []
      });
    }
    
    db.get('SELECT COUNT(*) as userCount FROM users', [], (err, userStats) => {
      if (err) {
        req.flash('error_msg', '獲取數據時發生錯誤');
        return res.render('admin-dashboard', { 
          stats: { eventCount: eventStats.eventCount, userCount: 0, checkinCount: 0 },
          recentEvents: [],
          recentCheckins: [],
          pendingAdmins: []
        });
      }
      
      db.get(checkinCountQuery, params, (err, checkinStats) => {
        if (err) {
          req.flash('error_msg', '獲取數據時發生錯誤');
          return res.render('admin-dashboard', { 
            stats: { eventCount: eventStats.eventCount, userCount: userStats.userCount, checkinCount: 0 },
            recentEvents: [],
            recentCheckins: [],
            pendingAdmins: []
          });
        }
        
        // 獲取最近活動
        let recentEventsQuery;
        let recentEventsParams = [];
        
        if (req.session.admin.role === 'super') {
          recentEventsQuery = `SELECT e.id, e.title, COUNT(c.id) as checkin_count 
                              FROM events e 
                              LEFT JOIN checkins c ON e.id = c.event_id 
                              GROUP BY e.id 
                              ORDER BY e.created_at DESC LIMIT 5`;
        } else {
          recentEventsQuery = `SELECT e.id, e.title, COUNT(c.id) as checkin_count 
                              FROM events e 
                              LEFT JOIN checkins c ON e.id = c.event_id 
                              WHERE e.admin_id = ?
                              GROUP BY e.id 
                              ORDER BY e.created_at DESC LIMIT 5`;
          recentEventsParams = [req.session.admin.id];
        }
        
        db.all(recentEventsQuery, recentEventsParams, (err, recentEvents) => {
          if (err) recentEvents = [];
          
          // 獲取最近簽到
          let recentCheckinsQuery;
          let recentCheckinsParams = [];
          
          if (req.session.admin.role === 'super') {
            recentCheckinsQuery = `SELECT c.id, u.name as user_name, e.title as event_name, c.checkin_time 
                                  FROM checkins c 
                                  JOIN users u ON c.user_id = u.id 
                                  JOIN events e ON c.event_id = e.id 
                                  ORDER BY c.checkin_time DESC LIMIT 5`;
          } else {
            recentCheckinsQuery = `SELECT c.id, u.name as user_name, e.title as event_name, c.checkin_time 
                                  FROM checkins c 
                                  JOIN users u ON c.user_id = u.id 
                                  JOIN events e ON c.event_id = e.id 
                                  WHERE e.admin_id = ?
                                  ORDER BY c.checkin_time DESC LIMIT 5`;
            recentCheckinsParams = [req.session.admin.id];
          }
          
          db.all(recentCheckinsQuery, recentCheckinsParams, (err, recentCheckins) => {
            if (err) recentCheckins = [];
            
            // 如果是超級管理者，獲取待審核申請
            let pendingAdmins = [];
            if (req.session.admin.role === 'super') {
              db.all(`SELECT * FROM admins WHERE status = 'pending' ORDER BY created_at DESC`, [], (err, results) => {
                if (!err) pendingAdmins = results;
                
                res.render('admin-dashboard', {
                  stats: {
                    eventCount: eventStats.eventCount,
                    userCount: userStats.userCount,
                    checkinCount: checkinStats.checkinCount
                  },
                  recentEvents,
                  recentCheckins,
                  pendingAdmins
                });
              });
            } else {
              res.render('admin-dashboard', {
                stats: {
                  eventCount: eventStats.eventCount,
                  userCount: userStats.userCount,
                  checkinCount: checkinStats.checkinCount
                },
                recentEvents,
                recentCheckins,
                pendingAdmins
              });
            }
          });
        });
      });
    });
  });
});

// 待審核管理者申請頁面
app.get('/admin/pending', isAuthenticated, isSuperAdmin, (req, res) => {
  db.all(`SELECT * FROM admins WHERE status = 'pending' ORDER BY created_at DESC`, [], (err, pendingAdmins) => {
    if (err) {
      req.flash('error_msg', '獲取數據時發生錯誤');
      return res.render('admin-pending', { pendingAdmins: [] });
    }
    
    res.render('admin-pending', { pendingAdmins });
  });
});

// 核准管理者申請
app.post('/admin/approve/:id', isAuthenticated, isSuperAdmin, (req, res) => {
  const adminId = req.params.id;
  const superAdminId = req.session.admin.id;
  const approvedAt = moment().format('YYYY-MM-DD HH:mm:ss');
  
  db.run(`UPDATE admins SET status = 'approved', approved_by = ?, approved_at = ? WHERE id = ?`,
    [superAdminId, approvedAt, adminId],
    function(err) {
      if (err) {
        req.flash('error_msg', '核准申請時發生錯誤');
      } else {
        req.flash('success_msg', '已核准管理者申請');
      }
      res.redirect('/admin/pending');
    }
  );
});

// 拒絕管理者申請
app.post('/admin/reject/:id', isAuthenticated, isSuperAdmin, (req, res) => {
  const adminId = req.params.id;
  
  db.run(`DELETE FROM admins WHERE id = ? AND status = 'pending'`, [adminId], function(err) {
    if (err) {
      req.flash('error_msg', '拒絕申請時發生錯誤');
    } else {
      req.flash('success_msg', '已拒絕管理者申請');
    }
    res.redirect('/admin/pending');
  });
});

// 管理者帳號管理頁面
app.get('/admin/admins', isAuthenticated, isSuperAdmin, (req, res) => {
  db.all(`SELECT * FROM admins ORDER BY role DESC, created_at DESC`, [], (err, admins) => {
    if (err) {
      req.flash('error_msg', '獲取數據時發生錯誤');
      return res.render('admin-admins', { admins: [] });
    }
    
    res.render('admin-admins', { admins });
  });
});

// 停用管理者帳號
app.post('/admin/disable/:id', isAuthenticated, isSuperAdmin, (req, res) => {
  const adminId = req.params.id;
  
  db.run(`UPDATE admins SET status = 'disabled' WHERE id = ? AND role != 'super'`, [adminId], function(err) {
    if (err) {
      req.flash('error_msg', '停用帳號時發生錯誤');
    } else {
      req.flash('success_msg', '已停用管理者帳號');
    }
    res.redirect('/admin/admins');
  });
});

// 啟用管理者帳號
app.post('/admin/enable/:id', isAuthenticated, isSuperAdmin, (req, res) => {
  const adminId = req.params.id;
  
  db.run(`UPDATE admins SET status = 'approved' WHERE id = ?`, [adminId], function(err) {
    if (err) {
      req.flash('error_msg', '啟用帳號時發生錯誤');
    } else {
      req.flash('success_msg', '已啟用管理者帳號');
    }
    res.redirect('/admin/admins');
  });
});

// 刪除管理者帳號
app.post('/admin/delete/:id', isAuthenticated, isSuperAdmin, (req, res) => {
  const adminId = req.params.id;
  
  db.run(`DELETE FROM admins WHERE id = ? AND role != 'super'`, [adminId], function(err) {
    if (err) {
      req.flash('error_msg', '刪除帳號時發生錯誤');
    } else {
      req.flash('success_msg', '已刪除管理者帳號');
    }
    res.redirect('/admin/admins');
  });
});

// 路由 - 管理員頁面（活動管理）
app.get('/admin', isAuthenticated, (req, res) => {
  // 根據管理員角色獲取不同的活動
  let query;
  let params = [];
  
  if (req.session.admin.role === 'super') {
    // 超級管理員可以看到所有活動
    query = 'SELECT * FROM events ORDER BY created_at DESC';
  } else {
    // 普通管理員只能看到自己創建的活動
    query = 'SELECT * FROM events WHERE admin_id = ? ORDER BY created_at DESC';
    params = [req.session.admin.id];
  }
  
  db.all(query, params, (err, events) => {
    if (err) {
      return res.status(500).send('數據庫錯誤');
    }
    res.render('admin', { events, admin: req.session.admin });
  });
});



// 路由 - 簽到記錄頁面
app.get('/admin/checkins', isAuthenticated, (req, res) => {
  let query;
  let params = [];
  
  if (req.session.admin.role === 'super') {
    // 超級管理員可以看到所有簽到記錄
    query = `SELECT 
              c.*,
              e.title as event_name,
              u.name as user_name,
              u.email as user_email,
              u.organization as user_organization,
              u.department as user_department,
              u.position as user_position,
              datetime(c.checkin_time) as checkin_time
            FROM checkins c
            JOIN events e ON c.event_id = e.id
            JOIN users u ON c.user_id = u.id
            ORDER BY c.checkin_time DESC`;
  } else {
    // 普通管理員只能看到自己創建活動的簽到記錄
    query = `SELECT 
              c.*,
              e.title as event_name,
              u.name as user_name,
              u.email as user_email,
              u.organization as user_organization,
              u.department as user_department,
              u.position as user_position,
              datetime(c.checkin_time) as checkin_time
            FROM checkins c
            JOIN events e ON c.event_id = e.id
            JOIN users u ON c.user_id = u.id
            WHERE e.admin_id = ?
            ORDER BY c.checkin_time DESC`;
    params = [req.session.admin.id];
  }
  
  db.all(query, params, (err, checkins) => {
    if (err) {
      req.flash('error_msg', '獲取簽到記錄時發生錯誤');
      return res.render('admin-checkins', { checkins: [], admin: req.session.admin });
    }
    res.render('admin-checkins', { checkins, admin: req.session.admin });
  });
});

// 路由 - 創建新活動
app.post('/events', isAuthenticated, (req, res) => {
  const { title, description, start_time, end_time } = req.body;
  const qrCodeId = uuidv4();
  const adminId = req.session.admin.id; // 獲取當前登入管理員的ID
  
  db.run(
    'INSERT INTO events (title, description, qr_code_id, start_time, end_time, admin_id) VALUES (?, ?, ?, ?, ?, ?)',
    [title, description, qrCodeId, start_time, end_time, adminId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.redirect('/admin');
    }
  );
});

// 路由 - 獲取活動QR碼
app.get('/events/:id/qrcode', (req, res) => {
  const eventId = req.params.id;
  
  // 檢查是否已登錄
  if (!req.session.admin) {
    return res.redirect('/admin/login');
  }
  
  db.get('SELECT * FROM events WHERE id = ?', [eventId], (err, event) => {
    if (err || !event) {
      return res.status(404).send('活動未找到');
    }
    
    // 檢查權限 - 一般管理員只能查看自己創建的活動
    if (req.session.admin.role !== 'super_admin' && event.admin_id !== req.session.admin.id) {
      return res.status(403).render('error', { message: '您無權查看此活動的QR碼' });
    }
    
    // 生成包含簽到URL的QR碼
    const checkinUrl = `${req.protocol}://${req.get('host')}/checkin/${event.qr_code_id}`;
    
    QRCode.toDataURL(checkinUrl, (err, url) => {
      if (err) {
        return res.status(500).send('生成QR碼錯誤');
      }
      
      // 傳遞管理員信息到模板
      res.render('qrcode', { 
        event, 
        qrCodeUrl: url, 
        checkinUrl,
        admin: req.session.admin 
      });
    });
  });
});

// 路由 - 更新活動QR碼
app.post('/events/:id/update-qrcode', (req, res) => {
  const eventId = req.params.id;
  
  db.get('SELECT * FROM events WHERE id = ?', [eventId], (err, event) => {
    if (err || !event) {
      return res.status(404).json({ error: '活動未找到' });
    }
    
    // 生成新的QR碼ID
    const newQrCodeId = uuidv4();
    const now = moment().format('YYYY-MM-DD HH:mm:ss');
    
    // 更新數據庫中的QR碼ID和更新時間
    db.run(
      'UPDATE events SET qr_code_id = ?, qr_code_updated_at = ? WHERE id = ?',
      [newQrCodeId, now, eventId],
      function(err) {
        if (err) {
          return res.status(500).json({ error: '更新QR碼失敗' });
        }
        
        res.redirect(`/events/${eventId}/qrcode`);
      }
    );
  });
});

// 路由 - 簽到頁面
app.get('/checkin/:qrCodeId', (req, res) => {
  const qrCodeId = req.params.qrCodeId;
  
  db.get('SELECT * FROM events WHERE qr_code_id = ?', [qrCodeId], (err, event) => {
    if (err || !event) {
      return res.status(404).render('error', { message: '無效的QR碼或活動不存在' });
    }
    
    res.render('checkin', { event });
  });
});

// 路由 - 處理簽到
app.post('/checkin/:qrCodeId', (req, res) => {
  const qrCodeId = req.params.qrCodeId;
  const { name, email, organization, department, position, id_number, birth_date } = req.body;
  
  db.get('SELECT * FROM events WHERE qr_code_id = ?', [qrCodeId], (err, event) => {
    if (err || !event) {
      return res.status(404).render('error', { message: '無效的QR碼或活動不存在' });
    }
    
    // 檢查活動是否屬於當前管理員（僅限一般管理員）
    if (req.session.admin.role !== 'super_admin' && event.admin_id !== req.session.admin.id) {
      return res.status(403).render('error', { message: '您無權為此活動進行簽到' });
    }
    
    // 檢查活動是否在有效時間內
    const now = moment();
    const startTime = moment(event.start_time);
    const endTime = moment(event.end_time);
    
    if (now < startTime || now > endTime) {
      return res.render('error', { message: '活動不在有效時間內，無法簽到' });
    }
    
    // 檢查用戶是否已存在
    db.get('SELECT id FROM users WHERE email = ?', [email], (err, existingUser) => {
      if (err) {
        return res.status(500).render('error', { message: '數據庫錯誤' });
      }
      
      if (existingUser) {
        // 用戶已存在，檢查是否已簽到
        db.get('SELECT id FROM checkins WHERE user_id = ? AND event_id = ?', 
          [existingUser.id, event.id], (err, existingCheckin) => {
          if (err) {
            return res.status(500).render('error', { message: '數據庫錯誤' });
          }
          
          if (existingCheckin) {
            return res.render('error', { message: '您已經簽到過了，無需重複簽到' });
          }
          
          // 更新用戶信息
          db.run('UPDATE users SET name = ?, organization = ?, department = ?, position = ?, id_number = ?, birth_date = ? WHERE id = ?',
            [name, organization, department, position, id_number, birth_date, existingUser.id], function(err) {
            if (err) {
              return res.status(500).render('error', { message: '更新用戶信息失敗' });
            }
            
            // 記錄簽到
            db.run('INSERT INTO checkins (user_id, event_id, admin_id) VALUES (?, ?, ?)', 
              [existingUser.id, event.id, event.admin_id], (err) => {
              if (err) {
                return res.status(500).render('error', { message: '簽到失敗' });
              }
              
              res.render('success', { name, event: event.title });
            });
          });
        });
      } else {
        // 新用戶，創建用戶記錄
        db.run('INSERT INTO users (name, email, organization, department, position, id_number, birth_date) VALUES (?, ?, ?, ?, ?, ?, ?)', 
          [name, email, organization, department, position, id_number, birth_date], function(err) {
          if (err) {
            return res.status(500).render('error', { message: '創建用戶失敗' });
          }
          
          const userId = this.lastID;
          
          // 記錄簽到
          db.run('INSERT INTO checkins (user_id, event_id, admin_id) VALUES (?, ?, ?)', 
            [userId, event.id, event.admin_id], (err) => {
            if (err) {
              return res.status(500).render('error', { message: '簽到失敗' });
            }
            
            res.render('success', { name, event: event.title });
          });
        });
      }
    });
  });
});

// 路由 - 查看簽到記錄
app.get('/events/:eventId/checkins', (req, res) => {
  const eventId = req.params.eventId;
  
  // 先獲取活動資訊
  db.get('SELECT * FROM events WHERE id = ?', [eventId], (err, event) => {
    if (err) {
      return res.status(500).send('數據庫錯誤');
    }
    
    if (!event) {
      return res.status(404).render('error', { message: '活動不存在' });
    }
    
    // 再獲取簽到記錄
    const query = `
      SELECT users.name, users.email, users.organization, users.department, users.position, 
             users.id_number, users.birth_date, checkins.checkin_time 
      FROM checkins 
      JOIN users ON checkins.user_id = users.id 
      WHERE checkins.event_id = ? 
      ORDER BY checkins.checkin_time DESC
    `;
    
    db.all(query, [eventId], (err, checkins) => {
      if (err) {
        return res.status(500).send('數據庫錯誤');
      }
      
      res.render('checkins', { checkins, event });
    });
  });
});

// 路由 - 導出簽到記錄
app.get('/events/:eventId/checkins/export', (req, res) => {
  const eventId = req.params.eventId;
  const format = req.query.format || 'csv'; // csv 或 excel
  
  const query = `
    SELECT users.name, users.email, users.organization, users.department, users.position, 
           checkins.checkin_time 
    FROM checkins 
    JOIN users ON checkins.user_id = users.id 
    WHERE checkins.event_id = ? 
    ORDER BY checkins.checkin_time DESC
  `;
  
  db.all(query, [eventId], (err, checkins) => {
    if (err) {
      return res.status(500).send('數據庫錯誤');
    }
    
    if (format === 'csv') {
      // 導出CSV格式
      const csvHeader = '姓名,Email,機關/單位,部門,職稱,簽到時間\n';
      const csvData = checkins.map(row => 
        `"${row.name}","${row.email}","${row.organization || ''}","${row.department || ''}","${row.position || ''}","${row.checkin_time}"`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="簽到記錄_${eventId}_${moment().format('YYYY-MM-DD')}.csv"`);
      res.send('\uFEFF' + csvHeader + csvData); // \uFEFF 是UTF-8 BOM，確保Excel正確識別中文
    } else {
      // 導出Excel格式（簡單的HTML表格格式）
      const htmlHeader = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" 
              xmlns:x="urn:schemas-microsoft-com:office:excel" 
              xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8">
          <style>
            table { border-collapse: collapse; }
            th, td { border: 1px solid black; padding: 8px; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <table>
            <tr>
              <th>姓名</th>
              <th>Email</th>
              <th>機關/單位</th>
              <th>部門</th>
              <th>職稱</th>
              <th>簽到時間</th>
            </tr>
      `;
      
      const htmlRows = checkins.map(row => `
        <tr>
          <td>${row.name}</td>
          <td>${row.email}</td>
          <td>${row.organization || ''}</td>
          <td>${row.department || ''}</td>
          <td>${row.position || ''}</td>
          <td>${row.checkin_time}</td>
        </tr>
      `).join('');
      
      const htmlFooter = `
          </table>
        </body>
        </html>
      `;
      
      res.setHeader('Content-Type', 'application/vnd.ms-excel; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="簽到記錄_${eventId}_${moment().format('YYYY-MM-DD')}.xls"`);
      res.send(htmlHeader + htmlRows + htmlFooter);
    }
  });
});

// 路由 - 404處理
app.use((req, res) => {
  res.status(404).render('error', { message: '頁面不存在' });
});

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { message: '系統錯誤，請稍後再試' });
});

// 啟動服務器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服務器運行在 http://localhost:${PORT}`);