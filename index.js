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

  // ✅ Show loading animation
  document.querySelector('.loading-panel').style.display = 'flex';
  document.querySelector('.output-panel').style.display = 'none';

  try {
      // ✅ Fetch Stock Data from Backend
      const stockDataResponse = await axios.get('http://localhost:5001/api/stock-data', {
          params: { ticker, startDate, endDate },
      });

      if (!stockDataResponse.data) {
          throw new Error("Invalid stock data response.");
      }

      const stockData = stockDataResponse.data;

      // ✅ Send Data to Backend for Report Generation
      const reportResponse = await axios.post('http://localhost:5001/api/generate-report',
          { stockData },
          { headers: { 'Content-Type': 'application/json' } }
      );

      if (!reportResponse.data || !reportResponse.data.report) {
          throw new Error("Invalid report response.");
      }

      // ✅ Extract and display the report
      const report = reportResponse.data.report;
      document.querySelector('.output-panel').innerHTML = `<h2>Your Report 😜</h2><p>${report}</p>`;

  } catch (error) {
      console.error("Error during report generation:", error.message);
      alert(`An error occurred: ${error.message}`);
  } finally {
      // ✅ Hide loading and show report
      document.querySelector('.loading-panel').style.display = 'none';
      document.querySelector('.output-panel').style.display = 'block';
  }
}

// ✅ Attach event listener to button
document.querySelector('.generate-report-btn').addEventListener('click', generateStockReport);
