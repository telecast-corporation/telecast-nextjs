const tls = require('tls');

const SMTP_HOST = 'mail.telecast.ca';
const SMTP_PORT = 465;
const SMTP_USER = 'verify@telecast.ca';
const SMTP_PASS = '!@#2Platek2!@#';

console.log('Testing SMTP Authentication...');
console.log(`Host: ${SMTP_HOST}:${SMTP_PORT}`);
console.log(`User: ${SMTP_USER}`);
console.log('---');

function testAuth() {
  return new Promise((resolve, reject) => {
    const socket = tls.connect({
      host: SMTP_HOST,
      port: SMTP_PORT,
      rejectUnauthorized: false,
    }, () => {
      console.log('✅ Connected to SMTP server');
      
      let buffer = '';
      let step = 0;
      
      socket.on('data', (data) => {
        const response = data.toString().trim();
        console.log(`📨 Server: ${response}`);
        
        if (step === 0 && response.includes('220')) {
          // Send EHLO
          console.log('📤 Client: EHLO test.com');
          socket.write('EHLO test.com\r\n');
          step = 1;
        } else if (step === 1 && response.includes('250')) {
          // Send AUTH LOGIN
          console.log('📤 Client: AUTH LOGIN');
          socket.write('AUTH LOGIN\r\n');
          step = 2;
        } else if (step === 2 && response.includes('334 VXNlcm5hbWU6')) {
          // Send username
          const username = Buffer.from(SMTP_USER).toString('base64');
          console.log(`📤 Client: [username base64: ${username}]`);
          socket.write(username + '\r\n');
          step = 3;
        } else if (step === 3 && response.includes('334 UGFzc3dvcmQ6')) {
          // Send password
          const password = Buffer.from(SMTP_PASS).toString('base64');
          console.log(`📤 Client: [password base64: ${password}]`);
          socket.write(password + '\r\n');
          step = 4;
        } else if (step === 4) {
          if (response.includes('235')) {
            console.log('✅ AUTHENTICATION SUCCESSFUL!');
            socket.write('QUIT\r\n');
            socket.end();
            resolve(true);
          } else if (response.includes('535')) {
            console.log('❌ AUTHENTICATION FAILED');
            socket.write('QUIT\r\n');
            socket.end();
            reject(new Error('Authentication failed: ' + response));
          }
        }
      });
      
      socket.on('error', (error) => {
        console.log('❌ Error:', error.message);
        reject(error);
      });
      
      socket.on('close', () => {
        console.log('🔌 Connection closed');
      });
    });
    
    socket.on('error', (error) => {
      console.log('❌ Connection failed:', error.message);
      reject(error);
    });
  });
}

testAuth()
  .then(() => {
    console.log('\n🎉 Authentication test PASSED!');
    process.exit(0);
  })
  .catch((error) => {
    console.log('\n💥 Authentication test FAILED:', error.message);
    process.exit(1);
  }); 