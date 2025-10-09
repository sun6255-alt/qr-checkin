const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('checkin_system.db');

console.log('創建測試活動...\n');

// 創建測試活動
db.serialize(() => {
  // 管理員1的活動
  db.run(`INSERT INTO events (title, description, start_time, end_time, location, qr_code_id, admin_id) 
          VALUES (?, ?, ?, ?, ?, ?, ?)`, 
          ['管理員1的活動A', '這是管理員1創建的第一個活動', 
           '2024-01-15 09:00:00', '2024-01-15 17:00:00', 
           '會議室A', 'qr001', 2]);
  
  db.run(`INSERT INTO events (title, description, start_time, end_time, location, qr_code_id, admin_id) 
          VALUES (?, ?, ?, ?, ?, ?, ?)`, 
          ['管理員1的活動B', '這是管理員1創建的第二個活動', 
           '2024-01-16 09:00:00', '2024-01-16 17:00:00', 
           '會議室B', 'qr002', 2]);
  
  // 管理員2的活動
  db.run(`INSERT INTO events (title, description, start_time, end_time, location, qr_code_id, admin_id) 
          VALUES (?, ?, ?, ?, ?, ?, ?)`, 
          ['管理員2的活動C', '這是管理員2創建的第一個活動', 
           '2024-01-17 09:00:00', '2024-01-17 17:00:00', 
           '會議室C', 'qr003', 3]);
  
  // 超級管理員的活動
  db.run(`INSERT INTO events (title, description, start_time, end_time, location, qr_code_id, admin_id) 
          VALUES (?, ?, ?, ?, ?, ?, ?)`, 
          ['超級管理員的活動D', '這是超級管理員創建的活動', 
           '2024-01-18 09:00:00', '2024-01-18 17:00:00', 
           '會議室D', 'qr004', 1]);
});

setTimeout(() => {
  // 顯示所有活動
  db.all(`
    SELECT e.id, e.title, e.start_time, e.end_time, e.location,
           a.username, a.name as admin_name, a.role as admin_role
    FROM events e
    JOIN admins a ON e.admin_id = a.id
    ORDER BY e.id
  `, (err, events) => {
    if (err) {
      console.error('查詢活動錯誤:', err);
      return;
    }
    
    console.log('創建的活動:');
    events.forEach(event => {
      console.log(`活動ID: ${event.id}`);
      console.log(`  標題: ${event.title}`);
      console.log(`  時間: ${event.start_time} - ${event.end_time}`);
      console.log(`  地點: ${event.location}`);
      console.log(`  創建者: ${event.admin_name} (${event.username}) - ${event.admin_role}`);
      console.log('');
    });
    
    db.close();
    console.log('測試活動創建完成！');
  });
}, 1000);