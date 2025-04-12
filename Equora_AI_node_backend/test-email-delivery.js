require('dotenv').config();
const nodemailer = require('nodemailer');

/**
 * Test direct SMTP connection and email delivery
 */
async function testEmailDelivery() {
  console.log('\n===== TESTING EMAIL DELIVERY =====');
  
  // Parse command line arguments
  const recipient = process.argv[2];
  if (!recipient) {
    console.error('Please provide a recipient email as argument');
    console.log('Usage: node test-email-delivery.js recipient@example.com');
    process.exit(1);
  }
  
  console.log(`Testing email delivery to: ${recipient}`);
  console.log(`Using email service: ${process.env.EMAIL_SERVICE}`);
  console.log(`From: ${process.env.EMAIL_USER}`);
  
  try {
    // Create transporter with detailed debugging
    const config = {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
      debug: true, // Enable debug messages
      logger: true // Log to console
    };
    
    console.log('Creating transporter with config:', {
      ...config,
      auth: { ...config.auth, pass: '[REDACTED]' }
    });
    
    const transporter = nodemailer.createTransport(config);
    
    // Verify connection configuration
    console.log('Verifying transport configuration...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');
    
    // Create a simple test email
    const mailOptions = {
      from: {
        name: 'Equora AI Test',
        address: process.env.EMAIL_USER
      },
      to: recipient,
      subject: 'Test Email from Equora AI',
      text: 'This is a test email to verify SMTP delivery is working correctly.',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2e7feb;">Equora AI Test Email</h1>
          <p>This is a test email sent at ${new Date().toLocaleString()}</p>
          <p>If you're seeing this email, it means our SMTP configuration is working correctly!</p>
          <div style="margin-top: 30px; padding: 10px; background-color: #f5f7fa; border-radius: 4px;">
            <p style="margin: 0; color: #666;">This is an automated test message. Please do not reply.</p>
          </div>
        </div>
      `,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    };
    
    // Send email with promise
    console.log('Sending test email...');
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    
    if (info.accepted.length > 0) {
      console.log('Accepted recipients:', info.accepted.join(', '));
    }
    
    if (info.rejected.length > 0) {
      console.log('Rejected recipients:', info.rejected.join(', '));
    }
    
    return true;
  } catch (error) {
    console.error('\n===== EMAIL TEST FAILED =====');
    console.error('Error:', error);
    console.error('Stack:', error.stack);
    
    if (error.code === 'EAUTH') {
      console.error('\nAuthentication error - your app password might be incorrect or expired.');
      console.error('Please check your Gmail account settings and regenerate the app password.');
    }
    
    if (error.code === 'ESOCKET') {
      console.error('\nSocket error - there might be network issues or the SMTP server is blocking your connection.');
      console.error('Check your firewall settings or try from a different network.');
    }
    
    console.error('\n===== TEST COMPLETE =====');
    return false;
  }
}

// Run the test
testEmailDelivery()
  .then(success => {
    console.log(`\n===== TEST ${success ? 'PASSED' : 'FAILED'} =====`);
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  }); 