let togglFetchReport;
let togglSaveProjectMapping;

(async () => {
    const togglModule = await import(chrome.runtime.getURL('js/toggl.js'));
    togglFetchReport = togglModule.togglFetchReport;
    togglSaveProjectMapping = togglModule.togglSaveProjectMapping;
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

    const existDialog = document.querySelector('.modal-dialog');
    if (existDialog) {
        existDialog.style['max-width'] = '720px';
    }
}

function onTogglButtonClick() {
    togglFetchReport(togglGetReportDate())
        .then(report => {
            console.log('KIMAI', report);
            togglUpdateReport(report);
            // TODO
            const mapping = togglGetCustomerProjectActivity();
            console.log('KIMAI', mapping);
            togglSaveProjectMapping(190909623, mapping);
        })
        .catch(err => console.warn(err));
}

function togglGetReportDate() {
    const dateInput = document.getElementById('timesheet_edit_form_begin_date');
    return moment(dateInput.value, dateInput.dataset.format).format('YYYY-MM-DD');
}

function togglFormatDuration(duration) {
    return duration.hours() + ':' + String(duration.minutes()).padStart(2, '0');
}

function togglUpdateReport(report) {
    togglAddReportPanel();
    const panel = document.getElementById('toggl_report');
    if (!panel) {
        return;
    }

    const items = report.map(item => {
        const time = moment.duration(item.seconds, 'seconds');

        const paragraph = document.createElement('article');
        paragraph.style['cursor'] = 'pointer';
        paragraph.addEventListener('click', ev => togglFillFormFromReport(item));

        const header = document.createElement('h4');
        header.innerText = togglFormatDuration(time) +
            ' • ' + (item.project?.name || 'Unknown Project') +
            ' • ' + (item.project?.client?.name || '');
        header.style['color'] = item.color;
        header.style['margin-bottom'] = '0';

        const body = document.createElement('p');
        body.innerText = item.description;
        paragraph.replaceChildren(header, body);

        return paragraph;
    });

    panel.replaceChildren(...items);

    if (report.length === 0) {
        panel.innerText = '[No time tracked in Toggl]';
        return;
    }

    const footer = document.createElement('h3');
    const totalSeconds = report.reduce((a, i) => a + i.seconds, 0);
    const totalTime = moment.duration(totalSeconds, 'seconds');
    footer.innerText = togglFormatDuration(totalTime);
    panel.appendChild(footer);
}

function togglFillFormFromReport(item) {
    const duration = document.getElementById('timesheet_edit_form_duration');
    if (duration) {
        duration.value = togglFormatDuration(moment.duration(item.seconds, 'seconds'));
        duration.dispatchEvent(new Event('change'));
    }

    const description = document.getElementById('timesheet_edit_form_description');
    if (description) {
        description.value = item.description;
        description.style['height'] = description.scrollHeight + 'px';
    }

    const customerId = item?.mapping?.customer;
    if (customerId) {
        togglClickSelect('timesheet_edit_form_customer-ts-dropdown', customerId);
    }
    const projectId = item?.mapping?.project;
    if (projectId) {
        togglClickSelect('timesheet_edit_form_customer-ts-dropdown', projectId);
    }
    const activityId = item?.mapping?.activity;
    if (activityId) {
        togglClickSelect('timesheet_edit_form_activity-ts-dropdown', activityId);
    }
}

function togglAddReportPanel() {
    if (document.getElementById('toggl_report')) {
        return;
    }

    const existDialog = document.querySelector('.modal-dialog');
    if (existDialog) {
        existDialog.style['max-width'] = '1200px';
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
    existBody.style['flex-basis'] = '80%';

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

function togglGetCustomerProjectActivity() {
    const customer = togglReadSelect('timesheet_edit_form_customer-ts-control');
    const project = togglReadSelect('timesheet_edit_form_project-ts-control');
    const activity = togglReadSelect('timesheet_edit_form_activity-ts-control');
    return {
        customer: customer?.id,
        project: project?.id,
        activity: activity?.id
    };
}

function togglReadSelect(inputId) {
    const input = document.getElementById(inputId);
    if (!input) {
        return {};
    }
    const dataDiv = input.previousElementSibling;
    if (!dataDiv) {
        return {};
    }
    return {
        id: dataDiv.dataset.value,
        name: dataDiv.innerText
    }
}

function togglClickSelect(dropDownId, optionId) {
    const listboxDiv = document.getElementById(dropDownId);
    if (!listboxDiv) {
        return;
    }
    const optionDiv = listboxDiv.querySelector(`[data-value='${optionId}']`);
    if (!optionDiv) {
        return;
    }
    optionDiv.click();
}
