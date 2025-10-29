import {
  buildMenuElement,
  createMenuHeader,
  createMenuList,
  createMenuItemElement,
  createSummaryView,
  createTranslationView,
  createRewriteView,
  createPromptView,
  createChatView,
  createImageView,
  showSummaryLoading,
  showTranslationLoading,
  updateSummaryView,
  updateTranslationView,
} from '../utils/componentUtils.js';
import { safeRenderMarkdown, hasMarkdown } from '../utils/markdownUtils.js';

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
    this.currentView = 'menu'; // 'menu', 'summary', 'translation', 'chat', 'rewrite', 'prompt', 'image'
    this._selectHandler = null;
    this._clickHandler = null;
    this._keydownHandler = null;
    this._chatView = null;
    this._rewriteView = null;
    this._rewriteHandlers = { rewrite: null, use: null, copy: null };
    this._promptView = null;
    this._promptHandlers = { run: null, runKeydown: null, insert: null, copy: null };
    this._imageView = null;
    this._imageHandlers = { analyze: null };
    
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
    this.#cleanupRewriteView();
    this.#cleanupPromptView();
    this.#cleanupImageView();
    
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
    this.#cleanupRewriteView();
    this.#cleanupPromptView();
    this.#cleanupImageView();
    this.currentView = 'summary';
    const createElement = this.domFactory.createElement.bind(this.domFactory);
    createSummaryView(createElement, this.container, text, () => this.showMenu());
  }

  /** Show translation view with back navigation */
  showTranslationView(languages = [], onTranslate) {
    this.#cleanupRewriteView();
    this.#cleanupPromptView();
    this.#cleanupImageView();
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
    this.#cleanupRewriteView();
    this.#cleanupPromptView();
    this.#cleanupImageView();
    this.currentView = 'chat';
    const createElement = this.domFactory.createElement.bind(this.domFactory);
    this._chatView = createChatView(createElement, this.container, () => this.showMenu(), onSendMessage);
  }

  #cleanupRewriteView() {
    if (!this._rewriteView) return;
    const { rewriteButton, useButton, copyButton } = this._rewriteView;
    if (rewriteButton && this._rewriteHandlers.rewrite) {
      rewriteButton.removeEventListener('click', this._rewriteHandlers.rewrite);
    }
    if (useButton && this._rewriteHandlers.use) {
      useButton.removeEventListener('click', this._rewriteHandlers.use);
    }
    if (copyButton && this._rewriteHandlers.copy) {
      copyButton.removeEventListener('click', this._rewriteHandlers.copy);
    }
    this._rewriteView = null;
    this._rewriteHandlers = { rewrite: null, use: null, copy: null };
  }

  showRewriteView({ initialText = '', onRewrite, onUseResult, onCopyResult, quickActions = [] } = {}) {
    this.#cleanupRewriteView();
    this.#cleanupPromptView();
    this.#cleanupImageView();
    this.currentView = 'rewrite';
    const createElement = this.domFactory.createElement.bind(this.domFactory);
    const view = createRewriteView(createElement, this.container, { initialText, onBack: () => this.showMenu() });
    this._rewriteView = view;

    const handleRewrite = (event) => {
      event.preventDefault();
      if (typeof onRewrite === 'function') {
        onRewrite({
          text: String(view.inputField.value ?? ''),
          tone: view.toneSelect.value,
          length: view.lengthSelect.value,
          context: String(view.contextField.value ?? ''),
        });
      }
    };
    view.rewriteButton.addEventListener('click', handleRewrite);
    this._rewriteHandlers.rewrite = handleRewrite;

    const handleUse = (event) => {
      event.preventDefault();
      if (typeof onUseResult === 'function') {
        onUseResult(String(view.outputField.textContent ?? ''));
      }
    };
    view.useButton.addEventListener('click', handleUse);
    this._rewriteHandlers.use = handleUse;

    const handleCopy = (event) => {
      event.preventDefault();
      if (typeof onCopyResult === 'function') {
        onCopyResult(String(view.outputField.textContent ?? ''));
      }
    };
    view.copyButton.addEventListener('click', handleCopy);
    this._rewriteHandlers.copy = handleCopy;

    this.setRewriteQuickActions(quickActions);
  }

  setRewriteQuickActions(actions = []) {
    if (!this._rewriteView) return;
    const createElement = this.domFactory.createElement.bind(this.domFactory);
    const { quickActions, toneSelect, lengthSelect, contextField, rewriteButton } = this._rewriteView;
    quickActions.innerHTML = '';
    if (!Array.isArray(actions) || actions.length === 0) {
      quickActions.classList.add('chrome-ai-rewrite__quick-actions--hidden');
      return;
    }
    quickActions.classList.remove('chrome-ai-rewrite__quick-actions--hidden');
    actions.forEach((action) => {
      const label = action?.label || 'Apply';
      const button = createElement('button', {
        classNames: ['chrome-ai-rewrite__quick-action'],
        attributes: { type: 'button' },
        textContent: label,
      });
      button.addEventListener('click', (event) => {
        event.preventDefault();
        if (action.tone) toneSelect.value = action.tone;
        if (action.length) lengthSelect.value = action.length;
        if (typeof action.context === 'string') contextField.value = action.context;
        if (typeof action.onApply === 'function') {
          action.onApply(this);
        }
        if (action.autoRun && typeof this._rewriteHandlers.rewrite === 'function') {
          this._rewriteHandlers.rewrite(new Event('click'));
        }
      });
      quickActions.appendChild(button);
    });
  }

  setRewriteStatus(message = '', variant = 'info') {
    if (!this._rewriteView) return;
    const { status } = this._rewriteView;
    status.textContent = message;
    status.className = 'chrome-ai-rewrite__status';
    if (message) {
      status.classList.add(`chrome-ai-rewrite__status--${variant}`);
    }
  }

  showRewriteLoading(label) {
    if (!this._rewriteView) return;
    const createElement = this.domFactory.createElement.bind(this.domFactory);
    const { outputField } = this._rewriteView;
    outputField.classList.add('loading');
    outputField.innerHTML = '';
    const spinner = createElement('span', { classNames: ['chrome-ai-spinner'], attributes: { 'aria-hidden': 'true' } });
    const text = createElement('span', { classNames: ['chrome-ai-spinner__label'], textContent: label });
    outputField.append(spinner, text);
  }

  clearRewriteOutput() {
    if (!this._rewriteView) return;
    const { outputField } = this._rewriteView;
    outputField.classList.remove('loading');
    outputField.innerHTML = '';
  }

  setRewriteResult(text) {
    if (!this._rewriteView) return;
    const { outputField } = this._rewriteView;
    outputField.classList.remove('loading');
    outputField.textContent = text;
  }

  setRewriteButtonState(disabled) {
    if (!this._rewriteView) return;
    const { rewriteButton } = this._rewriteView;
    rewriteButton.disabled = disabled;
    rewriteButton.textContent = disabled ? 'Rewriting…' : 'Rewrite';
  }

  focusRewriteInput() {
    if (!this._rewriteView) return;
    this._rewriteView.inputField.focus();
  }

  setRewriteInputText(text) {
    if (!this._rewriteView) return;
    this._rewriteView.inputField.value = text;
  }

  getRewriteInputText() {
    if (!this._rewriteView) return '';
    return String(this._rewriteView.inputField.value ?? '');
  }

  getRewriteResultText() {
    if (!this._rewriteView) return '';
    return String(this._rewriteView.outputField.textContent ?? '');
  }

  #cleanupPromptView() {
    if (!this._promptView) return;
    const { runButton, insertButton, copyButton, inputField } = this._promptView;
    if (runButton && this._promptHandlers.run) {
      runButton.removeEventListener('click', this._promptHandlers.run);
    }
    if (inputField && this._promptHandlers.runKeydown) {
      inputField.removeEventListener('keydown', this._promptHandlers.runKeydown);
    }
    if (insertButton && this._promptHandlers.insert) {
      insertButton.removeEventListener('click', this._promptHandlers.insert);
    }
    if (copyButton && this._promptHandlers.copy) {
      copyButton.removeEventListener('click', this._promptHandlers.copy);
    }
    this._promptView = null;
    this._promptHandlers = { run: null, insert: null, copy: null };
  }

  showPromptView({ templates = [], recents = [], initialInput = '', onRunPrompt, onInsertResult, onCopyResult } = {}) {
    this.#cleanupPromptView();
    this.#cleanupRewriteView();
    this.#cleanupImageView();
    this.currentView = 'prompt';
    const createElement = this.domFactory.createElement.bind(this.domFactory);
    const view = createPromptView(createElement, this.container, {
      templates,
      recent: recents,
      initialInput,
      onBack: () => this.showMenu(),
    });
    this._promptView = {
      ...view,
      templates,
      recents,
      selectedTemplateId: templates[0]?.id ?? null,
      selectedRecentId: null,
    };

    const handleRun = (event) => {
      event.preventDefault();
      if (typeof onRunPrompt === 'function') {
        onRunPrompt({
          templateId: this._promptView.selectedTemplateId,
          input: String(this._promptView.inputField.value ?? ''),
        });
      }
    };
    view.runButton.addEventListener('click', handleRun);
    this._promptHandlers.run = handleRun;

    const handleRunKeydown = (event) => {
      if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        handleRun(event);
      }
    };
    view.inputField.addEventListener('keydown', handleRunKeydown);
    this._promptHandlers.runKeydown = handleRunKeydown;

    const handleInsert = (event) => {
      event.preventDefault();
      if (typeof onInsertResult === 'function') {
        onInsertResult(this.getPromptResultText());
      }
    };
    view.insertButton.addEventListener('click', handleInsert);
    this._promptHandlers.insert = handleInsert;

    const handleCopy = (event) => {
      event.preventDefault();
      if (typeof onCopyResult === 'function') {
        onCopyResult(this.getPromptResultText());
      }
    };
    view.copyButton.addEventListener('click', handleCopy);
    this._promptHandlers.copy = handleCopy;

    this.setPromptTemplates(templates);
    this.setPromptRecents(recents);
    this.setPromptStatus('');
  }

  setPromptTemplates(templates = []) {
    if (!this._promptView) return;
    const createElement = this.domFactory.createElement.bind(this.domFactory);
    this._promptView.templates = templates;
    if (!templates.some((t) => t.id === this._promptView.selectedTemplateId)) {
      this._promptView.selectedTemplateId = templates[0]?.id ?? null;
    }
    const { templateList } = this._promptView;
    templateList.innerHTML = '';
    if (!templates.length) {
      const empty = createElement('div', { classNames: ['chrome-ai-prompt__empty'], textContent: 'No templates available.' });
      templateList.appendChild(empty);
      return;
    }
    templates.forEach((template) => {
      const button = createElement('button', {
        classNames: ['chrome-ai-prompt__template', template.id === this._promptView.selectedTemplateId ? 'is-selected' : null].filter(Boolean),
        attributes: { type: 'button', 'data-template-id': template.id },
      });
      const title = createElement('div', { classNames: ['chrome-ai-prompt__template-title'], textContent: template.label });
      const description = createElement('div', { classNames: ['chrome-ai-prompt__template-desc'], textContent: template.description });
      button.append(title, description);
      button.addEventListener('click', (event) => {
        event.preventDefault();
        this._promptView.selectedTemplateId = template.id;
        this._promptView.selectedRecentId = null;
        this.setPromptTemplates(this._promptView.templates);
        this.setPromptRecents(this._promptView.recents);
      });
      templateList.appendChild(button);
    });
  }

  setPromptRecents(recents = []) {
    if (!this._promptView) return;
    const createElement = this.domFactory.createElement.bind(this.domFactory);
    this._promptView.recents = recents;
    const { recentList } = this._promptView;
    recentList.innerHTML = '';
    if (!recents.length) {
      const empty = createElement('div', { classNames: ['chrome-ai-prompt__empty'], textContent: 'Recent prompts will appear here.' });
      recentList.appendChild(empty);
      return;
    }
    recents.forEach((entry) => {
      const button = createElement('button', {
        classNames: ['chrome-ai-prompt__recent', entry.id === this._promptView.selectedRecentId ? 'is-selected' : null].filter(Boolean),
        attributes: { type: 'button', 'data-recent-id': entry.id },
      });
      const title = createElement('div', { classNames: ['chrome-ai-prompt__recent-title'], textContent: entry.label });
      const desc = createElement('div', { classNames: ['chrome-ai-prompt__recent-desc'], textContent: entry.description });
      button.append(title, desc);
      button.addEventListener('click', (event) => {
        event.preventDefault();
        this._promptView.selectedTemplateId = entry.templateId;
        this._promptView.selectedRecentId = entry.id;
        if (typeof entry.input === 'string') {
          this.setPromptInputText(entry.input);
        }
        this.setPromptTemplates(this._promptView.templates);
        this.setPromptRecents(this._promptView.recents);
        this.setPromptStatus(`Using saved context from a previous "${entry.label}" prompt.`);
      });
      recentList.appendChild(button);
    });
  }

  setPromptStatus(message = '', variant = 'info') {
    if (!this._promptView) return;
    const { status } = this._promptView;
    status.textContent = message;
    status.className = 'chrome-ai-prompt__status';
    if (message) {
      status.classList.add(`chrome-ai-prompt__status--${variant}`);
    }
  }

  showPromptLoading(label) {
    if (!this._promptView) return;
    const createElement = this.domFactory.createElement.bind(this.domFactory);
    const { outputField } = this._promptView;
    outputField.classList.add('loading');
    outputField.innerHTML = '';
    const spinner = createElement('span', { classNames: ['chrome-ai-spinner'], attributes: { 'aria-hidden': 'true' } });
    const text = createElement('span', { classNames: ['chrome-ai-spinner__label'], textContent: label });
    outputField.append(spinner, text);
  }

  clearPromptOutput() {
    if (!this._promptView) return;
    const { outputField } = this._promptView;
    outputField.classList.remove('loading');
    outputField.innerHTML = '';
  }

  setPromptResult(text) {
    if (!this._promptView) return;
    const { outputField } = this._promptView;
    outputField.classList.remove('loading');
    outputField.innerHTML = '';
    if (!text) return;
    if (hasMarkdown(text)) {
      outputField.innerHTML = safeRenderMarkdown(text);
    } else {
      outputField.textContent = text;
    }
  }

  setPromptButtonState(disabled) {
    if (!this._promptView) return;
    const { runButton } = this._promptView;
    runButton.disabled = disabled;
    runButton.textContent = disabled ? 'Running…' : 'Run prompt';
  }

  focusPromptInput() {
    if (!this._promptView) return;
    this._promptView.inputField.focus();
  }

  setPromptInputText(text) {
    if (!this._promptView) return;
    this._promptView.inputField.value = text ?? '';
  }

  getPromptInputText() {
    if (!this._promptView) return '';
    return String(this._promptView.inputField.value ?? '');
  }

  getPromptResultText() {
    if (!this._promptView) return '';
    return String(this._promptView.outputField.textContent ?? '').trim();
  }

  getPromptSelectedTemplateId() {
    if (!this._promptView) return null;
    return this._promptView.selectedTemplateId;
  }

  #cleanupImageView() {
    if (!this._imageView) return;
    if (this._imageHandlers.analyze) {
      // Remove event listeners if needed
      this._imageHandlers.analyze = null;
    }
    this._imageView = null;
    this._imageHandlers = { analyze: null };
  }

  /** Show image analysis view */
  showImageView({ onAnalyzeImage } = {}) {
    this.#cleanupImageView();
    this.#cleanupRewriteView();
    this.#cleanupPromptView();
    this.currentView = 'image';
    const createElement = this.domFactory.createElement.bind(this.domFactory);
    this._imageView = createImageView(createElement, this.container, {
      onBack: () => this.showMenu(),
      onAnalyzeImage: (file, query) => {
        if (typeof onAnalyzeImage === 'function') {
          onAnalyzeImage(file, query);
        }
      }
    });
  }

  /** Set image analysis suggestions */
  setImageSuggestions(suggestions) {
    if (this._imageView && this.currentView === 'image') {
      this._imageView.setSuggestions(suggestions);
    }
  }

  /** Show image analysis loading state */
  setImageAnalysisLoading(label) {
    if (this._imageView && this.currentView === 'image') {
      this._imageView.setAnalyzeButtonState(true, label || 'Analyzing...');
    }
  }

  /** Set image analysis result */
  setImageAnalysisResult(content) {
    if (this._imageView && this.currentView === 'image') {
      this._imageView.setAnalyzeButtonState(false, 'Analyze Image');
      this._imageView.showResults(content);
    }
  }

  /** Hide image analysis results */
  hideImageAnalysisResults() {
    if (this._imageView && this.currentView === 'image') {
      this._imageView.hideResults();
    }
  }

  /** Get current image file */
  getCurrentImageFile() {
    if (this._imageView && this.currentView === 'image') {
      return this._imageView.currentFile();
    }
    return null;
  }

  /** Get image query */
  getImageQuery() {
    if (this._imageView && this.currentView === 'image') {
      return this._imageView.getQuery();
    }
    return '';
  }

  /** Set image query */
  setImageQuery(query) {
    if (this._imageView && this.currentView === 'image') {
      this._imageView.setQuery(query);
    }
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
      this._chatView.showChatSuggestions(suggestions, onSelect);
    }
  }

  /** Show suggestions loading state */
  showChatSuggestionsLoading(label) {
    if (this._chatView && this.currentView === 'chat') {
      this._chatView.showChatSuggestionsLoading(label);
    }
  }

  /** Show suggestions informational message */
  showChatSuggestionsMessage(message) {
    if (this._chatView && this.currentView === 'chat') {
      this._chatView.showChatSuggestionsMessage(message);
    }
  }

  /** Hide suggestions drawer */
  hideChatSuggestions() {
    if (this._chatView && this.currentView === 'chat') {
      this._chatView.hideChatSuggestions();
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
