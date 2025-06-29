const tls = require('tls');

const SMTP_HOST = 'mail.telecast.ca';
const SMTP_PORT = 465;
const SMTP_USER = 'verify@telecast.ca';
const SMTP_PASS = '!@#2Platek2!@#';
const TO_EMAIL = 'naufal.adityo16@gmail.com';

console.log('Testing SMTP Email Sending...');
console.log(`From: ${SMTP_USER}`);
console.log(`To: ${TO_EMAIL}`);
console.log('---');

function sendEmail() {
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
        } else if (step === 4 && response.includes('235')) {
          // Authentication successful, send MAIL FROM
          console.log('📤 Client: MAIL FROM:<verify@telecast.ca>');
          socket.write('MAIL FROM:<verify@telecast.ca>\r\n');
          step = 5;
        } else if (step === 5 && response.includes('250')) {
          // Send RCPT TO
          console.log(`📤 Client: RCPT TO:<${TO_EMAIL}>`);
          socket.write(`RCPT TO:<${TO_EMAIL}>\r\n`);
          step = 6;
        } else if (step === 6 && response.includes('250')) {
          // Send DATA
          console.log('📤 Client: DATA');
          socket.write('DATA\r\n');
          step = 7;
        } else if (step === 7 && response.includes('354')) {
          // Send email content
          const emailContent = `From: verify@telecast.ca
To: ${TO_EMAIL}
Subject: Test Email from Telecast SMTP
Date: ${new Date().toUTCString()}
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8

This is a test email sent from the Telecast SMTP server.
Time sent: ${new Date().toISOString()}

If you receive this, the SMTP configuration is working correctly!

Best regards,
Telecast Team

.
`;
          console.log('📤 Client: [email content]');
          socket.write(emailContent);
          step = 8;
        } else if (step === 8 && response.includes('250')) {
          // Email sent successfully
          console.log('✅ EMAIL SENT SUCCESSFULLY!');
          socket.write('QUIT\r\n');
          socket.end();
          resolve(true);
        } else if (response.includes('535') || response.includes('550') || response.includes('553')) {
          // Error occurred
          console.log('❌ EMAIL SENDING FAILED');
          socket.write('QUIT\r\n');
          socket.end();
          reject(new Error('Email sending failed: ' + response));
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

sendEmail()
  .then(() => {
    console.log('\n🎉 Email sending test PASSED!');
    console.log(`Check your inbox at ${TO_EMAIL} for the test email.`);
    process.exit(0);
  })
  .catch((error) => {
    console.log('\n💥 Email sending test FAILED:', error.message);
    process.exit(1);
  }); 