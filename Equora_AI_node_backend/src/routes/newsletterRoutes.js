const express = require('express');
const router = express.Router();
const newsletterController = require('../controllers/newsletterController');

// Newsletter subscription endpoint
router.post('/subscribe', newsletterController.subscribe);

// Newsletter unsubscribe endpoint
router.post('/unsubscribe', newsletterController.unsubscribe);

// Get newsletter subscribers
router.get('/subscribers', newsletterController.getSubscribers);

module.exports = router; 