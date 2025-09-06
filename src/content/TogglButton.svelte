<script lang="ts">
    import ReportPanel from "./ReportPanel.svelte";
    import {togglFetchReport, type TogglReportItem} from "../lib/toggl";

    type TogglButtonProps = {
        getDate: () => string;
        onItemClick: (item: TogglReportItem) => void;
    }

    let {getDate, onItemClick}: TogglButtonProps = $props();
    let date = $state('_');
    let panelVisible = $state(false);
    let report = $state<TogglReportItem[]>([]);
    // local cache of reports, valid while the button is visible
    const reportCache = new Map<string, TogglReportItem[]>();

    async function onClick() {
        if (panelVisible) {
            panelVisible = false;
        } else {
            date = getDate();
            if (reportCache.has(date)) {
                report = reportCache.get(date)!;
                panelVisible = true;
            } else {
                console.log(`Fetching Toggl report for date: ${date}`);
                try {
                    report = await togglFetchReport(date);
                    reportCache.set(date, report);
                    console.log('Got report', report);
                    panelVisible = true;
                } catch (err) {
                    console.warn(err);
                }
            }
        }
    }

    function onItemClickInt(item: TogglReportItem) {
        panelVisible = false;
        onItemClick(item);
    }

    // Handle document click to close the report panel
    function onDocumentClick(event: MouseEvent): void {
        const panel = document.getElementById('toggl_report');
        if (panel && !panel.contains(event.target as Node) && event.target !== document.getElementById('toggl_button')) {
            panelVisible = false;
        }
    }
    document.addEventListener('click', onDocumentClick);
</script>

<button id="toggl_button" onclick={onClick}>Toggl</button>
{#if panelVisible}
    <ReportPanel
            date={date}
            report={report}
            onItemClick={onItemClickInt}
    />
{/if}

<style>
    button {
        display: block;
        margin-top: 1.5rem;
        cursor: pointer;
    }
</style>
