/**
 * Language Detector utility functions using Chrome's built-in Language Detector API
 */

/**
 * Check if language detection is available
 * @returns {Promise<'readily'|'after-download'|'no'>}
 */
export async function canDetectLanguage() {
  try {
    if (!('LanguageDetector' in self)) {
      return 'no';
    }
    const status = await LanguageDetector.availability();
    return status;
  } catch (e) {
    return 'no';
  }
}

/**
 * Create a language detector
 * @returns {Promise<LanguageDetector>}
 */
export async function createLanguageDetector() {
  try {
    const detector = await LanguageDetector.create();
    return detector;
  } catch (e) {
    throw new Error('Failed to create language detector');
  }
}

/**
 * Detect the language of given text
 * @param {string} text - Text to detect language for
 * @returns {Promise<{detectedLanguage: string, confidence: number}>}
 */
export async function detectLanguage(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('Invalid text for language detection');
  }

  const detector = await createLanguageDetector();
  try {
    const results = await detector.detect(text);
    // Return the top result (most likely language)
    return {
      detectedLanguage: results[0].detectedLanguage,
      confidence: results[0].confidence
    };
  } finally {
    // Language Detector API doesn't have a close() method
    // No cleanup needed
  }
}

/**
 * Detect language with progress callbacks
 * @param {string} text - Text to detect language for
 * @param {(phase:'download_start'|'download_complete'|'detection_start')=>void} [onProgress]
 * @returns {Promise<{detectedLanguage: string, confidence: number}>}
 */
export async function detectLanguageWithProgress(text, onProgress) {
  if (!text || typeof text !== 'string') {
    throw new Error('Invalid text for language detection');
  }

  const status = await canDetectLanguage();
  if (status === 'no') {
    throw new Error('Language detection is not available');
  }

  if (status === 'after-download') onProgress?.('download_start');

  const detector = await LanguageDetector.create({
    monitor: (m) => {
      m.addEventListener('downloadprogress', (e) => {
        console.log(`[Language Detector] Downloaded ${e.loaded * 100}%`);
      });
    }
  });

  if (status === 'after-download') onProgress?.('download_complete');

  try {
    onProgress?.('detection_start');
    const results = await detector.detect(text);
    // Return the top result (most likely language)
    return {
      detectedLanguage: results[0].detectedLanguage,
      confidence: results[0].confidence
    };
  } finally {
    // Language Detector API doesn't have a close() method
    // No cleanup needed
  }
}

/**
 * Get a human-readable language name from BCP 47 code
 * @param {string} code - BCP 47 language code
 * @returns {string} - Human-readable language name
 */
export function getLanguageName(code) {
  const languageNames = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'zh': 'Chinese',
    'zh-CN': 'Chinese (Simplified)',
    'zh-TW': 'Chinese (Traditional)',
    'ja': 'Japanese',
    'ko': 'Korean',
    'ru': 'Russian',
    'ar': 'Arabic',
    'hi': 'Hindi',
    'nl': 'Dutch',
    'pl': 'Polish',
    'tr': 'Turkish',
    'sv': 'Swedish',
    'da': 'Danish',
    'no': 'Norwegian',
    'fi': 'Finnish',
    'el': 'Greek',
    'he': 'Hebrew',
    'th': 'Thai',
    'vi': 'Vietnamese',
    'id': 'Indonesian',
    'ms': 'Malay',
    'tl': 'Filipino',
    'ur': 'Urdu',
    'bn': 'Bengali',
    'ta': 'Tamil',
    'te': 'Telugu',
    'mr': 'Marathi',
    'gu': 'Gujarati',
    'kn': 'Kannada',
    'ml': 'Malayalam',
    'pa': 'Punjabi',
    'or': 'Odia',
    'as': 'Assamese'
  };
  
  return languageNames[code] || code.toUpperCase();
}
