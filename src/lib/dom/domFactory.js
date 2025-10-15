import { createElement as uCreateElement, createButton as uCreateButton } from '../utils/domUtils.js';

/**
 * Factory for creating DOM elements bound to a given Document.
 */
export class DomFactory {
  /**
   * @param {Document} documentRef
   */
  constructor(documentRef) {
    if (!documentRef) throw new Error('DomFactory requires a document reference.');
    this.documentRef = documentRef;
  }

  /**
   * @param {string} tagName
   * @param {{classNames?: string[], attributes?: Record<string,string>, textContent?: string}} [options]
   * @returns {HTMLElement}
   */
  createElement(tagName, options) {
    return uCreateElement(this.documentRef, tagName, options);
  }

  /**
   * @param {{classNames?: string[], attributes?: Record<string,string>, textContent?: string}} [options]
   * @returns {HTMLButtonElement}
   */
  createButton(options) {
    return uCreateButton(this.documentRef, options);
  }
}
