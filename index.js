// Ensure the report content element exists on page load
window.onload = function () {
  let reportElement = document.getElementById('report-content');
  if (!reportElement) {
      console.warn("⚠️ report-content missing! Adding it dynamically...");
      const outputPanel = document.querySelector('.output-panel');
      if (outputPanel) {
          reportElement = document.createElement('p');
          reportElement.id = "report-content";
          reportElement.textContent = "Your report will appear here...";
          outputPanel.appendChild(reportElement);
      } else {
          console.error("❌ Failed to find .output-panel!");
      }
  }
};

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

function getValidDateRange() {
  const today = new Date();
  const endDate = today.toISOString().split('T')[0]; // Today's date in YYYY-MM-DD
  const startDate = new Date();
  startDate.setMonth(today.getMonth() - 6); // Set 6 months back
  return {
      startDate: startDate.toISOString().split('T')[0],
      endDate
  };
}

// Fetch stock data and generate a report
async function generateStockReport() {
  if (tickersArr.length === 0) {
      alert("Please add at least one ticker.");
      return;
  }

  const ticker = tickersArr[0];
  const { startDate, endDate } = getValidDateRange();

  try {
      console.log(`🔍 Fetching data for ${ticker} (${startDate} - ${endDate})`);

      // ✅ Show loading panel
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

      // ✅ Update loading message
      document.getElementById('api-message').textContent = "Generating AI Report...";

      // ✅ Fetch AI-generated report
      let reportResponse;
      try {
          reportResponse = await axios.post('http://localhost:5001/api/generate-report', {
              data: JSON.stringify(stockData)
          });
      } catch (err) {
          console.error("❌ API Request Failed:", err.response?.data || err.message);
          throw new Error("Failed to fetch AI report.");
      }

      console.log("📢 Full OpenAI Response:", reportResponse.data); // Debug API response

      if (!reportResponse || !reportResponse.data) {
          throw new Error("Invalid report response.");
      }

      // ✅ Safely extract the report text
      const report = typeof reportResponse.data === 'string'
          ? reportResponse.data
          : reportResponse.data.report || JSON.stringify(reportResponse.data, null, 2);

      console.log("✅ Final Report Text:", report);

      // ✅ Ensure the report element exists before updating it
      let reportElement = document.getElementById('report-content');
      if (!reportElement) {
          console.error("❌ ERROR: #report-content element is missing! Adding dynamically...");
          const outputPanel = document.querySelector('.output-panel');
          reportElement = document.createElement('p');
          reportElement.id = "report-content";
          outputPanel.appendChild(reportElement);
      }

      console.log("📢 Report Content Element Exists?", !!reportElement, reportElement);

      // ✅ Update the report content
      reportElement.innerHTML = `<p>${report}</p>`;

      // ✅ Ensure it's visible
      reportElement.style.display = 'block';
      reportElement.style.color = 'black';

      console.log("✅ Report Updated Successfully!");

      document.querySelector('.loading-panel').style.display = 'none';

  } catch (error) {
      console.error("❌ Error during report generation:", error);
      alert("An error occurred while generating the report. Please try again.");
      document.querySelector('.loading-panel').style.display = 'none';
  }
}

document.querySelector('.generate-report-btn').addEventListener('click', () => {
  console.log("🔘 Generate Report button clicked!");
  generateStockReport();
});
