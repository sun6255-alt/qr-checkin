// Vercel 優化版本 - 內存數據庫
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const flash = require('connect-flash');

const app = express();

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
    maxAge: parseInt(process.env.SESSION_MAX_AGE) || 3600000,
    secure: false // Vercel 上使用 HTTP
  },
  name: 'checkin.sid'
}));

app.use(flash());

// 全局變量中間件
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.admin = req.session.admin || null;
  next();
});

// 內存數據庫
const memoryDB = {
  users: [],
  events: [],
  checkins: [],
  admins: []
};

// 初始化默認管理員
function initDefaultAdmin() {
  if (memoryDB.admins.length === 0) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    memoryDB.admins.push({
      id: 1,
      username: 'superadmin',
      password: hashedPassword,
      email: 'admin@example.com',
      name: '超級管理者',
      role: 'super',
      status: 'approved',
      created_at: new Date().toISOString()
    });
    console.log('✅ 默認管理員已創建: superadmin / admin123');
  }
}

initDefaultAdmin();

// 路由
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

const isSuperAdmin = (req, res, next) => {
  if (req.session.admin && req.session.admin.role === 'super') {
    return next();
  }
  req.flash('error_msg', '需要超級管理者權限');
  res.redirect('/admin/dashboard');
};

// 登入頁面
app.get('/admin/login', (req, res) => {
  if (req.session.admin) {
    return res.redirect('/admin/dashboard');
  }
  res.render('admin-login', { 
    error_msg: req.flash('error_msg'),
    success_msg: req.flash('success_msg')
  });
});

// 登入處理
app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  const admin = memoryDB.admins.find(a => a.username === username);
  
  if (!admin) {
    req.flash('error_msg', '用戶名或密碼錯誤');
    return res.redirect('/admin/login');
  }
  
  if (admin.status !== 'approved') {
    req.flash('error_msg', '您的帳號尚未被核准或已被停用');
    return res.redirect('/admin/login');
  }
  
  const isMatch = bcrypt.compareSync(password, admin.password);
  if (!isMatch) {
    req.flash('error_msg', '用戶名或密碼錯誤');
    return res.redirect('/admin/login');
  }
  
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

// 登出
app.get('/admin/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

// 儀表板
app.get('/admin/dashboard', isAuthenticated, (req, res) => {
  const stats = {
    eventCount: memoryDB.events.length,
    userCount: memoryDB.users.length,
    checkinCount: memoryDB.checkins.length
  };
  
  const recentEvents = memoryDB.events.slice(-5).reverse();
  const recentCheckins = memoryDB.checkins.slice(-5).reverse();
  
  res.render('admin-dashboard', {
    stats,
    recentEvents,
    recentCheckins,
    pendingAdmins: [],
    admin: req.session.admin
  });
});

// 活動管理
app.get('/admin', isAuthenticated, (req, res) => {
  res.render('admin', { 
    events: memoryDB.events,
    admin: req.session.admin 
  });
});

// 創建活動
app.post('/events', isAuthenticated, (req, res) => {
  const { title, description } = req.body;
  const event = {
    id: memoryDB.events.length + 1,
    title,
    description,
    qr_code_id: uuidv4(),
    qr_code_active: true,
    created_at: new Date().toISOString(),
    admin_id: req.session.admin.id
  };
  
  memoryDB.events.push(event);
  res.redirect('/admin');
});

// QR碼頁面
app.get('/events/:id/qrcode', isAuthenticated, (req, res) => {
  const event = memoryDB.events.find(e => e.id === parseInt(req.params.id));
  
  if (!event) {
    return res.status(404).render('error', { message: '活動不存在' });
  }
  
  const checkinUrl = `${req.protocol}://${req.get('host')}/checkin/${event.qr_code_id}`;
  
  QRCode.toDataURL(checkinUrl, (err, qrCodeDataUrl) => {
    if (err) {
      return res.status(500).render('error', { message: 'QR碼生成失敗' });
    }
    
    res.render('qrcode', {
      event,
      qrCodeDataUrl,
      checkinUrl
    });
  });
});

// 簽到處理
app.post('/checkin/:qrCodeId', (req, res) => {
  const { name, email } = req.body;
  const event = memoryDB.events.find(e => e.qr_code_id === req.params.qrCodeId);
  
  if (!event) {
    return res.status(404).render('error', { message: '活動不存在或QR碼無效' });
  }
  
  if (!event.qr_code_active) {
    return res.status(400).render('error', { message: '此活動的簽到已關閉' });
  }
  
  // 查找或創建用戶
  let user = memoryDB.users.find(u => u.email === email);
  
  if (!user) {
    user = {
      id: memoryDB.users.length + 1,
      name,
      email,
      created_at: new Date().toISOString()
    };
    memoryDB.users.push(user);
  }
  
  // 檢查是否已經簽到
  const existingCheckin = memoryDB.checkins.find(c => 
    c.user_id === user.id && c.event_id === event.id
  );
  
  if (existingCheckin) {
    return res.render('error', { message: '您已經簽到過了' });
  }
  
  // 創建簽到記錄
  const checkin = {
    id: memoryDB.checkins.length + 1,
    user_id: user.id,
    event_id: event.id,
    checkin_time: new Date().toISOString(),
    admin_id: event.admin_id
  };
  
  memoryDB.checkins.push(checkin);
  res.render('success', { name, event: event.title });
});

// 簽到記錄
app.get('/admin/checkins', isAuthenticated, (req, res) => {
  const checkins = memoryDB.checkins.map(checkin => {
    const user = memoryDB.users.find(u => u.id === checkin.user_id);
    const event = memoryDB.events.find(e => e.id === checkin.event_id);
    
    return {
      ...checkin,
      user_name: user ? user.name : '未知用戶',
      user_email: user ? user.email : '',
      event_name: event ? event.title : '未知活動'
    };
  }).reverse();
  
  res.render('admin-checkins', { 
    checkins,
    admin: req.session.admin 
  });
});

// 404處理
app.use((req, res) => {
  res.status(404).render('error', { message: '頁面不存在' });
});

// 錯誤處理
app.use((err, req, res, next) => {
  console.error('❌ 錯誤:', err.stack);
  res.status(500).render('error', { message: '系統錯誤，請稍後再試' });
});

// Vercel 無伺服器函數導出
module.exports = app;