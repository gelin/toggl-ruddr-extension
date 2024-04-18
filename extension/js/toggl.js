function togglGetApiToken() {
    return localStorage.getItem('toggl_api_token');
}

function togglGetWorkspaceId() {
    return localStorage.getItem('toggl_workspace_id');
}

function togglSaveSettings(settings) {
    localStorage.setItem('toggl_api_token', settings.token);
    localStorage.setItem('toggl_workspace_id', settings.workspace);
}

function togglTestToken(token) {
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
            console.log('Failed to fetch /me/logged', err);
            throw new Error('FAILED: ' + err.message);
        });
}

function togglGetWorkspaces() {
    const workspaceId = togglGetWorkspaceId();
    const workspaces = JSON.parse(localStorage.getItem('toggl_workspaces') || '[]');
    return workspaces.map(workspace => {
        workspace.selected = workspace.id === workspaceId;
        return workspace;
    })
}

function togglSetWorkspaces(workspaces) {
    localStorage.setItem('toggl_workspaces', JSON.stringify(workspaces));
}

function togglRefreshWorkspaces(token) {
    const apiToken = token ?? togglGetApiToken();
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
            console.log('Failed to fetch /me/workspaces', err);
            throw err;
        });
}
