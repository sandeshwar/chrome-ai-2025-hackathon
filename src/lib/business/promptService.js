const CACHE_LIMIT = 5;

const defaultPrompts = [
  {
    id: 'summarize-highlight',
    label: 'Summarize selection',
    description: 'Turn highlighted text into key bullet points.',
    template: 'Summarize the following content into 4 concise bullet points with short phrases. Avoid repetition.\n\nCONTENT:\n{{input}}',
  },
  {
    id: 'explain-like-five',
    label: 'Explain simply',
    description: 'Explain this like I am new to the topic.',
    template: 'Explain the following content in simple terms suitable for a beginner. Use short paragraphs and avoid jargon.\n\nCONTENT:\n{{input}}',
  },
  {
    id: 'draft-email',
    label: 'Draft email reply',
    description: 'Write a polite email based on context.',
    template: 'Write a polite and professional email reply based on the following context. Keep it under 180 words.\n\nCONTEXT:\n{{input}}',
  },
  {
    id: 'action-items',
    label: 'Action items',
    description: 'Extract tasks from the text.',
    template: 'Read the following content and extract the actionable next steps as a bullet list.\n\nCONTENT:\n{{input}}',
  },
];

const recentCache = [];

export function getDefaultPrompts() {
  return defaultPrompts.map((p) => ({ ...p }));
}

export function getRecentPrompts() {
  return recentCache.slice(0).map((p) => ({ ...p }));
}

function createRecentEntry(template, input) {
  const inputString = String(input ?? '').trim();
  const snippet = inputString.slice(0, 160).replace(/\s+/g, ' ').trim();
  return {
    id: `${template.id}-${Date.now()}`,
    templateId: template.id,
    label: template.label,
    description: snippet || template.description,
    template: template.template,
    input: inputString,
    usedAt: Date.now(),
  };
}

export function addRecentPromptUsage(template, input) {
  if (!template) return;
  const entry = createRecentEntry(template, input);
  recentCache.unshift(entry);
  if (recentCache.length > CACHE_LIMIT) {
    recentCache.length = CACHE_LIMIT;
  }
}

export function buildPrompt(template, input) {
  return template.replace(/{{input}}/gi, input);
}

export async function sendPrompt({ template, input, options = {}, onProgress }) {
  console.log('[Prompt Service] sendPrompt called with:', { template: template?.substring(0, 50), inputLength: input?.length });
  const trimmed = String(input ?? '').trim();
  if (!trimmed) {
    const err = new Error('No input provided for the prompt.');
    err.code = 'no-content';
    throw err;
  }

  console.log('[Prompt Service] Checking LanguageModel availability...');
  if (!('LanguageModel' in self)) {
    console.error('[Prompt Service] LanguageModel not found in self');
    const err = new Error('Prompt API not available.');
    err.code = 'ai-unavailable';
    throw err;
  }

  try {
    const status = await LanguageModel.availability();
    console.log('[Prompt Service] LanguageModel availability status:', status);
    if (status === 'no' || status === 'unavailable') {
      const err = new Error('Prompt API is not available.');
      err.code = 'ai-unavailable';
      throw err;
    }
    if (status === 'after-download') onProgress?.('download_start');

    console.log('[Prompt Service] Creating LanguageModel session...');
    const session = await LanguageModel.create({
      topK: 1,
      temperature: 0.2,
      systemPrompt: options.sharedContext || '',
      language: 'en',
    });
    console.log('[Prompt Service] Session created successfully');

    try {
      if (status === 'after-download') onProgress?.('download_complete');
      onProgress?.('inference_start');
      const builtPrompt = buildPrompt(template, trimmed);
      console.log('[Prompt Service] Sending prompt to session:', builtPrompt.substring(0, 100));
      const text = await session.prompt(builtPrompt);
      console.log('[Prompt Service] Received response:', text?.substring(0, 100));
      onProgress?.('inference_complete');
      return (text || '').trim();
    } finally {
      if (session && typeof session.destroy === 'function') {
        session.destroy();
      }
    }
  } catch (error) {
    console.error('[Prompt Service] Error during prompt execution:', error);
    onProgress?.('inference_complete');
    if (error && error.code) throw error;
    const err = new Error('Prompt execution failed.');
    err.code = 'inference-failed';
    err.originalError = error;
    throw err;
  }
}
