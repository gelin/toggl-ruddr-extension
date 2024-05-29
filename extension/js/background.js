import { togglFetchReportImpl } from "/js/toggl.js";

'/js/toggl.js';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.method === 'togglFetchReport') {
        togglFetchReportImpl(message.date)
            .then(report => {
                sendResponse({
                    success: true,
                    report: report
                });
            })
            .catch(err => {
                console.warn('BACKGROUND', err);
                sendResponse({
                    success: false,
                    error: err
                });
            });
    }
    return true;
});
