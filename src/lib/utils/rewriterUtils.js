export async function canCreateRewriter(options = {}) {
  if (typeof window.Rewriter?.availability === 'function') {
    try {
      const availability = await window.Rewriter.availability(options);
      if (availability === 'unavailable') return 'no';
      if (availability === 'available') return 'readily';
      return 'after-download';
    } catch {
      return 'no';
    }
  }
  try {
    const response = await chrome.runtime.sendMessage({ type: 'check-rewriter-availability', options });
    return response?.result || 'no';
  } catch {
    return 'no';
  }
}

export async function createRewriter(options = {}) {
  if (window.Rewriter?.create) {
    const rewriter = await window.Rewriter.create(options);
    return {
      rewrite: (text, opts) => rewriter.rewrite(text, opts),
      rewriteStreaming: (text, opts) => rewriter.rewriteStreaming(text, opts),
      close: () => (typeof rewriter.destroy === 'function' ? rewriter.destroy() : undefined),
    };
  }
  throw new Error('Rewriter API not available');
}

export async function rewrite(text, options = {}) {
  const status = await canCreateRewriter();
  if (status === 'no') {
    const err = new Error('Rewriter not available');
    err.code = 'ai-unavailable';
    throw err;
  }
  const rewriter = await createRewriter(options.session || {});
  try {
    const result = await rewriter.rewrite(text, options.request || {});
    const output = String(result || '').trim();
    if (output) return output;
    const err = new Error('Empty rewrite result');
    err.code = 'empty-rewrite';
    throw err;
  } finally {
    rewriter.close();
  }
}
