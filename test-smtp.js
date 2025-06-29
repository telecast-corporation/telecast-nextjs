const tls = require('tls');
const net = require('net');

// Load environment variables (you'll need to set these manually for this test)
const SMTP_HOST = 'mail.telecast.ca'; // or process.env.SMTP_HOST
const SMTP_PORT = 465; // or process.env.SMTP_PORT
const SMTP_USER = 'verify@telecast.ca'; // or process.env.SMTP_USER
const SMTP_PASS = '!@#2Platek2!@#'; // or process.env.SMTP_PASS

console.log('Testing SMTP connection...');
console.log(`Host: ${SMTP_HOST}`);
console.log(`Port: ${SMTP_PORT}`);
console.log(`User: ${SMTP_USER}`);
console.log('Password: [hidden]');
console.log('---');

function testSMTPConnection() {
  return new Promise((resolve, reject) => {
    const socket = tls.connect({
      host: SMTP_HOST,
      port: SMTP_PORT,
      rejectUnauthorized: false, // Allow self-signed certificates
    }, () => {
      console.log('✅ TLS connection established');
      console.log(`Connected to: ${socket.remoteAddress}:${socket.remotePort}`);
      
      let buffer = '';
      
      socket.on('data', (data) => {
        buffer += data.toString();
        console.log(`📨 Server: ${data.toString().trim()}`);
        
        // Handle SMTP responses
        if (buffer.includes('220')) {
          // Server ready, send EHLO
          console.log('📤 Client: EHLO test.com');
          socket.write('EHLO test.com\r\n');
        } else if (buffer.includes('250') && buffer.includes('EHLO')) {
          // EHLO successful, start authentication
          console.log('📤 Client: AUTH LOGIN');
          socket.write('AUTH LOGIN\r\n');
        } else if (buffer.includes('334 VXNlcm5hbWU6')) {
          // Send username
          console.log('📤 Client: [username]');
          socket.write(Buffer.from(SMTP_USER).toString('base64') + '\r\n');
        } else if (buffer.includes('334 UGFzc3dvcmQ6')) {
          // Send password
          console.log('📤 Client: [password]');
          socket.write(Buffer.from(SMTP_PASS).toString('base64') + '\r\n');
        } else if (buffer.includes('235')) {
          // Authentication successful
          console.log('✅ Authentication successful!');
          socket.write('QUIT\r\n');
          socket.end();
          resolve(true);
        } else if (buffer.includes('535')) {
          // Authentication failed
          console.log('❌ Authentication failed');
          socket.write('QUIT\r\n');
          socket.end();
          reject(new Error('Authentication failed'));
        } else if (buffer.includes('221')) {
          // Server closing connection
          console.log('📨 Server closing connection');
          socket.end();
          resolve(true);
        }
        
        buffer = '';
      });
      
      socket.on('error', (error) => {
        console.log('❌ Connection error:', error.message);
        reject(error);
      });
      
      socket.on('close', () => {
        console.log('🔌 Connection closed');
      });
    });
    
    socket.on('error', (error) => {
      console.log('❌ TLS connection failed:', error.message);
      reject(error);
    });
  });
}

// Run the test
testSMTPConnection()
  .then(() => {
    console.log('\n🎉 SMTP connection test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.log('\n💥 SMTP connection test failed:', error.message);
    process.exit(1);
  }); 