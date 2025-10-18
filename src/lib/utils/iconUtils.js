/**
 * Custom SVG icon utilities for Chrome AI Extension
 * Replaces Font Awesome icons with inline SVGs
 */

/**
 * Create an SVG element for the specified icon type
 * @param {string} iconType - The type of icon to create
 * @param {string[]} classNames - Additional CSS classes to apply
 * @returns {SVGSVGElement} The SVG element
 */
export const createIcon = (iconType, classNames = []) => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', ['chrome-ai-icon', `chrome-ai-icon--${iconType}`, ...classNames].join(' '));
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  // Ensure safe default size even if CSS fails to load
  svg.setAttribute('width', '16');
  svg.setAttribute('height', '16');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  
  // Generate unique gradient IDs to avoid conflicts
  const gradientId = `${iconType}Gradient_${Math.random().toString(36).substr(2, 9)}`;
  
  const iconDefinitions = {
    'idea': () => {
      // Minimal lightbulb, stroke only, uses currentColor
      svg.innerHTML = `
        <path d="M9 18h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M10 20h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M12 4.5A5.5 5.5 0 0 0 6.5 10c0 1.8.9 3.1 2.1 4 .9.7 1.4 1.7 1.4 2.5h4c0-.8.5-1.8 1.4-2.5 1.2-.9 2.1-2.2 2.1-4A5.5 5.5 0 0 0 12 4.5z" stroke="currentColor" stroke-width="1.6" fill="none"/>
      `;
    },
    'robot': () => {
      svg.innerHTML = `
        <defs>
          <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#2563eb;stop-opacity:1" />
          </linearGradient>
        </defs>
        <circle cx="12" cy="12" r="10" fill="url(#${gradientId})" opacity="0.1"/>
        <circle cx="12" cy="12" r="10" stroke="url(#${gradientId})" stroke-width="1.5" fill="none"/>
        <circle cx="8.5" cy="10.5" r="1.2" fill="url(#${gradientId})"/>
        <circle cx="15.5" cy="10.5" r="1.2" fill="url(#${gradientId})"/>
        <path d="M9 15c0.7 1.2 1.8 2 3 2s2.3-.8 3-2" stroke="url(#${gradientId})" stroke-width="1.5" stroke-linecap="round" fill="none"/>
        <rect x="10" y="6" width="4" height="1.5" rx="0.75" fill="url(#${gradientId})"/>
        <path d="M7 8.5L6 7.5M17 8.5L18 7.5" stroke="url(#${gradientId})" stroke-width="1.5" stroke-linecap="round"/>
      `;
    },
    'sparkles': () => {
      // Minimal single sparkle sized to viewBox, uses currentColor
      svg.innerHTML = `
        <path d="M12 6l1.2 3.2 3.2 1.2-3.2 1.2L12 15l-1.2-3.4L7.6 10.4 10.8 9.2 12 6z" fill="currentColor"/>
      `;
    },
    'file-lines': () => {
      // Minimal file outline with lines, stroke only
      svg.innerHTML = `
        <path d="M14 2H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8l-4-6z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round"/>
        <path d="M14 2v6h6" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M9 12h6M9 15h6M9 9h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
      `;
    },
    'chat': () => {
      // Minimal chat bubble outline with dots
      svg.innerHTML = `
        <rect x="5" y="6" width="14" height="10" rx="3" stroke="currentColor" stroke-width="1.6" fill="none"/>
        <path d="M9 18l-4 3v-3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="8.5" cy="11" r="1" fill="currentColor"/>
        <circle cx="12" cy="11" r="1" fill="currentColor"/>
        <circle cx="15.5" cy="11" r="1" fill="currentColor"/>
      `;
    },
    'language': () => {
      // Minimal globe outline
      svg.innerHTML = `
        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6" fill="none"/>
        <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      `;
    },
    'arrow-left': () => {
      svg.innerHTML = `
        <defs>
          <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#6b7280;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#4b5563;stop-opacity:1" />
          </linearGradient>
        </defs>
        <circle cx="12" cy="12" r="10" fill="url(#${gradientId})" opacity="0.05"/>
        <path d="M20 12H8" stroke="url(#${gradientId})" stroke-width="2" stroke-linecap="round"/>
        <path d="M12 16l-4-4 4-4" stroke="url(#${gradientId})" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      `;
    },
    'circle': () => {
      svg.innerHTML = '<circle cx="12" cy="12" r="10"/>';
    }
  };
  
  const createIconContent = iconDefinitions[iconType];
  if (createIconContent) {
    createIconContent();
  } else {
    // Fallback to a simple circle if icon not found
    svg.innerHTML = '<circle cx="12" cy="12" r="10"/>';
  }
  
  return svg;
};

/**
 * Icon mapping to replace Font Awesome classes
 */
export const iconMap = {
  'fa-robot': 'robot',
  'fa-sparkles': 'sparkles',
  'fa-file-lines': 'file-lines',
  'fa-language': 'language',
  'fa-arrow-left': 'arrow-left',
  'fa-circle': 'circle'
};

/**
 * Get the custom icon type for a Font Awesome class
 * @param {string} faClass - Font Awesome class name
 * @returns {string} Custom icon type
 */
export const getIconType = (faClass) => {
  return iconMap[faClass] || 'circle';
};
