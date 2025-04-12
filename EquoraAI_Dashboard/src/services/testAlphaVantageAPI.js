// Test script for Alpha Vantage API
const axios = require('axios');

// Using the API key directly for testing
const API_KEY = 'ENVZWD4RMWCC6EVQ';

async function testAlphaVantageAPI() {
  try {
    console.log('Testing Alpha Vantage API...');
    const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=AAPL,MSFT&apikey=${API_KEY}`;
    
    console.log('Request URL:', url);
    const response = await axios.get(url);
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    // Check if we get rate limit message
    if (response.data.Note) {
      console.log('Rate limit message:', response.data.Note);
    }
    
    // Check if we get error message
    if (response.data["Error Message"]) {
      console.log('Error message:', response.data["Error Message"]);
    }
    
    // Check the structure of the response
    console.log('Response keys:', Object.keys(response.data));
    
    // Check if feed exists and is an array
    if (response.data.feed && Array.isArray(response.data.feed)) {
      console.log('Feed is an array with', response.data.feed.length, 'items');
      
      // Log first item structure if available
      if (response.data.feed.length > 0) {
        console.log('First feed item keys:', Object.keys(response.data.feed[0]));
      }
    } else {
      console.log('Feed is not an array or does not exist');
      console.log('Data structure:', JSON.stringify(response.data, null, 2).substring(0, 500) + '...');
    }
  } catch (error) {
    console.error('Error testing API:', error.message);
    if (error.response) {
      console.error('Error response data:', error.response.data);
    }
  }
}

// Run the test function
testAlphaVantageAPI(); 