// Debug script to test AI detection
// Run this in the browser console to check AI availability

console.log('=== AI Detection Debug ===');

// Check if window.ai exists in main world
console.log('1. window.ai exists:', typeof window.ai, window.ai);

// Check canCreateTextSession function
if (window.ai && typeof window.ai.canCreateTextSession === 'function') {
  console.log('2. canCreateTextSession is a function');
  window.ai.canCreateTextSession().then(result => {
    console.log('3. canCreateTextSession result:', result);
  }).catch(e => {
    console.log('3. canCreateTextSession error:', e);
  });
} else {
  console.log('2. canCreateTextSession is NOT available');
}

// Check createTextSession function
if (window.ai && typeof window.ai.createTextSession === 'function') {
  console.log('4. createTextSession is a function');
} else {
  console.log('4. createTextSession is NOT available');
}

// Check Chrome version and AI support
console.log('5. Chrome version:', navigator.userAgent);
console.log('6. Chrome AI API enabled:', 'ai' in window);

// Test if we're in main world vs isolated world
console.log('7. Current world - window.chrome.runtime available:', typeof window.chrome?.runtime);
console.log('8. Extension context check:', chrome?.runtime?.id ? 'Extension context available' : 'No extension context');
