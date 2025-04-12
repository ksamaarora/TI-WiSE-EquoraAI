require('dotenv').config();
const { sendNewsletter } = require('./src/services/newsletterService');

console.log('Starting daily newsletter process...');

// If an email is provided as a command-line argument, send only to that email
const specificEmail = process.argv[2] || null;
if (specificEmail) {
  console.log(`Sending newsletter to specific email: ${specificEmail}`);
}

// Send newsletters
sendNewsletter(specificEmail)
  .then(result => {
    console.log('Newsletter sending process completed:', result ? 'Success' : 'Failed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error in newsletter process:', error);
    process.exit(1);
  }); 