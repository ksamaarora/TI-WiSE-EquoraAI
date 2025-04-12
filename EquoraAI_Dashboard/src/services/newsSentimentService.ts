// src/services/newsSentimentService.ts
import axios from 'axios';

const API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_KEY;
let cachedNewsSentiment: any = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 60 * 60 * 1000; // Cache for 1 hour

export async function getNewsSentiment(
  tickers: string = '',
  topics: string = '',
  time_from: string = '',
  time_to: string = '',
  sort: string = 'LATEST',
  limit: number = 50
) {
  // Check if cached data is still valid
  const now = Date.now();
  if (cachedNewsSentiment && now - cacheTimestamp < CACHE_DURATION) {
    return cachedNewsSentiment;
  }

  try {
    let url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&apikey=${API_KEY}`;
    if (tickers) {
      url += `&tickers=${tickers}`;
    }
    if (topics) {
      url += `&topics=${topics}`;
    }
    if (time_from) {
      url += `&time_from=${time_from}`;
    }
    if (time_to) {
      url += `&time_to=${time_to}`;
    }
    if (sort) {
      url += `&sort=${sort}`;
    }
    if (limit) {
      url += `&limit=${limit}`;
    }
    const response = await axios.get(url);
    console.log("Full news sentiment response:", response.data); // Add the log here

    // If the response contains rate-limit message or error, throw an error
    if (response.data.Note || response.data["Error Message"]) {
      throw new Error(response.data.Note || response.data["Error Message"]);
    }
    // Cache the response
    cachedNewsSentiment = response.data;
    cacheTimestamp = now;
    return response.data;
  } catch (error) {
    console.error("Error fetching news sentiment data:", error);
    throw error;
  }
}
