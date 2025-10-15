import {
  buildMenuElement,
  upsertSummaryBlock,
  upsertSummaryLoading,
  upsertTranslationBlock,
  setTranslationLanguages,
  setTranslationLoading,
  setTranslationText,
} from '../utils/componentUtils.js';

/** Mock menu view wrapper. */
export class MockMenu {
  /**
   * @param {{domFactory:any,stateCoordinator:any,items?:{id:string,title:string,description:string}[]}} params
   */
  constructor({ domFactory, stateCoordinator, items }) {
    if (!domFactory) throw new Error('MockMenu requires a DOM factory.');
    if (!stateCoordinator) throw new Error('MockMenu requires a state coordinator.');

    this.domFactory = domFactory;
    this.stateCoordinator = stateCoordinator;
    this.items = Array.isArray(items) ? items : [];
    this.visible = false;
    const createElement = this.domFactory.createElement.bind(this.domFactory);
    this.container = buildMenuElement(createElement, this.items);
  }

  /** @returns {HTMLElement} */
  get element() { return this.container; }

  /**
   * Delegate selection events to a callback with the item's id.
   * @param {(id:string)=>void} handler
   */
  onSelect(handler) {
    if (typeof handler !== 'function') return;
    this.container.addEventListener('click', (e) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const li = target.closest('.chrome-ai-mock-menu__item');
      if (!li) return;
      const id = li.getAttribute('data-item-id');
      if (id) handler(id);
    });

    this.container.addEventListener('keydown', (e) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const li = target.closest('.chrome-ai-mock-menu__item');
      if (!li) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const id = li.getAttribute('data-item-id');
        if (id) handler(id);
      }
    });
  }

  /** Show or update a summary section inside the menu. */
  setSummary(text) {
    const createElement = this.domFactory.createElement.bind(this.domFactory);
    upsertSummaryBlock(createElement, this.container, String(text ?? ''));
  }

  /** Show a spinner with label in the summary section. */
  setSummaryLoading(label) {
    const createElement = this.domFactory.createElement.bind(this.domFactory);
    upsertSummaryLoading(createElement, this.container, String(label ?? ''));
  }

  /** Ensure translation UI exists and populate languages. */
  showTranslationUI(languages) {
    const createElement = this.domFactory.createElement.bind(this.domFactory);
    const block = upsertTranslationBlock(createElement, this.container);
    setTranslationLanguages(block, languages);
    return block;
  }

  /** Read the currently selected target language label. */
  getSelectedLanguage() {
    const select = this.container.querySelector('.chrome-ai-translate__select');
    return select ? select.value : '';
    }

  /** Register handler for Translate button (replaces previous). */
  onTranslate(handler) {
    const btn = this.container.querySelector('.chrome-ai-translate__btn');
    if (!btn) return;
    if (this._translateHandler) btn.removeEventListener('click', this._translateHandler);
    this._translateHandler = (e) => {
      e.preventDefault();
      if (typeof handler === 'function') handler(this.getSelectedLanguage());
    };
    btn.addEventListener('click', this._translateHandler);
  }

  /** Show spinner in translation body. */
  setTranslationLoading(label) {
    const createElement = this.domFactory.createElement.bind(this.domFactory);
    const block = setTranslationLoading(createElement, this.container, String(label ?? ''));
    return block;
  }

  /** Set translation output text. */
  setTranslation(text) {
    const block = this.container.querySelector('.chrome-ai-translate');
    if (block) setTranslationText(block, String(text ?? ''));
  }

  /** Show menu. */
  show() { this.#setVisibility(true); }
  /** Hide menu. */
  hide() { this.#setVisibility(false); }
  /** Toggle menu. */
  toggle() { this.#setVisibility(!this.visible); }
  /** @returns {boolean} */
  isVisible() { return this.visible; }

  #setVisibility(isVisible) {
    this.visible = Boolean(isVisible);
    this.stateCoordinator.applyVisibilityState(this.container, {
      visibleClass: 'chrome-ai-mock-menu--visible',
      isVisible: this.visible,
    });
  }
}
