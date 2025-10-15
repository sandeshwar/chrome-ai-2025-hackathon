/**
 * Apply common options to an element.
 * @param {HTMLElement} element
 * @param {{classNames?: string[], attributes?: Record<string,string>, textContent?: string}} [options]
 * @returns {HTMLElement}
 */
export function applyOptions(element, { classNames = [], attributes = {}, textContent } = {}) {
  if (!element) return element;
  if (Array.isArray(classNames) && classNames.length) element.classList.add(...classNames);
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
  if (typeof textContent === 'string') element.textContent = textContent;
  return element;
}

/**
 * Create an element and apply options.
 * @param {Document} documentRef
 * @param {string} tagName
 * @param {{classNames?: string[], attributes?: Record<string,string>, textContent?: string}} [options]
 * @returns {HTMLElement}
 */
export function createElement(documentRef, tagName, options) {
  const element = documentRef.createElement(tagName);
  return applyOptions(element, options);
}

/**
 * Convenience for a `<button>` element with options.
 * @param {Document} documentRef
 * @param {{classNames?: string[], attributes?: Record<string,string>, textContent?: string}} [options]
 * @returns {HTMLButtonElement}
 */
export const createButton = (documentRef, options) => createElement(documentRef, 'button', options);
