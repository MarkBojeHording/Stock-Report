const tickersArr = [];

document.querySelector('.add-ticker-btn').addEventListener('click', (e) => {
    e.preventDefault();
    const tickerInput = document.getElementById('ticker-input');
    const generateReportBtn = document.querySelector('.generate-report-btn');

    if (tickerInput.value.length > 2) {
        generateReportBtn.disabled = false;
        const newTickerStr = tickerInput.value.trim().toUpperCase();
        tickersArr.push(newTickerStr);
        tickerInput.value = '';
        renderTickers();
    } else {
        const label = document.querySelector('label');
        label.style.color = 'red';
        label.textContent = 'You must add at least one valid ticker (3+ characters).';
    }
});

function renderTickers() {
    const tickerDisplay = document.querySelector('.ticker-choice-display');
    tickerDisplay.innerHTML = tickersArr.join(', ');
}

async function generateStockReport() {
    if (tickersArr.length === 0) {
        alert("Please add at least one ticker.");
        return;
    }

    const ticker = tickersArr[0];
    const startDate = '2023-01-01';
    const endDate = '2023-01-31';

    try {
        // Send request to the server to fetch stock data
        const stockDataResponse = await axios.get('http://localhost:5001/api/stock-data', {
            params: {
                ticker: ticker,       // Ticker symbol
                startDate: startDate, // Start date (YYYY-MM-DD format)
                endDate: endDate,     // End date (YYYY-MM-DD format)
            },
        });

        if (stockDataResponse.status !== 200 || !stockDataResponse.data) {
            throw new Error("Invalid stock data response.");
        }

        const stockData = stockDataResponse.data;

        // Send the stock data to the server to generate a report
        const reportResponse = await axios.post('http://localhost:5001/api/generate-report', {
            data: JSON.stringify(stockData),
        });

        if (reportResponse.status !== 200 || !reportResponse.data) {
            throw new Error("Invalid report response.");
        }

        const report = reportResponse.data;
        document.querySelector('.output-panel').innerHTML = `<h2>Your Report 😜</h2><p>${report}</p>`;
    } catch (error) {
        console.error("Error during report generation:", error.message);
        console.error("Error details:", error.response ? error.response.data : error);
        alert(`An error occurred: ${error.message}`);
    }
}

document.querySelector('.generate-report-btn').addEventListener('click', generateStockReport);
