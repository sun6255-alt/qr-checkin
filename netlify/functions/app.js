const express = require('express');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const flash = require('connect-flash');

const app = express();

// 設置模板引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../../views'));

// 中間件
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../../public')));

// 設置會話
app.use(session({
  secret: 'qr-checkin-system-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 3600000 } // 1小時
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

// 初始化數據庫 - 使用絕對路徑
const dbPath = path.join('/tmp', 'checkin.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('無法連接到數據庫', err.message);
  } else {
    console.log('已連接到SQLite數據庫');
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
    
    // 管理者表
    db.run(`CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL, -- 'super' 或 'normal'
      status TEXT NOT NULL, -- 'pending', 'approved', 'disabled', 'rejected'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      approved_by INTEGER,
      approved_at DATETIME,
      FOREIGN KEY (approved_by) REFERENCES admins (id)
    )`, function(err) {
      if (err) {
        console.error('創建管理者表錯誤:', err.message);
        return;
      }
      
      // 檢查是否已有超級管理者，如果沒有則創建默認超級管理者
      db.get("SELECT * FROM admins WHERE role = 'super' LIMIT 1", (err, admin) => {
        if (err) {
          console.error('檢查超級管理者時出錯:', err);
          return;
        }
        
        if (!admin) {
          // 創建默認超級管理者 (用戶名: superadmin, 密碼: admin123)
          const hashedPassword = bcrypt.hashSync('admin123', 10);
          
          db.run(`INSERT INTO admins (username, password, email, name, role, status) 
                  VALUES (?, ?, ?, ?, ?, ?)`, 
                  ['superadmin', hashedPassword, 'admin@example.com', '超級管理者', 'super', 'approved'], 
                  function(err) {
                    if (err) {
                      console.error('創建超級管理者時出錯:', err);
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
app.get('/', (req, res) => {
  res.render('index');
});

// 路由 - 管理員頁面
app.get('/admin', (req, res) => {
  // 獲取所有活動
  db.all('SELECT * FROM events ORDER BY created_at DESC', [], (err, events) => {
    if (err) {
      return res.status(500).send('數據庫錯誤');
    }
    res.render('admin', { events });
  });
});

// 路由 - 用戶管理頁面
app.get('/admin/users', (req, res) => {
  db.all('SELECT * FROM users ORDER BY created_at DESC', [], (err, users) => {
    if (err) {
      return res.status(500).send('數據庫錯誤');
    }
    res.render('admin-users', { users });
  });
});

// 路由 - 簽到記錄頁面
app.get('/admin/checkins', (req, res) => {
  db.all(`SELECT 
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
          ORDER BY c.checkin_time DESC`, [], (err, checkins) => {
    if (err) {
      return res.status(500).send('數據庫錯誤');
    }
    res.render('admin-checkins', { checkins });
  });
});

// 路由 - 創建新活動
app.post('/events', (req, res) => {
  const { title, description, start_time, end_time } = req.body;
  const qrCodeId = uuidv4();
  
  db.run(
    'INSERT INTO events (title, description, qr_code_id, start_time, end_time) VALUES (?, ?, ?, ?, ?)',
    [title, description, qrCodeId, start_time, end_time],
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
  
  db.get('SELECT * FROM events WHERE id = ?', [eventId], (err, event) => {
    if (err || !event) {
      return res.status(404).send('活動未找到');
    }
    
    // 生成包含簽到URL的QR碼
    const checkinUrl = `${req.protocol}://${req.get('host')}/checkin/${event.qr_code_id}`;
    
    QRCode.toDataURL(checkinUrl, (err, url) => {
      if (err) {
        return res.status(500).send('生成QR碼錯誤');
      }
      res.render('qrcode', { event, qrCodeUrl: url, checkinUrl });
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
            db.run('INSERT INTO checkins (user_id, event_id) VALUES (?, ?)', 
              [existingUser.id, event.id], (err) => {
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
          db.run('INSERT INTO checkins (user_id, event_id) VALUES (?, ?)', 
            [userId, event.id], (err) => {
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
app.get('/checkins/:eventId', (req, res) => {
  const eventId = req.params.eventId;
  
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
    
    res.render('checkins', { checkins, eventId });
  });
});

// 路由 - 導出簽到記錄
app.get('/checkins/:eventId/export', (req, res) => {
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

// 導出為Serverless函數
const serverless = require('serverless-http');
module.exports.handler = serverless(app);