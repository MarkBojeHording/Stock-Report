const express = require('express');
const axios = require('axios');
const cors = require('cors'); // Import cors
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS to allow requests from frontend
app.use(cors());
app.use(express.json());

// Check API keys
const polygonApiKey = process.env.POLYGON_API_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

console.log('Polygon API Key Loaded:', Boolean(polygonApiKey));
console.log('OpenAI API Key Loaded:', Boolean(openaiApiKey));

if (!polygonApiKey || !openaiApiKey) {
    console.error("API keys are missing. Make sure they are defined in your .env file.");
    process.exit(1);
}

// Fetch stock data from Polygon.io
app.post('/api/stock-data', async (req, res) => {
    const { ticker, startDate, endDate } = req.body;

    try {
        const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${startDate}/${endDate}?apiKey=${polygonApiKey}`;
        const response = await axios.get(url);
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching stock data:', error.message);
        res.status(500).json({ error: 'Failed to fetch stock data.' });
    }
});

// Generate AI report using OpenAI API
app.post('/api/generate-report', async (req, res) => {
    const { data } = req.body;

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a trading guru. Write a short report based on the provided data.',
                    },
                    {
                        role: 'user',
                        content: data,
                    },
                ],
            },
            {
                headers: {
                    'Authorization': `Bearer ${openaiApiKey}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        res.status(200).json(response.data.choices[0].message.content);
    } catch (error) {
        console.error('Error generating report:', error.message);
        res.status(500).json({ error: 'Failed to generate report.' });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
