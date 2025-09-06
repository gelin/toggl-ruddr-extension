import { E as block, F as EFFECT_TRANSPARENT, G as resume_effect, H as branch, I as pause_effect, U as UNINITIALIZED, v as get, J as derived, y as set, h as delegate, p as push, j as append_styles, m as from_html, z as child, w as append, x as pop, K as first_child, o as each, L as set_attribute, n as sibling, q as template_effect, M as user_derived, A as set_text, C as index, D as mount } from "./attributes.js";
function if_block(node, fn, [root_index, hydrate_index] = [0, 0]) {
  var anchor = node;
  var consequent_effect = null;
  var alternate_effect = null;
  var condition = UNINITIALIZED;
  var flags = root_index > 0 ? EFFECT_TRANSPARENT : 0;
  var has_branch = false;
  const set_branch = (fn2, flag = true) => {
    has_branch = true;
    update_branch(flag, fn2);
  };
  const update_branch = (new_condition, fn2) => {
    if (condition === (condition = new_condition)) return;
    if (condition) {
      if (consequent_effect) {
        resume_effect(consequent_effect);
      } else if (fn2) {
        consequent_effect = branch(() => fn2(anchor));
      }
      if (alternate_effect) {
        pause_effect(alternate_effect, () => {
          alternate_effect = null;
        });
      }
    } else {
      if (alternate_effect) {
        resume_effect(alternate_effect);
      } else if (fn2) {
        alternate_effect = branch(() => fn2(anchor, [root_index + 1, hydrate_index]));
      }
      if (consequent_effect) {
        pause_effect(consequent_effect, () => {
          consequent_effect = null;
        });
      }
    }
  };
  block(() => {
    has_branch = false;
    fn(set_branch);
    if (!has_branch) {
      update_branch(null, null);
    }
  }, flags);
}
const whitespace = [..." 	\n\r\f \v\uFEFF"];
function to_class(value, hash, directives) {
  var classname = "" + value;
  if (directives) {
    for (var key in directives) {
      if (directives[key]) {
        classname = classname ? classname + " " + key : key;
      } else if (classname.length) {
        var len = key.length;
        var a = 0;
        while ((a = classname.indexOf(key, a)) >= 0) {
          var b = a + len;
          if ((a === 0 || whitespace.includes(classname[a - 1])) && (b === classname.length || whitespace.includes(classname[b]))) {
            classname = (a === 0 ? "" : classname.substring(0, a)) + classname.substring(b + 1);
          } else {
            a = b;
          }
        }
      }
    }
  }
  return classname === "" ? null : classname;
}
function to_style(value, styles) {
  return value == null ? null : String(value);
}
function set_class(dom, is_html, value, hash, prev_classes, next_classes) {
  var prev = dom.__className;
  if (prev !== value || prev === void 0) {
    var next_class_name = to_class(value, hash, next_classes);
    {
      if (next_class_name == null) {
        dom.removeAttribute("class");
      } else {
        dom.className = next_class_name;
      }
    }
    dom.__className = value;
  } else if (next_classes && prev_classes !== next_classes) {
    for (var key in next_classes) {
      var is_present = !!next_classes[key];
      if (prev_classes == null || is_present !== !!prev_classes[key]) {
        dom.classList.toggle(key, is_present);
      }
    }
  }
  return next_classes;
}
function set_style(dom, value, prev_styles, next_styles) {
  var prev = dom.__style;
  if (prev !== value) {
    var next_style_attr = to_style(value);
    {
      if (next_style_attr == null) {
        dom.removeAttribute("style");
      } else {
        dom.style.cssText = next_style_attr;
      }
    }
    dom.__style = value;
  }
  return next_styles;
}
function has_destroyed_component_ctx(current_value) {
  var _a;
  return ((_a = current_value.ctx) == null ? void 0 : _a.d) ?? false;
}
function prop(props, key, flags, fallback) {
  var fallback_value = (
    /** @type {V} */
    fallback
  );
  var fallback_dirty = true;
  var get_fallback = () => {
    if (fallback_dirty) {
      fallback_dirty = false;
      fallback_value = /** @type {V} */
      fallback;
    }
    return fallback_value;
  };
  {
    props[key];
  }
  var getter;
  {
    getter = () => {
      var value = (
        /** @type {V} */
        props[key]
      );
      if (value === void 0) return get_fallback();
      fallback_dirty = true;
      return value;
    };
  }
  var d = derived(getter);
  return function(value, mutation) {
    if (arguments.length > 0) {
      const new_value = mutation ? get(d) : value;
      set(d, new_value);
      if (fallback_value !== void 0) {
        fallback_value = new_value;
      }
      return value;
    }
    if (has_destroyed_component_ctx(d)) {
      return d.v;
    }
    return get(d);
  };
}
var root_1 = from_html(`<p>[No time tracked in Toggl]</p>`);
var on_click = (_, onItemClick, item) => onItemClick(get(item));
var on_keydown = (event, onItemClick, item) => {
  if (event.key === "Enter") {
    onItemClick(get(item));
  }
};
var root_3 = from_html(`<div role="button"><h4 class="svelte-1b6lxs"> </h4> <p class="svelte-1b6lxs"> </p></div>`);
var root_2 = from_html(`<!> <h3 class="total svelte-1b6lxs"> </h3>`, 1);
var root$1 = from_html(`<div id="toggl_report" class="report-panel svelte-1b6lxs"><!></div>`);
const $$css$1 = {
  hash: "svelte-1b6lxs",
  code: ".report-panel.svelte-1b6lxs {position:relative;top:0;left:0;width:360px;z-index:100;padding:1rem;background:white;border:1px solid gray;border-radius:3px;text-transform:none;font-family:Roboto, sans-serif;font-size:0.875rem;font-weight:400;}.report-item.svelte-1b6lxs {cursor:pointer;margin:0.5rem;}h4.svelte-1b6lxs {font-weight:900;margin-bottom:0;}.total.svelte-1b6lxs {margin:0.5rem;font-weight:900;}.clicked.svelte-1b6lxs h4:where(.svelte-1b6lxs), .clicked.svelte-1b6lxs p:where(.svelte-1b6lxs) {color:lightgray;}"
};
function ReportPanel($$anchor, $$props) {
  push($$props, true);
  append_styles($$anchor, $$css$1);
  let clickedItems = /* @__PURE__ */ new Set();
  let totalSeconds = $$props.report.reduce((acc, item) => acc + item.seconds, 0);
  function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(seconds % 3600 / 60);
    return `${hours}:${minutes.toString().padStart(2, "0")}`;
  }
  function onItemClick(item) {
  }
  var div = root$1();
  var node = child(div);
  {
    var consequent = ($$anchor2) => {
      var p = root_1();
      append($$anchor2, p);
    };
    var alternate = ($$anchor2) => {
      var fragment = root_2();
      var node_1 = first_child(fragment);
      each(node_1, 17, () => $$props.report, index, ($$anchor3, item, index2) => {
        var div_1 = root_3();
        const itemId = user_derived(() => {
          var _a;
          return `${$$props.date}_${(_a = get(item).project) == null ? void 0 : _a.id}`;
        });
        const isClicked = user_derived(() => clickedItems.has(get(itemId)));
        let classes;
        set_attribute(div_1, "tabindex", index2);
        div_1.__click = [on_click, onItemClick, item];
        div_1.__keydown = [on_keydown, onItemClick, item];
        var h4 = child(div_1);
        var text = child(h4);
        var p_1 = sibling(h4, 2);
        var text_1 = child(p_1);
        template_effect(
          ($0, $1) => {
            var _a, _b, _c;
            classes = set_class(div_1, 1, "report-item svelte-1b6lxs", null, classes, $0);
            set_style(h4, `color: ${(get(isClicked) ? "lightgray" : get(item).color) ?? ""}`);
            set_text(text, `${$1 ?? ""} •
                    ${((_a = get(item).project) == null ? void 0 : _a.name) || "Unknown Project"} •
                    ${(((_c = (_b = get(item).project) == null ? void 0 : _b.client) == null ? void 0 : _c.name) || "") ?? ""}`);
            set_style(p_1, `color: ${get(isClicked) ? "lightgray" : "black"}`);
            set_text(text_1, get(item).description);
          },
          [
            () => ({ clicked: get(isClicked) }),
            () => formatDuration(get(item).seconds)
          ]
        );
        append($$anchor3, div_1);
      });
      var h3 = sibling(node_1, 2);
      var text_2 = child(h3);
      template_effect(($0) => set_text(text_2, $0), [() => formatDuration(totalSeconds)]);
      append($$anchor2, fragment);
    };
    if_block(node, ($$render) => {
      if ($$props.report.length === 0) $$render(consequent);
      else $$render(alternate, false);
    });
  }
  append($$anchor, div);
  pop();
}
delegate(["click", "keydown"]);
function onClick(_, panelVisible) {
  panelVisible(!panelVisible());
}
var root = from_html(`<button id="toggl_button" class="svelte-f9irs4">Toggl</button> <!>`, 1);
const $$css = {
  hash: "svelte-f9irs4",
  code: "button.svelte-f9irs4 {display:block;margin-top:1.5rem;cursor:pointer;}"
};
function TogglButton($$anchor, $$props) {
  append_styles($$anchor, $$css);
  let panelVisible = prop($$props, "panelVisible");
  function onDocumentClick(event) {
    const panel = document.getElementById("toggl_report");
    if (panel && !panel.contains(event.target) && event.target !== document.getElementById("toggl_button")) {
      panelVisible(false);
    }
  }
  document.addEventListener("click", onDocumentClick);
  var fragment = root();
  var button = first_child(fragment);
  button.__click = [onClick, panelVisible];
  var node = sibling(button, 2);
  {
    var consequent = ($$anchor2) => {
      ReportPanel($$anchor2, { report: [], date: "TEST" });
    };
    if_block(node, ($$render) => {
      if (panelVisible()) $$render(consequent);
    });
  }
  append($$anchor, fragment);
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
  togglInit
};
//# sourceMappingURL=content.js.map
