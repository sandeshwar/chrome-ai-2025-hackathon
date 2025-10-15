import { createTextSession, canCreateTextSession } from '../utils/aiUtils.js';
import { extractPageText } from '../utils/textUtils.js';

/**
 * Summarize the current page using Chrome's preview AI API.
 * Throws a coded error when not available or when inference fails.
 * @param {Document} documentRef
 * @returns {Promise<string>}
 */
export async function summarizeCurrentPage(documentRef) {
  const content = extractPageText(documentRef);
  if (!content) {
    const err = new Error('No readable content found on this page.');
    err.code = 'no-content';
    throw err;
  }

  const status = await canCreateTextSession();
  if (status === 'no') {
    const err = new Error('AI summarization is not available.');
    err.code = 'ai-unavailable';
    throw err;
  }

  try {
    const session = await createTextSession({
      systemPrompt: 'Produce clear, concise summaries. Prefer short bullet points when asked.',
      temperature: 0.2,
      topK: 1,
    });
    try {
      const clipped = content.slice(0, 8000);
      const prompt = `You are a careful summarizer. Return ONLY 4-6 bullet points, each prefixed with "- ". Paraphrase; do not copy verbatim. Keep the total under 1200 characters.\n\nCONTENT:\n${clipped}`;
      const summary = await session.prompt(prompt);
      if (summary) return summary.trim();
      const err = new Error('Empty AI summary.');
      err.code = 'empty-summary';
      throw err;
    } finally {
      session.close();
    }
  } catch (e) {
    if (!e || !e.code) {
      const err = new Error('Failed to summarize via AI.');
      err.code = 'inference-failed';
      throw err;
    }
    throw e;
  }
}

/**
 * Summarize with progress callbacks for UI spinners.
 * Throws a coded error when not available or when inference fails.
 * @param {Document} documentRef
 * @param {(phase:'download_start'|'download_complete'|'inference_start'|'inference_complete')=>void} [onProgress]
 */
export async function summarizeCurrentPageWithProgress(documentRef, onProgress) {
  const content = extractPageText(documentRef);
  if (!content) {
    const err = new Error('No readable content found on this page.');
    err.code = 'no-content';
    throw err;
  }

  const status = await canCreateTextSession();
  if (status === 'no') {
    const err = new Error('AI summarization is not available.');
    err.code = 'ai-unavailable';
    throw err;
  }

  if (status === 'after-download') onProgress?.('download_start');
  const session = await createTextSession({
    systemPrompt: 'Produce clear, concise summaries. Prefer short bullet points when asked.',
    temperature: 0.2,
    topK: 1,
  });
  if (status === 'after-download') onProgress?.('download_complete');

  try {
    onProgress?.('inference_start');
    const clipped = content.slice(0, 8000);
    const prompt = `You are a careful summarizer. Return ONLY 4-6 bullet points, each prefixed with "- ". Paraphrase; do not copy verbatim. Keep the total under 1200 characters.\n\nCONTENT:\n${clipped}`;
    const summary = await session.prompt(prompt);
    onProgress?.('inference_complete');
    if (summary) return summary.trim();
    const err = new Error('Empty AI summary.');
    err.code = 'empty-summary';
    throw err;
  } catch (e) {
    onProgress?.('inference_complete');
    if (!e || !e.code) {
      const err = new Error('Failed to summarize via AI.');
      err.code = 'inference-failed';
      throw err;
    }
    throw e;
  } finally {
    session.close();
  }
}
