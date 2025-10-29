import { safeRenderMarkdown, hasMarkdown } from './markdownUtils.js';
import { createIcon, getIconType } from './iconUtils.js';

/**
 * Build the floating action button element.
 * @param {(opts?: any)=>HTMLButtonElement} createButton
 * @param {{label:string, ariaLabel:string}} params
 * @returns {HTMLButtonElement}
 */
export const createFabButtonElement = (createButton, { label, ariaLabel }) =>
  createButton({
    classNames: ['chrome-ai-fab-button'],
    attributes: { type: 'button', 'aria-label': ariaLabel, 'aria-pressed': 'false' },
    innerHTML: label,
  });

/**
 * @param {(tag:string, opts?: any)=>HTMLElement} createElement
 * @param {{id:string,title:string,description:string}} item
 * @returns {HTMLLIElement}
 */
export const createMenuItemElement = (createElement, item) => {
  const listItem = createElement('li', {
    classNames: ['chrome-ai-mock-menu__item'],
    attributes: { role: 'menuitem', 'data-item-id': item.id, tabindex: '0' },
  });

  const iconMap = {
    'summary': 'file-lines',
    'chat': 'chat',
    'translate': 'language',
    'rewrite': 'pen-line',
    'prompt': 'zap',
    'image': 'image'
  };

  const iconType = iconMap[item.id] || 'circle';
  const icon = createIcon(iconType);
  
  const title = createElement('span', { classNames: ['chrome-ai-mock-menu__item-title'] });
  title.append(icon, createElement('span', { textContent: item.title }));
  
  listItem.appendChild(title);
  return listItem;
};

/**
 * @param {(tag:string, opts?: any)=>HTMLElement} createElement
 */
export const createMenuContainer = (createElement) =>
  createElement('section', { classNames: ['chrome-ai-mock-menu'], attributes: { role: 'menu', 'aria-hidden': 'true' } });

/**
 * @param {(tag:string, opts?: any)=>HTMLElement} createElement
 */
export const createMenuHeader = (createElement) => {
  const header = createElement('header', { classNames: ['chrome-ai-mock-menu__title'] });
  const icon = createIcon('sparkles');
  const title = createElement('span', { textContent: 'AI Assistant' });
  header.append(icon, title);
  return header;
};

/**
 * @param {(tag:string, opts?: any)=>HTMLElement} createElement
 */
export const createBackHeader = (createElement, title, onBack) => {
  const header = createElement('header', { classNames: ['chrome-ai-mock-menu__back-header'] });
  const backBtn = createElement('button', { 
    classNames: ['chrome-ai-mock-menu__back-btn'],
    attributes: { type: 'button', 'aria-label': 'Go back' }
  });
  const backIcon = createIcon('arrow-left');
  backBtn.appendChild(backIcon);
  backBtn.addEventListener('click', onBack);
  
  const titleSpan = createElement('span', { classNames: ['chrome-ai-mock-menu__back-title'], textContent: title });
  header.append(backBtn, titleSpan);
  return header;
};

/**
 * @param {(tag:string, opts?: any)=>HTMLElement} createElement
 */
export const createMenuList = (createElement) => createElement('ul', { classNames: ['chrome-ai-mock-menu__list'] });

/**
 * Build the full menu DOM.
 * @param {(tag:string, opts?: any)=>HTMLElement} createElement
 * @param {{id:string,title:string,description:string}[]} menuItems
 * @returns {HTMLElement}
 */
export const buildMenuElement = (createElement, menuItems) => {
  const container = createMenuContainer(createElement);
  const header = createMenuHeader(createElement);
  const list = createMenuList(createElement);
  menuItems.forEach((item) => list.appendChild(createMenuItemElement(createElement, item)));
  container.append(header, list);
  return container;
};

export const createRewriteView = (createElement, container, { initialText = '', onBack }) => {
  container.innerHTML = '';

  const header = createBackHeader(createElement, 'Improve Writing', onBack);
  container.appendChild(header);

  const content = createElement('div', { classNames: ['chrome-ai-mock-menu__content', 'chrome-ai-rewrite'] });

  const controls = createElement('div', { classNames: ['chrome-ai-rewrite__controls'] });
  const toneSelect = createElement('select', { classNames: ['chrome-ai-rewrite__select'], attributes: { 'aria-label': 'Tone' } });
  [['as-is', 'Tone: As-is'], ['more-formal', 'Tone: More formal'], ['more-casual', 'Tone: More casual']].forEach(([value, label]) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    toneSelect.appendChild(option);
  });
  const lengthSelect = createElement('select', { classNames: ['chrome-ai-rewrite__select'], attributes: { 'aria-label': 'Length' } });
  [['as-is', 'Length: As-is'], ['shorter', 'Length: Shorter'], ['longer', 'Length: Longer']].forEach(([value, label]) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    lengthSelect.appendChild(option);
  });
  const rewriteButton = createElement('button', {
    classNames: ['chrome-ai-rewrite__primary'],
    attributes: { type: 'button' },
    textContent: 'Rewrite',
  });
  const toneWrapper = createElement('div', { classNames: ['chrome-ai-rewrite__control'] });
  toneWrapper.append(
    createElement('span', { classNames: ['chrome-ai-rewrite__control-label'], textContent: 'Tone' }),
    toneSelect,
  );

  const lengthWrapper = createElement('div', { classNames: ['chrome-ai-rewrite__control'] });
  lengthWrapper.append(
    createElement('span', { classNames: ['chrome-ai-rewrite__control-label'], textContent: 'Length' }),
    lengthSelect,
  );

  controls.append(toneWrapper, lengthWrapper, rewriteButton);

  const quickLabel = createElement('div', { classNames: ['chrome-ai-rewrite__section-heading'], textContent: 'Quick adjustments' });
  const quickActions = createElement('div', { classNames: ['chrome-ai-rewrite__quick-actions'] });

  const grid = createElement('div', { classNames: ['chrome-ai-rewrite__grid'] });

  const inputSection = createElement('div', { classNames: ['chrome-ai-rewrite__section'] });
  const inputLabel = createElement('div', { classNames: ['chrome-ai-rewrite__label'], textContent: 'Original text' });
  const inputField = createElement('textarea', {
    classNames: ['chrome-ai-rewrite__input'],
    attributes: { rows: '6', placeholder: 'Paste or select text to improve' },
    textContent: initialText,
  });
  inputField.value = initialText;
  inputSection.append(inputLabel, inputField);

  const contextSection = createElement('div', { classNames: ['chrome-ai-rewrite__section'] });
  const contextLabel = createElement('div', { classNames: ['chrome-ai-rewrite__label'], textContent: 'Optional guidance' });
  const contextField = createElement('textarea', {
    classNames: ['chrome-ai-rewrite__context'],
    attributes: { rows: '3', placeholder: 'Add instructions for tone, audience, or purpose' },
  });
  contextSection.append(contextLabel, contextField);

  const outputSection = createElement('div', { classNames: ['chrome-ai-rewrite__section'] });
  const outputLabel = createElement('div', { classNames: ['chrome-ai-rewrite__label'], textContent: 'Suggestion' });
  const outputField = createElement('div', {
    classNames: ['chrome-ai-rewrite__output'],
    attributes: { role: 'status', 'aria-live': 'polite' },
  });
  const outputActions = createElement('div', { classNames: ['chrome-ai-rewrite__output-actions'] });
  const useButton = createElement('button', {
    classNames: ['chrome-ai-rewrite__action'],
    attributes: { type: 'button' },
    textContent: 'Use result',
  });
  const copyButton = createElement('button', {
    classNames: ['chrome-ai-rewrite__action'],
    attributes: { type: 'button' },
    textContent: 'Copy',
  });
  outputActions.append(useButton, copyButton);
  outputSection.append(outputLabel, outputField, outputActions);

  grid.append(inputSection, contextSection, outputSection);

  const status = createElement('div', { classNames: ['chrome-ai-rewrite__status'] });

  content.append(controls, quickLabel, quickActions, grid, status);
  container.appendChild(content);

  return {
    toneSelect,
    lengthSelect,
    rewriteButton,
    quickActions,
    quickLabel,
    inputField,
    contextField,
    outputField,
    useButton,
    copyButton,
    status,
  };
};

export const createPromptView = (createElement, container, { templates = [], recent = [], initialInput = '', onBack }) => {
  container.innerHTML = '';

  const header = createBackHeader(createElement, 'Prompt Quick Actions', onBack);
  container.appendChild(header);

  const content = createElement('div', { classNames: ['chrome-ai-mock-menu__content', 'chrome-ai-prompt'] });

  const templateSection = createElement('div', { classNames: ['chrome-ai-prompt__section'] });
  const templateLabel = createElement('div', { classNames: ['chrome-ai-prompt__section-heading'], textContent: 'Templates' });
  const templateList = createElement('div', { classNames: ['chrome-ai-prompt__templates'] });
  templateSection.append(templateLabel, templateList);

  const recentSection = createElement('div', { classNames: ['chrome-ai-prompt__section', 'chrome-ai-prompt__section--compact'] });
  const recentLabel = createElement('div', { classNames: ['chrome-ai-prompt__section-heading'], textContent: 'Recent' });
  const recentList = createElement('div', { classNames: ['chrome-ai-prompt__recents'] });
  recentSection.append(recentLabel, recentList);

  const inputSection = createElement('div', { classNames: ['chrome-ai-prompt__section'] });
  const inputLabel = createElement('div', { classNames: ['chrome-ai-prompt__label'], textContent: 'Context' });
  const inputField = createElement('textarea', {
    classNames: ['chrome-ai-prompt__input'],
    attributes: { rows: '6', placeholder: 'Use selected text or paste context for the assistant' },
    textContent: initialInput,
  });
  inputField.value = initialInput;
  inputSection.append(inputLabel, inputField);

  const actions = createElement('div', { classNames: ['chrome-ai-prompt__actions'] });
  const runButton = createElement('button', {
    classNames: ['chrome-ai-prompt__primary'],
    attributes: { type: 'button' },
    textContent: 'Run prompt',
  });
  const insertButton = createElement('button', {
    classNames: ['chrome-ai-prompt__action'],
    attributes: { type: 'button' },
    textContent: 'Insert result',
  });
  const copyButton = createElement('button', {
    classNames: ['chrome-ai-prompt__action'],
    attributes: { type: 'button' },
    textContent: 'Copy',
  });
  actions.append(runButton, insertButton, copyButton);

  const outputSection = createElement('div', { classNames: ['chrome-ai-prompt__section'] });
  const outputLabel = createElement('div', { classNames: ['chrome-ai-prompt__label'], textContent: 'Result' });
  const outputField = createElement('div', {
    classNames: ['chrome-ai-prompt__output'],
    attributes: { role: 'status', 'aria-live': 'polite' },
  });
  outputSection.append(outputLabel, outputField);

  const status = createElement('div', { classNames: ['chrome-ai-prompt__status'] });

  content.append(templateSection, recentSection, inputSection, actions, outputSection, status);
  container.appendChild(content);

  return {
    templateList,
    recentList,
    runButton,
    insertButton,
    copyButton,
    inputField,
    outputField,
    status,
  };
};

/**
 * Create or update a summary block inside the menu container.
 * @param {(tag:string, opts?: any)=>HTMLElement} createElement
 * @param {HTMLElement} container
 * @param {string} text
 * @returns {HTMLElement}
 */
/**
 * Create a full-screen summary view.
 * @param {(tag:string, opts?: any)=>HTMLElement} createElement
 * @param {HTMLElement} container
 * @param {string} text
 * @param {Function} onBack
 * @returns {HTMLElement}
 */
export const createSummaryView = (createElement, container, text, onBack) => {
  // Clear existing content
  container.innerHTML = '';
  
  // Add back header
  const header = createBackHeader(createElement, 'Summary', onBack);
  container.appendChild(header);
  
  // Create scrollable content area
  const content = createElement('div', { classNames: ['chrome-ai-mock-menu__content'] });
  const body = createElement('div', { classNames: ['chrome-ai-mock-menu__summary-body-full'], textContent: text });
  content.appendChild(body);
  container.appendChild(content);
  
  return container;
};

/**
 * Update summary view with new text.
 * @param {HTMLElement} container
 * @param {string} text
 */
export const updateSummaryView = (container, text) => {
  const body = container.querySelector('.chrome-ai-mock-menu__summary-body-full');
  if (body) {
    body.classList.remove('loading');
    body.textContent = text;
  }
};

/**
 * Show loading state in summary view.
 * @param {(tag:string, opts?: any)=>HTMLElement} createElement
 * @param {HTMLElement} container
 * @param {string} label
 */
export const showSummaryLoading = (createElement, container, label) => {
  const body = container.querySelector('.chrome-ai-mock-menu__summary-body-full');
  if (body) {
    body.classList.add('loading');
    body.textContent = '';
    const spinner = createElement('span', { classNames: ['chrome-ai-spinner'], attributes: { 'aria-hidden': 'true' } });
    const text = createElement('span', { classNames: ['chrome-ai-spinner__label'], textContent: label });
    body.append(spinner, text);
  }
};

/** Ensure summary block exists and show a spinner + label. */
export const upsertSummaryLoading = (createElement, container, label) => {
  const block = upsertSummaryBlock(createElement, container, '');
  const body = block.querySelector('.chrome-ai-mock-menu__summary-body');
  if (body) {
    body.classList.add('loading');
    body.textContent = '';
    const spinner = createElement('span', { classNames: ['chrome-ai-spinner'], attributes: { 'aria-hidden': 'true' } });
    const text = createElement('span', { classNames: ['chrome-ai-spinner__label'], textContent: label });
    body.append(spinner, text);
  }
  return block;
};

/**
 * Create a full-screen translation view.
 * @param {(tag:string, opts?: any)=>HTMLElement} createElement
 * @param {HTMLElement} container
 * @param {Array} languages
 * @param {Function} onBack
 * @param {Function} onTranslate
 * @returns {HTMLElement}
 */
export const createTranslationView = (createElement, container, languages, onBack, onTranslate) => {
  // Clear existing content
  container.innerHTML = '';
  
  // Add back header
  const header = createBackHeader(createElement, 'Translate', onBack);
  container.appendChild(header);
  
  // Create scrollable content area
  const content = createElement('div', { classNames: ['chrome-ai-mock-menu__content'] });
  
  // Create translation controls
  const controls = createElement('div', { classNames: ['chrome-ai-translate__controls-full'] });
  const select = createElement('select', { classNames: ['chrome-ai-translate__select-full'], attributes: { 'aria-label': 'Target language' } });
  const btn = createElement('button', { 
    classNames: ['chrome-ai-translate__btn-full'], 
    attributes: { type: 'button' }, 
    textContent: 'Translate' 
  });
  
  // Populate language options
  languages.forEach(({ code, label }) => {
    const opt = document.createElement('option');
    opt.value = code; // Use language code as value
    opt.textContent = label || code; // Use label as display text
    select.appendChild(opt);
  });
  
  // Add translate button handler
  btn.addEventListener('click', () => {
    const selectedLang = select.value;
    onTranslate(selectedLang);
  });
  
  controls.append(select, btn);
  content.appendChild(controls);
  
  // Create translation body
  const body = createElement('div', { classNames: ['chrome-ai-translate__body-full'] });
  content.appendChild(body);
  
  container.appendChild(content);
  
  return container;
};

/**
 * Update translation view with result text.
 * @param {HTMLElement} container
 * @param {string} text
 */
export const updateTranslationView = (container, text) => {
  const body = container.querySelector('.chrome-ai-translate__body-full');
  if (body) {
    body.classList.remove('loading');
    body.textContent = text;
  }
};

/**
 * Show loading state in translation view.
 * @param {(tag:string, opts?: any)=>HTMLElement} createElement
 * @param {HTMLElement} container
 * @param {string} label
 */
export const showTranslationLoading = (createElement, container, label) => {
  const body = container.querySelector('.chrome-ai-translate__body-full');
  if (body) {
    body.classList.add('loading');
    body.textContent = '';
    const spinner = createElement('span', { classNames: ['chrome-ai-spinner'], attributes: { 'aria-hidden': 'true' } });
    const text = createElement('span', { classNames: ['chrome-ai-spinner__label'], textContent: label });
    body.append(spinner, text);
  }
};

export const setTranslationLanguages = (container, languages) => {
  const select = container.querySelector('.chrome-ai-translate__select');
  if (!select) return;
  select.innerHTML = '';
  languages.forEach(({ code, label }) => {
    const opt = document.createElement('option');
    opt.value = label || code;
    opt.textContent = label || code;
    select.appendChild(opt);
  });
};

export const setTranslationLoading = (createElement, container, label) => {
  const block = upsertTranslationBlock(createElement, container);
  const body = block.querySelector('.chrome-ai-translate__body');
  if (body) {
    body.classList.add('loading');
    body.textContent = '';
    const spinner = createElement('span', { classNames: ['chrome-ai-spinner'], attributes: { 'aria-hidden': 'true' } });
    const text = createElement('span', { classNames: ['chrome-ai-spinner__label'], textContent: label });
    body.append(spinner, text);
  }
  return block;
};

export const setTranslationText = (container, text) => {
  const body = container.querySelector('.chrome-ai-translate__body');
  if (body) {
    body.classList.remove('loading');
    body.textContent = String(text || '');
  }
};

/**
 * Create a full-screen chat view
 * @param {(tag:string, opts?: any)=>HTMLElement} createElement
 * @param {HTMLElement} container
 * @param {() => void} onBack
 * @param {Function} onSendMessage
 */
export const createChatView = (createElement, container, onBack, onSendMessage) => {
  container.innerHTML = '';
  container.className = 'chrome-ai-mock-menu chrome-ai-mock-menu--visible';
  
  // Create back header
  const header = createBackHeader(createElement, 'AI Chat', onBack);
  
  // Create chat container
  const chatContainer = createElement('div', { 
    classNames: ['chrome-ai-chat-container'] 
  });
  
  // Messages area
  const messagesArea = createElement('div', { 
    classNames: ['chrome-ai-chat-messages'] 
  });
  
  // Input area
  const inputArea = createElement('div', { 
    classNames: ['chrome-ai-chat-input-area'] 
  });

  const suggestionsContainer = createElement('div', {
    classNames: ['chrome-ai-chat-suggestions-container']
  });

  const suggestionsToggle = createElement('button', {
    classNames: ['chrome-ai-chat-suggestions-toggle'],
    attributes: {
      type: 'button',
      'aria-expanded': 'false',
      'aria-label': 'View suggested prompts',
      'aria-disabled': 'true',
      disabled: 'disabled'
    },
    textContent: 'Suggestions'
  });

  const suggestionsStatus = createElement('span', {
    classNames: ['chrome-ai-chat-suggestions-status']
  });

  suggestionsContainer.append(suggestionsToggle, suggestionsStatus);

  const suggestionsDrawer = createElement('div', {
    classNames: ['chrome-ai-chat-suggestions-drawer']
  });

  const drawerBody = createElement('div', {
    classNames: ['chrome-ai-chat-suggestions-drawer__body']
  });

  suggestionsDrawer.appendChild(drawerBody);

  const inputWrapper = createElement('div', { 
    classNames: ['chrome-ai-chat-input-wrapper'] 
  });
  
  const messageInput = createElement('textarea', {
    classNames: ['chrome-ai-chat-input'],
    attributes: { 
      placeholder: 'Ask about this page...',
      rows: '1',
      maxlength: '1000'
    }
  });
  
  const sendButton = createElement('button', {
    classNames: ['chrome-ai-chat-send'],
    attributes: { type: 'button', 'aria-label': 'Send message' },
    textContent: 'Send'
  });
  
  inputWrapper.append(messageInput, sendButton);
  inputArea.append(suggestionsContainer, suggestionsDrawer, inputWrapper);
  
  chatContainer.append(messagesArea, inputArea);
  container.append(header, chatContainer);
  
  // Auto-resize textarea
  messageInput.addEventListener('input', () => {
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
  });
  
  let drawerOpen = false;

  const setSuggestionsToggleState = ({ loading = false, enabled = false, message = '' } = {}) => {
    suggestionsStatus.textContent = message;
    if (loading) {
      suggestionsToggle.classList.add('chrome-ai-chat-suggestions-toggle--loading');
    } else {
      suggestionsToggle.classList.remove('chrome-ai-chat-suggestions-toggle--loading');
    }

    if (enabled) {
      suggestionsToggle.removeAttribute('disabled');
      suggestionsToggle.setAttribute('aria-disabled', 'false');
    } else {
      suggestionsToggle.setAttribute('disabled', 'disabled');
      suggestionsToggle.setAttribute('aria-disabled', 'true');
      if (drawerOpen) {
        closeDrawer();
      }
    }
  };

  const openDrawer = () => {
    drawerOpen = true;
    suggestionsDrawer.classList.add('chrome-ai-chat-suggestions-drawer--open');
    suggestionsToggle.setAttribute('aria-expanded', 'true');
    suggestionsToggle.classList.add('chrome-ai-chat-suggestions-toggle--open');
  };

  const closeDrawer = () => {
    drawerOpen = false;
    suggestionsDrawer.classList.remove('chrome-ai-chat-suggestions-drawer--open');
    suggestionsToggle.setAttribute('aria-expanded', 'false');
    suggestionsToggle.classList.remove('chrome-ai-chat-suggestions-toggle--open');
  };

  suggestionsToggle.addEventListener('click', () => {
    if (suggestionsToggle.getAttribute('aria-disabled') === 'true') return;
    drawerOpen ? closeDrawer() : openDrawer();
  });

  // Handle send button
  const handleSend = () => {
    const message = messageInput.value.trim();
    if (message && onSendMessage) {
      onSendMessage(message);
      messageInput.value = '';
      messageInput.style.height = 'auto';
    }
  };
  
  sendButton.addEventListener('click', handleSend);
  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });
  
  return {
    container,
    messagesArea,
    messageInput,
    sendButton,
    addMessage: (role, content, isStreaming = false) => {
      const messageDiv = createElement('div', { 
        classNames: ['chrome-ai-chat-message', `chrome-ai-chat-message--${role}`] 
      });
      
      const messageContent = createElement('div', { 
        classNames: ['chrome-ai-chat-message-content'] 
      });
      
      if (isStreaming) {
        messageContent.classList.add('chrome-ai-chat-message-content--streaming');
        messageContent.textContent = content;
      } else {
        // Render markdown for assistant messages
        if (role === 'assistant' && hasMarkdown(content)) {
          messageContent.innerHTML = safeRenderMarkdown(content);
        } else {
          messageContent.textContent = content;
        }
      }
      
      messageDiv.appendChild(messageContent);
      messagesArea.appendChild(messageDiv);
      
      // Auto-scroll to bottom only for new messages
      messagesArea.scrollTop = messagesArea.scrollHeight;
      
      return messageContent;
    },
    updateStreamingMessage: (messageElement, chunk) => {
      if (messageElement) {
        // Store scroll position before update
        const wasAtBottom = messagesArea.scrollHeight - messagesArea.scrollTop <= messagesArea.clientHeight + 10;
        
        // For streaming, we need to accumulate text and then render markdown
        const currentContent = messageElement.textContent || '';
        const newContent = currentContent + chunk;
        
        // Try to render markdown, fallback to text if incomplete
        try {
          if (hasMarkdown(newContent)) {
            messageElement.innerHTML = safeRenderMarkdown(newContent);
          } else {
            messageElement.textContent = newContent;
          }
        } catch (e) {
          // Fallback to plain text if markdown parsing fails
          messageElement.textContent = newContent;
        }
        
        // Only auto-scroll if user was at bottom (allowing manual scrolling)
        if (wasAtBottom) {
          messagesArea.scrollTop = messagesArea.scrollHeight;
        }
      }
    },
    stopStreaming: (messageElement) => {
      if (messageElement) {
        messageElement.classList.remove('chrome-ai-chat-message-content--streaming');
      }
    },
    showTypingIndicator: () => {
      const typingDiv = createElement('div', { 
        classNames: ['chrome-ai-chat-typing'] 
      });
      
      const dots = createElement('div', { 
        classNames: ['chrome-ai-chat-typing-dots'] 
      });
      
      for (let i = 0; i < 3; i++) {
        const dot = createElement('span', { 
          classNames: ['chrome-ai-chat-typing-dot'] 
        });
        dots.appendChild(dot);
      }
      
      typingDiv.appendChild(dots);
      messagesArea.appendChild(typingDiv);
      
      // Auto-scroll to bottom for typing indicator
      messagesArea.scrollTop = messagesArea.scrollHeight;
      
      return typingDiv;
    },
    removeTypingIndicator: (typingElement) => {
      if (typingElement && typingElement.parentNode) {
        typingElement.parentNode.removeChild(typingElement);
      }
    },
    showChatSuggestionsLoading: (label) => {
      setSuggestionsToggleState({ loading: true, enabled: false, message: label });
      drawerBody.innerHTML = '';
    },
    showChatSuggestionsMessage: (message) => {
      setSuggestionsToggleState({ loading: false, enabled: false, message });
      drawerBody.innerHTML = '';
    },
    showChatSuggestions: (suggestions, onSelect) => {
      drawerBody.innerHTML = '';
      const list = createElement('div', {
        classNames: ['chrome-ai-chat-suggestions-list']
      });

      suggestions.forEach((suggestion) => {
        const item = createElement('button', {
          classNames: ['chrome-ai-chat-suggestions-item'],
          attributes: { type: 'button' },
          textContent: suggestion
        });

        item.addEventListener('click', () => {
          closeDrawer();
          messageInput.value = suggestion;
          messageInput.focus();
          if (onSelect) onSelect(suggestion);
        });

        list.appendChild(item);
      });

      drawerBody.appendChild(list);
      setSuggestionsToggleState({ loading: false, enabled: true, message: `${suggestions.length} suggestion${suggestions.length === 1 ? '' : 's'} available` });
    },
    hideChatSuggestions: () => {
      drawerBody.innerHTML = '';
      closeDrawer();
      setSuggestionsToggleState({ loading: false, enabled: false, message: '' });
    },
    clearMessages: () => {
      messagesArea.innerHTML = '';
    },
    setSendButtonState: (disabled) => {
      sendButton.disabled = disabled;
      if (disabled) {
        sendButton.textContent = '...';
      } else {
        sendButton.textContent = 'Send';
      }
    }
  };
};

/**
 * Create image analysis view
 * @param {(tag:string, opts?: any)=>HTMLElement} createElement
 * @param {HTMLElement} container
 * @param {{onBack:Function, onAnalyzeImage:Function}} params
 * @returns {Object}
 */
export const createImageView = (createElement, container, { onBack, onAnalyzeImage }) => {
  container.innerHTML = '';
  container.className = 'chrome-ai-mock-menu chrome-ai-mock-menu--visible';
  
  // Create back header
  const header = createBackHeader(createElement, 'Image Analysis', onBack);
  
  // Create main container
  const imageContainer = createElement('div', { 
    classNames: ['chrome-ai-image-container'] 
  });
  
  // Upload area
  const uploadArea = createElement('div', { 
    classNames: ['chrome-ai-image-upload-area'] 
  });
  
  const uploadLabel = createElement('label', {
    classNames: ['chrome-ai-image-upload-label'],
    attributes: { for: 'chrome-ai-image-input' }
  });
  
  const uploadIcon = createIcon('upload');
  const uploadText = createElement('span', { 
    classNames: ['chrome-ai-image-upload-text'],
    textContent: 'Click to upload or drag and drop'
  });
  
  const uploadSubtext = createElement('span', { 
    classNames: ['chrome-ai-image-upload-subtext'],
    textContent: 'JPEG, PNG, GIF, WebP (max 10MB)'
  });
  
  const fileInput = createElement('input', {
    classNames: ['chrome-ai-image-input'],
    attributes: { 
      type: 'file',
      id: 'chrome-ai-image-input',
      accept: 'image/jpeg,image/jpg,image/png,image/gif,image/webp'
    }
  });
  
  uploadLabel.append(uploadIcon, uploadText, uploadSubtext);
  uploadArea.append(uploadLabel, fileInput);
  
  // Preview area (initially hidden)
  const previewArea = createElement('div', { 
    classNames: ['chrome-ai-image-preview-area', 'chrome-ai-image-preview-area--hidden'] 
  });
  
  const previewContainer = createElement('div', { 
    classNames: ['chrome-ai-image-preview-container'] 
  });
  
  const previewImage = createElement('img', {
    classNames: ['chrome-ai-image-preview'],
    attributes: { alt: 'Uploaded image preview' }
  });
  
  const imageInfo = createElement('div', { 
    classNames: ['chrome-ai-image-info'] 
  });
  
  const imageFileName = createElement('div', { 
    classNames: ['chrome-ai-image-filename'] 
  });
  
  const imageFileSize = createElement('div', { 
    classNames: ['chrome-ai-image-filesize'] 
  });
  
  const removeImageBtn = createElement('button', {
    classNames: ['chrome-ai-image-remove-btn'],
    attributes: { type: 'button', 'aria-label': 'Remove image' },
    textContent: 'Remove'
  });
  
  imageInfo.append(imageFileName, imageFileSize);
  previewContainer.append(previewImage, imageInfo, removeImageBtn);
  previewArea.appendChild(previewContainer);
  
  // Query input area
  const queryArea = createElement('div', { 
    classNames: ['chrome-ai-image-query-area'] 
  });
  
  const queryLabel = createElement('label', { 
    classNames: ['chrome-ai-image-query-label'],
    textContent: 'What would you like to know about this image?'
  });
  
  const queryInput = createElement('textarea', {
    classNames: ['chrome-ai-image-query-input'],
    attributes: { 
      placeholder: 'e.g., "Describe what you see", "What text is in this image?", "What is the setting?"',
      rows: '2'
    }
  });
  
  const suggestionsArea = createElement('div', { 
    classNames: ['chrome-ai-image-suggestions'] 
  });
  
  const suggestionsTitle = createElement('div', { 
    classNames: ['chrome-ai-image-suggestions-title'],
    textContent: 'Suggested questions:'
  });
  
  const suggestionsList = createElement('div', { 
    classNames: ['chrome-ai-image-suggestions-list'] 
  });
  
  suggestionsArea.append(suggestionsTitle, suggestionsList);
  
  // Analyze button
  const analyzeButton = createElement('button', {
    classNames: ['chrome-ai-image-analyze-btn'],
    attributes: { type: 'button', disabled: 'disabled' },
    textContent: 'Analyze Image'
  });
  
  // Results area
  const resultsArea = createElement('div', { 
    classNames: ['chrome-ai-image-results', 'chrome-ai-image-results--hidden'] 
  });
  
  const resultsContent = createElement('div', { 
    classNames: ['chrome-ai-image-results-content'] 
  });
  
  resultsArea.appendChild(resultsContent);
  
  // Assemble the view
  queryArea.append(queryLabel, queryInput, analyzeButton);
  imageContainer.append(uploadArea, previewArea, queryArea, resultsArea, suggestionsArea);
  container.append(header, imageContainer);
  
  // Auto-resize textarea
  queryInput.addEventListener('input', () => {
    queryInput.style.height = 'auto';
    queryInput.style.height = Math.min(queryInput.scrollHeight, 80) + 'px';
  });
  
  let currentFile = null;
  
  // Handle file selection
  const handleFileSelect = (file) => {
    if (!file) return;
    
    currentFile = file;
    
    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImage.src = e.target.result;
      imageFileName.textContent = file.name;
      imageFileSize.textContent = formatFileSize(file.size);
      
      uploadArea.classList.add('chrome-ai-image-upload-area--hidden');
      previewArea.classList.remove('chrome-ai-image-preview-area--hidden');
      analyzeButton.disabled = false;
      
      queryInput.focus();
    };
    reader.readAsDataURL(file);
  };
  
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  });
  
  // Handle drag and drop
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('chrome-ai-image-upload-area--dragover');
  });
  
  uploadArea.addEventListener('dragleave', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('chrome-ai-image-upload-area--dragover');
  });
  
  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('chrome-ai-image-upload-area--dragover');
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    }
  });
  
  // Handle remove image
  removeImageBtn.addEventListener('click', () => {
    currentFile = null;
    fileInput.value = '';
    previewImage.src = '';
    
    uploadArea.classList.remove('chrome-ai-image-upload-area--hidden');
    previewArea.classList.add('chrome-ai-image-preview-area--hidden');
    analyzeButton.disabled = true;
    resultsArea.classList.add('chrome-ai-image-results--hidden');
  });
  
  // Handle analyze button
  analyzeButton.addEventListener('click', () => {
    if (currentFile && onAnalyzeImage) {
      const query = queryInput.value.trim();
      onAnalyzeImage(currentFile, query);
    }
  });
  
  // Helper function to format file size
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  return {
    container,
    uploadArea,
    previewArea,
    queryInput,
    analyzeButton,
    resultsArea,
    resultsContent,
    suggestionsList,
    currentFile: () => currentFile,
    setQuery: (text) => { queryInput.value = text; },
    getQuery: () => queryInput.value.trim(),
    showUploadArea: () => {
      uploadArea.classList.remove('chrome-ai-image-upload-area--hidden');
      previewArea.classList.add('chrome-ai-image-preview-area--hidden');
    },
    showPreviewArea: () => {
      uploadArea.classList.add('chrome-ai-image-upload-area--hidden');
      previewArea.classList.remove('chrome-ai-image-preview-area--hidden');
    },
    showResults: (content) => {
      resultsArea.classList.remove('chrome-ai-image-results--hidden');
      if (hasMarkdown(content)) {
        resultsContent.innerHTML = safeRenderMarkdown(content);
      } else {
        resultsContent.textContent = content;
      }
    },
    hideResults: () => {
      resultsArea.classList.add('chrome-ai-image-results--hidden');
    },
    setAnalyzeButtonState: (disabled, text) => {
      analyzeButton.disabled = disabled;
      analyzeButton.textContent = text || 'Analyze Image';
    },
    setSuggestions: (suggestions) => {
      suggestionsList.innerHTML = '';
      suggestions.forEach(suggestion => {
        const suggestionBtn = createElement('button', {
          classNames: ['chrome-ai-image-suggestion-btn'],
          attributes: { type: 'button' },
          textContent: suggestion
        });
        suggestionBtn.addEventListener('click', () => {
          queryInput.value = suggestion;
          queryInput.style.height = 'auto';
          queryInput.style.height = Math.min(queryInput.scrollHeight, 80) + 'px';
          queryInput.focus();
        });
        suggestionsList.appendChild(suggestionBtn);
      });
    }
  };
};
