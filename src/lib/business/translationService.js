import { createTranslator, canCreateTranslator } from '../utils/translatorUtils.js';
import { extractPageText } from '../utils/textUtils.js';

// Map common language names to BCP 47 codes
function mapLanguageToCode(labelOrCode) {
  const languageMap = {
    'spanish': 'es',
    'español': 'es',
    'french': 'fr',
    'français': 'fr',
    'german': 'de',
    'deutsch': 'de',
    'italian': 'it',
    'italiano': 'it',
    'portuguese': 'pt',
    'português': 'pt',
    'chinese': 'zh',
    '中文': 'zh',
    'japanese': 'ja',
    '日本語': 'ja',
    'korean': 'ko',
    '한국어': 'ko',
    'russian': 'ru',
    'русский': 'ru',
    'arabic': 'ar',
    'العربية': 'ar',
    'hindi': 'hi',
    'हिन्दी': 'hi',
    'english': 'en',
    'auto': 'auto'
  };
  
  const normalized = String(labelOrCode).toLowerCase().trim();
  return languageMap[normalized] || labelOrCode;
}

/**
 * Translate current page content using Chrome's built-in Translator API.
 * Throws coded errors on failure.
 * @param {Document} documentRef
 * @param {string} targetLanguageLabel e.g., 'Spanish', 'es', 'fr'
 * @param {string} [sourceLanguageLabel] e.g., 'English', 'en', 'auto'
 */
export async function translateCurrentPage(documentRef, targetLanguageLabel, sourceLanguageLabel = 'auto') {
  const content = extractPageText(documentRef);
  if (!content) {
    const err = new Error('No readable content found on this page.');
    err.code = 'no-content';
    throw err;
  }

  const targetLanguage = mapLanguageToCode(targetLanguageLabel);
  const sourceLanguage = mapLanguageToCode(sourceLanguageLabel) || 'en';
  
  if (!targetLanguage) {
    const err = new Error('Invalid target language.');
    err.code = 'invalid-language';
    throw err;
  }

  const status = await canCreateTranslator(sourceLanguage, targetLanguage);
  if (status === 'no') {
    const err = new Error('Translation is not available.');
    err.code = 'ai-unavailable';
    throw err;
  }

  try {
    const translator = await createTranslator({ sourceLanguage, targetLanguage });
    try {
      const clipped = content.slice(0, 8000);
      const result = await translator.translate(clipped);
      const out = String(result || '').trim();
      if (out) return out;
      const err = new Error('Empty translation result.');
      err.code = 'empty-translation';
      throw err;
    } finally {
      translator.close();
    }
  } catch (e) {
    if (!e || !e.code) {
      const err = new Error('Failed to translate via Translator API.');
      err.code = 'inference-failed';
      throw err;
    }
    throw e;
  }
}

/**
 * Translate with progress callbacks for UI spinners.
 * Throws coded errors on failure.
 * @param {Document} documentRef
 * @param {string} targetLanguageLabel
 * @param {(phase:'download_start'|'download_complete'|'inference_start'|'inference_complete')=>void} [onProgress]
 */
export async function translateCurrentPageWithProgress(documentRef, targetLanguageLabel, onProgress) {
  const content = extractPageText(documentRef);
  if (!content) {
    const err = new Error('No readable content found on this page.');
    err.code = 'no-content';
    throw err;
  }

  const targetLanguage = mapLanguageToCode(targetLanguageLabel);
  const sourceLanguage = mapLanguageToCode('en') || 'en';
  
  if (!targetLanguage) {
    const err = new Error('Invalid target language.');
    err.code = 'invalid-language';
    throw err;
  }

  const status = await canCreateTranslator(sourceLanguage, targetLanguage);
  if (status === 'no') {
    const err = new Error('Translation is not available.');
    err.code = 'ai-unavailable';
    throw err;
  }

  if (status === 'after-download') onProgress?.('download_start');
  
  const translator = await createTranslator({ 
    sourceLanguage, 
    targetLanguage,
    monitor: (m) => {
      m.addEventListener('downloadprogress', (e) => {
        console.log(`[Translator] Downloaded ${e.loaded * 100}%`);
      });
    }
  });
  
  if (status === 'after-download') onProgress?.('download_complete');

  try {
    onProgress?.('inference_start');
    const clipped = content.slice(0, 8000);
    const result = await translator.translate(clipped);
    onProgress?.('inference_complete');
    const out = String(result || '').trim();
    if (out) return out;
    const err = new Error('Empty translation result.');
    err.code = 'empty-translation';
    throw err;
  } catch (e) {
    onProgress?.('inference_complete');
    if (!e || !e.code) {
      const err = new Error('Failed to translate via Translator API.');
      err.code = 'inference-failed';
      throw err;
    }
    throw e;
  } finally {
    translator.close();
  }
}

