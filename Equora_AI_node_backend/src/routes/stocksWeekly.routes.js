const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stocksWeekly.controller');

router.get('/weekly', stockController.getWeeklyStockData);

module.exports = router;
