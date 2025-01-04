// Store the tickers
const tickersArr = [];

document.querySelector('.add-ticker-btn').addEventListener('click', (e) => {
    e.preventDefault(); // Prevent the form from reloading the page
    const tickerInput = document.getElementById('ticker-input');
    const generateReportBtn = document.querySelector('.generate-report-btn');

    if (tickerInput.value.length > 2) {
        generateReportBtn.disabled = false;
        const newTickerStr = tickerInput.value.trim().toUpperCase();
        tickersArr.push(newTickerStr);
        tickerInput.value = ''; // Clear input field
        renderTickers();
    } else {
        const label = document.querySelector('label');
        label.style.color = 'red';
        label.textContent = 'You must add at least one valid ticker (3+ characters).';
    }
});

// Function to render tickers in the UI
function renderTickers() {
    const tickerDisplay = document.querySelector('.ticker-choice-display');
    tickerDisplay.innerHTML = tickersArr.join(', ');
}

// Fetch stock data and generate a report
async function generateStockReport() {
    if (tickersArr.length === 0) {
        alert("Please add at least one ticker.");
        return;
    }

    const ticker = tickersArr[0]; // For simplicity, using the first ticker

    try {
        // Fetch stock data from backend
        const stockDataResponse = await axios.post('http://localhost:5000/api/stock-data', {
            ticker: ticker,
            startDate: '2022-01-01', // Example date range
            endDate: '2022-12-31'
        });

        if (!stockDataResponse || !stockDataResponse.data) {
            throw new Error("Invalid stock data response.");
        }

        const stockData = stockDataResponse.data;

        // Fetch AI report from backend
        const reportResponse = await axios.post('http://localhost:5000/api/generate-report', {
            data: JSON.stringify(stockData) // Send the stock data to generate report
        });

        if (!reportResponse || !reportResponse.data) {
            throw new Error("Invalid report response.");
        }

        const report = reportResponse.data;
        document.querySelector('.output-panel').innerHTML = `<h2>Your Report 😜</h2><p>${report}</p>`;
    } catch (error) {
        console.error("Error during report generation:", error);
        alert("An error occurred while generating the report. Please try again.");
    }
}

// Enable the report generation button
document.querySelector('.generate-report-btn').addEventListener('click', generateStockReport);
