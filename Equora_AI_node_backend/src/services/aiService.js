const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
const dashboardData = require('./dashboardData');

/**
 * Generate a response for the user query using Google's Gemini model
 * @param {string} query - The user's query
 * @returns {string} The AI-generated response
 */
exports.generateChatResponse = async (query) => {
  // Get API key from environment variables
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }

  // Initialize the Google Generative AI with the API key
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  // Configure generation parameters for briefer responses
  const generationConfig = {
    temperature: 0.4,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 2000, // Reduced token limit for shorter responses
    responseMimeType: 'text/plain',
  };

  // Get relevant dashboard data
  const marketData = dashboardData.getMarketData();
  const dashboardComponents = dashboardData.getDashboardComponents();
  
  // Determine if query is about dashboard components
  const isDashboardQuery = query.toLowerCase().includes('dashboard') || 
                          query.toLowerCase().includes('chart') || 
                          query.toLowerCase().includes('graph') ||
                          query.toLowerCase().includes('explain');

  // Create a system prompt for financial assistant
  const systemPrompt = `You are Equora.AI's financial assistant. Be extremely concise, limiting responses to 2-3 sentences when possible. Avoid unnecessary words.

Current Dashboard Data:
${JSON.stringify(marketData, null, 2)}

When asked about the dashboard, refer to this specific component information:
${JSON.stringify(dashboardComponents, null, 2)}

Key Guidelines:
- Keep answers under 100 words whenever possible
- Make precise references to actual data from the dashboard
- If asked about market sentiment, reference the current sentiment value: ${marketData.overallSentiment.toFixed(2)}
- For technical indicators, cite the actual RSI (${marketData.technicalIndicators.rsi.toFixed(2)}) and MACD (${marketData.technicalIndicators.macd.toFixed(2)})
- Use bullet points for lists
- Avoid lengthy introductions and conclusions
`;

  // Start a chat session with the model
  const chatSession = model.startChat({
    generationConfig,
    history: [
      {
        role: 'user',
        parts: [{ text: 'Be extremely concise with your answers.' }],
      },
      {
        role: 'model',
        parts: [{ text: "I'll keep my responses brief and to the point." }],
      },
    ],
  });

  // Build context for the financial query
  const prompt = `${systemPrompt}
  
User Question: ${query}

Remember to be extremely concise (2-3 sentences when possible) and directly reference dashboard data in your answer.`;

  try {
    // Send the message to the model and get the response
    const result = await chatSession.sendMessage(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw new Error(`Failed to generate response: ${error.message}`);
  }
}; 