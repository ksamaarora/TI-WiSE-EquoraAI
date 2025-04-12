const axios = require('axios');
const config = require('../config/config');

const STOCK_SYMBOL = 'IBM'; // Hardcoded stock symbol

const fetchStockData = async (functionType) => {
  try {
    const url = `${config.BASE_URL}?function=${functionType}&symbol=${STOCK_SYMBOL}&apikey=${config.API_KEY}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw new Error('Error fetching stock data');
  }
};

module.exports = { fetchStockData };
