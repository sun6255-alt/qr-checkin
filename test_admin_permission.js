const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('checkin_system.db');

console.log('測試管理員權限控制功能...\n');

// 模擬不同管理員登錄後能看到的活動
function testAdminView(adminId, adminRole, adminName) {
  console.log(`\n=== ${adminName} (${adminRole}) 的視角 ===`);
  
  let query;
  let params = [];
  
  if (adminRole === 'super_admin') {
    // 超級管理員可以看到所有活動
    query = 'SELECT * FROM events ORDER BY id';
    console.log('查詢：所有活動（超級管理員權限）');
  } else {
    // 一般管理員只能看到自己創建的活動
    query = 'SELECT * FROM events WHERE admin_id = ? ORDER BY id';
    params = [adminId];
    console.log(`查詢：只顯示 admin_id = ${adminId} 的活動（一般管理員權限）`);
  }
  
  db.all(query, params, (err, events) => {
    if (err) {
      console.error('查詢活動錯誤:', err);
      return;
    }
    
    console.log(`找到 ${events.length} 個活動:`);
    events.forEach(event => {
      console.log(`  - ID: ${event.id}, 標題: ${event.title}, QR碼: ${event.qr_code_id}`);
    });
    
    // 測試簽到記錄查詢
    testCheckinView(adminId, adminRole, adminName);
  });
}

function testCheckinView(adminId, adminRole, adminName) {
  let query;
  let params = [];
  
  if (adminRole === 'super_admin') {
    // 超級管理員可以看到所有簽到記錄
    query = `
      SELECT c.id, c.checkin_time, u.name as user_name, e.title as event_title
      FROM checkins c
      JOIN users u ON c.user_id = u.id
      JOIN events e ON c.event_id = e.id
      ORDER BY c.id DESC
      LIMIT 5
    `;
    console.log('查詢：所有簽到記錄（超級管理員權限）');
  } else {
    // 一般管理員只能看到自己活動的簽到記錄
    query = `
      SELECT c.id, c.checkin_time, u.name as user_name, e.title as event_title
      FROM checkins c
      JOIN users u ON c.user_id = u.id
      JOIN events e ON c.event_id = e.id
      WHERE c.admin_id = ?
      ORDER BY c.id DESC
      LIMIT 5
    `;
    params = [adminId];
    console.log(`查詢：只顯示 admin_id = ${adminId} 的簽到記錄（一般管理員權限）`);
  }
  
  db.all(query, params, (err, checkins) => {
    if (err) {
      console.error('查詢簽到記錄錯誤:', err);
      return;
    }
    
    console.log(`找到 ${checkins.length} 個簽到記錄:`);
    checkins.forEach(checkin => {
      console.log(`  - 簽到ID: ${checkin.id}, 用戶: ${checkin.user_name}, 活動: ${checkin.event_title}, 時間: ${checkin.checkin_time}`);
    });
  });
}

// 測試不同管理員
console.log('開始測試不同管理員的權限...');

// 測試超級管理員
testAdminView(1, 'super_admin', '超級管理員');

// 測試一般管理員1
setTimeout(() => {
  testAdminView(2, 'admin', '管理員1');
}, 1000);

// 測試一般管理員2
setTimeout(() => {
  testAdminView(3, 'admin', '管理員2');
}, 2000);

setTimeout(() => {
  db.close();
  console.log('\n權限測試完成！');
}, 3000);