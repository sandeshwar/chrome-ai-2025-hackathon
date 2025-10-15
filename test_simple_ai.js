// Simple test for Chrome Summarizer API access
// Run this in the browser console to test

console.log('=== Chrome Summarizer API Test ===');

// Test direct window.Summarizer access
console.log('1. window.Summarizer exists:', typeof window.Summarizer);

if (window.Summarizer) {
  console.log('2. window.Summarizer methods:', Object.keys(window.Summarizer));
  
  if (typeof window.Summarizer.availability === 'function') {
    console.log('3. availability available - testing...');
    window.Summarizer.availability()
      .then(result => {
        console.log('4. Summarizer Status:', result);
        if (result !== 'unavailable') {
          console.log('✅ Summarizer API is available!');
        } else {
          console.log('❌ Summarizer API not available');
        }
      })
      .catch(e => console.log('❌ Error:', e));
  } else {
    console.log('3. availability NOT available');
  }
} else {
  console.log('2. window.Summarizer is undefined - Chrome Summarizer API not enabled');
  console.log('💡 Chrome 138+ required for Summarizer API');
  console.log('💡 Check: chrome://flags/#summarizer-api');
}
