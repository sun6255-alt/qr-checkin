const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('checkin_system.db');

console.log('檢查數據庫結構...\n');

// 查看所有表
db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
  if (err) {
    console.error('查詢表錯誤:', err);
    return;
  }
  
  console.log('數據庫中的表:');
  tables.forEach(table => {
    console.log(`- ${table.name}`);
  });
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // 查看每個表的結構
  let tableIndex = 0;
  
  function checkNextTable() {
    if (tableIndex >= tables.length) {
      db.close();
      console.log('\n檢查完成！');
      return;
    }
    
    const tableName = tables[tableIndex].name;
    console.log(`表結構: ${tableName}`);
    
    db.all(`PRAGMA table_info(${tableName})`, (err, columns) => {
      if (err) {
        console.error(`查詢表 ${tableName} 結構錯誤:`, err);
        tableIndex++;
        checkNextTable();
        return;
      }
      
      columns.forEach(column => {
        console.log(`  ${column.name}: ${column.type} (${column.pk ? 'PK' : ''}${column.notnull ? ' NOT NULL' : ''})`);
      });
      
      console.log('');
      tableIndex++;
      checkNextTable();
    });
  }
  
  checkNextTable();
});