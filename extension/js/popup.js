// disable form submit
document.getElementById('toggl_settings').addEventListener('submit', (event) => {
    event.preventDefault();
    return false;
});

document.getElementById('toggl_settings_test_button').addEventListener('click', onTestButtonClick);

function onTestButtonClick() {
    const token = document.getElementById('toggl_token')?.value;
    testTogglToken(token);
    return false;
}

function testTogglToken(token) {
    const messageElement = document.getElementById('toggl_message');
    messageElement.textContent = 'Testing...';
    fetch('https://api.track.toggl.com/api/v9/me/logged', {
        method: 'GET',
        headers: {
            'Authorization': `Basic ${btoa(token + ':api_token')}`
        }
    })
        .then((resp) => {
            if (resp.ok) {
                messageElement.textContent = 'SUCCESS';
            } else {
                messageElement.textContent = 'FAILED: not OK response'
            }
        })
        .catch(err => {
            messageElement.textContent = 'FAILED: ' + err.message;
            console.log('Failed to fetch', err);
        });
}
