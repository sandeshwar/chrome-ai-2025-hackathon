import {
  buildMenuElement,
  createMenuHeader,
  createMenuList,
  createMenuItemElement,
  createSummaryView,
  createTranslationView,
  createChatView,
  showSummaryLoading,
  showTranslationLoading,
  updateSummaryView,
  updateTranslationView,
} from '../utils/componentUtils.js';

/** Mock menu view wrapper with mobile-style navigation. */
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
    this.currentView = 'menu'; // 'menu', 'summary', 'translation', 'chat'
    this._selectHandler = null;
    this._clickHandler = null;
    this._keydownHandler = null;
    this._chatView = null; // Store chat view reference
    
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
    this._selectHandler = handler; // Store handler reference
    
    // Remove existing listeners to prevent duplicates
    this._cleanupEventListeners();
    
    // Add new listeners
    this._clickHandler = (e) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const li = target.closest('.chrome-ai-mock-menu__item');
      if (!li) return;
      const id = li.getAttribute('data-item-id');
      if (id) handler(id);
    };
    
    this._keydownHandler = (e) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const li = target.closest('.chrome-ai-mock-menu__item');
      if (!li) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const id = li.getAttribute('data-item-id');
        if (id) handler(id);
      }
    };
    
    this.container.addEventListener('click', this._clickHandler);
    this.container.addEventListener('keydown', this._keydownHandler);
  }

  /** Clean up event listeners */
  _cleanupEventListeners() {
    if (this._clickHandler) {
      this.container.removeEventListener('click', this._clickHandler);
      this._clickHandler = null;
    }
    if (this._keydownHandler) {
      this.container.removeEventListener('keydown', this._keydownHandler);
      this._keydownHandler = null;
    }
  }

  /** Navigate back to the main menu */
  showMenu() {
    this.currentView = 'menu';
    const createElement = this.domFactory.createElement.bind(this.domFactory);
    
    // Clean up existing event listeners before clearing
    this._cleanupEventListeners();
    
    // Clear and rebuild the menu IN-PLACE (avoid nesting a new container)
    // Previously we appended a fresh .chrome-ai-mock-menu element inside the
    // existing container, which remained hidden (no visible class), making the
    // actions appear to "disappear" after navigating back.
    this.container.innerHTML = '';
    const header = createMenuHeader(createElement);
    const list = createMenuList(createElement);
    this.items.forEach((item) => list.appendChild(createMenuItemElement(createElement, item)));
    this.container.append(header, list);
    
    // Re-attach the select handler after rebuilding the menu
    if (this._selectHandler) {
      this.onSelect(this._selectHandler);
    }
  }

  /** Show summary view with back navigation */
  showSummaryView(text = '') {
    this.currentView = 'summary';
    const createElement = this.domFactory.createElement.bind(this.domFactory);
    createSummaryView(createElement, this.container, text, () => this.showMenu());
  }

  /** Show translation view with back navigation */
  showTranslationView(languages = [], onTranslate) {
    this.currentView = 'translation';
    const createElement = this.domFactory.createElement.bind(this.domFactory);
    createTranslationView(createElement, this.container, languages, () => this.showMenu(), onTranslate);
  }

  /** Update summary text in summary view */
  setSummary(text) {
    if (this.currentView === 'summary') {
      updateSummaryView(this.container, String(text ?? ''));
    }
  }

  /** Show loading state in summary view */
  setSummaryLoading(label) {
    const createElement = this.domFactory.createElement.bind(this.domFactory);
    if (this.currentView === 'summary') {
      showSummaryLoading(createElement, this.container, String(label ?? ''));
    }
  }

  /** Show translation UI */
  showTranslationUI(languages) {
    this.showTranslationView(languages, () => {});
  }

  /** Get selected language from translation view */
  getSelectedLanguage() {
    const select = this.container.querySelector('.chrome-ai-translate__select-full');
    return select ? select.value : '';
  }

  /** Register handler for Translate button */
  onTranslate(handler) {
    const btn = this.container.querySelector('.chrome-ai-translate__btn-full');
    if (!btn) return;
    if (this._translateHandler) btn.removeEventListener('click', this._translateHandler);
    this._translateHandler = (e) => {
      e.preventDefault();
      if (typeof handler === 'function') handler(this.getSelectedLanguage());
    };
    btn.addEventListener('click', this._translateHandler);
  }

  /** Show loading state in translation view */
  setTranslationLoading(label) {
    const createElement = this.domFactory.createElement.bind(this.domFactory);
    if (this.currentView === 'translation') {
      showTranslationLoading(createElement, this.container, String(label ?? ''));
    }
  }

  /** Set translation text */
  setTranslation(text) {
    if (this.currentView === 'translation') {
      updateTranslationView(this.container, String(text ?? ''));
    }
  }

  /** Show chat view */
  showChatView(onSendMessage) {
    this.currentView = 'chat';
    const createElement = this.domFactory.createElement.bind(this.domFactory);
    this._chatView = createChatView(createElement, this.container, () => this.showMenu(), onSendMessage);
  }

  /** Add message to chat */
  addChatMessage(role, content, isStreaming = false) {
    if (this._chatView && this.currentView === 'chat') {
      return this._chatView.addMessage(role, content, isStreaming);
    }
    return null;
  }

  /** Update streaming message */
  updateStreamingChatMessage(messageElement, chunk) {
    if (this._chatView && this.currentView === 'chat') {
      this._chatView.updateStreamingMessage(messageElement, chunk);
    }
  }

  /** Stop streaming message */
  stopStreamingChatMessage(messageElement) {
    if (this._chatView && this.currentView === 'chat') {
      this._chatView.stopStreaming(messageElement);
    }
  }

  /** Show typing indicator */
  showChatTypingIndicator() {
    if (this._chatView && this.currentView === 'chat') {
      return this._chatView.showTypingIndicator();
    }
    return null;
  }

  /** Remove typing indicator */
  removeChatTypingIndicator(typingElement) {
    if (this._chatView && this.currentView === 'chat') {
      this._chatView.removeTypingIndicator(typingElement);
    }
  }

  /** Show suggested questions */
  showChatSuggestions(suggestions, onSelect) {
    if (this._chatView && this.currentView === 'chat') {
      this._chatView.showSuggestions(suggestions, onSelect);
    }
  }

  /** Clear all chat messages */
  clearChatMessages() {
    if (this._chatView && this.currentView === 'chat') {
      this._chatView.clearMessages();
    }
  }

  /** Set send button state */
  setChatSendButtonState(disabled) {
    if (this._chatView && this.currentView === 'chat') {
      this._chatView.setSendButtonState(disabled);
    }
  }

  /** Focus chat input */
  focusChatInput() {
    if (this._chatView && this.currentView === 'chat') {
      this._chatView.messageInput.focus();
    }
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
