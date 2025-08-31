/**
 * Background service worker for the extension
 */
import {togglFetchReportImpl} from "../lib/toggl";

// Listen for messages from content scripts
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
    return true; // Keep the message channel open for async response
});
