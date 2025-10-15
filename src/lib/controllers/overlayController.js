import { createOverlayContainer, isEventOutside } from '../utils/overlayUtils.js';
import { summarizeCurrentPageWithProgress } from '../business/summarizationService.js';
import { translateCurrentPageWithProgress } from '../business/translationService.js';
import { LANGUAGES } from '../utils/i18nUtils.js';

/** Orchestrates FAB + menu mounting and interactions. */
export class OverlayController {
  /**
   * @param {{documentRoot:Element, domFactory:any, button:any, menu:any}} params
   */
  constructor({ documentRoot, domFactory, button, menu }) {
    if (!documentRoot) throw new Error('OverlayController requires a document root.');
    if (!domFactory || !button || !menu) throw new Error('OverlayController requires DOM factory, button, and menu.');

    this.documentRoot = documentRoot;
    this.domFactory = domFactory;
    this.button = button;
    this.menu = menu;
    this.container = null;
    this.initialized = false;
    this.handleToggle = this.handleToggle.bind(this);
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
  }

  /** Mount and wire the overlay. */
  initialize() {
    if (this.initialized) return;
    this.container = createOverlayContainer(this.domFactory.createElement.bind(this.domFactory));
    this.#mountContainer();
    this.#attachEvents();
    this.menu.onSelect(this.handleMenuSelect.bind(this));
    this.initialized = true;
  }

  /** Unmount and cleanup listeners. */
  destroy() {
    if (!this.initialized) return;
    this.#detachEvents();
    if (this.container?.parentElement) this.container.parentElement.removeChild(this.container);
    this.container = null;
    this.initialized = false;
  }

  /** Toggle menu visibility from the FAB. */
  handleToggle(event) {
    event.stopPropagation();
    this.menu.toggle();
    this.button.setActive(this.menu.isVisible());
  }

  /** Close when clicking outside the overlay. */
  handleOutsideClick(event) {
    if (!this.menu.isVisible()) return;
    const shouldClose = isEventOutside(this.container, event.target);
    if (shouldClose) {
      this.menu.hide();
      this.button.setActive(false);
    }
  }

  /** Handle menu item selections. */
  async handleMenuSelect(id) {
    if (id === 'summary') {
      try {
        // Show initial pre-flight while we check model readiness
        this.menu.setSummaryLoading('Preparing model…');
        const summary = await summarizeCurrentPageWithProgress(document, (phase) => {
          if (phase === 'download_start') this.menu.setSummaryLoading('Downloading model…');
          if (phase === 'download_complete') this.menu.setSummaryLoading('Model ready. Summarizing…');
          if (phase === 'inference_start') this.menu.setSummaryLoading('Summarizing…');
        });
        this.menu.setSummary(summary);
        if (!this.menu.isVisible()) this.menu.show();
        this.button.setActive(true);
      } catch (e) {
        let message = 'Unable to summarize this page.';
        const code = e && e.code;
        if (code === 'ai-unavailable') {
          message = 'AI summarization is not available in this Chrome build.';
        } else if (code === 'no-content') {
          message = 'No readable content found on this page.';
        } else if (code === 'empty-summary') {
          message = 'The model returned an empty summary.';
        } else if (code === 'inference-failed') {
          message = 'AI summarization failed. Please try again.';
        }
        this.menu.setSummary(message);
      }
    }
    if (id === 'translate') {
      // Show translate UI and attach handler once
      this.menu.showTranslationUI(LANGUAGES);
      if (!this.menu.isVisible()) this.menu.show();
      this.button.setActive(true);
      this.menu.onTranslate(async (targetLabel) => {
        try {
          this.menu.setTranslationLoading('Preparing model…');
          const translated = await translateCurrentPageWithProgress(document, targetLabel, (phase) => {
            if (phase === 'download_start') this.menu.setTranslationLoading('Downloading model…');
            if (phase === 'download_complete') this.menu.setTranslationLoading('Model ready. Translating…');
            if (phase === 'inference_start') this.menu.setTranslationLoading('Translating…');
          });
          this.menu.setTranslation(translated);
        } catch (e) {
          let message = 'Unable to translate this page.';
          const code = e && e.code;
          if (code === 'ai-unavailable') message = 'AI translation is not available in this Chrome build.';
          else if (code === 'no-content') message = 'No readable content found on this page.';
          else if (code === 'invalid-language') message = 'Please select a target language.';
          else if (code === 'empty-translation') message = 'The model returned an empty translation.';
          else if (code === 'inference-failed') message = 'AI translation failed. Please try again.';
          this.menu.setTranslation(message);
        }
      });
    }
  }

  #attachEvents() {
    this.button.onClick(this.handleToggle);
    document.addEventListener('click', this.handleOutsideClick, true);
  }

  #detachEvents() {
    document.removeEventListener('click', this.handleOutsideClick, true);
  }

  #mountContainer() {
    this.container.append(this.menu.element, this.button.element);
    this.documentRoot.appendChild(this.container);
  }
}
