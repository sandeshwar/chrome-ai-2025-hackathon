/**
 * Create the root overlay container.
 * @param {(tag:string, opts?: any)=>HTMLElement} createElement
 */
export const createOverlayContainer = (createElement) =>
  createElement('div', { classNames: ['chrome-ai-fab-container'] });

/**
 * Whether an event target lies outside the container.
 * @param {HTMLElement|null} container
 * @param {EventTarget|null} target
 */
export const isEventOutside = (container, target) => {
  if (!container) return true;
  return !container.contains(target);
};
