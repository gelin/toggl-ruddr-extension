<script lang="ts">
    import ReportPanel from "./ReportPanel.svelte";
    import {togglFetchReport, type TogglReportItem} from "../lib/toggl";

    let {getDate} = $props();
    let date = $state('_');
    let panelVisible = $state(false);
    let report = $state<TogglReportItem[]>([]);

    async function onClick() {
        if (panelVisible) {
            panelVisible = false;
        } else {
            date = getDate();
            console.log(`Fetching Toggl report for date: ${date}`);
            try {
                report = await togglFetchReport(date);
                console.log('Got report', report);
                panelVisible = true;
            } catch (err) {
                console.warn(err);
            }
        }
    }

    /**
     * Handle document click to close the report panel
     */
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
    />
{/if}

<style>
    button {
        display: block;
        margin-top: 1.5rem;
        cursor: pointer;
    }
</style>
