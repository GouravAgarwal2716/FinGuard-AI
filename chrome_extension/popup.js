document.addEventListener('DOMContentLoaded', function() {
    // Simple mock logic for the extension popup
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        let url = tabs[0].url;
        let ticker = "UNKNOWN";

        // Basic domain detection
        if (url.includes('moneycontrol.com') || url.includes('tickertape.in') || url.includes('finance.yahoo.com')) {
            document.getElementById('no-stock').style.display = 'none';
            document.getElementById('stock-view').style.display = 'block';

            // Try to extract ticker from URL (very basic)
            if (url.includes('RELIANCE')) ticker = "RELIANCE";
            else if (url.includes('TCS')) ticker = "TCS";
            else if (url.includes('INFY')) ticker = "INFY";
            else ticker = "ACTIVE_ASSET";

            document.getElementById('ticker-name').textContent = ticker;
        }
    });

    document.getElementById('open-dashboard').addEventListener('click', function() {
        chrome.tabs.create({ url: 'http://localhost:5173/dashboard' });
    });
});
