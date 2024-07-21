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
    })
        .then(_ => togglRefreshClients(settings.token))
        .then(_ => togglRefreshProjects(settings.token));
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

async function togglGetClientsMap() {
    const clients = await chrome.storage.local.get('toggl_clients')
        .then(o => o?.toggl_clients || []).catch(_ => []);
    const idToClientMap = clients.reduce((map, client) => {
        map.set(client.id, {
            id: client.id,
            name: client.name
        });
        return map;
    }, new Map());
    return idToClientMap;
}

function togglSetClients(clients) {
    return chrome.storage.local.set({
        'toggl_clients': clients
    })
}

async function togglRefreshClients(token) {
    const apiToken = token ?? await togglGetApiToken();
    return fetch("https://api.track.toggl.com/api/v9/me/clients", {
        method: "GET",
        headers: {
            'Authorization': `Basic ${btoa(apiToken + ':api_token')}`
        },
    })
        .then((resp) => resp.json())
        .then((json) => {
            const clients = json.map(value => {
                return {
                    id: value.id,
                    name: value.name
                }
            });
            return togglSetClients(clients);
        })
        .catch(err => {
            console.log('Failed to fetch me/clients', err);
            throw err;
        });
}

async function togglGetProjectsMap() {
    const projects = await chrome.storage.local.get('toggl_projects')
        .then(o => o?.toggl_projects || []).catch(_ => []);
    const clientsMap = await togglGetClientsMap();
    const idToProjectMap = projects.reduce((map, project) => {
        map.set(project.id, {
            id: project.id,
            name: project.name,
            client: clientsMap.get(project.client_id)
        });
        return map;
    }, new Map());
    return idToProjectMap;
}

function togglSetProjects(projects) {
    return chrome.storage.local.set({
        'toggl_projects': projects
    })
}

async function togglRefreshProjects(token) {
    const apiToken = token ?? await togglGetApiToken();
    return fetch("https://api.track.toggl.com/api/v9/me/projects", {
        method: "GET",
        headers: {
            'Authorization': `Basic ${btoa(apiToken + ':api_token')}`
        },
    })
        .then((resp) => resp.json())
        .then((json) => {
            const projects = json.map(value => {
                return {
                    id: value.id,
                    name: value.name,
                    client_id: value.client_id
                }
            });
            return togglSetProjects(projects);
        })
        .catch(err => {
            console.log('Failed to fetch me/projects', err);
            throw err;
        });
}

/**
 * Accepts project mapping and saves in into sync storage.
 * @param key id of the project
 * @param mapping the mapping object
 * @returns storage set future
 */
export function togglSaveProjectMapping(key, mapping) {
    console.log('Saving project mapping', key, mapping);
    return chrome.storage.sync.get('toggl_project_mappings')
        .then(o => {
            let m = o?.toggl_project_mappings || {};
            m[key] = mapping;
            return chrome.storage.sync.set({
                'toggl_project_mappings': m
            });
        });
}

function togglGetProjectMappings() {
    return chrome.storage.sync.get('toggl_project_mappings')
        .then(o => o?.toggl_project_mappings || {})
        .catch(_ => {});
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
 *      project: {
 *          id: 123,
 *          name: "project name",
 *          client: {
 *              id: 234,
 *              name: "client name"
 *          }
 *      },
 *      color: "#123abc",
 *      seconds: 12345,
 *      description: "line 1\nline 2"
 *   },...
 * ]
 * ```
 */
async function togglConvertReport(json) {
    const projectsMap = await togglGetProjectsMap();
    const projectMappings = await togglGetProjectMappings();
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
                project: projectsMap.get(projectId),
                color: color,
                seconds: toggleRoundSeconds(seconds),
                description: descriptionLines.join('\n'),
                mapping: projectMappings[projectId]
            })
        }
    });
    return items;
}

function toggleRoundSeconds(seconds) {
    const fifteenMinutes = 15 * 60;
    const quarters = Math.ceil(seconds / fifteenMinutes);
    return quarters * fifteenMinutes;
}
