import { createOverlayContainer, isEventOutside } from '../utils/overlayUtils.js';
import { summarizeCurrentPageWithProgress } from '../business/summarizationService.js';
import { translateCurrentPageWithProgress } from '../business/translationService.js';
import { sendChatMessageStreaming, getSuggestedQuestions, canChat } from '../business/chatService.js';
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
    this.chatHistory = []; // Store chat history
    this.currentStreamingMessage = null; // Current streaming message element
    this.currentTypingIndicator = null; // Current typing indicator
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

  /** Handle menu item selections with mobile-style navigation. */
  async handleMenuSelect(id) {
    if (id === 'summary') {
      try {
        // Navigate to summary view and show initial loading
        this.menu.showSummaryView('');
        this.menu.setSummaryLoading('Preparing model…');
        if (!this.menu.isVisible()) this.menu.show();
        this.button.setActive(true);
        
        const summary = await summarizeCurrentPageWithProgress(document, (phase) => {
          if (phase === 'download_start') this.menu.setSummaryLoading('Downloading model…');
          if (phase === 'download_complete') this.menu.setSummaryLoading('Model ready. Summarizing…');
          if (phase === 'inference_start') this.menu.setSummaryLoading('Summarizing…');
        });
        this.menu.setSummary(summary);
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
      // Navigate to translation view
      this.menu.showTranslationView(LANGUAGES, async (targetLabel) => {
        try {
          this.menu.setTranslationLoading('Detecting language…');
          const translated = await translateCurrentPageWithProgress(document, targetLabel, (phase) => {
            if (phase === 'detection_start') this.menu.setTranslationLoading('Detecting language…');
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
          else if (code === 'same-language') message = e.message;
          else if (code === 'empty-translation') message = 'The model returned an empty translation.';
          else if (code === 'inference-failed') message = 'AI translation failed. Please try again.';
          this.menu.setTranslation(message);
        }
      });
      
      if (!this.menu.isVisible()) this.menu.show();
      this.button.setActive(true);
    }
    if (id === 'chat') {
      try {
        // Navigate to chat view
        this.menu.showChatView(async (message) => {
          await this.handleChatMessage(message);
        });
        
        if (!this.menu.isVisible()) this.menu.show();
        this.button.setActive(true);
        
        // Load and show suggested questions in drawer
        await this.loadAndShowSuggestions();
        
        // Focus input for better UX
        this.menu.focusChatInput();
      } catch (e) {
        let message = 'Unable to open chat.';
        const code = e && e.code;
        if (code === 'ai-unavailable') message = 'AI chat is not available in this Chrome build.';
        this.menu.addChatMessage('assistant', message);
      }
    }
  }

  /** Load and display suggested questions in the drawer */
  async loadAndShowSuggestions() {
    this.menu.showChatSuggestionsLoading('Getting suggestions…');
    try {
      const suggestions = await getSuggestedQuestions(document, () => {});
      this.showSuggestionsDrawer(suggestions);
    } catch (e) {
      // Fallback suggestions if generation fails
      const fallbackSuggestions = [
        'What is this page about?',
        'Can you explain the main points?',
        'What should I take away from this?'
      ];
      this.showSuggestionsDrawer(fallbackSuggestions);
    }
  }

  /** Show suggestions drawer with given suggestions */
  showSuggestionsDrawer(suggestions) {
    const list = Array.isArray(suggestions) ? suggestions : [];
    if (list.length === 0) {
      this.menu.showChatSuggestionsMessage('No suggestions available right now.');
      return;
    }

    this.menu.showChatSuggestions(list, (suggestion) => {
      this.handleSuggestionSelect(suggestion);
    });
  }

  /** Hide suggestions drawer */
  hideSuggestionsDrawer() {
    this.menu.hideChatSuggestions();
  }

  /** Handle suggestion selection from drawer */
  async handleSuggestionSelect(suggestion) {
    // Hide drawer after selection
    this.hideSuggestionsDrawer();
    
    // Send the suggestion as a chat message
    await this.handleChatMessage(suggestion);
  }

  /** Update suggestions with new ones and show carousel */
  updateSuggestions(newSuggestions) {
    if (this.menu.currentView === 'chat') {
      const list = Array.isArray(newSuggestions) ? newSuggestions : [];
      if (list.length === 0) {
        this.menu.showChatSuggestionsMessage('No new suggestions available right now.');
        return;
      }
      this.menu.showChatSuggestions(list, (suggestion) => {
        this.handleSuggestionSelect(suggestion);
      });
    }
  }

  /** Handle chat message with streaming response */
  async handleChatMessage(message) {
    const clearTypingIndicator = () => {
      if (this.currentTypingIndicator) {
        this.menu.removeChatTypingIndicator(this.currentTypingIndicator);
        this.currentTypingIndicator = null;
      }
    };

    try {
      // Add user message
      this.menu.addChatMessage('user', message);
      this.chatHistory.push({ role: 'user', content: message });
      
      // Disable input and show typing
      this.menu.setChatSendButtonState(true);
      this.currentTypingIndicator = this.menu.showChatTypingIndicator();
      
      // Create AbortController for stopping
      const abortController = new AbortController();
      
      // Start streaming response
      this.currentStreamingMessage = this.menu.addChatMessage('assistant', '', true);
      clearTypingIndicator();
      
      let fullResponse = '';
      await sendChatMessageStreaming(
        document,
        message,
        this.chatHistory,
        () => {},
        (chunk) => {
          fullResponse += chunk;
          this.menu.updateStreamingChatMessage(this.currentStreamingMessage, chunk);
        },
        abortController.signal
      );
      
      // Clean up
      this.menu.stopStreamingChatMessage(this.currentStreamingMessage);
      clearTypingIndicator();
      this.menu.setChatSendButtonState(false);
      
      // Add to history
      this.chatHistory.push({ role: 'assistant', content: fullResponse });
      
      // Keep history manageable (last 10 messages)
      if (this.chatHistory.length > 10) {
        this.chatHistory = this.chatHistory.slice(-10);
      }
      
    } catch (e) {
      if (e.name === 'AbortError') {
        // User stopped generation
        clearTypingIndicator();
        this.menu.setChatSendButtonState(false);
        return;
      }
      
      let errorMessage = 'Sorry, I encountered an error.';
      const code = e && e.code;
      if (code === 'ai-unavailable') errorMessage = 'AI chat is not available in this Chrome build.';
      else if (code === 'no-content') errorMessage = 'No readable content found on this page.';
      else if (code === 'inference-failed') errorMessage = 'AI chat failed. Please try again.';
      
      clearTypingIndicator();
      this.menu.addChatMessage('assistant', errorMessage);
      this.menu.setChatSendButtonState(false);
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
