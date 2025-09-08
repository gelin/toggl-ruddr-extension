<script lang="ts">
    import {onMount} from 'svelte';
    import {
        togglGetWorkspaceId,
        togglGetApiToken,
        togglGetWorkspaces,
        togglRefreshWorkspaces,
        togglSaveSettings,
        togglTestToken,
        type TogglWorkspace,
        type TogglSettings,
    } from '../lib/toggl';

    let token = $state('');
    let workspaces: TogglWorkspace[] = $state([]);
    let selectedWorkspace = $state();
    let message = $state('');
    let loading = $state(true);

    onMount(async () => {
        try {
            token = await togglGetApiToken() || '';
            workspaces = await togglGetWorkspaces();
            selectedWorkspace = await togglGetWorkspaceId();
            loading = false;
        } catch (error) {
            console.error('Error loading settings:', error);
            message = 'Error loading settings';
            loading = false;
        }
    });

    async function onTokenChange() {
        message = 'Testing...';
        try {
            message = await togglTestToken(token);
            workspaces = await togglRefreshWorkspaces(token);
            selectedWorkspace = await togglGetWorkspaceId();
        } catch (error: any) {
            console.error('Error testing token:', error);
            message = error.message;
        }
    }

    async function onSaveClick() {
        try {
            await togglSaveSettings({
                token,
                workspace: selectedWorkspace
            } as TogglSettings);
            message = 'Settings saved successfully';
        } catch (error: any) {
            console.error('Error saving settings:', error);
            message = 'Error saving settings: ' + error.message;
        }
    }
</script>

<form>
    <label for="toggl_token">Toggl Track API token</label>
    <input
            id="toggl_token"
            type="text"
            disabled={loading}
            bind:value={token}
            onchange={onTokenChange}
    />

    <label for="toggl_workspace">Toggl Workspace</label>
    <select
            id="toggl_workspace"
            disabled={loading || workspaces.length === 0}
            bind:value={selectedWorkspace}
    >
        {#each workspaces as workspace}
            <option value={workspace.id} selected={workspace.selected}>{workspace.name}</option>
        {/each}
    </select>

    <p class="message">{message}</p>

    <button
            type="button"
            disabled={loading || !token || !selectedWorkspace}
            onclick={onSaveClick}
    >
        Refresh & Save
    </button>
</form>

<style>
    :global(body) {
        font-family: sans-serif;
        min-width: 200px;
    }

    :global(h1) {
        font-size: 1.5em;
    }

    label {
        display: block;
        margin-top: 1em;
    }

    input, select {
        display: block;
        width: 100%;
    }
</style>
