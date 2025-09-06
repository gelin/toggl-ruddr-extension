<script lang="ts">

    import {type TogglReportItem} from "../lib/toggl";

    type ReportPanelProps = {
        report: TogglReportItem[];
        date: string;
    }

    let {report, date}: ReportPanelProps = $props();

    let clickedItems: Set<string> = new Set();

    let totalSeconds = report.reduce((acc, item) => acc + item.seconds, 0);

    function formatDuration(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}:${minutes.toString().padStart(2, '0')}`;
    }

    function onItemClick(item: TogglReportItem) {
        // dispatch('itemClick', {item});
    }

    // function onOutsideClick(event: MouseEvent) {
    //     if (event.target === event.currentTarget) {
    //         dispatch('close');
    //     }
    // }
</script>

<div id="toggl_report" class="report-panel">
    {#if report.length === 0}
        <p>[No time tracked in Toggl]</p>
    {:else}
        {#each report as item, index}
            {@const itemId = `${date}_${item.project?.id}`}
            {@const isClicked = clickedItems.has(itemId)}

            <div class="report-item" class:clicked={isClicked}
                 tabindex={index}
                 role="button"
                 onclick={() => onItemClick(item)}
                 onkeydown={(event) => {
                     if (event.key === 'Enter') {
                         onItemClick(item);
                     }
                 }}>
                <h4 style="color: {isClicked ? 'lightgray' : item.color}">
                    {formatDuration(item.seconds)} •
                    {item.project?.name || 'Unknown Project'} •
                    {item.project?.client?.name || ''}
                </h4>
                <p style="color: {isClicked ? 'lightgray' : 'black'}">
                    {item.description}
                </p>
            </div>
        {/each}

        <h3 class="total">
            {formatDuration(totalSeconds)}
        </h3>
    {/if}
</div>

<style>
    .report-panel {
        position: relative;
        top: 0;
        left: 0;
        width: 360px;
        z-index: 100;
        padding: 1rem;
        background: white;
        border: 1px solid gray;
        border-radius: 3px;
        text-transform: none;
        font-family: Roboto, sans-serif;
        font-size: 0.875rem;
        font-weight: 400;
    }

    .report-item {
        cursor: pointer;
        margin: 0.5rem;
    }

    h4 {
        font-weight: 900;
        margin-bottom: 0;
    }

    .total {
        margin: 0.5rem;
        font-weight: 900;
    }

    .clicked h4, .clicked p {
        color: lightgray;
    }
</style>
