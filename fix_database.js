const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./checkin.db');

console.log('開始修復數據庫結構...');

// 添加缺失的欄位到users表
db.serialize(() => {
  console.log('1. 添加organization欄位到users表');
  db.run("ALTER TABLE users ADD COLUMN organization TEXT", (err) => {
    if (err) {
      console.log('organization欄位可能已存在或添加失敗:', err.message);
    } else {
      console.log('成功添加organization欄位');
    }
  });

  console.log('2. 添加department欄位到users表');
  db.run("ALTER TABLE users ADD COLUMN department TEXT", (err) => {
    if (err) {
      console.log('department欄位可能已存在或添加失敗:', err.message);
    } else {
      console.log('成功添加department欄位');
    }
  });

  console.log('3. 添加position欄位到users表');
  db.run("ALTER TABLE users ADD COLUMN position TEXT", (err) => {
    if (err) {
      console.log('position欄位可能已存在或添加失敗:', err.message);
    } else {
      console.log('成功添加position欄位');
    }
  });

  console.log('4. 添加id_number欄位到users表');
  db.run("ALTER TABLE users ADD COLUMN id_number TEXT", (err) => {
    if (err) {
      console.log('id_number欄位可能已存在或添加失敗:', err.message);
    } else {
      console.log('成功添加id_number欄位');
    }
  });

  console.log('5. 添加birth_date欄位到users表');
  db.run("ALTER TABLE users ADD COLUMN birth_date TEXT", (err) => {
    if (err) {
      console.log('birth_date欄位可能已存在或添加失敗:', err.message);
    } else {
      console.log('成功添加birth_date欄位');
    }
  });

  console.log('6. 添加qr_code_updated_at欄位到events表');
  db.run("ALTER TABLE events ADD COLUMN qr_code_updated_at DATETIME", (err) => {
    if (err) {
      console.log('qr_code_updated_at欄位可能已存在或添加失敗:', err.message);
    } else {
      console.log('成功添加qr_code_updated_at欄位');
    }
  });

  // 關閉數據庫連接
  setTimeout(() => {
    db.close();
    console.log('數據庫修復完成！');
  }, 2000);
});