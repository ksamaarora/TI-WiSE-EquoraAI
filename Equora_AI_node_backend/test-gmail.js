require('dotenv').config();
const nodemailer = require('nodemailer');

async function testGmail() {
  console.log('Testing Gmail SMTP connection...');
  console.log(`Using email: ${process.env.EMAIL_USER}`);
  console.log(`App password length: ${process.env.EMAIL_APP_PASSWORD.length}`);
  
  // Create a test transporter
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
    logger: true,
    debug: true
  });
  
  // Test recipient from command line
  const testEmail = process.argv[2];
  if (!testEmail) {
    console.error('Please provide a test email as a command line parameter');
    process.exit(1);
  }
  
  // Create mail options
  const mailOptions = {
    from: `"Equora Test" <${process.env.EMAIL_USER}>`,
    to: testEmail,
    subject: 'Test Email from Equora (Gmail Test)',
    text: 'This is a test email to verify Gmail SMTP is working correctly.',
    html: `
      <h1>Equora Gmail Test</h1>
      <p>This is a test email sent at ${new Date().toLocaleString()}</p>
      <p>If you received this, the SMTP connection is working!</p>
    `
  };
  
  // Send the email
  try {
    console.log(`Sending test email to ${testEmail}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully!');
    console.log(`Message ID: ${info.messageId}`);
    
    if (info.accepted && info.accepted.length > 0) {
      console.log(`Accepted recipients: ${info.accepted.join(', ')}`);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return false;
  }
}

// Run the test
testGmail()
  .then(result => {
    console.log(`Test completed: ${result ? 'SUCCESS' : 'FAILED'}`);
    process.exit(result ? 0 : 1);
  })
  .catch(error => {
    console.error('Test error:', error);
    process.exit(1);
  }); 