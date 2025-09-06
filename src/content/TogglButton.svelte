<script lang="ts">
    let {panelVisible} = $props();

    function onClick() {
        console.log('Toggl button clicked');
        // TODO, show report
    }
</script>

<button id="toggl_button" onclick={onClick}>Toggl</button>

<style>
    button {
        display: block;
        margin-top: 1.5rem;
        cursor: pointer;
    }
</style>
