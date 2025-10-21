/** @typedef {{id:string,title:string,description:string}} MenuItem */

/** @type {ReadonlyArray<MenuItem>} */
export const DEFAULT_ITEMS = Object.freeze([
  { id: 'summary', title: 'Summarize Page', description: 'Get a concise overview of what you are reading.' },
  { id: 'chat', title: 'Open Chat', description: 'Start a conversation with the assistant.' },
  { id: 'rewrite', title: 'Improve Writing', description: 'Refine tone or length of selected text.' },
]);

/**
 * @param {ReadonlyArray<MenuItem>} [items]
 * @returns {MenuItem[]}
 */
export const cloneMenuItems = (items = DEFAULT_ITEMS) => items.map((item) => ({ ...item }));
