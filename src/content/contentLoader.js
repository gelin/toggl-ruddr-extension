// a workaround to load module from content script
(async () => {
    const contentModule = await import(chrome.runtime.getURL('assets/content.js'));
    contentModule.togglInit();
})();
