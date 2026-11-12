import { configured, supabase } from "./core/supabase.js";
import { resolveAuthRedirectUrl } from "./core/auth-redirect.js";
import { modules } from "./modules/registry.js";
import { listRecords, createRecord, createOrganization, getOrganizations } from "./data/records.js";
import { validate } from "./domain/workflow.js";
import { dashboard } from "./modules/dashboard.js";

const root = document.querySelector("#app");
const state = { user: null, org: null, route: location.hash.slice(1) || "dashboard" };

const el = (tag, attrs = {}, children = []) => {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "text") node.textContent = value;
    else if (key === "className") node.className = value;
    else if (key.startsWith("on")) node.addEventListener(key.slice(2).toLowerCase(), value);
    else if (value != null) node.setAttribute(key, value);
  }
  for (const child of children) {
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
};

const msg = (node, text) => { node.textContent = text; };

function authScreen() {
  root.replaceChildren();
  const card = el("section", { className: "auth-card" });
  card.append(
    el("div", { className: "brand large" }, [
      el("span", { className: "brand-mark", text: "K" }),
      el("span", { text: "KairoSphere" })
    ]),
    el("p", { className: "eyebrow", text: "INDUSTRIAL TRADE OPERATIONS" }),
    el("h1", { text: "The supply chain, in one workspace." }),
    el("p", { className: "muted", text: "Supplier intelligence, sourcing, procurement, receiving and inventory control." })
  );
  const form = el("form", { className: "auth-form" });
  const email = el("input", { type: "email", name: "email", placeholder: "Email", required: "required" });
  const password = el("input", { type: "password", name: "password", placeholder: "Password", minlength: "8", required: "required" });
  const submit = el("button", { className: "primary", type: "submit", text: "Sign in" });
  const toggle = el("button", { className: "text-button", type: "button", text: "Create account" });
  const feedback = el("p", { className: "feedback" });
  let mode = "signin";
  toggle.addEventListener("click", () => {
    mode = mode === "signin" ? "signup" : "signin";
    submit.textContent = mode === "signup" ? "Create account" : "Sign in";
    toggle.textContent = mode === "signup" ? "Back to sign in" : "Create account";
  });
  form.append(email, password, submit, toggle, feedback);
  form.addEventListener("submit", async event => {
    event.preventDefault();
    submit.disabled = true;
    try {
      const credentials = { email: email.value.trim(), password: password.value };
      const result = mode === "signup"
        ? await supabase.auth.signUp({ ...credentials, options: { emailRedirectTo: resolveAuthRedirectUrl(import.meta.env.VITE_AUTH_REDIRECT_URL) } })
        : await supabase.auth.signInWithPassword(credentials);
      if (result.error) throw result.error;
      if (mode === "signup" && !result.data.session) msg(feedback, "Verify your email, then sign in.");
    } catch (error) {
      msg(feedback, error.message);
    } finally {
      submit.disabled = false;
    }
  });
  card.append(form);
  root.append(el("div", { className: "auth-shell" }, [card]));
}

function organizationScreen() {
  root.replaceChildren();
  const card = el("section", { className: "auth-card" });
  card.append(
    el("div", { className: "brand large" }, [
      el("span", { className: "brand-mark", text: "K" }),
      el("span", { text: "KairoSphere" })
    ]),
    el("p", { className: "eyebrow", text: "WORKSPACE INITIALIZATION" }),
    el("h1", { text: "Create your organization" }),
    el("p", { className: "muted", text: "Operational records will be isolated inside this organization." })
  );
  const form = el("form", { className: "auth-form" });
  const name = el("input", { name: "name", placeholder: "Organization name", required: "required", maxlength: "140" });
  const submit = el("button", { className: "primary", type: "submit", text: "Create workspace" });
  const feedback = el("p", { className: "feedback" });
  form.append(name, submit, feedback);
  form.addEventListener("submit", async event => {
    event.preventDefault();
    submit.disabled = true;
    try {
      await createOrganization(supabase, name.value.trim(), state.user.id);
      await loadWorkspace();
    } catch (error) {
      msg(feedback, error.message);
    } finally {
      submit.disabled = false;
    }
  });
  card.append(form);
  root.append(el("div", { className: "auth-shell" }, [card]));
}

function shell() {
  root.replaceChildren();
  const frame = el("div", { className: "frame" });
  const side = el("aside", { className: "sidebar" });
  side.append(
    el("a", { className: "brand", href: "#dashboard" }, [
      el("span", { className: "brand-mark", text: "K" }),
      el("span", { text: "KairoSphere" })
    ]),
    el("p", { className: "side-label", text: "OPERATIONS" })
  );
  const nav = el("nav", { className: "nav" });
  for (const [key, item] of Object.entries(modules)) {
    nav.append(el("a", { className: `nav-link${state.route === key ? " active" : ""}`, href: `#${key}` }, [
      el("span", { className: "nav-icon", text: item.icon }),
      el("span", { text: item.label })
    ]));
  }
  side.append(nav, el("div", { className: "side-foot" }, [
    el("span", { text: state.org?.name || "Workspace" }),
    el("button", { className: "text-button", text: "Sign out", onClick: () => supabase.auth.signOut() })
  ]));
  const main = el("main", { className: "main" });
  main.append(
    el("header", { className: "topbar" }, [
      el("strong", { text: modules[state.route]?.label || "Overview" }),
      el("span", { className: "user", text: state.user?.email || "" })
    ]),
    el("section", { className: "content", id: "content" })
  );
  frame.append(side, main);
  root.append(frame);
}

function field(spec) {
  const label = el("label", { className: "field" });
  label.append(el("span", { text: `${spec.label}${spec.required ? " *" : ""}` }));
  let input;
  if (spec.type === "textarea") {
    input = el("textarea", { name: spec.name, required: spec.required ? "required" : null, rows: "3" });
  } else if (spec.type === "select") {
    input = el("select", { name: spec.name });
    for (const option of spec.options) {
      input.append(el("option", { value: option, text: option.replaceAll("_", " ") }));
    }
  } else {
    input = el("input", {
      name: spec.name,
      type: spec.type || "text",
      required: spec.required ? "required" : null,
      min: spec.min,
      max: spec.max,
      maxlength: spec.maxLength,
      step: spec.step
    });
  }
  label.append(input);
  return label;
}

async function moduleView(key) {
  const item = modules[key];
  if (!item) throw new Error("Unknown workspace module.");
  const panel = el("div", { className: "panel" });
  if (key === "dashboard") {
    panel.innerHTML = await dashboard(supabase, state.org.id);
    return panel;
  }
  panel.append(el("div", { className: "section-head" }, [
    el("div", {}, [
      el("p", { className: "eyebrow", text: "WORKFLOW REGISTER" }),
      el("h1", { text: item.label }),
      el("p", { className: "muted", text: item.description })
    ])
  ]));
  const layout = el("div", { className: "module-layout" });
  const records = el("div", { className: "records" });
  if (!item.readOnly) {
    const form = el("form", { className: "record-form" });
    const feedback = el("p", { className: "feedback" });
    for (const spec of item.fields) form.append(field(spec));
    const submit = el("button", { className: "primary", type: "submit", text: "Create record" });
    form.append(submit, feedback);
    form.addEventListener("submit", async event => {
      event.preventDefault();
      submit.disabled = true;
      try {
        const raw = Object.fromEntries(new FormData(form));
        await createRecord(supabase, item.table, state.org.id, state.user.id, validate(key, raw));
        form.reset();
        msg(feedback, "Record created.");
        await render();
      } catch (error) {
        msg(feedback, error.message);
      } finally {
        submit.disabled = false;
      }
    });
    layout.append(records, el("aside", { className: "form-panel" }, [
      el("p", { className: "eyebrow", text: "NEW RECORD" }),
      el("h2", { text: `Add ${item.label.toLowerCase()}` }),
      form
    ]));
  } else {
    layout.append(records, el("aside", { className: "form-panel" }, [
      el("p", { className: "eyebrow", text: "LEDGER CONTROL" }),
      el("h2", { text: "Posting is controlled" }),
      el("p", { className: "muted", text: "Read-only movement history. Receipt posting, issues and adjustments are not yet automated; stock balances are derived only from movements already recorded. Direct stock edits are disabled." })
    ]));
  }
  try {
    const rows = await listRecords(supabase, item.table, state.org.id, item.orderBy);
    if (!rows.length) {
      records.append(el("p", { className: "empty", text: "No records yet." }));
    } else {
      const table = el("table");
      const header = el("tr");
      for (const column of item.columns) header.append(el("th", { text: column[1] }));
      table.append(el("thead", {}, [header]));
      const body = el("tbody");
      for (const row of rows) {
        const tr = el("tr");
        for (const column of item.columns) {
          const value = row[column[0]];
          tr.append(el("td", { text: typeof value === "boolean" ? (value ? "Yes" : "No") : value ?? "—" }));
        }
        body.append(tr);
      }
      table.append(body);
      records.append(el("div", { className: "table-scroll" }, [table]));
    }
  } catch (error) {
    records.append(el("p", { className: "notice error", text: error.message }));
  }
  panel.append(layout);
  return panel;
}

async function render() {
  const target = document.querySelector("#content");
  if (!target) return;
  target.replaceChildren(el("p", { className: "muted", text: "Loading…" }));
  try {
    target.replaceChildren(await moduleView(state.route));
  } catch (error) {
    target.replaceChildren(el("p", { className: "notice error", text: error.message }));
  }
}

async function loadWorkspace() {
  const organizations = await getOrganizations(supabase);
  state.org = organizations[0] || null;
  if (!state.org) {
    organizationScreen();
    return;
  }
  shell();
  await render();
}

async function start(user) {
  state.user = user;
  if (!user) {
    state.org = null;
    authScreen();
    return;
  }
  try {
    await loadWorkspace();
  } catch (error) {
    root.replaceChildren(el("p", { className: "notice error", text: error.message }));
  }
}

window.addEventListener("hashchange", () => {
  state.route = location.hash.slice(1) || "dashboard";
  if (state.user && state.org) {
    shell();
    void render();
  }
});

async function boot() {
  if (!configured) {
    root.textContent = "Supabase configuration is required.";
    return;
  }
  const { data: { session } } = await supabase.auth.getSession();
  await start(session?.user || null);
  supabase.auth.onAuthStateChange((_event, session) => queueMicrotask(() => void start(session?.user || null)));
}

void boot();
