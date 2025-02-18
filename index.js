// ✅ Ensure the DOM is fully loaded before running scripts
console.log("🚀 JavaScript is running!");

window.onload = function () {
    console.log("✅ Page fully loaded");

    let outputPanel = document.querySelector('.output-panel');

    // ✅ Hide the output panel initially
    if (outputPanel) {
        outputPanel.style.display = "none";
        outputPanel.style.opacity = "0";
    }
};

// ✅ Array to store stock tickers
const tickersArr = [];

// ✅ Add ticker button event listener
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

// ✅ Render tickers on the UI
function renderTickers() {
    const tickerDisplay = document.querySelector('.ticker-choice-display');
    tickerDisplay.innerHTML = tickersArr.join(', ');
}

// ✅ Get a valid date range (last 6 months)
function getValidDateRange() {
    const today = new Date();
    const endDate = today.toISOString().split('T')[0];
    const startDate = new Date();
    startDate.setMonth(today.getMonth() - 6);
    return {
        startDate: startDate.toISOString().split('T')[0],
        endDate
    };
}

// ✅ Fetch stock data and generate a report
async function generateStockReport() {
    if (tickersArr.length === 0) {
        alert("Please add at least one ticker.");
        return;
    }

    const ticker = tickersArr[0];
    const { startDate, endDate } = getValidDateRange();

    try {
        console.log(`🔍 Fetching data for ${ticker} (${startDate} - ${endDate})`);

        // Show loading panel
        document.querySelector('.loading-panel').style.display = 'block';
        document.getElementById('api-message').textContent = "Querying Stocks API...";

        // ✅ Fetch stock data
        const stockDataResponse = await axios.post('http://localhost:5001/api/stock-data', {
            ticker,
            startDate,
            endDate
        });

        if (!stockDataResponse || !stockDataResponse.data) {
            throw new Error("Invalid stock data response.");
        }

        const stockData = stockDataResponse.data;
        console.log("✅ Stock Data Received:", stockData);

        // Update loading message
        document.getElementById('api-message').textContent = "Generating AI Report...";

        // ✅ Fetch AI-generated report
        let reportResponse;
        try {
            reportResponse = await axios.post('http://localhost:5001/api/generate-report', {
                data: JSON.stringify(stockData)
            });
        } catch (err) {
            console.error("❌ API Request Failed:", err.response?.data ?? err.message);
            throw new Error("Failed to fetch AI report.");
        }

        console.log("📢 Full OpenAI Response:", reportResponse.data);

        if (!reportResponse || !reportResponse.data) {
            throw new Error("Invalid report response.");
        }

        // ✅ Extract the AI-generated report text
        const report = typeof reportResponse.data === 'string'
            ? reportResponse.data
            : reportResponse.data.report || JSON.stringify(reportResponse.data, null, 2);

        console.log("✅ Final Report Text:", report);

        // ✅ Ensure .output-panel exists
        let outputPanel = document.querySelector('.output-panel');
        if (!outputPanel) {
            console.warn("⚠️ .output-panel is missing! Recreating...");
            outputPanel = document.createElement('section');
            outputPanel.className = "output-panel";
            document.body.appendChild(outputPanel);
        }

        // ✅ Ensure #report-content exists
        let reportElement = document.getElementById('report-content');
        if (!reportElement) {
            console.warn("⚠️ Report content element missing, recreating...");
            reportElement = document.createElement('p');
            reportElement.id = "report-content";
            outputPanel.appendChild(reportElement);
        }

        console.log("📢 Report Content Element Exists?", !!reportElement, reportElement);

        // ✅ Inject the report with formatting
        reportElement.innerHTML = `<strong>${report.replace(/\n/g, "<br>")}</strong>`; // Preserve formatting

        // ✅ Show the report panel with a smooth fade-in
        outputPanel.style.display = "block";
        setTimeout(() => {
            outputPanel.style.opacity = "1";
        }, 100);

        console.log("✅ Report successfully injected and displayed!");

        // ✅ Hide loading panel after report is rendered
        document.querySelector('.loading-panel').style.display = 'none';

    } catch (error) {
        console.error("❌ Error during report generation:", error);
        alert("An error occurred while generating the report. Please try again.");
        document.querySelector('.loading-panel').style.display = 'none';
    }
}

// ✅ Generate report button event listener
document.querySelector('.generate-report-btn').addEventListener('click', () => {
    console.log("🔘 Generate Report button clicked!");
    generateStockReport();
});
