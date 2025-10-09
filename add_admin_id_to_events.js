const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./checkin.db');

// 為 events 表添加 admin_id 欄位
db.serialize(() => {
  // 檢查 admin_id 欄位是否已存在
  db.all("PRAGMA table_info(events)", (err, columns) => {
    if (err) {
      console.error('檢查表結構錯誤:', err);
      return;
    }
    
    const hasAdminId = columns.some(col => col.name === 'admin_id');
    
    if (!hasAdminId) {
      console.log('正在為 events 表添加 admin_id 欄位...');
      
      // 添加 admin_id 欄位
      db.run("ALTER TABLE events ADD COLUMN admin_id TEXT", (err) => {
        if (err) {
          console.error('添加 admin_id 欄位錯誤:', err);
          return;
        }
        console.log('成功添加 admin_id 欄位');
        
        // 將現有活動的 admin_id 設置為第一個管理員（或超級管理員）
        db.get("SELECT id FROM admins WHERE role = 'super' LIMIT 1", (err, admin) => {
          if (err) {
            console.error('查詢管理員錯誤:', err);
            return;
          }
          
          if (admin) {
            db.run("UPDATE events SET admin_id = ? WHERE admin_id IS NULL", [admin.id], (err) => {
              if (err) {
                console.error('更新現有活動錯誤:', err);
                return;
              }
              console.log('已將現有活動分配給超級管理員');
            });
          }
        });
      });
    } else {
      console.log('admin_id 欄位已存在');
    }
  });
});

// 為 checkins 表添加 admin_id 欄位（可選，用於快速查詢）
db.serialize(() => {
  // 檢查 checkins 表是否已有 admin_id 欄位
  db.all("PRAGMA table_info(checkins)", (err, columns) => {
    if (err) {
      console.error('檢查 checkins 表結構錯誤:', err);
      return;
    }
    
    const hasAdminId = columns.some(col => col.name === 'admin_id');
    
    if (!hasAdminId) {
      console.log('正在為 checkins 表添加 admin_id 欄位...');
      
      // 添加 admin_id 欄位
      db.run("ALTER TABLE checkins ADD COLUMN admin_id TEXT", (err) => {
        if (err) {
          console.error('添加 checkins admin_id 欄位錯誤:', err);
          return;
        }
        console.log('成功為 checkins 表添加 admin_id 欄位');
        
        // 更新現有簽到記錄的 admin_id
        db.run(`
          UPDATE checkins 
          SET admin_id = (
            SELECT e.admin_id 
            FROM events e 
            WHERE e.id = checkins.event_id
          )
          WHERE admin_id IS NULL
        `, (err) => {
          if (err) {
            console.error('更新現有簽到記錄錯誤:', err);
            return;
          }
          console.log('已更新現有簽到記錄的 admin_id');
        });
      });
    } else {
      console.log('checkins 表的 admin_id 欄位已存在');
    }
  });
});

setTimeout(() => {
  db.close();
  console.log('資料庫更新完成');
}, 2000);