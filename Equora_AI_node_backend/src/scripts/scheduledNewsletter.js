require('dotenv').config();
const { getNewsletterSubscribers, sendNewsletter } = require('../services/newsletterService');

/**
 * Schedules newsletters by frequency
 * Run this script daily to send newsletters to all subscribers (since all are now daily)
 */
async function scheduleNewsletters() {
  try {
    console.log('Starting scheduled newsletter process...');
    
    // Get all active subscribers
    const allSubscribers = await getNewsletterSubscribers(true);
    console.log(`Found ${allSubscribers.length} active subscribers total`);
    
    if (allSubscribers.length === 0) {
      console.log('No subscribers found. Exiting.');
      return;
    }
    
    // All subscribers now get daily newsletters
    const todaySubscribers = allSubscribers;
    
    console.log(`Sending newsletters to ${todaySubscribers.length} subscribers today:`);
    
    // Send newsletters to each subscriber
    if (todaySubscribers.length === 0) {
      console.log('No newsletters to send today. Exiting.');
      return;
    }
    
    for (const subscriber of todaySubscribers) {
      try {
        console.log(`Sending newsletter to ${subscriber.email}...`);
        await sendNewsletter(subscriber.email);
        console.log(`Successfully sent newsletter to ${subscriber.email}`);
        
        // Add a small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error sending newsletter to ${subscriber.email}:`, error);
      }
    }
    
    console.log('Scheduled newsletter process completed successfully.');
  } catch (error) {
    console.error('Error in scheduled newsletter process:', error);
  }
}

// Execute the script if called directly
if (require.main === module) {
  scheduleNewsletters()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}

module.exports = scheduleNewsletters; 