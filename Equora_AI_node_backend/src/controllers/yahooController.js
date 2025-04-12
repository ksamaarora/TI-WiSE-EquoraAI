const yahooService = require('../services/yahooService');

const yahooController = {
    async getQuotes(req, res) {
        const tickers = req.query.tickers || 'AAPL,MSFT,^SPX';

        try {
            const data = await yahooService.getStockQuotes(tickers);
            
            res.status(200).json({
                success: true,
                data
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch stock data',
                error: error.message
            });
        }
    }
};

module.exports = yahooController;
