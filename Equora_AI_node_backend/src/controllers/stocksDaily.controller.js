const stockService = require('../services/stock.service');

const getDailyStockData = async (req, res) => {
  try {
    const data = await stockService.fetchStockData('TIME_SERIES_DAILY');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getDailyStockData };
