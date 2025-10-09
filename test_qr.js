const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./checkin.db');

// 創建測試活動
const testEvent = {
  title: '測試活動',
  description: '測試QR碼顯示',
  qr_code_id: 'test-qrcode-123',
  start_time: new Date().toISOString(),
  end_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
};

db.run(
  'INSERT INTO events (title, description, qr_code_id, start_time, end_time) VALUES (?, ?, ?, ?, ?)',
  [testEvent.title, testEvent.description, testEvent.qr_code_id, testEvent.start_time, testEvent.end_time],
  function(err) {
    if (err) {
      console.error('插入錯誤:', err);
    } else {
      console.log('測試活動創建成功，ID:', this.lastID);
    }
    db.close();
  }
);