import { canCreateRewriter, createRewriter } from '../utils/rewriterUtils.js';

function normalizeOptions(options = {}) {
  const result = {};
  if (options.tone && options.tone !== 'as-is') result.tone = options.tone;
  if (options.length && options.length !== 'as-is') result.length = options.length;
  if (options.format) result.format = options.format;
  if (options.sharedContext) result.sharedContext = options.sharedContext;
  if (options.expectedInputLanguages) result.expectedInputLanguages = options.expectedInputLanguages;
  if (options.expectedContextLanguages) result.expectedContextLanguages = options.expectedContextLanguages;
  if (options.outputLanguage) result.outputLanguage = options.outputLanguage;
  return result;
}

function buildRequestOptions(options = {}) {
  const request = {};
  if (options.context) request.context = options.context;
  if (options.tone && options.tone !== 'as-is') request.tone = options.tone;
  if (options.length && options.length !== 'as-is') request.length = options.length;
  if (options.format) request.format = options.format;
  return request;
}

export async function rewriteTextWithProgress(text, options = {}, onProgress) {
  const trimmed = String(text ?? '').trim();
  if (!trimmed) {
    const err = new Error('No text provided to rewrite.');
    err.code = 'no-content';
    throw err;
  }

  const sessionOptions = normalizeOptions({ ...options, format: options.format || 'markdown' });
  const availabilityOptions = { ...sessionOptions };
  delete availabilityOptions.monitor;

  const availability = await canCreateRewriter(availabilityOptions);
  if (availability === 'no') {
    const err = new Error('AI rewriting is not available.');
    err.code = 'ai-unavailable';
    throw err;
  }

  if (availability === 'after-download') onProgress?.('download_start');

  if (typeof onProgress === 'function') {
    sessionOptions.monitor = (monitor) => {
      monitor.addEventListener('downloadprogress', (event) => {
        onProgress('download_progress', event);
      });
    };
  }

  const rewriter = await createRewriter(sessionOptions);
  if (availability === 'after-download') onProgress?.('download_complete');

  try {
    onProgress?.('inference_start');
    const requestOptions = buildRequestOptions({ ...options, format: sessionOptions.format });
    const result = await rewriter.rewrite(trimmed, requestOptions);
    onProgress?.('inference_complete');
    const output = String(result ?? '').trim();
    if (output) return output;
    const err = new Error('The model returned an empty rewrite.');
    err.code = 'empty-rewrite';
    throw err;
  } catch (error) {
    onProgress?.('inference_complete');
    if (error && error.code) throw error;
    const err = new Error('Failed to rewrite via AI.');
    err.code = 'inference-failed';
    throw err;
  } finally {
    rewriter.close();
  }
}
