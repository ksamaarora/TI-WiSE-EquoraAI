/**
 * Script to set up a cron job for scheduling newsletters
 * This uses node-cron to set up a daily task at 9:00 AM
 */

require('dotenv').config();
const cron = require('node-cron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

// Ensure node-cron is installed
try {
  require.resolve('node-cron');
} catch (e) {
  console.error('node-cron is not installed. Please run: npm install node-cron');
  process.exit(1);
}

console.log('Setting up cron job for newsletter scheduling...');

// Schedule the newsletter job to run daily at 9:00 AM
// Cron format: minute hour day-of-month month day-of-week
const task = cron.schedule('0 9 * * *', () => {
  console.log(`Running scheduled newsletter job at ${new Date().toISOString()}`);
  
  const scriptPath = path.join(__dirname, 'src', 'scripts', 'scheduledNewsletter.js');
  
  // Check if script exists
  if (!fs.existsSync(scriptPath)) {
    console.error(`Error: Script not found at ${scriptPath}`);
    return;
  }
  
  // Execute the script as a child process
  const child = spawn('node', [scriptPath], { 
    stdio: 'inherit',
    env: process.env
  });
  
  child.on('close', (code) => {
    console.log(`Newsletter script exited with code ${code}`);
  });
  
  child.on('error', (err) => {
    console.error('Failed to start newsletter script:', err);
  });
});

// Start the task
task.start();

console.log('Cron job has been set up and is running.');
console.log('The newsletter script will execute daily at 9:00 AM.');
console.log('Keep this process running in the background, or use a process manager like PM2.');
console.log('Example PM2 command: pm2 start setup-cron.js --name newsletter-cron');

// Keep the process running
process.stdin.resume();

// Handle application termination
process.on('SIGINT', () => {
  task.stop();
  console.log('Cron job stopped.');
  process.exit(0);
});

console.log('Press Ctrl+C to stop the cron job.'); 