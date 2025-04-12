require('dotenv').config();

module.exports = {
  API_KEY: process.env.ALPHA_VANTAGE_API_KEY,
  BASE_URL: 'https://www.alphavantage.co/query',
  PORT: process.env.PORT || 3000,
};
