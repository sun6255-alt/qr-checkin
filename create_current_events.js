const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('checkin_system.db');

console.log('創建當前時間有效的活動...\n');

// 獲取當前時間並創建有效的活動
const now = new Date();
const startTime = new Date(now.getTime() - 60 * 60 * 1000); // 1小時前開始
const endTime = new Date(now.getTime() + 60 * 60 * 1000);   // 1小時後結束

db.serialize(() => {
  // 管理員1的當前活動
  db.run(`INSERT INTO events (title, description, start_time, end_time, location, qr_code_id, admin_id) 
          VALUES (?, ?, ?, ?, ?, ?, ?)`, 
          ['管理員1的當前活動', '這是管理員1創建的當前有效活動', 
           startTime.toISOString(), endTime.toISOString(), 
           '會議室A', 'current001', 2]);
  
  // 管理員2的當前活動
  db.run(`INSERT INTO events (title, description, start_time, end_time, location, qr_code_id, admin_id) 
          VALUES (?, ?, ?, ?, ?, ?, ?)`, 
          ['管理員2的當前活動', '這是管理員2創建的當前有效活動', 
           startTime.toISOString(), endTime.toISOString(), 
           '會議室B', 'current002', 3]);
  
  // 超級管理員的當前活動
  db.run(`INSERT INTO events (title, description, start_time, end_time, location, qr_code_id, admin_id) 
          VALUES (?, ?, ?, ?, ?, ?, ?)`, 
          ['超級管理員的當前活動', '這是超級管理員創建的當前有效活動', 
           startTime.toISOString(), endTime.toISOString(), 
           '會議室C', 'current003', 1]);
});

setTimeout(() => {
  // 顯示所有當前活動
  db.all(`
    SELECT e.id, e.title, e.start_time, e.end_time, e.location, e.qr_code_id,
           a.username, a.name as admin_name, a.role as admin_role
    FROM events e
    JOIN admins a ON e.admin_id = a.id
    WHERE e.start_time <= datetime('now') AND e.end_time >= datetime('now')
    ORDER BY e.id
  `, (err, events) => {
    if (err) {
      console.error('查詢當前活動錯誤:', err);
      return;
    }
    
    console.log('創建的當前有效活動:');
    events.forEach(event => {
      console.log(`活動ID: ${event.id}`);
      console.log(`  標題: ${event.title}`);
      console.log(`  時間: ${event.start_time} - ${event.end_time}`);
      console.log(`  地點: ${event.location}`);
      console.log(`  QR碼: ${event.qr_code_id}`);
      console.log(`  創建者: ${event.admin_name} (${event.username}) - ${event.admin_role}`);
      console.log('');
    });
    
    db.close();
    console.log('當前有效活動創建完成！');
    console.log('現在可以測試實際簽到功能了！');
  });
}, 1000);