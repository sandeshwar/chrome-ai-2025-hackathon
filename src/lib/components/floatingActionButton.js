import { createFabButtonElement } from '../utils/componentUtils.js';

/** Floating action button wrapper. */
export class FloatingActionButton {
  /**
   * @param {{domFactory:any,stateCoordinator:any,config?:{label?:string,ariaLabel?:string}}} params
   */
  constructor({ domFactory, stateCoordinator, config = {} }) {
    if (!domFactory) throw new Error('FloatingActionButton requires a DOM factory.');
    if (!stateCoordinator) throw new Error('FloatingActionButton requires a state coordinator.');

    this.domFactory = domFactory;
    this.stateCoordinator = stateCoordinator;
    this.label = config.label ?? '<i class="fas fa-robot"></i>';
    this.ariaLabel = config.ariaLabel ?? 'Toggle AI assistant';
    this.button = this.#buildButton();
  }

  /** @returns {HTMLButtonElement} */
  get element() {
    return this.button;
  }

  /**
   * Reflect active state in DOM.
   * @param {boolean} isActive
   */
  setActive(isActive) {
    this.stateCoordinator.applyPressedState(this.button, {
      activeClass: 'chrome-ai-fab-button--active',
      isActive,
    });
  }

  /**
   * Register a click handler.
   * @param {(e:MouseEvent)=>void} handler
   */
  onClick(handler) {
    if (typeof handler === 'function') this.button.addEventListener('click', handler);
  }

  #buildButton() {
    const createButton = this.domFactory.createButton.bind(this.domFactory);
    return createFabButtonElement(createButton, { label: this.label, ariaLabel: this.ariaLabel });
  }
}
