import { DEFAULT_ITEMS, cloneMenuItems } from '../utils/menuUtils.js';

/** Provides a list of menu items (mock). */
export class MenuCatalog {
  /**
   * @param {{sourceItems?: {id:string,title:string,description:string}[]}} [params]
   */
  constructor({ sourceItems } = {}) {
    const base = Array.isArray(sourceItems) ? sourceItems : DEFAULT_ITEMS;
    // Ensure translate item exists
    const hasTranslate = base.some((i) => i.id === 'translate');
    this.sourceItems = hasTranslate
      ? base
      : [
          ...base,
          {
            id: 'translate',
            title: 'Translate Page',
            description: 'Translate this page into another language.',
          },
        ];
  }

  /** @returns {{id:string,title:string,description:string}[]} */
  loadItems() {
    return cloneMenuItems(this.sourceItems);
  }
}
