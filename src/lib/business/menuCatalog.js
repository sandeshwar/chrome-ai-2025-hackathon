import { DEFAULT_ITEMS, cloneMenuItems } from '../utils/menuUtils.js';

/** Provides a list of menu items (mock). */
export class MenuCatalog {
  /**
   * @param {{sourceItems?: {id:string,title:string,description:string}[]}} [params]
   */
  constructor({ sourceItems } = {}) {
    this.sourceItems = Array.isArray(sourceItems) ? sourceItems : DEFAULT_ITEMS;
  }

  /** @returns {{id:string,title:string,description:string}[]} */
  loadItems() {
    return cloneMenuItems(this.sourceItems);
  }
}
