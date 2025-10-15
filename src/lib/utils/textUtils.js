/** Extract readable text from the page, excluding our overlay, nav/aside/footer/header, and hidden content. */
export function extractPageText(documentRef) {
  const doc = documentRef;
  const win = doc.defaultView || window;
  const preferredRoots = [
    doc.querySelector('main, [role="main"]'),
    ...doc.querySelectorAll('article')
  ].filter(Boolean);
  const roots = preferredRoots.length ? preferredRoots : [doc.body || doc.documentElement].filter(Boolean);
  if (!roots.length) return '';

  const SKIP_TAGS = new Set(['NAV', 'ASIDE', 'FOOTER', 'HEADER', 'SCRIPT', 'STYLE', 'NOSCRIPT']);
  const SKIP_ROLES = new Set(['navigation', 'banner', 'complementary', 'contentinfo', 'search', 'toolbar']);

  const hasExtClass = (el) =>
    !!el.classList && Array.from(el.classList).some((c) => c.startsWith('chrome-ai-'));

  const isSkippableElement = (el) => {
    if (!el || el.nodeType !== 1) return false;
    if (hasExtClass(el)) return true;
    if (SKIP_TAGS.has(el.tagName)) return true;
    const role = el.getAttribute('role');
    if (role && SKIP_ROLES.has(role)) return true;
    if (el.hasAttribute('hidden') || el.getAttribute('aria-hidden') === 'true') return true;
    // Basic visibility checks
    try {
      const cs = win.getComputedStyle(el);
      if (cs && (cs.display === 'none' || cs.visibility === 'hidden')) return true;
    } catch {}
    return false;
  };

  const collectFromRoot = (root) => {
    const walker = doc.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (node.nodeType === 1) {
          return isSkippableElement(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_SKIP;
        }
        // Text node: decide based on parent visibility
        const parent = node.parentElement;
        if (!parent || isSkippableElement(parent)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    const parts = [];
    let n = walker.nextNode();
    while (n) {
      if (n.nodeType === 3) {
        const t = String(n.nodeValue || '').replace(/\s+/g, ' ').trim();
        if (t) parts.push(t);
      }
      n = walker.nextNode();
    }
    return parts.join(' ');
  };

  const text = roots.map(collectFromRoot).filter(Boolean).join(' ');
  return text.slice(0, 20000);
}

// AI-only summarization – no non-AI fallback per product requirements
