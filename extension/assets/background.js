import { f as togglFetchReportImpl } from "./toggl.js";
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.method === "togglFetchReport") {
    togglFetchReportImpl(message.date).then((report) => {
      sendResponse({
        success: true,
        report
      });
    }).catch((err) => {
      console.warn("BACKGROUND", err);
      sendResponse({
        success: false,
        error: err
      });
    });
  }
  return true;
});
//# sourceMappingURL=background.js.map
