// console.log('TOGGL');

window.addEventListener('load', main);

function main() {
    // const button = document.querySelector("a[href='/en_NZ/timesheet/create']")
    // console.log('TOGGL', button);
    // if (button) {
    //     button.addEventListener('click', updateForm);
    // }
    // document.addEventListener('click', updateForm);
}

const modal = document.querySelector('#remote_form_modal');
const observer = new MutationObserver(mutations => {
    // console.log('TOGGL', mutations);
    updateForm();
});
observer.observe(modal, { childList: true, subtree: true });

function updateForm() {
    if (document.querySelector('#toggle_button')) {
        return;
    }
    const form = document.querySelector("form[name='timesheet_edit_form']");
    // console.log('TOGGL', form);

    if (form) {
        const header = form.querySelector('.modal-header');
        if (header) {
            header.insertAdjacentHTML('beforeend', "<h5 id='toggle_button' class='modal-title'>Toggl ▶</h5>");
        }
    }
}
