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
export const upsertSummaryBlock = (createElement, container, text) => {
  let block = container.querySelector('.chrome-ai-mock-menu__summary');
  if (!block) {
    block = createElement('section', {
      classNames: ['chrome-ai-mock-menu__summary'],
      attributes: { role: 'region', 'aria-live': 'polite' },
    });
    const header = createElement('div', {
      classNames: ['chrome-ai-mock-menu__summary-title'],
    });
    const icon = createElement('i', { classNames: ['fas', 'fa-file-lines'], attributes: { 'aria-hidden': 'true' } });
    const title = createElement('span', { textContent: 'Summary' });
    header.append(icon, title);
    const body = createElement('div', { classNames: ['chrome-ai-mock-menu__summary-body'] });
    block.append(header, body);
    // Insert below header
    const firstChild = container.firstElementChild;
    if (firstChild) {
      container.insertBefore(block, firstChild.nextSibling);
    } else {
      container.append(block);
    }
  }
  const body = block.querySelector('.chrome-ai-mock-menu__summary-body');
  if (body) {
    body.classList.remove('loading');
    body.textContent = text;
  }
  return block;
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
 * Translation UI helpers
 */
export const upsertTranslationBlock = (createElement, container) => {
  let block = container.querySelector('.chrome-ai-translate');
  if (!block) {
    block = createElement('section', { classNames: ['chrome-ai-translate'] });
    const header = createElement('div', { classNames: ['chrome-ai-translate__title'] });
    const icon = createElement('i', { classNames: ['fas', 'fa-language'], attributes: { 'aria-hidden': 'true' } });
    const title = createElement('span', { textContent: 'Translate' });
    header.append(icon, title);
    const controls = createElement('div', { classNames: ['chrome-ai-translate__controls'] });
    const select = createElement('select', { classNames: ['chrome-ai-translate__select'], attributes: { 'aria-label': 'Target language' } });
    const btn = createElement('button', { classNames: ['chrome-ai-translate__btn'], attributes: { type: 'button' }, textContent: 'Translate' });
    const body = createElement('div', { classNames: ['chrome-ai-translate__body'] });
    controls.append(select, btn);
    block.append(header, controls, body);
    const firstChild = container.firstElementChild;
    if (firstChild) container.insertBefore(block, firstChild.nextSibling);
    else container.append(block);
  }
  return block;
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
