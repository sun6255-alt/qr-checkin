const axios = require('axios');
const cheerio = require('cheerio');

// 測試QR碼頁面和簽到頁面的訪問控制
async function testQRAccess() {
  console.log('=== 測試QR碼相關頁面訪問 ===\n');
  
  try {
    // 測試1: 直接訪問QR碼顯示頁面（未登錄）
    console.log('測試1: 未登錄訪問QR碼顯示頁面');
    try {
      const response = await axios.get('http://localhost:3000/events/5/qrcode', {
        maxRedirects: 0,
        validateStatus: status => status < 400
      });
      
      if (response.status >= 300 && response.status < 400) {
        console.log('✓ 正確重定向到登錄頁面');
      } else {
        console.log('✗ 未正確重定向，狀態碼:', response.status);
      }
    } catch (error) {
      console.log('✓ 訪問被拒絕');
    }
    
    // 測試2: 訪問簽到頁面（模擬使用者掃描QR碼）
    console.log('\n測試2: 使用者掃描QR碼進入簽到頁面');
    
    // 先獲取活動的QR碼ID
    const db = require('./app.js').db; // 需要直接查詢數據庫
    
    // 使用HTTP請求獲取活動信息
    try {
      const eventResponse = await axios.get('http://localhost:3000/events/5/qrcode');
      console.log('需要登錄才能訪問QR碼頁面');
    } catch (error) {
      if (error.response && error.response.status === 403) {
        console.log('✓ QR碼頁面需要權限訪問');
      }
    }
    
    // 測試3: 直接訪問簽到頁面
    console.log('\n測試3: 直接訪問簽到頁面');
    
    // 我們需要獲取一個有效的QR碼ID
    // 假設我們知道某個活動的QR碼ID
    const checkinResponse = await axios.get('http://localhost:3000/checkin/test-qrcode-id');
    const $ = cheerio.load(checkinResponse.data);
    
    // 檢查是否有返回管理頁面的按鈕
    const adminButtons = $('a[href="/admin"]');
    const disabledButtons = $('button[disabled]');
    
    console.log('簽到頁面按鈕分析:');
    console.log('- 返回管理頁面鏈接數量:', adminButtons.length);
    console.log('- 被禁用的按鈕數量:', disabledButtons.length);
    
    if (adminButtons.length === 0) {
      console.log('✓ 簽到頁面沒有返回管理頁面的按鈕');
    } else {
      console.log('✗ 簽到頁面存在管理相關按鈕');
    }
    
  } catch (error) {
    console.error('測試錯誤:', error.message);
  }
}

// 簡化測試，直接訪問簽到頁面
async function simpleTest() {
  console.log('=== 簡化測試：簽到頁面分析 ===\n');
  
  try {
    // 創建一個測試事件來獲取QR碼ID
    const db = require('better-sqlite3')('checkin_system.db');
    
    // 查詢一個存在的活動
    const event = db.prepare('SELECT qr_code_id FROM events LIMIT 1').get();
    
    if (event && event.qr_code_id) {
      console.log('找到活動，QR碼ID:', event.qr_code_id);
      
      // 訪問簽到頁面
      const response = await axios.get(`http://localhost:3000/checkin/${event.qr_code_id}`);
      const $ = cheerio.load(response.data);
      
      // 分析頁面內容
      const title = $('title').text();
      const buttons = $('button, a');
      
      console.log('頁面標題:', title);
      console.log('找到按鈕數量:', buttons.length);
      
      // 檢查是否有管理相關的按鈕
      buttons.each((i, elem) => {
        const text = $(elem).text();
        if (text.includes('管理') || text.includes('admin')) {
          console.log('發現管理相關按鈕:', text);
        }
      });
      
      console.log('✓ 簽到頁面分析完成');
      
    } else {
      console.log('未找到活動數據');
    }
    
    db.close();
    
  } catch (error) {
    console.error('簡化測試錯誤:', error.message);
  }
}

// 執行測試
simpleTest().catch(console.error);