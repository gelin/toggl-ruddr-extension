import { F as delegate, H as append_styles, L as from_html, O as append, T as mount } from "./css.js";
function onClick() {
  console.log("Toggl button clicked");
}
var root = from_html(`<button id="toggl_button" class="svelte-f9irs4">Toggl</button>`);
const $$css = {
  hash: "svelte-f9irs4",
  code: "button.svelte-f9irs4 {display:block;margin-top:1.5rem;cursor:pointer;}"
};
function TogglButton($$anchor, $$props) {
  append_styles($$anchor, $$css);
  var button = root();
  button.__click = [
    // TODO, show report
    onClick
  ];
  append($$anchor, button);
}
delegate(["click"]);
function togglInit() {
  const observer = new MutationObserver((mutations) => {
    togglAddButton();
  });
  observer.observe(document.body, { childList: true });
}
function togglFindElementWithText(startElement, selector, text) {
  const elements = startElement.querySelectorAll(selector);
  for (const element of elements) {
    if (element.textContent === text) {
      return element;
    }
  }
  return null;
}
function togglAddButton() {
  if (document.getElementById("toggl_button")) {
    return;
  }
  const dialogDiv = document.querySelector("body > div:last-of-type");
  if (!dialogDiv) {
    return;
  }
  const header = togglFindElementWithText(dialogDiv, "header h5", "New Entry");
  if (!header) {
    return;
  }
  const form = dialogDiv.querySelector("form");
  if (!form) {
    const dialogObserver = new MutationObserver(() => {
      dialogObserver.disconnect();
      togglAddButton();
    });
    dialogObserver.observe(dialogDiv, { childList: true, subtree: true });
    return;
  }
  const entryDetailsHeader = form.querySelector("div:nth-child(2) > div > div");
  if (!entryDetailsHeader) {
    return;
  }
  const buttonContainer = document.createElement("p");
  entryDetailsHeader.appendChild(buttonContainer);
  mount(TogglButton, {
    target: buttonContainer,
    props: {
      panelVisible: false
    }
  });
}
export {
  togglAddButton,
  togglInit
};
//# sourceMappingURL=content.js.map
