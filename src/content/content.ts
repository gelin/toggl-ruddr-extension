/**
 * Content script for Ruddr integration
 */
import TogglButton from './TogglButton.svelte';
import ReportPanel from './ReportPanel.svelte';
import {fetchReport, saveProjectMapping, type ReportItem} from '../lib/toggl';
import {mount} from "svelte";

// Global state
let togglLastProjectIdClicked: string | null = null;
let togglLastReportDate: string = '_';
const togglClickedReportItems: Set<string> = new Set();

// Components
let buttonComponent: TogglButton | null = null;
let reportComponent: ReportPanel | null = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Observe DOM changes to detect when the form is loaded
    const observer = new MutationObserver(() => {
        addTogglButton();
    });
    observer.observe(document.body, {childList: true});
});

/**
 * Find an element with specific text content
 */
function findElementWithText(startElement: Element, selector: string, text: string): Element | null {
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
function addTogglButton(): void {
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
    const header = findElementWithText(dialogDiv as Element, 'header h5', 'New Entry');
    if (!header) {
        return; // not the New Entry dialogue
    }

    // Find the form
    const form = dialogDiv.querySelector('form');
    if (!form) {
        // Wait for the form to be loaded
        const dialogObserver = new MutationObserver(() => {
            dialogObserver.disconnect();
            addTogglButton();
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
    buttonComponent = mount(TogglButton, {
        target: buttonContainer,
        props: {
            isReportVisible: false
        }
    });
}

/**
 * Handle Toggl button click
 */
async function onTogglButtonClick(): Promise<void> {
    if (document.getElementById('toggl_report')) {
        removeReportPanel();
    } else {
        const date = getReportDate();
        togglLastReportDate = date;
        console.log(`Fetching Toggl report for date: ${date}`);

        try {
            const report = await fetchReport(date);
            console.log('Got report', report);
            showReportPanel(report);
        } catch (err) {
            console.warn(err);
        }
    }
}

/**
 * Get the date from the form
 */
function getReportDate(): string {
    const form = findForm();
    const dateInput = form?.querySelector('input[name="date"]');
    // @ts-ignore - moment is loaded globally
    return moment(dateInput?.value, 'DD/MM/YYYY').format('YYYY-MM-DD');
}

/**
 * Find the form element
 */
function findForm(): HTMLFormElement | null {
    const dialogDiv = document.querySelector('body > div:last-of-type');
    if (!dialogDiv) {
        return null;
    }
    return dialogDiv.querySelector('form');
}

/**
 * Show the report panel
 */
function showReportPanel(report: ReportItem[]): void {
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

    // Create and mount the report panel component
    reportComponent = new ReportPanel({
        target: panelContainer,
        props: {
            report,
            date: togglLastReportDate,
            clickedItems: togglClickedReportItems
        }
    });

    // Add event listeners
    reportComponent.$on('itemClick', (event) => {
        fillFormFromReport(event.detail.item);
    });

    reportComponent.$on('close', removeReportPanel);

    // Add global click listener to close panel when clicking outside
    document.addEventListener('click', onDocumentClick);
}

/**
 * Handle document click to close the report panel
 */
function onDocumentClick(event: MouseEvent): void {
    const panel = document.getElementById('toggl_report');
    if (panel && !panel.contains(event.target as Node) && event.target !== document.getElementById('toggl_button')) {
        removeReportPanel();
    }
}

/**
 * Remove the report panel
 */
function removeReportPanel(): void {
    document.removeEventListener('click', onDocumentClick);

    const panel = document.getElementById('toggl_report');
    if (panel) {
        if (reportComponent) {
            reportComponent.$destroy();
            reportComponent = null;
        }
        panel.remove();
    }
}

/**
 * Fill the form with data from a report item
 */
function fillFormFromReport(item: ReportItem): void {
    togglLastProjectIdClicked = item?.project?.id || null;
    const itemId = `${togglLastReportDate}_${item?.project?.id}`;
    togglClickedReportItems.add(itemId);

    const form = findForm();

    // Set duration
    const duration = form?.querySelector('input[name="minutes"]');
    if (duration) {
        // @ts-ignore - moment is loaded globally
        const formattedDuration = formatDuration(moment.duration(item.seconds, 'seconds'));
        setInputValue(duration as HTMLInputElement, formattedDuration);
    }

    // Set description
    const description = form?.querySelector('textarea[name="notes"]');
    if (description) {
        (description as HTMLTextAreaElement).style.height = `${(description as HTMLTextAreaElement).scrollHeight}px`;
        setInputValue(description as HTMLTextAreaElement, item.description);
    }

    // Save project mapping
    if (togglLastProjectIdClicked) {
        const mapping = getCustomerProjectActivity();
        saveProjectMapping(togglLastProjectIdClicked, mapping);
    }

    removeReportPanel();
}

/**
 * Format duration in hours:minutes format
 */
function formatDuration(duration: any): string {
    return `${duration.hours()}:${String(duration.minutes()).padStart(2, '0')}`;
}

/**
 * Set value of an input element and dispatch input event
 */
function setInputValue(target: HTMLInputElement | HTMLTextAreaElement, value: string): void {
    target.value = value;
    // Dispatch input event to trigger React state updates
    const event = new Event('input', {bubbles: true});
    Object.defineProperty(event, 'target', {writable: false, value: target});
    target.dispatchEvent(event);
}

/**
 * Get customer, project, and activity from the form
 */
function getCustomerProjectActivity(): { customer?: string, project?: string, activity?: string } {
    const customer = readSelect('timesheet_edit_form_customer');
    const project = readSelect('timesheet_edit_form_project');
    const activity = readSelect('timesheet_edit_form_activity');
    return {
        customer: customer?.id,
        project: project?.id,
        activity: activity?.id
    };
}

/**
 * Read value from a select element
 */
function readSelect(selectId: string): { id?: string } {
    const select = document.getElementById(selectId) as HTMLSelectElement;
    if (!select) {
        return {};
    }
    return {
        id: select.value
    };
}
