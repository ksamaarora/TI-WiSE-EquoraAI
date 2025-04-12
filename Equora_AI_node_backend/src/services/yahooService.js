const https = require('https');

const getStockQuotes = (tickers) => {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            hostname: 'yahoo-finance15.p.rapidapi.com',
            port: null,
            path: `/api/v1/markets/stock/quotes?ticker=${encodeURIComponent(tickers)}`,
            headers: {
                'x-rapidapi-key': process.env.YAHOO_API_KEY,
                'x-rapidapi-host': 'yahoo-finance15.p.rapidapi.com'
            }
        };

        const req = https.request(options, (res) => {
            const chunks = [];

            res.on('data', (chunk) => {
                chunks.push(chunk);
            });

            res.on('end', () => {
                const body = Buffer.concat(chunks);
                try {
                    const json = JSON.parse(body.toString());
                    resolve(json);
                } catch (error) {
                    reject(error);
                }
            });
        });

        req.on('error', (error) => reject(error));
        req.end();
    });
};

// ✅ Exporting the function properly
module.exports = { getStockQuotes };
