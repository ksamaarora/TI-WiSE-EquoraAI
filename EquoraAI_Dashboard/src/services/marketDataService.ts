// marketDataService.ts
import axios from 'axios';

// This is marketDataService.ts from src/services/marketDataService.ts

const API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_KEY; 
// or process.env.REACT_APP_ALPHA_VANTAGE_KEY, depending on your setup

// Example function to fetch intraday data for a given symbol
export async function getIntradayData(symbol: string, interval = '5min') {
  try {
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=${interval}&apikey=${API_KEY}`;
    const response = await axios.get(url);
    return response.data; 
  } catch (error) {
    console.error('Error fetching intraday data:', error);
    throw error;
  }
}

// src/services/marketDataService.ts
// import axios from 'axios';

// const API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_KEY;

// export async function getMarketData(
//   symbol: string,
//   timeFrame: 'daily' | 'weekly' | 'monthly'
// ) {
//   try {
//     let url = '';
//     if (timeFrame === 'daily') {
//       url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`;
//     } else if (timeFrame === 'weekly') {
//       url = `https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=${symbol}&apikey=${API_KEY}`;
//     } else if (timeFrame === 'monthly') {
//       url = `https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol=${symbol}&apikey=${API_KEY}`;
//     }
//     console.log("Fetching URL:", url);
//     const response = await axios.get(url);
//     console.log("API response:", response.data);

//     // Check if the response contains an error message
//     if (response.data["Error Message"] || response.data["Note"]) {
//       console.error("API Error:", response.data);
//       throw new Error("API returned an error");
//     }

//     return response.data;
//   } catch (error) {
//     console.error('Error fetching market data:', error);
//     throw error;
//   }
// }

