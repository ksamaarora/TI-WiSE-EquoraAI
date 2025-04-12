const cron = require('node-cron');
const { sendNewsletter } = require('./newsletterService');

// Schedule daily newsletter delivery at 8:00 AM
function scheduleNewsletterDelivery() {
  console.log('Setting up scheduled newsletter delivery task...');
  
  // Schedule task to run at 8:00 AM every day
  // Format: minute hour day-of-month month day-of-week
  const task = cron.schedule('0 8 * * *', async () => {
    console.log(`Running scheduled newsletter delivery at ${new Date().toISOString()}`);
    
    try {
      await sendNewsletter();
      console.log('Newsletter delivery completed successfully');
    } catch (error) {
      console.error('Error sending scheduled newsletter:', error);
    }
  });
  
  console.log('Newsletter delivery scheduled successfully');
  return task;
}

module.exports = {
  scheduleNewsletterDelivery
}; 