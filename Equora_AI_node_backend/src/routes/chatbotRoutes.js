const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

// Chatbot query endpoint
router.post('/query', chatbotController.processQuery);

module.exports = router; 