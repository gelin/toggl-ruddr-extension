<script lang="ts">
    import {onMount} from 'svelte';
    import {
        getApiToken,
        testToken,
        refreshWorkspaces,
        getWorkspaces,
        saveSettings,
    } from '../lib/toggl';
    import type {
        Workspace
    } from '../lib/toggl';

    let token = $state('');
    let workspaces: Workspace[] = $state([]);
    let selectedWorkspace = '';
    let message = $state('');
    let loading = $state(true);

    onMount(async () => {
        try {
            token = await getApiToken() || '';
            workspaces = await getWorkspaces();
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
            const result = await testToken(token);
            message = result;
            const newWorkspaces = await refreshWorkspaces(token);
            workspaces = newWorkspaces;
        } catch (error: any) {
            console.error('Error testing token:', error);
            message = error.message;
        }
    }

    async function onSaveClick() {
        try {
            await saveSettings({
                token,
                workspace: selectedWorkspace
            });
            message = 'Settings saved successfully';
        } catch (error: any) {
            console.error('Error saving settings:', error);
            message = 'Error saving settings: ' + error.message;
        }
    }
</script>

<main>
    <h1>Toggl + Ruddr Settings</h1>

    <form>
        <label for="toggl_token">Toggl Track API token</label>
        <input
                id="toggl_token"
                type="text"
                disabled={loading}
                value={token}
                onchange={onTokenChange}
        />

        <label for="toggl_workspace">Toggl Workspace</label>
        <select
            id="toggl_workspace"
            disabled={loading || workspaces.length === 0}
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
</main>

<style>

</style>
