const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stocksDaily.controller');

router.get('/daily', stockController.getDailyStockData);

module.exports = router;
