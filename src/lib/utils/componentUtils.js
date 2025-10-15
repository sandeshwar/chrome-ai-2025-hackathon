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
    'summary': 'fa-file-lines',
    'translate': 'fa-language'
  };

  const icon = createElement('i', { 
    classNames: ['fas', iconMap[item.id] || 'fa-circle'], 
    attributes: { 'aria-hidden': 'true' } 
  });
  
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
  const icon = createElement('i', { classNames: ['fas', 'fa-sparkles'], attributes: { 'aria-hidden': 'true' } });
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
  const backIcon = createElement('i', { classNames: ['fas', 'fa-arrow-left'], attributes: { 'aria-hidden': 'true' } });
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
