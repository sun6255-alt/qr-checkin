const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('checkin_system.db');

console.log('測試權限控制功能...\n');

// 1. 顯示當前管理員和他們的活動
db.all(`
  SELECT a.id, a.username, a.name, a.role, 
         COUNT(e.id) as event_count
  FROM admins a
  LEFT JOIN events e ON a.id = e.admin_id
  GROUP BY a.id
  ORDER BY a.id
`, (err, admins) => {
  if (err) {
    console.error('查詢管理員錯誤:', err);
    return;
  }
  
  console.log('管理員列表和他們的活動數量:');
  admins.forEach(admin => {
    console.log(`ID: ${admin.id}, 用戶名: ${admin.username}, 姓名: ${admin.name}, 角色: ${admin.role}, 活動數: ${admin.event_count}`);
  });
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // 2. 顯示活動和對應的管理員
  db.all(`
    SELECT e.id, e.title, e.start_time, e.end_time,
           a.username, a.name as admin_name, a.role as admin_role
    FROM events e
    JOIN admins a ON e.admin_id = a.id
    ORDER BY e.id DESC
    LIMIT 10
  `, (err, events) => {
    if (err) {
      console.error('查詢活動錯誤:', err);
      return;
    }
    
    console.log('最近10個活動:');
    events.forEach(event => {
      console.log(`活動ID: ${event.id}, 標題: ${event.title}`);
      console.log(`  管理員: ${event.admin_name} (${event.username}), 角色: ${event.admin_role}`);
      console.log(`  時間: ${event.start_time} - ${event.end_time}`);
      console.log('');
    });
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 3. 顯示簽到記錄和對應的管理員
    db.all(`
      SELECT c.id, c.checkin_time,
             u.name as user_name, u.email,
             e.title as event_title,
             a.name as admin_name, a.role as admin_role
      FROM checkins c
      JOIN users u ON c.user_id = u.id
      JOIN events e ON c.event_id = e.id
      JOIN admins a ON c.admin_id = a.id
      ORDER BY c.id DESC
      LIMIT 10
    `, (err, checkins) => {
      if (err) {
        console.error('查詢簽到記錄錯誤:', err);
        return;
      }
      
      console.log('最近10個簽到記錄:');
      checkins.forEach(checkin => {
        console.log(`簽到ID: ${checkin.id}, 時間: ${checkin.checkin_time}`);
        console.log(`  用戶: ${checkin.user_name} (${checkin.email})`);
        console.log(`  活動: ${checkin.event_title}`);
        console.log(`  管理員: ${checkin.admin_name}, 角色: ${checkin.admin_role}`);
        console.log('');
      });
      
      db.close();
      console.log('\n測試完成！');
    });
  });
});