const sqlite3 = require('sqlite3').verbose();

// 連接到數據庫
const db = new sqlite3.Database('./checkin.db');

console.log('檢查管理員帳號...');

// 查詢所有管理員
db.all("SELECT id, username, name, email, role, status FROM admins", [], (err, rows) => {
  if (err) {
    console.error('查詢錯誤:', err.message);
    return;
  }
  
  console.log('\n所有管理員帳號:');
  console.log('ID | 用戶名 | 姓名 | 郵箱 | 角色 | 狀態');
  console.log('---|--------|------|------|------|------');
  
  rows.forEach(row => {
    console.log(`${row.id} | ${row.username} | ${row.name} | ${row.email} | ${row.role} | ${row.status}`);
  });
  
  // 特別檢查超級管理員
  console.log('\n超級管理員帳號:');
  const superAdmins = rows.filter(row => row.role === 'super');
  if (superAdmins.length > 0) {
    superAdmins.forEach(admin => {
      console.log(`用戶名: ${admin.username}`);
      console.log(`姓名: ${admin.name}`);
      console.log(`狀態: ${admin.status}`);
    });
  } else {
    console.log('沒有找到超級管理員帳號');
  }
  
  db.close();
});