console.log("FinGuard AI: Scanner Active");

// Content script for future risk highlighting
// In a real production environment, this would scan the DOM for symbols and 
// call the backend API to inject risk warnings.

function injectBanner(ticker, riskScore) {
    const banner = document.createElement('div');
    banner.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 10000;
        background: rgba(15, 23, 42, 0.95);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(59, 130, 246, 0.3);
        padding: 16px;
        border-radius: 12px;
        color: white;
        font-family: sans-serif;
        box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    `;
    banner.innerHTML = `
        <div style="font-weight: 800; font-size: 10px; color: #3b82f6; margin-bottom: 4px;">FINGUARD AI WARNING</div>
        <div style="font-weight: 900; font-size: 14px;">${ticker} Risk Detected: ${riskScore}%</div>
        <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">Potential pump & dump pattern identified.</div>
    `;
    document.body.appendChild(banner);
}

// Mocking a detection scenario
if (window.location.href.includes('RELIANCE')) {
    setTimeout(() => injectBanner('RELIANCE', 72), 3000);
}
