export function togglGetApiToken() {
    return chrome.storage.sync.get('toggl_api_token').then(o => o?.toggl_api_token).catch(_ => null);
}

export function togglGetWorkspaceId() {
    return chrome.storage.sync.get('toggl_workspace_id').then(o => o?.toggl_workspace_id).catch(_ => null);
}

export function togglSaveSettings(settings) {
    return chrome.storage.sync.set({
        'toggl_api_token': settings.token,
        'toggl_workspace_id': settings.workspace
    });
}

export function togglTestToken(token) {
    return fetch('https://api.track.toggl.com/api/v9/me/logged', {
        method: 'GET',
        headers: {
            'Authorization': `Basic ${btoa(token + ':api_token')}`
        }
    })
        .then((resp) => {
            if (resp.ok) {
                return 'SUCCESS';
            } else {
                throw new Error('FAILED: not OK response');
            }
        })
        .catch(err => {
            console.log('Failed to fetch me/logged', err);
            throw new Error('FAILED: ' + err.message);
        });
}

export async function togglGetWorkspaces() {
    const workspaceId = await togglGetWorkspaceId();
    const workspaces = await chrome.storage.local.get('toggl_workspaces')
        .then(o => o?.toggl_workspaces || []).catch(_ => []);
    return workspaces.map(workspace => {
        workspace.selected = workspace.id === workspaceId;
        return workspace;
    })
}

function togglSetWorkspaces(workspaces) {
    chrome.storage.local.set({
        'toggl_workspaces': workspaces
    })
}

export async function togglRefreshWorkspaces(token) {
    const apiToken = token ?? await togglGetApiToken();
    return fetch("https://api.track.toggl.com/api/v9/me/workspaces", {
        method: "GET",
        headers: {
            'Authorization': `Basic ${btoa(apiToken + ':api_token')}`
        },
    })
        .then((resp) => resp.json())
        .then((json) => {
            const workspaces = json.map(value => {
                return {
                    'id': value.id,
                    'name': value.name
                }
            });
            togglSetWorkspaces(workspaces);
            return workspaces;
        })
        .catch(err => {
            console.log('Failed to fetch me/workspaces', err);
            throw err;
        });
}

export function togglFetchReport(date) {
    const message = {
        method: 'togglFetchReport',
        date: date
    };
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(message, (response) => {
            if (response.success) {
                resolve(response.report);
            } else {
                reject(response.error);
            }
        });
    })
}

export async function togglFetchReportImpl(date) {
    const apiToken = await togglGetApiToken();
    const workspaceId = await togglGetWorkspaceId();
    console.log(`Fetching report for date=${date} in workspace=${workspaceId}`);
    return fetch(`https://api.track.toggl.com/reports/api/v3/workspace/${workspaceId}/summary/time_entries`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${btoa(apiToken + ':api_token')}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'start_date': date,
            'end_date': date,
            'grouping': 'projects',
            'sub_grouping': 'time_entries'
        })
    })
        .then((resp) => resp.json())
        .then((json) => togglConvertReport(json))
        .catch(err => {
            console.warn('Failed to fetch summary/time_entries', err);
            throw err;
        });
}

/**
 * Output format:
 * ```
 * [
 *   {
 *       "project_id": 123,
 *       "project": "project name",
 *       "client_id": 234,
 *       "client": "client name",
 *       "color": "#123abc",
 *       "seconds": 12345,
 *       "description": "line 1\nline 2"
 *   },...
 * ]
 * ```
 */
function togglConvertReport(json) {
    const items = [];
    json?.groups?.forEach(group => {
        const projectId = group.id;
        const descriptionLines = [];
        let seconds = 0;
        let color = '#000';
        group?.sub_groups?.forEach(subGroup => {
            descriptionLines.push(subGroup.title);
            seconds += subGroup.seconds;
            color = subGroup.project_hex_color;
        });
        if (seconds > 0) {
            items.push({
                project_id: projectId,
                // TODO: project name, client
                color: color,
                seconds: toggleRoundSeconds(seconds),
                description: descriptionLines.join('\n')
            })
        }
    });
    return items;
}

function toggleRoundSeconds(seconds) {
    const quarters = Math.ceil(seconds / 15);
    return quarters * 15;
}
