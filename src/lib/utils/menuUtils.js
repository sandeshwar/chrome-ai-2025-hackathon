/** @typedef {{id:string,title:string,description:string}} MenuItem */

/** @type {ReadonlyArray<MenuItem>} */
export const DEFAULT_ITEMS = Object.freeze([
  { id: 'summary', title: 'Summarize Page', description: 'Get a concise overview of what you are reading.' },
  { id: 'chat', title: 'Open Chat', description: 'Start a conversation with the assistant.' },
  { id: 'rewrite', title: 'Improve Writing', description: 'Refine tone or length of selected text.' },
  { id: 'prompt', title: 'Prompt Quick Actions', description: 'Fire off templated AI prompts for common tasks.' },
  { id: 'image', title: 'Analyze Image', description: 'Upload an image for AI analysis and description.' },
]);

/**
 * @param {ReadonlyArray<MenuItem>} [items]
 * @returns {MenuItem[]}
 */
export const cloneMenuItems = (items = DEFAULT_ITEMS) => items.map((item) => ({ ...item }));
