import { createTextSession, canCreateTextSession } from '../utils/aiUtils.js';
import { extractPageText, fallbackSummarize } from '../utils/textUtils.js';

/**
 * Summarize the current page using Chrome's preview AI API when available,
 * otherwise provide a simple fallback.
 * @param {Document} documentRef
 * @returns {Promise<string>}
 */
export async function summarizeCurrentPage(documentRef) {
  const content = extractPageText(documentRef);
  if (!content) return 'No readable content found on this page.';

  const status = await canCreateTextSession();
  if (status === 'no') {
    return fallbackSummarize(content, 5);
  }

  try {
    const session = await createTextSession({
      systemPrompt: 'Produce clear, concise summaries. Prefer short bullet points when asked.',
      temperature: 0.2,
      topK: 1,
    });
    try {
      const clipped = content.slice(0, 8000);
      const prompt = `Summarize the content below as 4-6 short bullet points (<= 1200 chars total).\n\nCONTENT:\n${clipped}`;
      const summary = await session.prompt(prompt);
      if (summary) return summary.trim();
    } finally {
      session.close();
    }
  } catch {
    // ignore and fallback
  }

  return fallbackSummarize(content, 5);
}

/**
 * Summarize with progress callbacks for UI spinners.
 * @param {Document} documentRef
 * @param {(phase:'download_start'|'download_complete'|'inference_start'|'inference_complete'|'fallback')=>void} [onProgress]
 */
export async function summarizeCurrentPageWithProgress(documentRef, onProgress) {
  const content = extractPageText(documentRef);
  if (!content) return 'No readable content found on this page.';

  const status = await canCreateTextSession();
  if (status === 'no') {
    onProgress?.('fallback');
    return fallbackSummarize(content, 5);
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
    const prompt = `Summarize the content below as 4-6 short bullet points (<= 1200 chars total).\n\nCONTENT:\n${clipped}`;
    const summary = await session.prompt(prompt);
    onProgress?.('inference_complete');
    return (summary || '').trim() || fallbackSummarize(content, 5);
  } catch {
    onProgress?.('inference_complete');
    return fallbackSummarize(content, 5);
  } finally {
    session.close();
  }
}
