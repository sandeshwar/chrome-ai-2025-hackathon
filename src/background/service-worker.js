// MV3 service worker (ESM). Injects page-world AI host to bypass isolated world limitations and CSP.

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    if (!msg || msg.type !== 'inject-ai-host') return;
    console.log('[Service Worker] Received inject-ai-host request');
    try {
      const tabId = sender?.tab?.id;
      if (tabId == null) throw new Error('No sender tab id');
      console.log('[Service Worker] Injecting AI host into tab:', tabId);
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['src/page/aiHost.js'],
        world: 'MAIN',
      });
      console.log('[Service Worker] AI host injection successful');
      sendResponse({ ok: true });
    } catch (e) {
      console.log('[Service Worker] AI host injection failed:', e);
      sendResponse({ ok: false, error: String(e && e.message ? e.message : e) });
    }
  })();
  return true; // respond async
});

// Handle AI availability check
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    if (!msg || msg.type !== 'check-ai-availability') return;
    console.log('[Service Worker] Received check-ai-availability request');
    try {
      const tabId = sender?.tab?.id;
      if (tabId == null) throw new Error('No sender tab id');
      console.log('[Service Worker] Checking AI availability in tab:', tabId);
      
      // Inject and run AI check in main world
      const results = await chrome.scripting.executeScript({
        target: { tabId },
        func: async () => {
          console.log('[Main World] Checking window.Summarizer availability...');
          console.log('[Main World] typeof window.Summarizer:', typeof window.Summarizer);
          console.log('[Main World] window.Summarizer exists:', 'Summarizer' in window);
          
          if (window.Summarizer) {
            console.log('[Main World] window.Summarizer methods:', Object.keys(window.Summarizer));
            console.log('[Main World] availability type:', typeof window.Summarizer.availability);
          }
          
          if (typeof window.Summarizer?.availability === 'function') {
            console.log('[Main World] Calling Summarizer.availability...');
            try {
              const result = await window.Summarizer.availability();
              console.log('[Main World] Summarizer.availability result:', result);
              return { status: result === 'unavailable' ? 'no' : result === 'readily' ? 'readily' : 'after-download', error: null };
            } catch (e) {
              console.log('[Main World] Summarizer.availability error:', e);
              return { status: 'no', error: e.message };
            }
          }
          console.log('[Main World] window.Summarizer.availability not available');
          return { status: 'no', error: 'window.Summarizer.availability not available' };
        },
        world: 'MAIN',
      });
      
      const result = results[0]?.result;
      console.log('[Service Worker] AI check result:', result);
      sendResponse({ result: result?.status || 'no' });
    } catch (e) {
      console.log('[Service Worker] AI check failed:', e);
      sendResponse({ result: 'no' });
    }
  })();
  return true; // respond async
});

// Handle Translator availability check
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    if (!msg || msg.type !== 'check-translator-availability') return;
    console.log('[Service Worker] Received check-translator-availability request');
    try {
      const tabId = sender?.tab?.id;
      if (tabId == null) throw new Error('No sender tab id');
      const { sourceLanguage = 'en', targetLanguage = 'en' } = msg;
      console.log('[Service Worker] Checking Translator availability in tab:', tabId, sourceLanguage, '->', targetLanguage);
      
      // Inject and run Translator check in main world
      const results = await chrome.scripting.executeScript({
        target: { tabId },
        func: async (sourceLang, targetLang) => {
          console.log('[Main World] Checking window.Translator availability...');
          console.log('[Main World] typeof window.Translator:', typeof window.Translator);
          console.log('[Main World] window.Translator exists:', 'Translator' in window);
          
          if (window.Translator) {
            console.log('[Main World] window.Translator methods:', Object.keys(window.Translator));
            console.log('[Main World] availability type:', typeof window.Translator.availability);
          }
          
          if (typeof window.Translator?.availability === 'function') {
            console.log('[Main World] Calling Translator.availability...');
            try {
              const result = await window.Translator.availability({ sourceLanguage: sourceLang, targetLanguage: targetLang });
              console.log('[Main World] Translator.availability result:', result);
              return { status: result === 'no' ? 'no' : result === 'available' ? 'readily' : 'after-download', error: null };
            } catch (e) {
              console.log('[Main World] Translator.availability error:', e);
              return { status: 'no', error: e.message };
            }
          }
          console.log('[Main World] window.Translator.availability not available');
          return { status: 'no', error: 'window.Translator.availability not available' };
        },
        args: [sourceLanguage, targetLanguage],
        world: 'MAIN',
      });
      
      const result = results[0]?.result;
      console.log('[Service Worker] Translator check result:', result);
      sendResponse({ result: result?.status || 'no' });
    } catch (e) {
      console.log('[Service Worker] Translator check failed:', e);
      sendResponse({ result: 'no' });
    }
  })();
  return true; // respond async
});

