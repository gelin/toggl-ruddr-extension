// disable form submit
const togglSettingsForm = document.getElementById('toggl_settings');
togglSettingsForm.addEventListener('submit', (event) => {
    event.preventDefault();
    return false;
});

const togglTokenInput = document.getElementById('toggl_token');
togglTokenInput.value = togglGetApiToken();
togglTokenInput.addEventListener('change', onTogglTokenChanged);

const togglWorkspaceSelect = document.getElementById('toggl_workspace');

const messageText = document.getElementById('toggl_message');

function onTogglTokenChanged() {
    const token = togglTokenInput.value;
    messageText.textContent = 'Testing...';
    togglTestToken(token)
        .then(message => messageText.textContent = message)
        .then(() => togglListWorkspaces(token))
        .then(workspaces => fillWorkspaceSelect(workspaces))
        .catch(err => messageText.textContent = err.message);
    return false;
}

function fillWorkspaceSelect(workspaces) {
    workspaces.forEach(w => {
        const option = document.createElement('option')
        option.value = w.id;
        option.innerText = w.name;
        togglWorkspaceSelect.appendChild(option);
    });
}

const togglSaveButton = document.getElementById('toggl_settings_save_button');
togglSaveButton.addEventListener('click', onSaveButtonClick);

function onSaveButtonClick() {
    const token = togglTokenInput.value;
    togglSaveSettings({
        'token': token
    })
    return false;
}
