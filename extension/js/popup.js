import {
    togglGetApiToken,
    togglTestToken,
    togglRefreshWorkspaces,
    togglGetWorkspaces,
    togglSaveSettings
} from '/js/toggl.js';

// disable form submit
const togglSettingsForm = document.getElementById('toggl_settings');
togglSettingsForm.addEventListener('submit', (event) => {
    event.preventDefault();
    return false;
});

const togglTokenInput = document.getElementById('toggl_token');
togglTokenInput.value = await togglGetApiToken();
togglTokenInput.addEventListener('change', onTogglTokenChanged);

const togglWorkspaceSelect = document.getElementById('toggl_workspace');

const messageText = document.getElementById('toggl_message');

function onTogglTokenChanged() {
    const token = togglTokenInput.value;
    messageText.textContent = 'Testing...';
    togglTestToken(token)
        .then(message => {
            messageText.textContent = message;
            return togglRefreshWorkspaces(token);
        })
        .then(workspaces => {
            fillWorkspaceSelect(workspaces);
        })
        .catch(err => {
            messageText.textContent = err.message
        });
    return false;
}

function fillWorkspaceSelect(workspaces) {
    togglWorkspaceSelect.length = 0;
    workspaces.forEach(w => {
        const option = document.createElement('option')
        option.value = w.id;
        option.innerText = w.name;
        option.selected = w.selected;
        togglWorkspaceSelect.appendChild(option);
    });
}
fillWorkspaceSelect(await togglGetWorkspaces());

const togglSaveButton = document.getElementById('toggl_settings_save_button');
togglSaveButton.addEventListener('click', onSaveButtonClick);

function onSaveButtonClick() {
    const token = togglTokenInput.value;
    const workspace = togglWorkspaceSelect.value;
    togglSaveSettings({
        'token': token,
        'workspace': workspace
    })
    return false;
}
