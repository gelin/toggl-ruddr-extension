/**
 * Content script for Ruddr integration
 */
import TogglButton from './TogglButton.svelte';
// import ReportPanel from './ReportPanel.svelte';
import {togglFetchReport, togglSaveProjectMapping, type TogglReportItem} from '../lib/toggl';
import {mount} from "svelte";

// Global state
let togglLastProjectIdClicked: string | null = null;
let togglLastReportDate: string = '_';
const togglClickedReportItems: Set<string> = new Set();

export function togglInit(): void {
    const observer = new MutationObserver(mutations => {
        togglAddButton();
    });
    observer.observe(document.body, { childList: true });
    // TODO: Is it possible to observe not the entire body?
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
            panelVisible: false
        }
    });
}

/**
 * Handle Toggl button click
 */
async function onTogglButtonClick(): Promise<void> {
    if (document.getElementById('toggl_report')) {
        togglRemoveReportPanel();
    } else {
        const date = togglGetReportDate();
        togglLastReportDate = date;
        console.log(`Fetching Toggl report for date: ${date}`);

        try {
            const report = await togglFetchReport(date);
            console.log('Got report', report);
            togglShowReportPanel(report);
        } catch (err) {
            console.warn(err);
        }
    }
}

/**
 * Get the date from the form
 */
function togglGetReportDate(): string {
    const form = togglfindForm();
    const dateInput = form?.querySelector('input[name="date"]');
    // @ts-ignore - moment is loaded globally
    return moment(dateInput?.value, 'DD/MM/YYYY').format('YYYY-MM-DD');
}

/**
 * Find the form element
 */
function togglfindForm(): HTMLFormElement | null {
    const dialogDiv = document.querySelector('body > div:last-of-type');
    if (!dialogDiv) {
        return null;
    }
    return dialogDiv.querySelector('form');
}

/**
 * Show the report panel
 */
function togglShowReportPanel(report: TogglReportItem[]): void {
    togglLastProjectIdClicked = null;

    // Don't add if already exists
    if (document.getElementById('toggl_report')) {
        return;
    }

    const button = document.getElementById('toggl_button');
    if (!button) {
        return;
    }

    // Create a container for the report panel
    const panelContainer = document.createElement('div');
    button.insertAdjacentElement('afterend', panelContainer);

    // // Create and mount the report panel component
    // reportComponent = new ReportPanel({
    //     target: panelContainer,
    //     props: {
    //         report,
    //         date: togglLastReportDate,
    //         clickedItems: togglClickedReportItems
    //     }
    // });
    //
    // // Add event listeners
    // reportComponent.$on('itemClick', (event) => {
    //     togglFillFormFromReport(event.detail.item);
    // });
    //
    // reportComponent.$on('close', togglRemoveReportPanel);

    // Add global click listener to close panel when clicking outside
    document.addEventListener('click', togglOnDocumentClick);
}

/**
 * Handle document click to close the report panel
 */
function togglOnDocumentClick(event: MouseEvent): void {
    const panel = document.getElementById('toggl_report');
    if (panel && !panel.contains(event.target as Node) && event.target !== document.getElementById('toggl_button')) {
        togglRemoveReportPanel();
    }
}

/**
 * Remove the report panel
 */
function togglRemoveReportPanel(): void {
    document.removeEventListener('click', togglOnDocumentClick);

    const panel = document.getElementById('toggl_report');
    if (panel) {
        // if (reportComponent) {
        //     reportComponent.$destroy();
        //     reportComponent = null;
        // }
        panel.remove();
    }
}

/**
 * Fill the form with data from a report item
 */
function togglFillFormFromReport(item: TogglReportItem): void {
    togglLastProjectIdClicked = item?.project?.id || null;
    const itemId = `${togglLastReportDate}_${item?.project?.id}`;
    togglClickedReportItems.add(itemId);

    const form = togglfindForm();

    // Set duration
    const duration = form?.querySelector('input[name="minutes"]');
    if (duration) {
        // @ts-ignore - moment is loaded globally
        const formattedDuration = togglFormatDuration(moment.duration(item.seconds, 'seconds'));
        togglSetInputValue(duration as HTMLInputElement, formattedDuration);
    }

    // Set description
    const description = form?.querySelector('textarea[name="notes"]');
    if (description) {
        (description as HTMLTextAreaElement).style.height = `${(description as HTMLTextAreaElement).scrollHeight}px`;
        togglSetInputValue(description as HTMLTextAreaElement, item.description);
    }

    // Save project mapping
    if (togglLastProjectIdClicked) {
        const mapping = togglGetCustomerProjectActivity();
        togglSaveProjectMapping(togglLastProjectIdClicked, mapping);
    }

    togglRemoveReportPanel();
}

/**
 * Format duration in hours:minutes format
 */
function togglFormatDuration(duration: any): string {
    return `${duration.hours()}:${String(duration.minutes()).padStart(2, '0')}`;
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
