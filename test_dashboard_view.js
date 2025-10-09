const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('checkin_system.db');

console.log('測試儀表板數據查詢...\n');

// 模擬不同管理員登錄後的儀表板數據
function testDashboardView(adminId, adminRole, adminName) {
  console.log(`\n=== ${adminName} (${adminRole}) 的儀表板 ===`);
  
  // 1. 活動數量統計
  let eventQuery;
  let eventParams = [];
  
  if (adminRole === 'super_admin') {
    eventQuery = 'SELECT COUNT(*) as count FROM events';
    console.log('活動統計：所有活動（超級管理員）');
  } else {
    eventQuery = 'SELECT COUNT(*) as count FROM events WHERE admin_id = ?';
    eventParams = [adminId];
    console.log(`活動統計：admin_id = ${adminId} 的活動（一般管理員）`);
  }
  
  db.get(eventQuery, eventParams, (err, eventResult) => {
    if (err) {
      console.error('查詢活動數量錯誤:', err);
      return;
    }
    
    console.log(`活動總數: ${eventResult.count}`);
    
    // 2. 最近活動
    let recentEventsQuery;
    let recentEventsParams = [];
    
    if (adminRole === 'super_admin') {
      recentEventsQuery = 'SELECT * FROM events ORDER BY id DESC LIMIT 5';
    } else {
      recentEventsQuery = 'SELECT * FROM events WHERE admin_id = ? ORDER BY id DESC LIMIT 5';
      recentEventsParams = [adminId];
    }
    
    db.all(recentEventsQuery, recentEventsParams, (err, recentEvents) => {
      if (err) {
        console.error('查詢最近活動錯誤:', err);
        return;
      }
      
      console.log('最近活動:');
      recentEvents.forEach(event => {
        console.log(`  - ${event.title} (${event.start_time} ~ ${event.end_time})`);
      });
      
      // 3. 簽到統計
      let checkinQuery;
      let checkinParams = [];
      
      if (adminRole === 'super_admin') {
        checkinQuery = 'SELECT COUNT(*) as count FROM checkins';
        console.log('\n簽到統計：所有簽到記錄（超級管理員）');
      } else {
        checkinQuery = 'SELECT COUNT(*) as count FROM checkins WHERE admin_id = ?';
        checkinParams = [adminId];
        console.log(`\n簽到統計：admin_id = ${adminId} 的簽到記錄（一般管理員）`);
      }
      
      db.get(checkinQuery, checkinParams, (err, checkinResult) => {
        if (err) {
          console.error('查詢簽到數量錯誤:', err);
          return;
        }
        
        console.log(`簽到總數: ${checkinResult.count}`);
        
        // 4. 最近簽到
        let recentCheckinsQuery;
        let recentCheckinsParams = [];
        
        if (adminRole === 'super_admin') {
          recentCheckinsQuery = `
            SELECT c.checkin_time, u.name as user_name, e.title as event_title
            FROM checkins c
            JOIN users u ON c.user_id = u.id
            JOIN events e ON c.event_id = e.id
            ORDER BY c.id DESC
            LIMIT 5
          `;
        } else {
          recentCheckinsQuery = `
            SELECT c.checkin_time, u.name as user_name, e.title as event_title
            FROM checkins c
            JOIN users u ON c.user_id = u.id
            JOIN events e ON c.event_id = e.id
            WHERE c.admin_id = ?
            ORDER BY c.id DESC
            LIMIT 5
          `;
          recentCheckinsParams = [adminId];
        }
        
        db.all(recentCheckinsQuery, recentCheckinsParams, (err, recentCheckins) => {
          if (err) {
            console.error('查詢最近簽到錯誤:', err);
            return;
          }
          
          console.log('最近簽到:');
          if (recentCheckins.length === 0) {
            console.log('  (暫無簽到記錄)');
          } else {
            recentCheckins.forEach(checkin => {
              console.log(`  - ${checkin.user_name} 簽到了 ${checkin.event_title} (${checkin.checkin_time})`);
            });
          }
          
          console.log('\n' + '='.repeat(50));
        });
      });
    });
  });
}

// 測試不同管理員的儀表板視圖
console.log('開始測試不同管理員的儀表板視圖...');

// 測試超級管理員
testDashboardView(1, 'super_admin', '超級管理員');

// 測試一般管理員1
setTimeout(() => {
  testDashboardView(2, 'admin', '管理員1');
}, 2000);

// 測試一般管理員2
setTimeout(() => {
  testDashboardView(3, 'admin', '管理員2');
}, 4000);

setTimeout(() => {
  db.close();
  console.log('\n儀表板測試完成！');
}, 6000);