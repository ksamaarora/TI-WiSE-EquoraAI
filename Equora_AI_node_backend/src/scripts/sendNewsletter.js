require('dotenv').config();
const { sendNewsletter, getNewsletterSubscribers } = require('../services/newsletterService');

async function main() {
  try {
    // Log start
    console.log('Starting newsletter sending process...');
    
    // Get active subscribers
    const subscribers = await getNewsletterSubscribers(true);
    console.log(`Found ${subscribers.length} active subscribers.`);
    
    if (subscribers.length === 0) {
      console.log('No subscribers to send newsletter to. Exiting.');
      return;
    }
    
    // Send newsletter to all subscribers
    console.log('Sending newsletters...');
    await sendNewsletter();
    
    console.log('Newsletter sending process completed successfully.');
  } catch (error) {
    console.error('Error in newsletter sending process:', error);
  }
}

// Execute the script if called directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}

module.exports = main; 