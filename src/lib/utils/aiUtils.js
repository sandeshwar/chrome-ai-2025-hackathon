/**
 * Lightweight wrapper around Chrome's preview AI Text API (window.ai).
 */

/** @returns {Promise<"no"|"readily"|"after-download">} */
export async function canCreateTextSession() {
  try {
    const fn = globalThis.ai?.canCreateTextSession;
    if (!fn) return 'no';
    return await fn();
  } catch {
    return 'no';
  }
}

/**
 * @param {{systemPrompt?: string, temperature?: number, topK?: number}} [opts]
 * @returns {Promise<{prompt:(q:string)=>Promise<string>, close:()=>void}>}
 */
export async function createTextSession(opts = {}) {
  const { systemPrompt = 'You are a helpful assistant.', temperature = 0.2, topK = 1 } = opts;
  const create = globalThis.ai?.createTextSession;
  if (!create) throw new Error('AI Text API not available');
  const session = await create({ systemPrompt, temperature, topK });
  return {
    prompt: (q) => session.prompt(q),
    close: () => (typeof session.destroy === 'function' ? session.destroy() : undefined),
  };
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

