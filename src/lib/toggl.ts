/**
 * Toggl API integration module
 */

/**
 * Get the Toggl API token from storage
 */
export async function getApiToken(): Promise<string | null> {
    return chrome.storage.sync.get('toggl_api_token')
        .then(o => o?.toggl_api_token)
        .catch(_ => null);
}

/**
 * Get the Toggl workspace ID from storage
 */
export async function getWorkspaceId(): Promise<string | null> {
    return chrome.storage.sync.get('toggl_workspace_id')
        .then(o => o?.toggl_workspace_id)
        .catch(_ => null);
}

/**
 * Save Toggl settings to storage
 */
export async function saveSettings(settings: { token: string, workspace: string }): Promise<void> {
    return chrome.storage.sync.set({
        'toggl_api_token': settings.token,
        'toggl_workspace_id': settings.workspace
    })
        .then(_ => togglRefreshClients(settings.token))
        .then(_ => togglRefreshProjects(settings.token));
}

/**
 * Test if the Toggl API token is valid
 */
export async function testToken(token: string): Promise<string> {
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

export type Workspace = {
    id: string;
    name: string;
    selected?: boolean;
}

/**
 * Get workspaces from storage
 */
export async function getWorkspaces(): Promise<Workspace[]> {
    const workspaceId = await getWorkspaceId();
    const workspaces = await chrome.storage.local.get('toggl_workspaces')
        .then(o => o?.toggl_workspaces || []).catch(_ => []);
    return workspaces.map((workspace: Workspace) => {
        workspace.selected = workspace.id === workspaceId;
        return workspace;
    });
}

/**
 * Set workspaces in storage
 */
async function setWorkspaces(workspaces: Workspace[]): Promise<void> {
    return chrome.storage.local.set({
        'toggl_workspaces': workspaces
    });
}

/**
 * Refresh workspaces from Toggl API
 */
export async function refreshWorkspaces(token: string | null): Promise<Workspace[]> {
    const apiToken = token ?? await getApiToken();
    return fetch("https://api.track.toggl.com/api/v9/me/workspaces", {
        method: "GET",
        headers: {
            'Authorization': `Basic ${btoa(apiToken + ':api_token')}`
        },
    })
        .then((resp) => resp.json())
        .then((json) => {
            const workspaces = json.map((value: any) => {
                return {
                    'id': value.id,
                    'name': value.name
                };
            });
            setWorkspaces(workspaces);
            return workspaces;
        })
        .catch(err => {
            console.log('Failed to fetch me/workspaces', err);
            throw err;
        });
}

export type Client = {
    id: string;
    name: string;
}

/**
 * Get clients map from storage
 */
async function getClientsMap(): Promise<Map<string, Client>> {
    const clients = await chrome.storage.local.get('toggl_clients')
        .then(o => o?.toggl_clients || []).catch(_ => []);
    const idToClientMap = clients.reduce((map: Map<string, Client>, client: Client) => {
        map.set(client.id, {
            id: client.id,
            name: client.name
        });
        return map;
    }, new Map());
    return idToClientMap;
}

/**
 * Set clients in storage
 */
function setClients(clients: Client[]): Promise<void> {
    return chrome.storage.local.set({
        'toggl_clients': clients
    });
}

/**
 * Refresh clients from Toggl API
 */
async function refreshClients(token: string | null): Promise<void> {
    const apiToken = token ?? await getApiToken();
    return fetch("https://api.track.toggl.com/api/v9/me/clients", {
        method: "GET",
        headers: {
            'Authorization': `Basic ${btoa(apiToken + ':api_token')}`
        },
    })
        .then((resp) => resp.json())
        .then((json) => {
            const clients = json.map((value: any) => {
                return {
                    id: value.id,
                    name: value.name
                };
            });
            return setClients(clients);
        })
        .catch(err => {
            console.log('Failed to fetch me/clients', err);
            throw err;
        });
}

export type Project = {
    id: string;
    name: string;
    client?: Client;
    client_id?: string;
}

/**
 * Get projects map from storage
 */
async function getProjectsMap(): Promise<Map<string, Project>> {
    const projects = await chrome.storage.local.get('toggl_projects')
        .then(o => o?.toggl_projects || []).catch(_ => []);
    const clientsMap = await togglGetClientsMap();
    const idToProjectMap = projects.reduce((map: Map<string, Project>, project: Project) => {
        map.set(project.id, {
            id: project.id,
            name: project.name,
            client: clientsMap.get(project.client_id!)
        });
        return map;
    }, new Map());
    return idToProjectMap;
}

/**
 * Set projects in storage
 */
async function setProjects(projects: Project[]): Promise<void> {
    return chrome.storage.local.set({
        'toggl_projects': projects
    });
}

/**
 * Refresh projects from Toggl API
 */
async function refreshProjects(token: string | null): Promise<void> {
    const apiToken = token ?? await getApiToken();
    return fetch("https://api.track.toggl.com/api/v9/me/projects", {
        method: "GET",
        headers: {
            'Authorization': `Basic ${btoa(apiToken + ':api_token')}`
        },
    })
        .then((resp) => resp.json())
        .then((json) => {
            const projects = json.map((value: any) => {
                return {
                    id: value.id,
                    name: value.name,
                    client_id: value.client_id
                };
            });
            return setProjects(projects);
        })
        .catch(err => {
            console.log('Failed to fetch me/projects', err);
            throw err;
        });
}

export type ProjectMapping = {
    customer?: string;
    project?: string;
    activity?: string;
}

/**
 * Save project mapping to storage
 */
export async function saveProjectMapping(key: string, mapping: ProjectMapping): Promise<void> {
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

/**
 * Get project mappings from storage
 */
async function getProjectMappings(): Promise<Record<string, ProjectMapping>> {
    return chrome.storage.sync.get('toggl_project_mappings')
        .then(o => o?.toggl_project_mappings || {})
        .catch(_ => ({}));
}

export type ReportRequest = {
    method: string;
    date: string;
}

export type ReportResponse = {
    success: boolean;
    report?: ReportItem[];
    error?: any;
}

/**
 * Fetch report from background script
 */
export async function fetchReport(date: string): Promise<ReportItem[]> {
    const message: ReportRequest = {
        method: 'togglFetchReport',
        date: date
    };
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(message, (response: ReportResponse) => {
            if (response.success) {
                resolve(response.report!);
            } else {
                reject(response.error);
            }
        });
    });
}

export type ReportItem = {
    project?: Project;
    color: string;
    seconds: number;
    description: string;
    mapping?: ProjectMapping;
}

/**
 * Fetch report implementation (called from background script)
 */
export async function fetchReportImpl(date: string): Promise<ReportItem[]> {
    const apiToken = await getApiToken();
    const workspaceId = await getWorkspaceId();
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
        .then((json) => convertReport(json))
        .catch(err => {
            console.warn('Failed to fetch summary/time_entries', err);
            throw err;
        });
}

/**
 * Convert report from Toggl API format to our format
 */
async function convertReport(json: any): Promise<ReportItem[]> {
    const projectsMap = await getProjectsMap();
    const projectMappings = await getProjectMappings();
    const items: ReportItem[] = [];
    json?.groups?.forEach((group: any) => {
        const projectId = group.id;
        const descriptionLines: string[] = [];
        let seconds = 0;
        let color = '#000';
        group?.sub_groups?.forEach((subGroup: any) => {
            descriptionLines.push(subGroup.title);
            seconds += subGroup.seconds;
            color = subGroup.project_hex_color;
        });
        if (seconds > 0) {
            items.push({
                project: projectsMap.get(projectId),
                color: color,
                seconds: roundSeconds(seconds),
                description: descriptionLines.join('\n'),
                mapping: projectMappings[projectId]
            });
        }
    });
    return items;
}

/**
 * Round seconds to 15-minute intervals
 */
function roundSeconds(seconds: number): number {
    const fifteenMinutes = 15 * 60;
    const quarters = Math.ceil(seconds / fifteenMinutes);
    return quarters * fifteenMinutes;
}
