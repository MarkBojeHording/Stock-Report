const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const polygonApiKey = process.env.POLYGON_API_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

console.log('Polygon API Key Loaded:', Boolean(polygonApiKey));
console.log('OpenAI API Key Loaded:', Boolean(openaiApiKey));

if (!polygonApiKey || !openaiApiKey) {
    console.error("API keys are missing. Check your .env file.");
    process.exit(1);
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ✅ Fetch stock data from Polygon API
app.get('/api/stock-data', async (req, res) => {
    const { ticker, startDate, endDate } = req.query;

    try {
        const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${startDate}/${endDate}?adjusted=true&sort=asc&apiKey=${polygonApiKey}`;
        console.log(`Fetching stock data: ${url}`);

        const response = await axios.get(url);

        if (!response.data || response.status !== 200) {
            throw new Error("Invalid stock data response.");
        }

        res.json(response.data); // ✅ Send stock data back to client
    } catch (error) {
        console.error('Stock Data Fetch Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch stock data.' });
    }
});

// ✅ Generate Stock Report using OpenAI API
app.post('/api/generate-report', async (req, res) => {
    const { stockData } = req.body;

    if (!stockData) {
        return res.status(400).json({ error: "Missing stock data in request body." });
    }

    try {
        console.log("Generating report with OpenAI...");

        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4',
                messages: [
                    { role: 'system', content: 'You are a stock market analyst. Write a short financial summary based on the provided data.' },
                    { role: 'user', content: JSON.stringify(stockData) },
                ],
                max_tokens: 150,
                temperature: 0.7,
            },
            {
                headers: {
                    Authorization: `Bearer ${openaiApiKey}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.data || response.status !== 200) {
            throw new Error("Failed to generate report.");
        }

        console.log("Report Generated:", response.data.choices[0].message.content);

        res.json({ report: response.data.choices[0].message.content }); // ✅ Ensure JSON format
    } catch (error) {
        console.error('Report Generation Error:', error.message);
        res.status(500).json({ error: 'Failed to generate stock report.' });
    }
});

// Start the server
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
