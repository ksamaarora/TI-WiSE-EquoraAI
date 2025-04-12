const { subscribeNewsletter, unsubscribeNewsletter, getNewsletterSubscribers } = require('../services/newsletterService');

/**
 * Subscribe a user to the newsletter
 * @param {Object} req - Express request object with email in the body
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with subscription details
 */
exports.subscribe = async (req, res) => {
  try {
    const { email, name, topics, sources, frequency } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    const subscription = await subscribeNewsletter({ 
      email, 
      name, 
      topics: topics || [], 
      sources: sources || [], 
      frequency: frequency || 'weekly' 
    });
    
    return res.status(200).json({ 
      message: 'Successfully subscribed to newsletter',
      subscription
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return res.status(500).json({ 
      error: 'Failed to subscribe to newsletter',
      details: error.message 
    });
  }
};

/**
 * Unsubscribe a user from the newsletter
 * @param {Object} req - Express request object with email in the body
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with unsubscription status
 */
exports.unsubscribe = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const result = await unsubscribeNewsletter(email);
    
    return res.status(200).json({ 
      message: 'Successfully unsubscribed from newsletter',
      result
    });
  } catch (error) {
    console.error('Newsletter unsubscription error:', error);
    return res.status(500).json({ 
      error: 'Failed to unsubscribe from newsletter',
      details: error.message 
    });
  }
};

/**
 * Get all newsletter subscribers
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with subscribers list
 */
exports.getSubscribers = async (req, res) => {
  try {
    const subscribers = await getNewsletterSubscribers();
    
    return res.status(200).json({ 
      subscribers,
      count: subscribers.length
    });
  } catch (error) {
    console.error('Error fetching newsletter subscribers:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch newsletter subscribers',
      details: error.message 
    });
  }
}; 