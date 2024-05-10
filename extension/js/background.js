import { togglFetchReportImpl } from "/js/toggl.js";

'/js/toggl.js';

chrome.runtime.onMessage.addListener((message, sender, senderResponse) => {
    if (message.method === 'togglFetchReport') {
        return togglFetchReportImpl(message.date);
    }
    return true;
});
