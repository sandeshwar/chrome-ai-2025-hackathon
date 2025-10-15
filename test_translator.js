// Simple test for Chrome Translator API access
// Run this in the browser console to test

console.log('=== Chrome Translator API Test ===');

// Test direct window.Translator access
console.log('1. window.Translator exists:', typeof window.Translator);

if (window.Translator) {
  console.log('2. window.Translator methods:', Object.keys(window.Translator));
  
  if (typeof window.Translator.availability === 'function') {
    console.log('3. availability available - testing English to Spanish...');
    window.Translator.availability({ sourceLanguage: 'en', targetLanguage: 'es' })
      .then(result => {
        console.log('4. Translator Status (en->es):', result);
        if (result !== 'no') {
          console.log('✅ Translator API is available!');
          
          // Test actual translation
          if (window.Translator.create) {
            console.log('5. Testing translation...');
            window.Translator.create({ sourceLanguage: 'en', targetLanguage: 'es' })
              .then(translator => {
                return translator.translate('Hello world, how are you?')
                  .then(result => {
                    console.log('6. Translation result:', result);
                    translator.destroy();
                  });
              })
              .catch(e => console.log('❌ Translation failed:', e));
          }
        } else {
          console.log('❌ Translator API not available for this language pair');
        }
      })
      .catch(e => console.log('❌ Error:', e));
  } else {
    console.log('3. availability NOT available');
  }
} else {
  console.log('2. window.Translator is undefined - Chrome Translator API not enabled');
  console.log('💡 Chrome 138+ required for Translator API');
  console.log('💡 Check: chrome://flags/#translator-api');
}
