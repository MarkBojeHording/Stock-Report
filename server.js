const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express(); // Create an instance of Express
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'Public')));

const polygonApiKey = process.env.POLYGON_API_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

console.log('Polygon API Key Loaded:', Boolean(polygonApiKey));
console.log('OpenAI API Key Loaded:', Boolean(openaiApiKey));

if (!polygonApiKey || !openaiApiKey) {
    console.error("API keys are missing. Make sure they are defined in your .env file.");
    process.exit(1);
}

// Endpoint to serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Public', 'index.html'));
});

// API Endpoint to fetch stock data
app.get('/api/stock-data', async (req, res) => {
    const { ticker, startDate, endDate } = req.query;

    try {
        const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${startDate}/${endDate}?adjusted=true&sort=asc&apiKey=${polygonApiKey}`;

        const stockDataResponse = await axios.get(url);

        if (stockDataResponse.status !== 200 || !stockDataResponse.data) {
            return res.status(500).json({ error: 'Failed to fetch stock data.' });
        }

        res.status(200).json(stockDataResponse.data);
    } catch (error) {
        console.error('Error fetching stock data:', error.message);
        console.error("Error details:", error.response?.data || error);

        if (error.response?.status === 403) {
            res.status(403).json({
                error: "Your plan doesn't include this data timeframe. Please ensure you're requesting delayed data or upgrade your plan at https://polygon.io/pricing.",
            });
        } else {
            res.status(500).json({
                error: error.response?.data?.message || 'Failed to fetch stock data.',
            });
        }
    }
});

// Start the server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
