let togglFetchReport;
let togglSaveProjectMapping;

(async () => {
    const togglModule = await import(chrome.runtime.getURL('js/toggl.js'));
    togglFetchReport = togglModule.togglFetchReport;
    togglSaveProjectMapping = togglModule.togglSaveProjectMapping;
})();

let togglLastProjectIdClicked;

const observer = new MutationObserver(mutations => {
    togglAddButton();
});
observer.observe(document.body, { childList: true });
// TODO: Is it possible to observe not the entire body?

function togglAddButton() {
    if (document.getElementById('toggl_button')) {
        return;
    }

    const dialogDiv = document.querySelector('body > div:last-of-type');
    if (!dialogDiv) {
        return;
    }

    const header = dialogDiv.querySelector('header h5');
    if (!header) {
        return;
    }
    if (header.innerText !== 'New Entry') {
        return; // not the New Entry dialogue
    }

    const form = dialogDiv.querySelector('form');
    if (!form) {
        return;
    }
    const entryDetailsHeader = form.querySelector('div:nth-child(2) > div > div');
    if (!entryDetailsHeader) {
        return;
    }

    const togglButton = document.createElement('button');
    togglButton.id = 'toggl_button';
    togglButton.innerText = 'Toggl';
    togglButton.style.display = 'block';
    togglButton.style.marginTop = '1.5rem';
    togglButton.style.cursor = 'pointer';
    togglButton.className = 'inqByU';       // grey button, can be changed in next Ruddr builds
    togglButton.addEventListener('click', onTogglButtonClick);

    const buttonP = document.createElement('p');
    entryDetailsHeader.appendChild(buttonP);
    buttonP.appendChild(togglButton);

    // const existDialog = document.querySelector('.modal-dialog');
    // if (existDialog) {
    //     existDialog.style['max-width'] = '720px';
    // }
    //
    // const saveButton = document.getElementById('form_modal_save');
    // if (saveButton) {
    //     saveButton.addEventListener('click', onTogglSaveButtonClick);
    // }
}

function onTogglButtonClick() {
    const date = togglGetReportDate();
    console.log(`Fetching Toggl report for date: ${date}`);
    togglFetchReport(date)
        .then(report => {
            console.log('Got report', report);
            togglUpdateReport(report);
        })
        .catch(err => console.warn(err));
}

function onTogglSaveButtonClick() {
    if (togglLastProjectIdClicked) {
        const mapping = togglGetCustomerProjectActivity();
        togglSaveProjectMapping(togglLastProjectIdClicked, mapping);
    }
}

function toggleFindForm() {
    const dialogDiv = document.querySelector('body > div:last-of-type');
    if (!dialogDiv) {
        return null;
    }
    return dialogDiv.querySelector('form');
}

function togglGetReportDate() {
    const form = toggleFindForm();
    const dateInput = form?.querySelector('input[name="date"]');
    return moment(dateInput?.value, 'DD/MM/YYYY').format('YYYY-MM-DD');
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
    togglLastProjectIdClicked = item?.project?.id;

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
    let promise;
    if (customerId) {
        promise = togglClickSelect('timesheet_edit_form_customer', customerId);
    }
    const projectId = item?.mapping?.project;
    if (projectId) {
        promise = promise?.then(() =>
            togglClickSelect('timesheet_edit_form_project', projectId)
        );
    }
    const activityId = item?.mapping?.activity;
    if (activityId) {
        promise = promise?.then(() =>
            togglClickSelect('timesheet_edit_form_activity', activityId)
        );
    }
    promise?.catch(err => console.warn(err));
}

function togglAddReportPanel() {
    togglLastProjectIdClicked = null;

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
    const customer = togglReadSelect('timesheet_edit_form_customer');
    const project = togglReadSelect('timesheet_edit_form_project');
    const activity = togglReadSelect('timesheet_edit_form_activity');
    return {
        customer: customer?.id,
        project: project?.id,
        activity: activity?.id
    };
}

function togglReadSelect(selectId) {
    const select = document.getElementById(selectId);
    if (!select) {
        return {};
    }
    return {
        id: select.value,
    }
}

function togglClickSelect(selectId, optionId) {
    const select = document.getElementById(selectId);
    if (!select) {
        return Promise.reject(new Error(`#${selectId} not found`));
    }
    const formSelectDiv = select.nextElementSibling;
    if (!formSelectDiv) {
        return Promise.reject(new Error(`#${selectId} next sibling not found`));
    }
    const controlDiv = formSelectDiv.querySelector('.ts-control');
    if (!controlDiv) {
        return Promise.reject(new Error(`#${selectId} .ts-control not found`));
    }

    // TODO: pre-load select options some way
    return new Promise((resolve, reject) => {
        const optionDiv = formSelectDiv.querySelector(`[data-value='${optionId}']`);
        if (optionDiv) {
            optionDiv.click();     // click on option
            resolve();
        } else {
            controlDiv.click();     // click on control to load and expand the list of options
            const observer = new MutationObserver(mutations => {
                observer.disconnect();
                const optionDiv = formSelectDiv.querySelector(`[data-value='${optionId}']`);
                if (optionDiv) {
                    optionDiv.click();      // click on option
                    // controlDiv.click();     // click on control to close the selection
                    resolve();
                } else {
                    reject(new Error(`[data-value='${optionId}'] not found`));
                }
            });
            // wait for options to be loaded
            observer.observe(formSelectDiv, { childList: true, subtree: true });
        }
    });
}
