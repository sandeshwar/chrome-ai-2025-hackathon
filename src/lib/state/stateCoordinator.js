import { applyPressedState, applyVisibilityState } from '../utils/stateUtils.js';

/** Coordinates view state (pressed/visible) across components. */
export class StateCoordinator {
  /**
   * @param {HTMLElement} element
   * @param {{activeClass?: string, isActive: boolean}} options
   */
  applyPressedState(element, options) {
    return applyPressedState(element, options);
  }

  /**
   * @param {HTMLElement} element
   * @param {{visibleClass?: string, isVisible: boolean}} options
   */
  applyVisibilityState(element, options) {
    return applyVisibilityState(element, options);
  }
}
