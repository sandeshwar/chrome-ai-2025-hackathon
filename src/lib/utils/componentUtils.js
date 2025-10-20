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
    'idea': 'idea',
    'summary': 'file-lines',
    'chat': 'chat',
    'translate': 'language'
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
