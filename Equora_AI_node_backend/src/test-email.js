require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmailSending() {
  console.log('\n======= TESTING EMAIL FUNCTIONALITY =======');
  console.log('Creating email transporter with credentials:');
  console.log(`- Email: ${process.env.EMAIL_USER}`);
  console.log(`- App Password format: ${process.env.EMAIL_APP_PASSWORD.substring(0, 4)}...${process.env.EMAIL_APP_PASSWORD.substring(process.env.EMAIL_APP_PASSWORD.length - 4)}`);
  
  try {
    // Create a test transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false
      },
      debug: true,
    });
    
    // Verify transporter configuration
    transporter.verify(function (error, success) {
      if (error) {
        console.error('Transporter verification failed:', error);
      } else {
        console.log('Transporter is ready to send emails');
      }
    });
    
    // Test email content
    const testHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4646fa; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .footer { background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Test Email from Equora.AI</h1>
            </div>
            <div class="content">
              <p>This is a test email to verify that the email sending functionality is working correctly.</p>
              <p>If you received this email, it means the email configuration is correct!</p>
              <p>Time sent: ${new Date().toLocaleString()}</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Equora.AI. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
    
    // Get email from command line or use default
    const testEmail = process.argv[2] || 'test@example.com';
    console.log(`Sending test email to: ${testEmail}`);
    
    // Send the test email
    const info = await transporter.sendMail({
      from: `"Equora.AI Test" <${process.env.EMAIL_USER}>`,
      to: testEmail,
      subject: 'Equora.AI Email Test',
      html: testHtml,
    });
    
    console.log('Email sent successfully!');
    console.log(`Message ID: ${info.messageId}`);
    if (info.accepted && info.accepted.length > 0) {
      console.log(`Accepted recipients: ${info.accepted.join(', ')}`);
    }
    if (info.rejected && info.rejected.length > 0) {
      console.log(`Rejected recipients: ${info.rejected.join(', ')}`);
    }
    console.log('======= EMAIL TEST COMPLETE =======\n');
    
  } catch (error) {
    console.error('\n======= EMAIL TEST FAILED =======');
    console.error('Error sending test email:', error);
    if (error.code) {
      console.error(`Error code: ${error.code}`);
    }
    if (error.response) {
      console.error(`Error response: ${error.response}`);
    }
    console.error('======= EMAIL ERROR DETAILS END =======\n');
  }
}

// Run the test function
testEmailSending(); 