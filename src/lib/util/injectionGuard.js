import { markInitialisedFlag, isInitialisedFlag } from '../utils/guardUtils.js';

const DEFAULT_FLAG = 'chromeAiFabInjected';

/** Prevents duplicate overlay injection per document root. */
export class InjectionGuard {
  /** @param {string} [flag] */
  constructor(flag = DEFAULT_FLAG) {
    this.flag = flag;
  }

  /** @param {Element} root */
  markInitialised(root) {
    markInitialisedFlag(root, this.flag);
  }

  /** @param {Element} root */
  isInitialised(root) {
    return isInitialisedFlag(root, this.flag);
  }
}

export const injectionGuard = new InjectionGuard();
