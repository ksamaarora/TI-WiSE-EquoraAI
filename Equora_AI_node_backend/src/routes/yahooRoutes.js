const express = require('express');
const router = express.Router();
const yahooController = require('../controllers/yahooController');

// Define the Yahoo Finance route
router.get('/quotes', yahooController.getQuotes);

module.exports = router;
