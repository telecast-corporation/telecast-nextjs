const nodemailer = require('nodemailer');

// Use the same configuration as our email.ts file
const SMTP_HOST = 'mail.telecast.ca';
const SMTP_PORT = 465;
const SMTP_USER = 'verify@telecast.ca';
const SMTP_PASS = '!@#2Platek2!@#';
const TO_EMAIL = 'naufal.adityo16@gmail.com';

console.log('Testing Nodemailer Email Sending...');
console.log(`Host: ${SMTP_HOST}:${SMTP_PORT}`);
console.log(`From: ${SMTP_USER}`);
console.log(`To: ${TO_EMAIL}`);
console.log('---');

// Create transporter with the same config as email.ts
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: true, // true for 465, false for other ports
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
  debug: true, // Enable debug output
});

async function testNodemailer() {
  try {
    // First, verify the connection
    console.log('🔍 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!');
    
    // Send the test email
    console.log('📧 Sending test email...');
    const info = await transporter.sendMail({
      from: SMTP_USER,
      to: TO_EMAIL,
      subject: 'Test Email from Nodemailer - Telecast',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Test Email from Nodemailer</h2>
          <p>This is a test email sent using Nodemailer with the same configuration as your app.</p>
          <p><strong>Time sent:</strong> ${new Date().toISOString()}</p>
          <p><strong>From:</strong> ${SMTP_USER}</p>
          <p><strong>To:</strong> ${TO_EMAIL}</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            If you receive this email, Nodemailer is working correctly with your SMTP configuration!
          </p>
        </div>
      `,
      text: `Test Email from Nodemailer - Telecast

This is a test email sent using Nodemailer with the same configuration as your app.

Time sent: ${new Date().toISOString()}
From: ${SMTP_USER}
To: ${TO_EMAIL}

If you receive this email, Nodemailer is working correctly with your SMTP configuration!`,
    });

    console.log('✅ EMAIL SENT SUCCESSFULLY!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📧 Response:', info.response);
    console.log(`\n🎉 Check your inbox at ${TO_EMAIL} for the test email.`);
    
  } catch (error) {
    console.log('❌ EMAIL SENDING FAILED');
    console.log('Error details:', error.message);
    console.log('Error code:', error.code);
    console.log('Error response:', error.response);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔍 This looks like an authentication error. Check your credentials.');
    } else if (error.code === 'ECONNECTION') {
      console.log('\n🔍 This looks like a connection error. Check your host and port.');
    }
    
    throw error;
  } finally {
    // Close the transporter
    transporter.close();
  }
}

testNodemailer()
  .then(() => {
    console.log('\n🎉 Nodemailer test PASSED!');
    process.exit(0);
  })
  .catch((error) => {
    console.log('\n💥 Nodemailer test FAILED');
    process.exit(1);
  }); 