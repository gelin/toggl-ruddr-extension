import { s as set_active_reaction, a as set_active_effect, b as active_reaction, c as active_effect, d as component_context, u as user_effect, e as untrack, f as effect, t as teardown, i as is_array, g as is, r as render_effect, h as delegate, p as push, j as append_styles, k as state, l as proxy, m as from_html, n as sibling, o as each, q as template_effect, v as get, w as append, x as pop, y as set, z as child, A as set_text, B as set_selected, C as index, D as mount } from "./attributes.js";
import { t as togglTestToken, a as togglRefreshWorkspaces, b as togglGetWorkspaceId, c as togglSaveSettings, d as togglGetApiToken, e as togglGetWorkspaces } from "./toggl.js";
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
function lifecycle_outside_component(name) {
  {
    throw new Error(`https://svelte.dev/e/lifecycle_outside_component`);
  }
}
function select_multiple_invalid_value() {
  {
    console.warn(`https://svelte.dev/e/select_multiple_invalid_value`);
  }
}
let listening_to_form_reset = false;
function add_form_reset_listener() {
  if (!listening_to_form_reset) {
    listening_to_form_reset = true;
    document.addEventListener(
      "reset",
      (evt) => {
        Promise.resolve().then(() => {
          var _a;
          if (!evt.defaultPrevented) {
            for (
              const e of
              /**@type {HTMLFormElement} */
              evt.target.elements
            ) {
              (_a = e.__on_r) == null ? void 0 : _a.call(e);
            }
          }
        });
      },
      // In the capture phase to guarantee we get noticed of it (no possiblity of stopPropagation)
      { capture: true }
    );
  }
}
function without_reactive_context(fn) {
  var previous_reaction = active_reaction;
  var previous_effect = active_effect;
  set_active_reaction(null);
  set_active_effect(null);
  try {
    return fn();
  } finally {
    set_active_reaction(previous_reaction);
    set_active_effect(previous_effect);
  }
}
function listen_to_event_and_reset_event(element, event, handler, on_reset = handler) {
  element.addEventListener(event, () => without_reactive_context(handler));
  const prev = element.__on_r;
  if (prev) {
    element.__on_r = () => {
      prev();
      on_reset(true);
    };
  } else {
    element.__on_r = () => on_reset(true);
  }
  add_form_reset_listener();
}
function onMount(fn) {
  if (component_context === null) {
    lifecycle_outside_component();
  }
  {
    user_effect(() => {
      const cleanup = untrack(fn);
      if (typeof cleanup === "function") return (
        /** @type {() => void} */
        cleanup
      );
    });
  }
}
function select_option(select, value, mounting) {
  if (select.multiple) {
    if (value == void 0) {
      return;
    }
    if (!is_array(value)) {
      return select_multiple_invalid_value();
    }
    for (var option of select.options) {
      option.selected = value.includes(get_option_value(option));
    }
    return;
  }
  for (option of select.options) {
    var option_value = get_option_value(option);
    if (is(option_value, value)) {
      option.selected = true;
      return;
    }
  }
  if (!mounting || value !== void 0) {
    select.selectedIndex = -1;
  }
}
function init_select(select) {
  var observer = new MutationObserver(() => {
    select_option(select, select.__value);
  });
  observer.observe(select, {
    // Listen to option element changes
    childList: true,
    subtree: true,
    // because of <optgroup>
    // Listen to option element value attribute changes
    // (doesn't get notified of select value changes,
    // because that property is not reflected as an attribute)
    attributes: true,
    attributeFilter: ["value"]
  });
  teardown(() => {
    observer.disconnect();
  });
}
function bind_select_value(select, get2, set2 = get2) {
  var mounting = true;
  listen_to_event_and_reset_event(select, "change", (is_reset) => {
    var query = is_reset ? "[selected]" : ":checked";
    var value;
    if (select.multiple) {
      value = [].map.call(select.querySelectorAll(query), get_option_value);
    } else {
      var selected_option = select.querySelector(query) ?? // will fall back to first non-disabled option if no option is selected
      select.querySelector("option:not([disabled])");
      value = selected_option && get_option_value(selected_option);
    }
    set2(value);
  });
  effect(() => {
    var value = get2();
    select_option(select, value, mounting);
    if (mounting && value === void 0) {
      var selected_option = select.querySelector(":checked");
      if (selected_option !== null) {
        value = get_option_value(selected_option);
        set2(value);
      }
    }
    select.__value = value;
    mounting = false;
  });
  init_select(select);
}
function get_option_value(option) {
  if ("__value" in option) {
    return option.__value;
  } else {
    return option.value;
  }
}
function bind_value(input, get2, set2 = get2) {
  listen_to_event_and_reset_event(input, "input", (is_reset) => {
    var value = is_reset ? input.defaultValue : input.value;
    value = is_numberlike_input(input) ? to_number(value) : value;
    set2(value);
    if (value !== (value = get2())) {
      var start = input.selectionStart;
      var end = input.selectionEnd;
      input.value = value ?? "";
      if (end !== null) {
        input.selectionStart = start;
        input.selectionEnd = Math.min(end, input.value.length);
      }
    }
  });
  if (
    // If we are hydrating and the value has since changed,
    // then use the updated value from the input instead.
    // If defaultValue is set, then value == defaultValue
    // TODO Svelte 6: remove input.value check and set to empty string?
    untrack(get2) == null && input.value
  ) {
    set2(is_numberlike_input(input) ? to_number(input.value) : input.value);
  }
  render_effect(() => {
    var value = get2();
    if (is_numberlike_input(input) && value === to_number(input.value)) {
      return;
    }
    if (input.type === "date" && !value && !input.value) {
      return;
    }
    if (value !== input.value) {
      input.value = value ?? "";
    }
  });
}
function is_numberlike_input(input) {
  var type = input.type;
  return type === "number" || type === "range";
}
function to_number(value) {
  return value === "" ? null : +value;
}
async function onTokenChange(_, message, token, workspaces, selectedWorkspace) {
  set(message, "Testing...");
  try {
    set(message, await togglTestToken(get(token)), true);
    set(workspaces, await togglRefreshWorkspaces(get(token)), true);
    set(selectedWorkspace, await togglGetWorkspaceId(), true);
  } catch (error) {
    console.error("Error testing token:", error);
    set(message, error.message, true);
  }
}
async function onSaveClick(__1, token, selectedWorkspace, message) {
  try {
    await togglSaveSettings({ token: get(token), workspace: get(selectedWorkspace) });
    set(message, "Settings saved successfully");
  } catch (error) {
    console.error("Error saving settings:", error);
    set(message, "Error saving settings: " + error.message);
  }
}
var root_1 = from_html(`<option> </option>`);
var root = from_html(`<form><label for="toggl_token" class="svelte-1tqcnsd">Toggl Track API token</label> <input id="toggl_token" type="text" class="svelte-1tqcnsd"/> <label for="toggl_workspace" class="svelte-1tqcnsd">Toggl Workspace</label> <select id="toggl_workspace" class="svelte-1tqcnsd"></select> <p class="message"> </p> <button type="button">Refresh & Save</button></form>`);
const $$css = {
  hash: "svelte-1tqcnsd",
  code: "body {font-family:sans-serif;min-width:200px;}h1 {font-size:1.5em;}label.svelte-1tqcnsd {display:block;margin-top:1em;}input.svelte-1tqcnsd, select.svelte-1tqcnsd {display:block;width:100%;}"
};
function Popup($$anchor, $$props) {
  push($$props, true);
  append_styles($$anchor, $$css);
  let token = state("");
  let workspaces = state(proxy([]));
  let selectedWorkspace = state(void 0);
  let message = state("");
  let loading = state(true);
  onMount(async () => {
    try {
      set(token, await togglGetApiToken() || "", true);
      set(workspaces, await togglGetWorkspaces(), true);
      set(selectedWorkspace, await togglGetWorkspaceId(), true);
      set(loading, false);
    } catch (error) {
      console.error("Error loading settings:", error);
      set(message, "Error loading settings");
      set(loading, false);
    }
  });
  var form = root();
  var input = sibling(child(form), 2);
  input.__change = [onTokenChange, message, token, workspaces, selectedWorkspace];
  var select = sibling(input, 4);
  each(select, 21, () => get(workspaces), index, ($$anchor2, workspace) => {
    var option = root_1();
    var text = child(option);
    var option_value = {};
    template_effect(() => {
      set_selected(option, get(workspace).selected);
      set_text(text, get(workspace).name);
      if (option_value !== (option_value = get(workspace).id)) {
        option.value = (option.__value = get(workspace).id) ?? "";
      }
    });
    append($$anchor2, option);
  });
  var p = sibling(select, 2);
  var text_1 = child(p);
  var button = sibling(p, 2);
  button.__click = [onSaveClick, token, selectedWorkspace, message];
  template_effect(() => {
    input.disabled = get(loading);
    select.disabled = get(loading) || get(workspaces).length === 0;
    set_text(text_1, get(message));
    button.disabled = get(loading) || !get(token) || !get(selectedWorkspace);
  });
  bind_value(input, () => get(token), ($$value) => set(token, $$value));
  bind_select_value(select, () => get(selectedWorkspace), ($$value) => set(selectedWorkspace, $$value));
  append($$anchor, form);
  pop();
}
delegate(["change", "click"]);
const target = document.getElementById("popup");
if (!target) {
  throw new Error("Could not find popup container");
}
mount(Popup, { target });
//# sourceMappingURL=popup.js.map
