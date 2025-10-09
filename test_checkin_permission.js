const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('checkin_system.db');

console.log('測試簽到權限控制...\n');

// 模擬不同管理員嘗試為不同活動簽到的情況
function testCheckinPermission(adminId, adminRole, adminName, eventQrCode) {
  console.log(`\n=== ${adminName} (${adminRole}) 嘗試為活動 ${eventQrCode} 簽到 ===`);
  
  // 查找活動
  db.get('SELECT * FROM events WHERE qr_code_id = ?', [eventQrCode], (err, event) => {
    if (err || !event) {
      console.log('錯誤：活動不存在');
      return;
    }
    
    console.log(`活動資訊: ${event.title} (ID: ${event.id}, 創建者ID: ${event.admin_id})`);
    
    // 檢查權限
    if (adminRole !== 'super_admin' && event.admin_id !== adminId) {
      console.log('❌ 權限檢查失敗：一般管理員只能為自己創建的活動簽到');
      console.log(`   當前管理員ID: ${adminId}, 活動創建者ID: ${event.admin_id}`);
      return;
    }
    
    console.log('✅ 權限檢查通過：可以為此活動簽到');
    
    // 模擬簽到流程
    simulateCheckinProcess(event.id, event.admin_id);
  });
}

function simulateCheckinProcess(eventId, eventAdminId) {
  console.log('模擬簽到流程...');
  
  // 檢查活動是否在有效時間內
  const now = new Date();
  db.get('SELECT * FROM events WHERE id = ?', [eventId], (err, event) => {
    if (err || !event) {
      console.log('錯誤：活動不存在');
      return;
    }
    
    const startTime = new Date(event.start_time);
    const endTime = new Date(event.end_time);
    
    if (now < startTime || now > endTime) {
      console.log('❌ 活動不在有效時間內，無法簽到');
      console.log(`   當前時間: ${now}, 活動時間: ${startTime} ~ ${endTime}`);
      return;
    }
    
    console.log('✅ 活動時間檢查通過');
    
    // 模擬創建用戶和簽到記錄
    const testUser = {
      name: '測試用戶',
      email: 'test@example.com',
      organization: '測試機構',
      department: '測試部門',
      position: '測試職位',
      id_number: 'A123456789',
      birth_date: '1990-01-01'
    };
    
    // 插入用戶
    db.run('INSERT OR IGNORE INTO users (name, email, organization, department, position, id_number, birth_date) VALUES (?, ?, ?, ?, ?, ?, ?)', 
      [testUser.name, testUser.email, testUser.organization, testUser.department, testUser.position, testUser.id_number, testUser.birth_date], 
      function(err) {
        if (err) {
          console.log('用戶已存在，使用現有用戶');
        }
        
        // 獲取用戶ID
        db.get('SELECT id FROM users WHERE email = ?', [testUser.email], (err, user) => {
          if (err || !user) {
            console.log('錯誤：無法獲取用戶ID');
            return;
          }
          
          const userId = user.id;
          console.log(`找到用戶ID: ${userId}`);
          
          // 檢查是否已經簽到
          db.get('SELECT id FROM checkins WHERE user_id = ? AND event_id = ?', [userId, eventId], (err, existingCheckin) => {
            if (err) {
              console.log('錯誤：檢查簽到狀態失敗');
              return;
            }
            
            if (existingCheckin) {
              console.log('⚠️  用戶已經簽到過了，無需重複簽到');
              return;
            }
            
            console.log('✅ 用戶尚未簽到，可以進行簽到');
            
            // 插入簽到記錄（包含admin_id）
            db.run('INSERT INTO checkins (user_id, event_id, admin_id) VALUES (?, ?, ?)', 
              [userId, eventId, eventAdminId], (err) => {
              if (err) {
                console.log('❌ 簽到失敗:', err.message);
                return;
              }
              
              console.log('✅ 簽到成功！');
              console.log(`   用戶 ${testUser.name} 成功簽到活動 ${event.title}`);
            });
          });
        });
      });
  });
}

// 測試不同場景
console.log('開始測試簽到權限控制...');

// 場景1: 管理員1為自己的活動簽到
setTimeout(() => {
  testCheckinPermission(2, 'admin', '管理員1', 'qr001');
}, 1000);

// 場景2: 管理員1嘗試為管理員2的活動簽到（應該失敗）
setTimeout(() => {
  testCheckinPermission(2, 'admin', '管理員1', 'qr003');
}, 3000);

// 場景3: 管理員2為自己的活動簽到
setTimeout(() => {
  testCheckinPermission(3, 'admin', '管理員2', 'qr003');
}, 5000);

// 場景4: 超級管理員為任何活動簽到（應該成功）
setTimeout(() => {
  testCheckinPermission(1, 'super_admin', '超級管理員', 'qr002');
}, 7000);

setTimeout(() => {
  db.close();
  console.log('\n簽到權限測試完成！');
}, 9000);