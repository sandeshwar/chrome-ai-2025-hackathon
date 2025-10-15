/**
 * Lightweight wrapper around Chrome's built-in Summarizer API.
 */

/** @returns {Promise<"no"|"readily"|"after-download">} */
export async function canCreateTextSession() {
  console.log('[AI Utils] Checking Summarizer API availability...');
  
  // Check if Summarizer API is available
  if (typeof window.Summarizer?.availability === 'function') {
    console.log('[AI Utils] Summarizer.availability found');
    try {
      const availability = await window.Summarizer.availability();
      console.log('[AI Utils] Summarizer API available with status:', availability);
      
      // Map availability to expected return values
      if (availability === 'unavailable') return 'no';
      if (availability === 'readily') return 'readily';
      return 'after-download'; // for 'download-needed' or other states
    } catch (e) {
      console.log('[AI Utils] Error checking Summarizer availability:', e);
      return 'no';
    }
  }
  
  // If not available, try checking via background script injection
  console.log('[AI Utils] Checking via background script injection...');
  try {
    const response = await chrome.runtime.sendMessage({ type: 'check-ai-availability' });
    console.log('[AI Utils] Background script AI check result:', response?.result);
    return response?.result || 'no';
  } catch (e) {
    console.log('[AI Utils] Background script AI check failed:', e);
    return 'no';
  }
}

/**
 * @param {{type?: string, format?: string, length?: string, sharedContext?: string}} [opts]
 * @returns {Promise<{prompt:(q:string)=>Promise<string>, close:()=>void}>}
 */
export async function createTextSession(opts = {}) {
  const { type = 'key-points', format = 'markdown', length = 'medium', sharedContext = '' } = opts;
  
  if (window.Summarizer?.create) {
    const summarizer = await window.Summarizer.create({ type, format, length, sharedContext });
    return {
      prompt: (text) => summarizer.summarize(text),
      close: () => (typeof summarizer.destroy === 'function' ? summarizer.destroy() : undefined),
    };
  }
  
  throw new Error('Summarizer API not available - window.Summarizer.create not found');
}

/**
 * Summarize provided text using the AI API, if available.
 * @param {string} text
 * @param {{style?: 'bullets'|'paragraph', maxChars?: number}} [opts]
 */
export async function summarize(text, opts = {}) {
  const { style = 'bullets', maxChars = 1200 } = opts;
  const status = await canCreateTextSession();
  if (status === 'no') throw new Error('AI not available');
  const session = await createTextSession({
    systemPrompt: 'Produce clear, concise summaries. Prefer short bullet points when asked.',
    temperature: 0.2,
    topK: 1,
  });
  try {
    const clipped = text.slice(0, 8000);
    const prompt = style === 'bullets'
      ? `Summarize the content below as 4-6 short bullet points (<= ${maxChars} chars total).\n\nCONTENT:\n${clipped}`
      : `Summarize the content below in a short paragraph (<= ${maxChars} chars).\n\nCONTENT:\n${clipped}`;
    const out = await session.prompt(prompt);
    return (out || '').trim();
  } finally {
    session.close();
  }
}
