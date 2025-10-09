const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./checkin.db');

console.log('檢查數據庫結構...');

db.all("SELECT sql FROM sqlite_master WHERE type='table'", (err, rows) => {
  if (err) {
    console.error('錯誤:', err);
  } else {
    console.log('所有表結構:');
    rows.forEach(row => {
      console.log(row.sql);
      console.log('---');
    });
  }
  
  // 檢查events表中的qr_code_updated_at列
  db.all("PRAGMA table_info(events)", (err, columns) => {
    if (err) {
      console.error('錯誤:', err);
    } else {
      console.log('events表列信息:');
      columns.forEach(col => {
        console.log(`${col.cid}: ${col.name} (${col.type})`);
      });
    }
    
    // 檢查users表中的列
    db.all("PRAGMA table_info(users)", (err, columns) => {
      if (err) {
        console.error('錯誤:', err);
      } else {
        console.log('users表列信息:');
        columns.forEach(col => {
          console.log(`${col.cid}: ${col.name} (${col.type})`);
        });
      }
      
      db.close();
    });
  });
});