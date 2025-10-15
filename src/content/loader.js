(() => {
  const entryUrl = chrome.runtime.getURL('src/content/bootstrap.js');
  import(entryUrl)
    .then((mod) => {
      const start = mod?.default || mod?.bootstrap;
      if (typeof start === 'function') start();
    })
    .catch(() => {});
})();
