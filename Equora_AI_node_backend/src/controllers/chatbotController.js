const { generateChatResponse } = require('../services/aiService');
const dashboardData = require('../services/dashboardData');

/**
 * Process user query and return AI-generated response
 * @param {Object} req - Express request object with query in the body
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with answer
 */
exports.processQuery = async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query not provided' });
    }

    // Check if it's a greeting
    if (isGreeting(query)) {
      return res.json({
        answer: "Hello! I'm your Equora.AI assistant. Ask me about market sentiment or any dashboard components.",
        source: "greeting"
      });
    }

    // Check if it's a direct question about a dashboard component
    const componentData = checkDashboardComponentQuery(query);
    if (componentData) {
      return res.json({
        answer: componentData.description,
        data: componentData.data,
        source: "dashboard"
      });
    }

    // Generate response using AI
    const answer = await generateChatResponse(query);
    
    return res.json({ answer, source: "ai" });
  } catch (error) {
    console.error('Error processing chatbot query:', error);
    return res.status(500).json({ 
      error: 'Error processing your query',
      details: error.message 
    });
  }
};

/**
 * Check if a query is a simple greeting
 * @param {string} query - User message to check
 * @returns {boolean} True if query is a greeting
 */
function isGreeting(query) {
  const greetings = ['hi', 'hello', 'hey', 'howdy', 'hi there', 'hello there'];
  return greetings.includes(query.toLowerCase().trim());
}

/**
 * Check if the user is directly asking about a dashboard component
 * @param {string} query - User query to check
 * @returns {Object|null} Component data if found, null otherwise
 */
function checkDashboardComponentQuery(query) {
  const lowerQuery = query.toLowerCase();
  const components = dashboardData.getDashboardComponents();
  
  // Direct questions about dashboard components
  if (lowerQuery.includes('what is') || lowerQuery.includes('explain') || lowerQuery.includes('tell me about')) {
    // Check for sentiment overview
    if (lowerQuery.includes('sentiment overview') || lowerQuery.includes('sentiment score')) {
      return {
        description: components["Sentiment Overview"].description,
        data: dashboardData.getComponentData('sentiment overview')
      };
    }
    
    // Check for price correlation
    if (lowerQuery.includes('price correlation') || lowerQuery.includes('correlation chart')) {
      return {
        description: components["Price Correlation Chart"].description,
        data: dashboardData.getComponentData('correlation')
      };
    }
    
    // Check for technical indicators
    if (lowerQuery.includes('technical indicator') || lowerQuery.includes('rsi') || lowerQuery.includes('macd')) {
      return {
        description: components["Technical Indicators"].description,
        data: dashboardData.getComponentData('technical')
      };
    }
    
    // Check for sentiment prediction
    if (lowerQuery.includes('sentiment prediction') || lowerQuery.includes('forecast')) {
      return {
        description: components["Sentiment Prediction"].description,
        data: dashboardData.getComponentData('prediction')
      };
    }
    
    // Check for news sentiment
    if (lowerQuery.includes('news sentiment') || lowerQuery.includes('headlines')) {
      return {
        description: components["News Sentiment"].description,
        data: dashboardData.getComponentData('news')
      };
    }
  }
  
  // General dashboard query
  if (lowerQuery === 'dashboard' || lowerQuery === 'what\'s on the dashboard' || lowerQuery === 'explain the dashboard') {
    const componentsList = Object.keys(components).map(key => 
      `${key}: ${components[key].description.split('.')[0]}`
    ).join('\n\n');
    
    return {
      description: `The dashboard contains these main components:\n\n${componentsList}`,
      data: null
    };
  }
  
  return null;
} 