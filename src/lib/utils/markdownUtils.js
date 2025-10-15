/**
 * Lightweight markdown rendering utilities
 * Simple implementation without external dependencies
 */

/**
 * Convert markdown to HTML
 * @param {string} markdown 
 * @returns {string} HTML
 */
export function renderMarkdown(markdown) {
  if (!markdown) return '';
  
  let html = markdown;
  
  // Convert headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // Convert bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
  
  // Convert italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');
  
  // Convert code blocks
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Convert links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  
  // Convert line breaks
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');
  
  // Wrap in paragraphs
  html = '<p>' + html + '</p>';
  
  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<p>(<h[1-6]>)/g, '$1');
  html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
  html = html.replace(/<p>(<pre>)/g, '$1');
  html = html.replace(/(<\/pre>)<\/p>/g, '$1');
  html = html.replace(/<p>(<ul>)/g, '$1');
  html = html.replace(/(<\/ul>)<\/p>/g, '$1');
  html = html.replace(/<p>(<ol>)/g, '$1');
  html = html.replace(/(<\/ol>)<\/p>/g, '$1');
  
  // Convert lists
  html = html.replace(/^\* (.+)$/gim, '<li>$1</li>');
  html = html.replace(/^- (.+)$/gim, '<li>$1</li>');
  html = html.replace(/^\d+\. (.+)$/gim, '<li>$1</li>');
  
  // Wrap consecutive list items
  html = html.replace(/(<li>.*?<\/li>\s*)+/gs, (match) => {
    // Check if it's likely an ordered list
    if (match.match(/^\d+\./m)) {
      return '<ol>' + match + '</ol>';
    }
    return '<ul>' + match + '</ul>';
  });
  
  // Convert blockquotes
  html = html.replace(/^> (.+)$/gim, '<blockquote>$1</blockquote>');
  
  // Convert horizontal rules
  html = html.replace(/^---$/gim, '<hr>');
  html = html.replace(/^\*\*\*$/gim, '<hr>');
  
  // Clean up extra line breaks
  html = html.replace(/<br>\s*<br>/g, '<br>');
  html = html.replace(/<p>\s*<br>/g, '<p>');
  html = html.replace(/<br>\s*<\/p>/g, '</p>');
  
  return html.trim();
}

/**
 * Safely render markdown with HTML escaping for content
 * @param {string} markdown 
 * @returns {string} HTML
 */
export function safeRenderMarkdown(markdown) {
  if (!markdown) return '';
  
  // Basic HTML sanitization - allow only safe tags
  const allowedTags = [
    'p', 'br', 'strong', 'em', 'code', 'pre',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'blockquote', 'hr',
    'a'
  ];
  
  const html = renderMarkdown(markdown);
  
  // Simple sanitization - remove any tags not in allowed list
  return html.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, (match, tag) => {
    const tagName = tag.toLowerCase();
    if (allowedTags.includes(tagName)) {
      return match;
    }
    return '';
  });
}

/**
 * Check if text contains markdown patterns
 * @param {string} text 
 * @returns {boolean}
 */
export function hasMarkdown(text) {
  if (!text) return false;
  
  const markdownPatterns = [
    /^#{1,6}\s/m,           // Headers
    /\*\*.*?\*\*/,          // Bold
    /\*.*?\*/,              // Italic
    /`.*?`/,                // Inline code
    /```[\s\S]*?```/,       // Code blocks
    /\[.*?\]\(.*?\)/,       // Links
    /^\* |^- |^\d+\. /m,    // Lists
    /^> /m,                 // Blockquotes
    /^---$|^\*\*\*$/m       // Horizontal rules
  ];
  
  return markdownPatterns.some(pattern => pattern.test(text));
}

/**
 * Convert markdown chunks to HTML incrementally
 * @param {string} accumulatedText 
 * @returns {string} HTML
 */
export function renderMarkdownIncremental(accumulatedText) {
  // For incremental rendering, we need to handle incomplete markdown
  let html = accumulatedText;
  
  // Don't try to render incomplete code blocks or lists
  const openCodeBlocks = (html.match(/```/g) || []).length;
  const openLists = (html.match(/^\* |^- |^\d+\. /gm) || []).length;
  
  if (openCodeBlocks % 2 === 1) {
    // Incomplete code block, render as plain text with code formatting
    return html.replace(/\n/g, '<br>').replace(/`([^`]+)`/g, '<code>$1</code>');
  }
  
  return safeRenderMarkdown(html);
}
