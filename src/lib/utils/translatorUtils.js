/**
 * Lightweight wrapper around Chrome's built-in Translator API.
 */

/** @returns {Promise<"no"|"readily"|"after-download">} */
export async function canCreateTranslator(sourceLanguage = 'en', targetLanguage = 'en') {
  console.log('[Translator Utils] Checking Translator API availability...');
  
  // Check if Translator API is available
  if (typeof window.Translator?.availability === 'function') {
    console.log('[Translator Utils] Translator.availability found');
    try {
      const availability = await window.Translator.availability({ sourceLanguage, targetLanguage });
      console.log('[Translator Utils] Translator API available with status:', availability);
      
      // Map availability to expected return values
      if (availability === 'no') return 'no';
      if (availability === 'available') return 'readily';
      return 'after-download'; // for 'downloadable' or other states
    } catch (e) {
      console.log('[Translator Utils] Error checking Translator availability:', e);
      return 'no';
    }
  }
  
  // If not available, try checking via background script injection
  console.log('[Translator Utils] Checking via background script injection...');
  try {
    const response = await chrome.runtime.sendMessage({ 
      type: 'check-translator-availability',
      sourceLanguage,
      targetLanguage 
    });
    console.log('[Translator Utils] Background script Translator check result:', response?.result);
    return response?.result || 'no';
  } catch (e) {
    console.log('[Translator Utils] Background script Translator check failed:', e);
    return 'no';
  }
}

/**
 * @param {{sourceLanguage?: string, targetLanguage?: string, monitor?: function}} [opts]
 * @returns {Promise<{translate:(text:string)=>Promise<string>, close:()=>void}>}
 */
export async function createTranslator(opts = {}) {
  const { sourceLanguage = 'en', targetLanguage = 'en', monitor } = opts;
  
  if (window.Translator?.create) {
    const translator = await window.Translator.create({ sourceLanguage, targetLanguage, monitor });
    return {
      translate: (text) => translator.translate(text),
      close: () => (typeof translator.destroy === 'function' ? translator.destroy() : undefined),
    };
  }
  
  throw new Error('Translator API not available - window.Translator.create not found');
}

/**
 * Translate provided text using the Translator API, if available.
 * @param {string} text
 * @param {string} targetLanguage BCP 47 language code (e.g., 'es', 'fr')
 * @param {string} [sourceLanguage] BCP 47 language code (default: 'en')
 */
export async function translate(text, targetLanguage, sourceLanguage = 'en') {
  const status = await canCreateTranslator(sourceLanguage, targetLanguage);
  if (status === 'no') throw new Error('Translator not available');
  
  const translator = await createTranslator({ sourceLanguage, targetLanguage });
  try {
    const clipped = text.slice(0, 8000);
    const result = await translator.translate(clipped);
    return (result || '').trim();
  } finally {
    translator.close();
  }
}
