/**
 * Toggle pressed state styling + aria.
 * @param {HTMLElement} element
 * @param {{activeClass?: string, isActive: boolean}} params
 * @returns {HTMLElement}
 */
export function applyPressedState(element, { activeClass, isActive }) {
  if (!element) return element;
  const active = Boolean(isActive);
  if (activeClass) element.classList.toggle(activeClass, active);
  element.setAttribute('aria-pressed', String(active));
  return element;
}

/**
 * Toggle visibility styling + aria.
 * @param {HTMLElement} element
 * @param {{visibleClass?: string, isVisible: boolean}} params
 * @returns {HTMLElement}
 */
export function applyVisibilityState(element, { visibleClass, isVisible }) {
  if (!element) return element;
  const visible = Boolean(isVisible);
  if (visibleClass) element.classList.toggle(visibleClass, visible);
  element.setAttribute('aria-hidden', String(!visible));
  return element;
}
