if (!document.querySelector('link[href="asserts/content.css"]')) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "asserts/content.css";
  document.head.appendChild(link);
}
(async () => {
  const contentModule = await import(chrome.runtime.getURL("assets/content.js"));
  contentModule.togglInit();
})();
//# sourceMappingURL=contentLoader.js.map
