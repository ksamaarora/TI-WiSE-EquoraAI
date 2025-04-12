const stockService = require('../services/stock.service');

const getWeeklyStockData = async (req, res) => {
  try {
    const data = await stockService.fetchStockData('TIME_SERIES_WEEKLY');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getWeeklyStockData };
