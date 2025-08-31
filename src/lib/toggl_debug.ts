/**
 * Toggl API integration module
 */

/**
 * Get the Toggl API token from storage
 */
export async function togglGetApiToken(): Promise<string | null> {
    return Promise.resolve('token');
}

/**
 * Get the Toggl workspace ID from storage
 */
export async function togglGetWorkspaceId(): Promise<string | null> {
    return Promise.resolve('workspace1');
}

export type TogglSettings = {
    token: string;
    workspace: string;
}

/**
 * Save Toggl settings to storage
 */
export async function togglSaveSettings(settings: TogglSettings): Promise<void> {
    return Promise.resolve();
}

/**
 * Test if the Toggl API token is valid
 */
export async function togglTestToken(token: string): Promise<string> {
    return Promise.resolve('SUCCESS');
}

export type TogglWorkspace = {
    id: string;
    name: string;
    selected?: boolean;
}

/**
 * Get workspaces from storage
 */
export async function togglGetWorkspaces(): Promise<TogglWorkspace[]> {
    return Promise.resolve([
        { id: 'workspace1', name: 'workspace1', selected: true },
        { id: 'workspace2', name: 'workspace2', selected: false },
    ]);
}

/**
 * Refresh workspaces from Toggl API
 */
export async function togglRefreshWorkspaces(token: string | null): Promise<TogglWorkspace[]> {
    return togglGetWorkspaces();
}

export type TogglClient = {
    id: string;
    name: string;
}

export type TogglProject = {
    id: string;
    name: string;
    client?: TogglClient;
    client_id?: string;
}

export type TogglProjectMapping = {
    customer?: string;
    project?: string;
    activity?: string;
}

/**
 * Save project mapping to storage
 */
export async function togglSaveProjectMapping(key: string, mapping: TogglProjectMapping): Promise<void> {
    return Promise.resolve();
}

export type TogglReportRequest = {
    method: string;
    date: string;
}

export type TogglReportResponse = {
    success: boolean;
    report?: TogglReportItem[];
    error?: any;
}

/**
 * Fetch report from background script
 */
export async function togglFetchReport(date: string): Promise<TogglReportItem[]> {
    return Promise.resolve([]);
}

export type TogglReportItem = {
    project?: TogglProject;
    color: string;
    seconds: number;
    description: string;
    mapping?: TogglProjectMapping;
}

/**
 * Fetch report implementation (called from background script)
 */
export async function togglFetchReportImpl(date: string): Promise<TogglReportItem[]> {
    return Promise.resolve([]);
}
