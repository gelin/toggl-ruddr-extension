let togglFetchReport;

(async () => {
    const togglModule = await import(chrome.runtime.getURL('js/toggl.js'));
    togglFetchReport = togglModule.togglFetchReport;
})();


const modal = document.getElementById('remote_form_modal');
const observer = new MutationObserver(mutations => {
    togglAddButton();
});
observer.observe(modal, { childList: true, subtree: true });

function togglAddButton() {
    if (document.getElementById('toggl_button')) {
        return;
    }

    const form = document.querySelector("form[name='timesheet_edit_form']");
    if (!form) {
        return;
    }

    const header = form.querySelector('.modal-header');
    if (!header) {
        return;
    }

    const togglButton = document.createElement('h5');
    togglButton.id = 'toggl_button';
    togglButton.className = 'modal-title btn';
    togglButton.addEventListener('click', onTogglButtonClick);
    togglButton.innerText = 'Toggl ▶';
    header.appendChild(togglButton);
}

function onTogglButtonClick() {
    // TODO
    togglFetchReport(togglGetReportDate())
        .then(report => {
            console.log('KIMAI', report);
            togglUpdateReport(report);
        });
}

function togglGetReportDate() {
    const dateInput = document.getElementById('timesheet_edit_form_begin_date');
    return moment(dateInput.value, dateInput.dataset.format).format('YYYY-MM-DD');
}

function togglUpdateReport(report) {
    togglAddReportPanel();
    const panel = document.getElementById('toggl_report');
    if (!panel) {
        return;
    }

    panel.innerText = "test\ntest\ntest";
}

function togglAddReportPanel() {
    if (document.getElementById('toggl_report')) {
        return;
    }

    const form = document.querySelector("form[name='timesheet_edit_form']");
    if (!form) {
        return;
    }

    const header = form.querySelector('.modal-header');
    if (!header) {
        return;
    }

    const existBody = form.querySelector('.modal-body');
    if (!existBody) {
        return;
    }
    existBody.className = '';
    existBody.style['flex-grow'] = '4';

    const newBody = document.createElement('div');
    newBody.className = 'modal-body';
    newBody.style['display'] = 'flex';
    newBody.style['gap'] = '24px';

    const panel = document.createElement('div');
    panel.id = 'toggl_report';
    existBody.style['flex-grow'] = '1';
    existBody.style['flex-basis'] = '20%';

    newBody.appendChild(existBody);
    newBody.appendChild(panel);

    header.after(newBody);
}
