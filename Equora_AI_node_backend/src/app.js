const express = require('express');
const stockDailyRoutes = require('./routes/stocksDaily.routes');
const stockWeeklyRoutes = require('./routes/stocksWeekly.routes');
const yahooRoutes = require('./routes/yahooRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());

// Configure CORS with more detailed options
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400, // 24 hours in seconds
}));

// Routes
app.use('/api/stocks', stockDailyRoutes);
app.use('/api/stocks', stockWeeklyRoutes);
app.use('/api/yahoo', yahooRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/newsletter', newsletterRoutes);

// Add route to test API is running
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'API is running',
    time: new Date().toISOString()
  });
});

// Default Route
app.get('/', (req, res) => {
  res.send('Equora API is running...');
});

module.exports = app;
