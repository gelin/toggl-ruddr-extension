<script lang="ts">
    import ReportPanel from "./ReportPanel.svelte";

    let {panelVisible} = $props();

    function onClick() {
        panelVisible = !panelVisible;
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
            report={[]}
            date="TEST"
    />
{/if}

<style>
    button {
        display: block;
        margin-top: 1.5rem;
        cursor: pointer;
    }
</style>
