/**
 * @param {Element} root
 * @param {string} flag
 */
export const markInitialisedFlag = (root, flag) => {
  if (!root) return;
  root.dataset[flag] = 'true';
};

/**
 * @param {Element} root
 * @param {string} flag
 */
export const isInitialisedFlag = (root, flag) => {
  if (!root) return false;
  return root.dataset[flag] === 'true';
};
