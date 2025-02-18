const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5002;

// ✅ CORS Configuration: Fully handle preflight requests
const corsOptions = {
    origin: '*', // Allow all origins (for development, restrict in production)
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// ✅ Handle CORS preflight requests
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.sendStatus(204);
});

// ✅ Default route (for debugging)
app.get('/', (req, res) => {
    res.send(`<h2>🚀 Stock Report API is running!</h2>
        <p>Available API routes:</p>
        <ul>
            <li>📊 <code>POST /api/stock-data</code> - Fetch stock data</li>
            <li>🤖 <code>POST /api/generate-report</code> - Generate AI stock report</li>
        </ul>`);
});

// ✅ Fetch stock data (Polygon API)
app.post('/api/stock-data', async (req, res) => {
    try {
        const { ticker, startDate, endDate } = req.body;
        console.log(`🔍 Fetching data for ${ticker} (${startDate} - ${endDate})`);

        const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${startDate}/${endDate}?apiKey=${process.env.POLYGON_API_KEY}`;
        const response = await axios.get(url);

        res.status(200).json(response.data);
    } catch (error) {
        console.error('❌ Error fetching stock data:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch stock data.' });
    }
});

// ✅ Generate AI stock report
app.post('/api/generate-report', async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*'); // Ensure CORS

    const { data } = req.body;

    try {
        // Parse and filter only necessary stock data fields
        const parsedData = JSON.parse(data);

        // 🔹 Limit the records sent to OpenAI (3 most recent records)
        const filteredData = parsedData.results
            .slice(-3) // Take last 3 records
            .map(stock => ({
                date: new Date(stock.t).toISOString().split('T')[0], // Convert timestamp to YYYY-MM-DD
                open: stock.o,
                close: stock.c,
                high: stock.h,
                low: stock.l,
                volume: stock.v
            }));

        console.log(`📉 Sending reduced stock data to OpenAI. Records: ${filteredData.length}`);

        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are a financial analyst. Analyze the stock data and provide insights.' },
                    { role: 'user', content: JSON.stringify(filteredData) }
                ],
                max_tokens: 250
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                timeout: 10000 // ⏳ Timeout set to 10 seconds
            }
        );

                const aiResponse = response.data.choices[0].message.content; // Extract text
                console.log("✅ OpenAI Response:", aiResponse);
                res.status(200).json({ report: aiResponse }); // Send properly formatted JSON

    } catch (error) {
        console.error("❌ OpenAI Error:", error.message);

        if (error.response) {
            console.error("🔴 Response Data:", error.response.data);
        }

        res.status(500).json({ error: 'Failed to generate report.' });
    }
});

// ✅ Start Server
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
