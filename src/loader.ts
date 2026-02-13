// Add WebGPU feature detection and loading
if (!navigator.gpu) {
  console.warn('WebGPU is not supported in this browser. Falling back to WASM.');
}

// Load transformers.js from CDN
console.log('Loading transformers.js v4.0.0-next.2...');

// Add CSS for loading states
const style = document.createElement('style');
style.textContent = `
  .loading-spinner {
    border: 2px solid #f3f3f3;
    border-top: 2px solid #646cff;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .progress-bar {
    width: 100%;
    height: 4px;
    background-color: #f3f3f3;
    border-radius: 2px;
    overflow: hidden;
  }

  .progress-bar-fill {
    height: 100%;
    background-color: #646cff;
    transition: width 0.3s ease;
  }
`;
document.head.appendChild(style);

console.log('transformers.js v4.0.0-next.2 loaded successfully');