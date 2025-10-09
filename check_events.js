const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./checkin.db');

db.all('SELECT id, title, qr_code_id FROM events ORDER BY id DESC LIMIT 5', (err, rows) => {
  if (err) {
    console.error('錯誤:', err);
  } else {
    console.log('找到的活動:', rows);
  }
  db.close();
});