document.getElementById('toggl_settings_test_button').addEventListener('click', onTestButtonClick);

function onTestButtonClick() {
    const token = document.getElementById('toggl_token')?.value;
    testTogglToken(token);
}

function testTogglToken(token) {
    console.log(`TOGGL Testing ${token}`);
    fetch("https://api.track.toggl.com/api/v9/me/logged", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            // "Authorization": `Basic ${btoa(token + ':api_token')}`
        },
    })
        .then((resp) => resp.json())
        .then((json) => {
            document.getElementById('toggl_message').text = 'SUCCESS';
            console.log(json);
        })
        .catch(err => {
            document.getElementById('toggl_message').text = 'FAILED: ' + err.message;
            console.error(err);
        });
}
