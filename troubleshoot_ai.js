// Comprehensive AI API troubleshooting script
// Run this in the browser console

console.log('=== Chrome AI API Troubleshooting ===');

// 1. Check Chrome version and AI support
console.log('1. Chrome User Agent:', navigator.userAgent);
const chromeVersion = navigator.userAgent.match(/Chrome\/(\d+)/);
if (chromeVersion) {
  console.log('   Chrome version:', chromeVersion[1]);
  if (parseInt(chromeVersion[1]) < 127) {
    console.log('   ❌ Chrome version too old - need 127+');
  } else {
    console.log('   ✅ Chrome version supports AI API');
  }
}

// 2. Check if we're in the right context
console.log('2. Context check:');
console.log('   window.ai exists:', 'ai' in window);
console.log('   typeof window.ai:', typeof window.ai);
console.log('   window object keys containing "ai":', Object.keys(window).filter(k => k.toLowerCase().includes('ai')));

// 3. Check for content script isolation
console.log('3. Extension context:');
console.log('   chrome.runtime available:', typeof chrome?.runtime);
console.log('   chrome.runtime.id:', chrome?.runtime?.id);
if (chrome?.runtime?.id) {
  console.log('   ❌ You are in extension content script context');
  console.log('   💡 Content scripts run in isolated world and cannot access window.ai');
  console.log('   💡 Try this in the main page console (not DevTools console)');
} else {
  console.log('   ✅ You are in main world context');
}

// 4. Check flags and settings
console.log('4. Checking if AI should be available...');
console.log('   Try visiting: chrome://flags/#prompt-api-for-gemini-nano');
console.log('   Try visiting: chrome://settings/ai');

// 5. Try alternative access methods
console.log('5. Alternative checks:');
console.log('   globalThis.ai:', typeof globalThis?.ai);
console.log('   self.ai:', typeof self?.ai);
console.log('   window.chrome?.ai:', typeof window.chrome?.ai);

// 6. Test with a simple page
console.log('6. Testing on simple pages:');
console.log('   Try opening about:blank and running this script there');
console.log('   Try opening data:text/html,<html><body>Test</body></html> and running this script');
