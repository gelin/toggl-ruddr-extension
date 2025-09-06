/**
 * Content script for Ruddr integration
 */
import TogglButton from './TogglButton.svelte';
import {togglSaveProjectMapping, type TogglReportItem} from '../lib/toggl';
import {mount} from 'svelte';
import {DateTime, Duration} from 'luxon';

/**
 * Initialise the content script
 */
export function togglInit(): void {
    const observer = new MutationObserver(mutations => {
        togglAddButton();
    });
    observer.observe(document.body, { childList: true });
    // TODO: Is it possible to observe not the entire body?
}

/**
 * Add the Toggl button to the Ruddr form
 */
function togglAddButton(): void {
    // Don't add if already exists
    if (document.getElementById('toggl_button')) {
        return;
    }

    // Find the dialog
    const dialogDiv = document.querySelector('body > div:last-of-type');
    if (!dialogDiv) {
        return;
    }

    // Check if it's the New Entry dialog
    const header = togglFindElementWithText(dialogDiv as Element, 'header h5', 'New Entry');
    if (!header) {
        return; // not the New Entry dialogue
    }

    // Find the form
    const form = dialogDiv.querySelector('form');
    if (!form) {
        // Wait for the form to be loaded
        const dialogObserver = new MutationObserver(() => {
            dialogObserver.disconnect();
            togglAddButton();
        });
        dialogObserver.observe(dialogDiv, {childList: true, subtree: true});
        return;
    }

    // Find the entry details header
    const entryDetailsHeader = form.querySelector('div:nth-child(2) > div > div');
    if (!entryDetailsHeader) {
        return;
    }

    // Create a container for the button
    const buttonContainer = document.createElement('p');
    entryDetailsHeader.appendChild(buttonContainer);

    // Create and mount the Toggl button component
    mount(TogglButton, {
        target: buttonContainer,
        props: {
            getDate: togglGetReportDate,
            onItemClick: togglFillFormFromReport
        }
    });
}

/**
 * Find an element with specific text content
 */
function togglFindElementWithText(startElement: Element, selector: string, text: string): Element | null {
    const elements = startElement.querySelectorAll(selector);
    for (const element of elements) {
        if (element.textContent === text) {
            return element;
        }
    }
    return null;
}

/**
 * Get the date from the form
 */
function togglGetReportDate(): string {
    const form = togglFindForm();
    const dateInput: HTMLInputElement = form?.querySelector('input[name="date"]') as HTMLInputElement;
    return DateTime.fromFormat(dateInput?.value, 'd/M/yyyy').toFormat('yyyy-MM-dd');
}

/**
 * Find the form element
 */
function togglFindForm(): HTMLFormElement | null {
    const dialogDiv = document.querySelector('body > div:last-of-type');
    if (!dialogDiv) {
        return null;
    }
    return dialogDiv.querySelector('form');
}

/**
 * Fill the form with data from a report item
 */
function togglFillFormFromReport(item: TogglReportItem): void {
    // togglLastProjectIdClicked = item?.project?.id || null;
    // const itemId = `${togglLastReportDate}_${item?.project?.id}`;
    // togglClickedReportItems.add(itemId);

    const form = togglFindForm();

    // Set duration
    const duration = form?.querySelector('input[name="minutes"]');
    if (duration) {
        const formattedDuration = Duration.fromMillis(item.seconds * 1000).toFormat('h:mm');
        togglSetInputValue(duration as HTMLInputElement, formattedDuration);
    }

    // Set description
    const description = form?.querySelector('textarea[name="notes"]');
    if (description) {
        (description as HTMLTextAreaElement).style.height = `${(description as HTMLTextAreaElement).scrollHeight}px`;
        togglSetInputValue(description as HTMLTextAreaElement, item.description);
    }

    // Save project mapping
    // if (togglLastProjectIdClicked) {
    //     const mapping = togglGetCustomerProjectActivity();
    //     togglSaveProjectMapping(togglLastProjectIdClicked, mapping);
    // }
}

/**
 * Set value of an input element and dispatch input event
 */
function togglSetInputValue(target: HTMLInputElement | HTMLTextAreaElement, value: string): void {
    target.value = value;
    // Dispatch input event to trigger React state updates
    const event = new Event('input', {bubbles: true});
    Object.defineProperty(event, 'target', {writable: false, value: target});
    target.dispatchEvent(event);
}

/**
 * Get customer, project, and activity from the form
 */
function togglGetCustomerProjectActivity(): { customer?: string, project?: string, activity?: string } {
    const customer = togglReadSelect('timesheet_edit_form_customer');
    const project = togglReadSelect('timesheet_edit_form_project');
    const activity = togglReadSelect('timesheet_edit_form_activity');
    return {
        customer: customer?.id,
        project: project?.id,
        activity: activity?.id
    };
}

/**
 * Read value from a select element
 */
function togglReadSelect(selectId: string): { id?: string } {
    const select = document.getElementById(selectId) as HTMLSelectElement;
    if (!select) {
        return {};
    }
    return {
        id: select.value
    };
}
