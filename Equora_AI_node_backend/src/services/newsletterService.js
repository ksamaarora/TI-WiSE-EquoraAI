const fs = require('fs').promises;
const path = require('path');
const nodemailer = require('nodemailer');
const { generateChatResponse } = require('./aiService');
const { getMarketData } = require('./dashboardData');

// File path for storing subscribers data
const SUBSCRIBERS_FILE = path.join(__dirname, '../data/newsletter-subscribers.json');

// Ensure the data directory exists
async function ensureDataDirExists() {
  const dataDir = path.join(__dirname, '../data');
  try {
    await fs.access(dataDir);
  } catch (error) {
    // Directory doesn't exist, create it
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Load subscribers from file or create empty array if file doesn't exist
async function loadSubscribers() {
  try {
    await ensureDataDirExists();
    const data = await fs.readFile(SUBSCRIBERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or can't be read, return empty array
    return [];
  }
}

// Save subscribers to file
async function saveSubscribers(subscribers) {
  await ensureDataDirExists();
  await fs.writeFile(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2), 'utf-8');
}

/**
 * Subscribe user to newsletter
 * @param {Object} params - Subscription parameters
 * @param {string} params.email - User's email
 * @param {string} [params.name] - User's name
 * @param {string[]} [params.topics] - Topics of interest
 * @param {string[]} [params.sources] - Data sources preference
 * @param {string} [params.frequency] - Newsletter frequency (daily, weekly, monthly)
 * @returns {Object} Subscription details
 */
async function subscribeNewsletter({
  email,
  name,
  topics = [],
  sources = [],
  frequency = "daily",
}) {
  console.log(`Subscribing user: ${email} to newsletter with frequency: ${frequency}`);
  
  try {
    const subscribers = await loadSubscribers();
    
    // Check if email already exists
    const existingIndex = subscribers.findIndex(sub => sub.email === email);
    
    const timestamp = new Date().toISOString();
    let subscription;
    
    if (existingIndex >= 0) {
      // Update existing subscription
      subscription = {
        ...subscribers[existingIndex],
        name,
        topics,
        sources,
        frequency,
        updatedAt: timestamp,
      };
      subscribers[existingIndex] = subscription;
      console.log(`Updated existing subscription for ${email}`);
    } else {
      // Create new subscription
      subscription = {
        id: `sub_${Date.now()}`,
        email,
        name,
        topics,
        sources,
        frequency,
        isActive: true,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      subscribers.push(subscription);
      console.log(`Created new subscription for ${email}`);
    }
    
    // Save updated subscribers list
    await saveSubscribers(subscribers);
    console.log(`Saved subscribers list with ${subscribers.length} subscribers`);
    
    // Send welcome email for new subscribers
    if (existingIndex < 0) {
      console.log(`Sending welcome email to new subscriber: ${email}`);
      try {
        await sendWelcomeEmail(subscription);
        console.log(`Welcome email process completed for ${email}`);
      } catch (error) {
        console.error(`Failed to send welcome email to ${email}:`, error);
        // Don't fail the subscription process if email fails
      }
    }
    
    return subscription;
  } catch (error) {
    console.error(`Error in subscription process:`, error);
    throw error;
  }
}

/**
 * Unsubscribe user from newsletter
 * @param {string} email - User's email to unsubscribe
 * @returns {Object} Result of unsubscription
 */
async function unsubscribeNewsletter(email) {
  const subscribers = await loadSubscribers();
  
  // Find subscriber by email
  const index = subscribers.findIndex(sub => sub.email === email);
  
  if (index === -1) {
    return { success: false, message: 'Email not found in subscribers list' };
  }
  
  // Either remove completely or mark as inactive
  // Here we're marking as inactive to keep record
  subscribers[index].isActive = false;
  subscribers[index].updatedAt = new Date().toISOString();
  
  // Save updated subscribers list
  await saveSubscribers(subscribers);
  
  return { success: true, message: 'Successfully unsubscribed' };
}

/**
 * Get all newsletter subscribers
 * @param {boolean} [activeOnly=true] - Whether to return only active subscribers
 * @returns {Array} List of subscribers
 */
async function getNewsletterSubscribers(activeOnly = true) {
  const subscribers = await loadSubscribers();
  
  if (activeOnly) {
    return subscribers.filter(sub => sub.isActive !== false);
  }
  
  return subscribers;
}

/**
 * Create an email transporter using nodemailer
 * @returns {Object} Nodemailer transporter
 */
function createEmailTransporter() {
  console.log('Creating email transporter with service:', process.env.EMAIL_SERVICE);
  
  try {
    // Configure based on the email service
    const config = {
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      }
    };
    
    // For Gmail specifically, we need additional settings for reliability
    if (process.env.EMAIL_SERVICE === 'gmail') {
      config.host = 'smtp.gmail.com';
      config.port = 465;
      config.secure = true;
      // Required for some Gmail accounts with high security
      config.auth.type = 'login';
    }
    
    console.log('Transporter config:', JSON.stringify({
      ...config,
      auth: { ...config.auth, pass: '[REDACTED]' }
    }));
    
    const transporter = nodemailer.createTransport(config);
    
    return transporter;
  } catch (error) {
    console.error('Error creating email transporter:', error);
    throw error;
  }
}

/**
 * Send a welcome email to new subscribers
 * @param {Object} subscription - Subscription details
 */
async function sendWelcomeEmail(subscription) {
  try {
    console.log(`\n======= SENDING WELCOME EMAIL TO ${subscription.email} =======`);
    
    // If in test mode, just log instead of sending
    if (process.env.EMAIL_TEST_MODE === 'true') {
      console.log(`TEST MODE: Would have sent welcome email to ${subscription.email}`);
      
      // In test mode, if a test recipient is configured, send there instead
      if (process.env.EMAIL_TEST_RECIPIENT) {
        console.log(`TEST MODE: Redirecting email to ${process.env.EMAIL_TEST_RECIPIENT}`);
        subscription = { ...subscription, email: process.env.EMAIL_TEST_RECIPIENT };
      } else {
        // Just pretend we sent it
        return true;
      }
    }
    
    // Set up the Nodemailer transporter
    const transporter = createEmailTransporter();
    
    // Create welcome email HTML
    const welcomeHtml = generateWelcomeEmailHtml(subscription);
    
    // Prepare mail options with proper headers
    const mailOptions = {
      from: {
        name: 'Equora.AI',
        address: process.env.EMAIL_USER
      },
      to: subscription.email,
      subject: 'Welcome to Equora.AI Market Insights',
      html: welcomeHtml,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    };
    
    console.log(`Sending email to ${subscription.email}...`);
    
    // Use promise + timeouts for reliability
    return new Promise((resolve, reject) => {
      // Set a timeout to ensure we don't hang indefinitely
      const timeoutId = setTimeout(() => {
        console.error(`Email sending timed out for ${subscription.email}`);
        reject(new Error('Email sending timed out'));
      }, 30000); // 30 second timeout
      
      transporter.sendMail(mailOptions, (error, info) => {
        clearTimeout(timeoutId);
        
        if (error) {
          console.error('Error sending welcome email:', error);
          reject(error);
          return;
        }
        
        console.log(`Welcome email sent successfully to ${subscription.email}`);
        console.log(`Message ID: ${info.messageId}`);
        console.log(`======= EMAIL SENDING COMPLETE =======\n`);
        resolve(true);
      });
    });
  } catch (error) {
    console.error(`\n======= EMAIL SENDING FAILED =======`);
    console.error(`Error sending welcome email to ${subscription.email}:`, error);
    return false;
  }
}

/**
 * Send the newsletter to all active subscribers or a specific one
 * @param {string} [specificEmail] - Send only to this email if provided
 */
async function sendNewsletter(specificEmail = null) {
  try {
    console.log(`Starting newsletter sending process${specificEmail ? ` for ${specificEmail}` : ''}...`);
    
    // Get active subscribers
    const allSubscribers = await getNewsletterSubscribers(true);
    
    // Filter subscribers if specificEmail is provided
    const subscribers = specificEmail 
      ? allSubscribers.filter(sub => sub.email === specificEmail)
      : allSubscribers;
    
    if (!subscribers.length) {
      console.log('No subscribers to send newsletter to');
      return true;
    }
    
    // If in test mode, modify the behavior
    if (process.env.EMAIL_TEST_MODE === 'true') {
      if (process.env.EMAIL_TEST_RECIPIENT) {
        console.log(`TEST MODE: Redirecting all newsletters to test recipient: ${process.env.EMAIL_TEST_RECIPIENT}`);
        // Just send to the test recipient
        subscribers.length = 0;
        subscribers.push({
          email: process.env.EMAIL_TEST_RECIPIENT,
          name: 'Test Recipient',
          isActive: true
        });
      } else {
        console.log(`TEST MODE: Would have sent newsletters to ${subscribers.length} subscribers`);
        return true;
      }
    }
    
    console.log(`Sending newsletter to ${subscribers.length} subscribers...`);
    
    // Get market data for the newsletter
    const marketData = getMarketData();
    
    // Generate newsletter HTML
    const newsletterHtml = await generateNewsletterHtml(marketData);
    
    // Set up the Nodemailer transporter
    const transporter = createEmailTransporter();
    
    // Send to each subscriber sequentially
    for (const subscriber of subscribers) {
      try {
        console.log(`Sending newsletter to ${subscriber.email}...`);
        
        // Prepare mail options with proper headers
        const mailOptions = {
          from: {
            name: 'Equora.AI',
            address: process.env.EMAIL_USER
          },
          to: subscriber.email,
          subject: `Market Insights - ${new Date().toLocaleDateString()}`,
          html: newsletterHtml,
          headers: {
            'X-Priority': '1',
            'X-MSMail-Priority': 'High',
            'Importance': 'high'
          }
        };
        
        // Use promise + timeouts for reliability
        await new Promise((resolve, reject) => {
          // Set a timeout to ensure we don't hang indefinitely
          const timeoutId = setTimeout(() => {
            console.error(`Email sending timed out for ${subscriber.email}`);
            reject(new Error('Email sending timed out'));
          }, 30000); // 30 second timeout
          
          transporter.sendMail(mailOptions, (error, info) => {
            clearTimeout(timeoutId);
            
            if (error) {
              console.error(`Failed to send newsletter to ${subscriber.email}:`, error);
              reject(error);
              return;
            }
            
            console.log(`Newsletter sent successfully to ${subscriber.email}`);
            console.log(`Message ID: ${info.messageId}`);
            resolve(true);
          });
        });
        
        // Add a small delay between sends to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error sending newsletter to ${subscriber.email}:`, error);
        // Continue with other subscribers even if one fails
      }
    }
    
    console.log('Newsletter sending process completed successfully');
    return true;
  } catch (error) {
    console.error('Error in newsletter sending process:', error);
    return false;
  }
}

/**
 * Generate HTML for welcome email
 * @param {Object} subscription - Subscription details
 * @returns {string} HTML content
 */
function generateWelcomeEmailHtml(subscription) {
  const firstName = subscription.name ? subscription.name.split(' ')[0] : 'there';
  
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Equora.AI</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f7fa;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(90deg, #2e7feb, #4646fa);
            padding: 30px 20px;
            text-align: center;
            color: white;
          }
          .content {
            padding: 30px 20px;
          }
          .footer {
            background-color: #f5f5f5;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          .button {
            display: inline-block;
            background-color: #2e7feb;
            color: white;
            text-decoration: none;
            padding: 12px 25px;
            border-radius: 4px;
            font-weight: bold;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Equora.AI</h1>
          </div>
          <div class="content">
            <h2>Hi ${firstName}!</h2>
            <p>Thank you for subscribing to our Market Insights Newsletter.</p>
            <p>You'll be receiving ${subscription.frequency} updates with the latest market trends, sentiment analysis, and financial insights.</p>
            <p>Here's what you can expect:</p>
            <ul>
              <li>Market sentiment analysis and trends</li>
              <li>Technical indicator analysis</li>
              <li>Stock performance reports</li>
              <li>AI-powered market predictions</li>
            </ul>
            <p>Your first newsletter will arrive soon!</p>
            <div style="text-align: center;">
              <a href="https://equora.ai/dashboard" class="button">Visit Dashboard</a>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Equora.AI. All rights reserved.</p>
            <p>If you didn't sign up for this newsletter, you can <a href="https://equora.ai/unsubscribe?email=${subscription.email}">unsubscribe here</a>.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate HTML for the newsletter
 * @param {Object} marketData - Market data for the newsletter
 * @returns {string} HTML content
 */
async function generateNewsletterHtml(marketData) {
  // Get AI-generated market analysis
  let marketAnalysis = '';
  try {
    const prompt = `Generate a concise financial market analysis based on this data:
    
    Market sentiment: ${marketData.overallSentiment.toFixed(2)} (range -1 to 1)
    Market value: ${marketData.currentValue.toFixed(2)}
    Percent change: ${marketData.percentChange.toFixed(2)}%
    Volatility index: ${marketData.volatilityIndex.toFixed(2)}
    RSI: ${marketData.technicalIndicators.rsi.toFixed(2)}
    MACD: ${marketData.technicalIndicators.macd.toFixed(4)}
    
    Keep your analysis professional, fact-based, and under 150 words. Focus on what these numbers suggest about market conditions. Do not mention that you're an AI or reference this prompt.`;
    
    marketAnalysis = await generateChatResponse(prompt);
    
    // Fallback if AI fails
    if (!marketAnalysis) {
      marketAnalysis = `Market sentiment is currently ${marketData.overallSentiment > 0 ? 'positive' : 'negative'} at ${marketData.overallSentiment.toFixed(2)}, with the market showing a ${marketData.percentChange > 0 ? 'gain' : 'decline'} of ${Math.abs(marketData.percentChange).toFixed(2)}%. Technical indicators suggest a ${marketData.technicalIndicators.rsi > 70 ? 'overbought' : marketData.technicalIndicators.rsi < 30 ? 'oversold' : 'neutral'} environment.`;
    }
  } catch (error) {
    console.error('Error generating market analysis:', error);
    marketAnalysis = `Market sentiment is currently at ${marketData.overallSentiment.toFixed(2)}, with the market showing a ${marketData.percentChange > 0 ? 'gain' : 'decline'} of ${Math.abs(marketData.percentChange).toFixed(2)}%.`;
  }
  
  // Format date
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = new Date().toLocaleDateString('en-US', dateOptions);
  
  // Select top performing stocks
  const topStocks = marketData.topStocks
    .sort((a, b) => b.percentChange - a.percentChange)
    .slice(0, 3);
  
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Equora.AI Market Insights</title>
        <style>
          body, p, h1, h2, h3, h4, h5, h6 {
            margin: 0;
            padding: 0;
          }
          body {
            background-color: #f5f7fa;
            font-family: Arial, sans-serif;
            color: #333;
            line-height: 1.6;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(90deg, #2e7feb, #4646fa);
            text-align: center;
            padding: 30px 20px;
            color: #fff;
          }
          .header h1 {
            font-size: 26px;
            margin-bottom: 5px;
          }
          .header p {
            font-size: 14px;
          }
          .content {
            padding: 20px;
          }
          .content h2 {
            color: #2e7feb;
            font-size: 20px;
            margin: 20px 0 10px;
          }
          .content p {
            margin-bottom: 15px;
            font-size: 15px;
          }
          .section {
            margin-bottom: 30px;
          }
          .section-header {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
          }
          .section-icon {
            font-size: 22px;
            margin-right: 10px;
          }
          .sentiment-card {
            background-color: #f9f9f9;
            border-left: 4px solid #2e7feb;
            padding: 15px;
            margin-bottom: 20px;
          }
          .tech-indicators {
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 10px;
            margin: 15px 0;
          }
          .indicator {
            background-color: #f0f7ff;
            border-radius: 6px;
            padding: 10px;
            flex: 1;
            min-width: 100px;
            text-align: center;
          }
          .indicator h3 {
            font-size: 16px;
            margin-bottom: 5px;
          }
          .indicator p {
            font-size: 18px;
            font-weight: bold;
            margin: 0;
          }
          .stocks-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
          }
          .stocks-table th,
          .stocks-table td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          .stocks-table th {
            background-color: #f5f5f5;
          }
          .positive {
            color: #4caf50;
          }
          .negative {
            color: #f44336;
          }
          .cta {
            text-align: center;
            margin: 30px 0;
          }
          .cta a {
            background-color: #2e7feb;
            color: #ffffff;
            padding: 12px 25px;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
            font-weight: bold;
          }
          .footer {
            background-color: #f0f0f0;
            text-align: center;
            padding: 20px;
            font-size: 13px;
            color: #777;
          }
          .footer a {
            color: #2e7feb;
            text-decoration: none;
          }
          .social-links {
            margin: 10px 0;
          }
          .disclaimer {
            font-size: 11px;
            color: #999;
            margin-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header Section -->
          <div class="header">
            <h1>Equora.AI Market Insights</h1>
            <p>${formattedDate}</p>
          </div>
          
          <!-- Content Section -->
          <div class="content">
            <h2>Market Overview</h2>
            <div class="sentiment-card">
              <p>${marketAnalysis}</p>
            </div>
            
            <!-- Technical Indicators Section -->
            <div class="section">
              <div class="section-header">
                <span class="section-icon">📊</span>
                <h2>Technical Indicators</h2>
              </div>
              <p>Key technical indicators for today's market analysis:</p>
              
              <div class="tech-indicators">
                <div class="indicator">
                  <h3>RSI</h3>
                  <p>${marketData.technicalIndicators.rsi.toFixed(2)}</p>
                  <small>${marketData.technicalIndicators.rsi > 70 ? 'Overbought' : marketData.technicalIndicators.rsi < 30 ? 'Oversold' : 'Neutral'}</small>
                </div>
                <div class="indicator">
                  <h3>MACD</h3>
                  <p>${marketData.technicalIndicators.macd.toFixed(3)}</p>
                  <small>${marketData.technicalIndicators.macd > 0 ? 'Bullish' : 'Bearish'}</small>
                </div>
                <div class="indicator">
                  <h3>Volatility</h3>
                  <p>${marketData.volatilityIndex.toFixed(2)}</p>
                  <small>${marketData.volatilityIndex > 25 ? 'High' : marketData.volatilityIndex > 15 ? 'Moderate' : 'Low'}</small>
                </div>
              </div>
            </div>
            
            <!-- Top Stocks Section -->
            <div class="section">
              <div class="section-header">
                <span class="section-icon">🚀</span>
                <h2>Top Performing Stocks</h2>
              </div>
              <p>These stocks are showing notable performance today:</p>
              
              <table class="stocks-table">
                <thead>
                  <tr>
                    <th>Stock</th>
                    <th>Symbol</th>
                    <th>Change</th>
                  </tr>
                </thead>
                <tbody>
                  ${topStocks.map(stock => `
                    <tr>
                      <td>${stock.name}</td>
                      <td>${stock.symbol}</td>
                      <td class="${stock.percentChange >= 0 ? 'positive' : 'negative'}">
                        ${stock.percentChange >= 0 ? '+' : ''}${stock.percentChange.toFixed(2)}%
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            
            <!-- Market Breadth Section -->
            <div class="section">
              <div class="section-header">
                <span class="section-icon">📈</span>
                <h2>Market Breadth</h2>
              </div>
              <p>Today's market breadth indicators:</p>
              
              <ul>
                <li><strong>Advancing Stocks:</strong> ${marketData.marketBreadth.advancers}</li>
                <li><strong>Declining Stocks:</strong> ${marketData.marketBreadth.decliners}</li>
                <li><strong>New Highs:</strong> ${marketData.marketBreadth.newHighs}</li>
                <li><strong>New Lows:</strong> ${marketData.marketBreadth.newLows}</li>
              </ul>
              
              <p>The advance-decline ratio of ${(marketData.marketBreadth.advancers / marketData.marketBreadth.decliners).toFixed(2)} indicates 
              ${marketData.marketBreadth.advancers > marketData.marketBreadth.decliners ? 'broad market strength' : 'narrow market participation'}.</p>
            </div>
            
            <!-- Recent News Section -->
            <div class="section">
              <div class="section-header">
                <span class="section-icon">📰</span>
                <h2>Market News</h2>
              </div>
              <p>Key news affecting markets today:</p>
              
              <ul>
                ${marketData.recentNews.map(news => `
                  <li>
                    <strong>${news.title}</strong> - 
                    <span class="${news.sentiment > 0.2 ? 'positive' : news.sentiment < -0.2 ? 'negative' : ''}">
                      Impact: ${news.sentiment > 0.2 ? 'Positive' : news.sentiment < -0.2 ? 'Negative' : 'Neutral'}
                    </span>
                  </li>
                `).join('')}
              </ul>
            </div>
            
            <!-- CTA Section -->
            <div class="cta">
              <a href="https://equora.ai/dashboard">View Full Dashboard</a>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <p>You're receiving this email because you subscribed to Equora.AI Market Insights.</p>
            <div class="social-links">
              <a href="https://twitter.com/equora_ai">Twitter</a> • 
              <a href="https://linkedin.com/company/equora-ai">LinkedIn</a> • 
              <a href="https://equora.ai">Website</a>
            </div>
            <p><a href="https://equora.ai/unsubscribe">Unsubscribe</a> | <a href="https://equora.ai/preferences">Manage Preferences</a></p>
            <div class="disclaimer">
              This newsletter is for informational purposes only and does not constitute investment advice. 
              Past performance is not indicative of future results. Investing involves risk, including possible loss of principal.
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

module.exports = {
  subscribeNewsletter,
  unsubscribeNewsletter,
  getNewsletterSubscribers,
  sendNewsletter,
}; 