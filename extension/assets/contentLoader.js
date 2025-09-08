(async () => {
  const contentModule = await import(chrome.runtime.getURL("assets/content.js"));
  contentModule.togglInit();
})();
//# sourceMappingURL=contentLoader.js.map
