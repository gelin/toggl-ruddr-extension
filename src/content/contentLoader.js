// a workaround to load module from content script
(async () => {
    await import(chrome.runtime.getURL('assets/content.js'));
})();
