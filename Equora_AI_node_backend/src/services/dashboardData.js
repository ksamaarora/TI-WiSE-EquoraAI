/**
 * This module provides access to real-time dashboard data
 * that the chatbot can reference when answering user queries
 */

// Simulated market data (in production, this would fetch from real data sources)
let marketData = {
  // Overall market sentiment (-1 to 1 range)
  overallSentiment: 0.32,
  currentValue: 4286.52,
  percentChange: 0.78,
  volatilityIndex: 16.45,
  
  // Technical indicators
  technicalIndicators: {
    rsi: 63.5,
    macd: 0.085,
    movingAverages: {
      ma50: 4218.75,
      ma200: 4150.20
    },
    bollingerBands: {
      upper: 4325.60,
      middle: 4275.25,
      lower: 4225.90
    }
  },
  
  // Market breadth information
  marketBreadth: {
    advancers: 352,
    decliners: 148,
    newHighs: 62,
    newLows: 15
  },
  
  // Top performing stocks
  topStocks: [
    { symbol: "AAPL", name: "Apple Inc", percentChange: 2.1, volume: 75000000 },
    { symbol: "MSFT", name: "Microsoft", percentChange: 1.8, volume: 45000000 },
    { symbol: "AMZN", name: "Amazon", percentChange: 1.5, volume: 35000000 }
  ],
  
  // Recent news affecting markets
  recentNews: [
    { 
      title: "Fed signals potential rate cut in September", 
      source: "Bloomberg", 
      timestamp: new Date().toISOString(),
      sentiment: 0.65
    },
    { 
      title: "Tech stocks rally on AI advancements", 
      source: "Reuters", 
      timestamp: new Date().toISOString(),
      sentiment: 0.72
    }
  ],
  
  // Price correlations with sentiment
  priceCorrelation: {
    stocks: [
      { symbol: "TSLA", name: "Tesla", correlationIndex: 0.82 },
      { symbol: "NVDA", name: "NVIDIA", correlationIndex: 0.76 },
      { symbol: "JPM", name: "JPMorgan Chase", correlationIndex: 0.45 }
    ]
  },
  
  // Sentiment predictions for future
  sentimentPrediction: {
    confidenceLevel: 78,
    predictions: [
      { day: 1, predicted: 0.35 },
      { day: 2, predicted: 0.38 },
      { day: 3, predicted: 0.41 },
      { day: 4, predicted: 0.39 },
      { day: 5, predicted: 0.42 }
    ]
  }
};

// Dashboard component descriptions for the chatbot to reference
const dashboardComponents = {
  "Sentiment Overview": {
    description: "Shows the overall market sentiment score ranging from -1 (extremely negative) to 1 (extremely positive), with current value and percent change.",
    location: "Top left section",
    metrics: ["sentiment score", "current value", "percent change"]
  },
  "Price Correlation Chart": {
    description: "Visualizes how stocks correlate with overall market sentiment. Stocks are plotted based on price performance (x-axis) and correlation with sentiment (y-axis).",
    location: "Center panel",
    interpretation: "Stocks in top-right quadrant have positive price movement with high correlation to sentiment."
  },
  "Technical Indicators": {
    description: "Displays key market technical indicators including RSI, MACD, and moving averages.",
    location: "Right sidebar",
    indicators: {
      "RSI": "Relative Strength Index measures overbought/oversold conditions. Values above 70 are overbought, below 30 are oversold.",
      "MACD": "Moving Average Convergence Divergence shows momentum direction. Positive values indicate bullish momentum.",
      "Moving Averages": "50-day and 200-day moving averages help identify long-term trends."
    }
  },
  "Sentiment Prediction": {
    description: "Machine learning forecast of market sentiment for the next 5 days based on historical patterns.",
    location: "Bottom section",
    interpretation: "Green line shows predicted bullish sentiment, red shows bearish prediction."
  },
  "News Sentiment": {
    description: "Analysis of how recent news impacts market sentiment with source attribution.",
    location: "Middle right panel",
    metrics: ["headline", "source", "sentiment impact score"]
  }
};

/**
 * Get current market data
 * @returns {Object} Current market data
 */
exports.getMarketData = () => {
  // In a real implementation, this would fetch fresh data
  // Update a few values to simulate real-time changes
  marketData.overallSentiment = parseFloat((marketData.overallSentiment + (Math.random() * 0.06 - 0.03)).toFixed(2));
  marketData.currentValue = parseFloat((marketData.currentValue + (Math.random() * 10 - 5)).toFixed(2));
  marketData.percentChange = parseFloat((marketData.percentChange + (Math.random() * 0.2 - 0.1)).toFixed(2));
  
  return marketData;
};

/**
 * Get dashboard component descriptions
 * @returns {Object} Description of dashboard components
 */
exports.getDashboardComponents = () => {
  return dashboardComponents;
};

/**
 * Get data for a specific chart or component
 * @param {string} componentName - Name of the dashboard component
 * @returns {Object} Data for the specified component
 */
exports.getComponentData = (componentName) => {
  // Convert to lowercase for case-insensitive matching
  const component = componentName.toLowerCase();
  
  if (component.includes('sentiment') && component.includes('overview')) {
    return {
      overallSentiment: marketData.overallSentiment,
      currentValue: marketData.currentValue,
      percentChange: marketData.percentChange
    };
  }
  
  if (component.includes('technical')) {
    return marketData.technicalIndicators;
  }
  
  if (component.includes('correlation')) {
    return marketData.priceCorrelation;
  }
  
  if (component.includes('prediction')) {
    return marketData.sentimentPrediction;
  }
  
  if (component.includes('news')) {
    return marketData.recentNews;
  }
  
  // Default return entire market data if component not found
  return marketData;
}; 