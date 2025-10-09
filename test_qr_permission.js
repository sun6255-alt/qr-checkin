const axios = require('axios');
const cheerio = require('cheerio');

// 測試QR碼頁面權限控制
async function testQRCodePermission() {
  console.log('=== 測試QR碼頁面權限控制 ===\n');
  
  try {
    // 測試1: 未登錄訪問QR碼頁面
    console.log('測試1: 未登錄訪問QR碼頁面');
    try {
      const response = await axios.get('http://localhost:3000/events/5/qrcode', {
        maxRedirects: 0,
        validateStatus: function (status) {
          return status < 400; // 允許重定向
        }
      });
      
      if (response.status === 302 || response.status === 303) {
        console.log('✓ 正確重定向到登錄頁面');
      } else {
        console.log('✗ 未正確重定向，狀態碼:', response.status);
      }
    } catch (error) {
      console.log('✓ 未登錄訪問被拒絕');
    }
    
    // 測試2: 模擬已登錄的管理員訪問自己的活動
    console.log('\n測試2: 管理員訪問自己創建的活動QR碼');
    
    // 首先創建一個測試會話
    const loginResponse = await axios.post('http://localhost:3000/admin/login', {
      username: 'admin1',
      password: 'password123'
    });
    
    if (loginResponse.data.success) {
      console.log('✓ 管理員1登錄成功');
      
      // 使用相同的cookie訪問QR碼頁面
      const cookie = loginResponse.headers['set-cookie'];
      const qrResponse = await axios.get('http://localhost:3000/events/5/qrcode', {
        headers: { Cookie: cookie }
      });
      
      const $ = cheerio.load(qrResponse.data);
      const backButton = $('a[href="/admin"]');
      const disabledButton = $('button[disabled]');
      
      if (backButton.length > 0 && disabledButton.length === 0) {
        console.log('✓ 返回管理頁面按鈕可用（管理員1查看自己的活動）');
      } else if (disabledButton.length > 0 && disabledButton.text().includes('無權限')) {
        console.log('✗ 返回管理頁面按鈕被禁用');
      } else {
        console.log('? 按鈕狀態不明確');
      }
    } else {
      console.log('✗ 管理員1登錄失敗');
    }
    
  } catch (error) {
    console.error('測試過程中出現錯誤:', error.message);
  }
}

testQRCodePermission();