function togglGetApiToken() {
    return localStorage.getItem('toggl_api_token');
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
                return 'FAILED: not OK response'
            }
        })
        .catch(err => {
            console.log('Failed to fetch /me/logged', err);
            throw new Error('FAILED: ' + err.message);
        });
}

function togglListWorkspaces(token) {
    const apiToken = token ?? togglGetApiToken();
    return fetch("https://api.track.toggl.com/api/v9/me/workspaces", {
        method: "GET",
        headers: {
            'Authorization': `Basic ${btoa(apiToken + ':api_token')}`
        },
    })
        .then((resp) => resp.json())
        .then((json) => json.map(value => {
            return {
                'id': value.id,
                'name': value.name
            }
        }))
        .catch(err => {
            console.log('Failed to fetch /me/workspaces', err);
            throw err;
        });
}
