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

function togglFindElementWithText(startElement, selector, text) {
    const elements = startElement.querySelectorAll(selector);
    for (const element of elements) {
        if (element.innerText === text) {
            return element;
        }
    }
    return null;
}

function togglAddButton() {
    if (document.getElementById('toggl_button')) {
        return;
    }

    const dialogDiv = document.querySelector('body > div:last-of-type');
    if (!dialogDiv) {
        return;
    }

    const header = togglFindElementWithText(dialogDiv, 'header h5', 'New Entry');
    if (!header) {
        return;     // not the New Entry dialogue
    }

    const form = dialogDiv.querySelector('form');
    if (!form) {
        const dialogObserver = new MutationObserver(mutations => {
            dialogObserver.disconnect();
            togglAddButton();
        });
        // wait for the form to be loaded
        dialogObserver.observe(dialogDiv, { childList: true, subtree: true });
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

    // const saveButton = document.getElementById('form_modal_save');
    // if (saveButton) {
    //     saveButton.addEventListener('click', onTogglSaveButtonClick);
    // }
}

function onTogglButtonClick() {
    if (document.getElementById('toggl_report')) {
        toggleRemoveReportPanel();
    } else {
        const date = togglGetReportDate();
        console.log(`Fetching Toggl report for date: ${date}`);
        togglFetchReport(date)
            .then(report => {
                console.log('Got report', report);
                togglUpdateReport(report);
            })
            .catch(err => console.warn(err));
    }
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

function togglAddReportPanel() {
    togglLastProjectIdClicked = null;

    if (document.getElementById('toggl_report')) {
        return;
    }

    const button = document.getElementById('toggl_button');
    if (!button) {
        return;
    }

    const panel = document.createElement('div');
    panel.id = 'toggl_report';
    panel.style.position = 'relative';
    panel.style.top = '0';
    panel.style.left = '0';
    panel.style.width = '360px';
    panel.style.zIndex = '100';
    panel.style.padding = '1rem';
    panel.style.background = 'white';
    panel.style.border = '1px solid gray';
    panel.style.borderRadius = '3px';
    panel.style.textTransform = 'none';
    panel.style.fontFamily = 'Roboto, sans-serif';
    panel.style.fontSize = '0.875rem';
    panel.style.fontWeight = '400';

    button.insertAdjacentElement('afterend', panel);
}

function toggleRemoveReportPanel() {
    const panel = document.getElementById('toggl_report');
    if (panel) {
        panel.remove();
    }
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
        paragraph.style.cursor = 'pointer';
        paragraph.style.margin = '0.5rem';
        paragraph.addEventListener('click', ev => togglFillFormFromReport(item));

        const header = document.createElement('h4');
        header.innerText = togglFormatDuration(time) +
            ' • ' + (item.project?.name || 'Unknown Project') +
            ' • ' + (item.project?.client?.name || '');
        header.style.color = item.color;
        header.style.fontWeight = '900';
        header.style.marginBottom = '0';

        const body = document.createElement('p');
        body.innerText = item.description;
        body.style.color = 'black';
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
    footer.style.margin = '0.5rem';
    footer.style.fontWeight = '900';

    panel.appendChild(footer);
}

function togglFillFormFromReport(item) {
    togglLastProjectIdClicked = item?.project?.id;

    const form = toggleFindForm();
    const duration = form?.querySelector('input[name="minutes"]');
    if (duration) {
        duration.value = togglFormatDuration(moment.duration(item.seconds, 'seconds'));
        // some magic to successfully dispatch the event to React
        const event = new Event('input', { bubbles: true });
        Object.defineProperty(event, 'target', { writable: false, value: duration });
        duration.dispatchEvent(event);
    }

    const description = form?.querySelector('textarea[name="notes"]');
    if (description) {
        description.value = item.description;
        description.style['height'] = description.scrollHeight + 'px';
    }

    const projectId = item?.mapping?.project;
    let promise;
    if (projectId) {
        promise = togglChooseProject(projectId);
    }
    togglChooseProject(1);

    // const activityId = item?.mapping?.activity;
    // if (activityId) {
    //     promise = promise?.then(() =>
    //         togglClickSelect('timesheet_edit_form_activity', activityId)
    //     );
    // }
    // promise?.catch(err => console.warn(err));

    toggleRemoveReportPanel();
}

function togglChooseProject(projectId) {
    const form = toggleFindForm();
    if (!form) {
        return;
    }
    const projectButton = togglFindElementWithText(form, 'div[role="button"]', 'Project');
    if (projectButton) {
        togglSimulateClick(projectButton);
    }
    // TODO
    return Promise.resolve(true);
}

function togglSimulateClick(element) {
    const event = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
    });
    element.dispatchEvent(event);
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
