let togglFetchReport;

(async () => {
    const togglModule = await import(chrome.runtime.getURL('js/toggl.js'));
    togglFetchReport = togglModule.togglFetchReport;
})();

window.addEventListener('load', main);

function main() {
    // const button = document.querySelector("a[href='/en_NZ/timesheet/create']")
    // console.log('TOGGL', button);
    // if (button) {
    //     button.addEventListener('click', updateForm);
    // }
    // document.addEventListener('click', updateForm);
}

const modal = document.getElementById('remote_form_modal');
const observer = new MutationObserver(mutations => {
    // console.log('TOGGL', mutations);
    togglUpdateForm();
});
observer.observe(modal, { childList: true, subtree: true });

function togglUpdateForm() {
    if (document.getElementById('toggl_button')) {
        return;
    }
    const form = document.querySelector("form[name='timesheet_edit_form']");
    // console.log('TOGGL', form);

    if (form) {
        const header = form.querySelector('.modal-header');
        if (header) {
            const togglButton = document.createElement('h5');
            togglButton.id = 'toggl_button';
            togglButton.className = 'modal-title btn';
            togglButton.addEventListener('click', onTogglButtonClick);
            togglButton.innerText = 'Toggl ▶';
            header.appendChild(togglButton);
        }
    }
}

function onTogglButtonClick() {
    // TODO
    togglFetchReport(getReportDate())
        .then(report => console.log('KIMAI', report));
}

function getReportDate() {
    console.log(moment());
    const dateInput = document.getElementById('timesheet_edit_form_begin_date');
    return moment(dateInput.value, dateInput.dataset.format).format('YYYY-MM-DD');
}
