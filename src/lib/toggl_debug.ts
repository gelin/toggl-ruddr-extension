/**
 * Toggl API integration module
 */

/**
 * Get the Toggl API token from storage
 */
export async function getApiToken(): Promise<string | null> {
    return Promise.resolve('token');
}

/**
 * Get the Toggl workspace ID from storage
 */
export async function getWorkspaceId(): Promise<string | null> {
    return Promise.resolve('workspace1');
}

export type Settings = {
    token: string;
    workspace: string;
}

/**
 * Save Toggl settings to storage
 */
export async function saveSettings(settings: Settings): Promise<void> {
    return Promise.resolve();
}

/**
 * Test if the Toggl API token is valid
 */
export async function testToken(token: string): Promise<string> {
    return Promise.resolve('SUCCESS');
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
    return Promise.resolve([
        { id: 'workspace1', name: 'workspace1', selected: true },
        { id: 'workspace2', name: 'workspace2', selected: false },
    ]);
}

/**
 * Refresh workspaces from Toggl API
 */
export async function refreshWorkspaces(token: string | null): Promise<Workspace[]> {
    return getWorkspaces();
}

export type Client = {
    id: string;
    name: string;
}

export type Project = {
    id: string;
    name: string;
    client?: Client;
    client_id?: string;
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
    return Promise.resolve();
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
    return Promise.resolve([]);
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
    return Promise.resolve([]);
}
