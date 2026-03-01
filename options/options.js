import { DEFAULT_TEMPLATES, TEMPLATE_CATEGORIES } from "../shared/constants.js";
import { getTemplates, saveTemplates, getSettings, saveSettings, getOpenAIKey, saveOpenAIKey, getGrokKey, saveGrokKey, getGeminiKey, saveGeminiKey } from "../shared/storage.js";

// ─── State ────────────────────────────────────────────────────────────────────
let templates = [];
let settings  = {};
let editingId  = null;
let searchQuery = "";

// ─── DOM refs ─────────────────────────────────────────────────────────────────
const defaultTplEl    = document.getElementById("default-template");
const providerSeg     = document.getElementById("provider-segmented");
const themeSeg        = document.getElementById("theme-segmented");
const btnSaveSettings = document.getElementById("btn-save-settings");
const settingsSaved   = document.getElementById("settings-saved");
const navAiWarning    = document.getElementById("nav-ai-warning");

const templateSearch  = document.getElementById("template-search");
const templateList    = document.getElementById("template-list");
const btnNewTemplate  = document.getElementById("btn-new-template");

const modalOverlay    = document.getElementById("modal-overlay");
const modalTitle      = document.getElementById("modal-title");
const modalName       = document.getElementById("modal-name");
const modalPrompt     = document.getElementById("modal-prompt");
const modalCancel     = document.getElementById("modal-cancel");
const modalClose      = document.getElementById("modal-close");
const modalSave       = document.getElementById("modal-save");

// ─── Tab switching ────────────────────────────────────────────────────────────
document.querySelectorAll(".nav-item").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach((n) => n.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach((p) => p.classList.add("hidden"));
    btn.classList.add("active");
    document.getElementById(`tab-${btn.dataset.tab}`).classList.remove("hidden");
    // FAB only on Prompt Library tab
    btnNewTemplate.classList.toggle("hidden", btn.dataset.tab !== "prompt-library");
  });
});

// ─── Segmented control helper ─────────────────────────────────────────────────
function initSegmented(container, value, onChange) {
  container.querySelectorAll(".seg-btn").forEach((btn) => {
    if (btn.dataset.value === value) btn.classList.add("active");
    btn.addEventListener("click", () => {
      container.querySelectorAll(".seg-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      onChange(btn.dataset.value);
    });
  });
}

function getSegmentedValue(container) {
  return container.querySelector(".seg-btn.active")?.dataset.value;
}

// ─── Init ─────────────────────────────────────────────────────────────────────
async function init() {
  [templates, settings] = await Promise.all([getTemplates(), getSettings()]);
  applyTheme(settings.theme ?? "dark");
  renderSettingsForm();
  renderTemplateList();
  await loadApiKeyStatuses();
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

// ─── Settings form ────────────────────────────────────────────────────────────
function renderSettingsForm() {
  renderDefaultTemplateSelect();
  initSegmented(providerSeg, settings.llmProvider ?? "openai", () => {});
  initSegmented(themeSeg, settings.theme ?? "dark", (val) => applyTheme(val));
}

function renderDefaultTemplateSelect() {
  defaultTplEl.innerHTML = "";

  const grouped = {};
  for (const cat of TEMPLATE_CATEGORIES) grouped[cat] = [];
  templates.forEach((t) => {
    const cat = t.category ?? "General";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(t);
  });

  [...TEMPLATE_CATEGORIES, "Custom"].forEach((cat) => {
    const list = grouped[cat];
    if (!list?.length) return;
    const group = document.createElement("optgroup");
    group.label = cat;
    list.forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t.id;
      opt.textContent = t.name;
      if (t.id === settings.defaultTemplateId) opt.selected = true;
      group.appendChild(opt);
    });
    defaultTplEl.appendChild(group);
  });
}

btnSaveSettings.addEventListener("click", async () => {
  await saveSettings({
    defaultTemplateId: defaultTplEl.value,
    theme: getSegmentedValue(themeSeg) ?? "dark",
    llmProvider: getSegmentedValue(providerSeg) ?? "openai",
  });
  settings = await getSettings();
  flash(settingsSaved);
});

// ─── API key status ───────────────────────────────────────────────────────────
function flash(el) {
  el.classList.remove("hidden");
  setTimeout(() => el.classList.add("hidden"), 2000);
}

async function loadApiKeyStatuses() {
  const [oaiKey, gemKey, grkKey] = await Promise.all([
    getOpenAIKey(), getGeminiKey(), getGrokKey(),
  ]);
  setBadge("badge-openai", !!oaiKey);
  setBadge("badge-gemini", !!gemKey);
  setBadge("badge-grok",   !!grkKey);
  navAiWarning.classList.toggle("hidden", !!(oaiKey && gemKey && grkKey));
}

function setBadge(id, connected) {
  const badge = document.getElementById(id);
  if (!badge) return;
  badge.textContent = connected ? "Connected" : "Not Configured";
  badge.className = "status-badge " + (connected ? "connected" : "unconfigured");
}

function wireKeySection({ inputId, toggleId, saveId, clearId, savedId, getKey, saveKey }) {
  const inputEl  = document.getElementById(inputId);
  const toggleEl = document.getElementById(toggleId);
  const saveEl   = document.getElementById(saveId);
  const clearEl  = document.getElementById(clearId);
  const savedEl  = document.getElementById(savedId);

  getKey().then((k) => { if (k) inputEl.value = k; });

  toggleEl.addEventListener("click", () => {
    inputEl.type = inputEl.type === "password" ? "text" : "password";
  });

  saveEl.addEventListener("click", async () => {
    await saveKey(inputEl.value.trim());
    await loadApiKeyStatuses();
    flash(savedEl);
  });

  clearEl.addEventListener("click", async () => {
    inputEl.value = "";
    await saveKey("");
    await loadApiKeyStatuses();
    flash(savedEl);
  });
}

wireKeySection({
  inputId: "openai-key",  toggleId: "btn-toggle-key",
  saveId:  "btn-save-key", clearId: "btn-clear-key", savedId: "key-saved",
  getKey: getOpenAIKey, saveKey: saveOpenAIKey,
});

wireKeySection({
  inputId: "gemini-key",        toggleId: "btn-toggle-gemini-key",
  saveId:  "btn-save-gemini-key", clearId: "btn-clear-gemini-key", savedId: "gemini-key-saved",
  getKey: getGeminiKey, saveKey: saveGeminiKey,
});

wireKeySection({
  inputId: "grok-key",        toggleId: "btn-toggle-grok-key",
  saveId:  "btn-save-grok-key", clearId: "btn-clear-grok-key", savedId: "grok-key-saved",
  getKey: getGrokKey, saveKey: saveGrokKey,
});

// ─── Template list ────────────────────────────────────────────────────────────
function renderTemplateList() {
  templateList.innerHTML = "";

  const q = searchQuery.toLowerCase();

  const grouped = {};
  for (const cat of TEMPLATE_CATEGORIES) grouped[cat] = [];

  templates.forEach((t) => {
    if (q && !t.name.toLowerCase().includes(q) && !t.prompt.toLowerCase().includes(q)) return;
    const cat = t.category ?? "Custom";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(t);
  });

  const allCats = [...TEMPLATE_CATEGORIES, "Custom"];
  let totalShown = 0;

  allCats.forEach((cat) => {
    const list = grouped[cat];
    if (!list?.length) return;
    totalShown += list.length;

    const section = document.createElement("div");
    section.className = "template-category open";

    const toggle = document.createElement("button");
    toggle.className = "category-toggle";
    toggle.setAttribute("type", "button");
    toggle.innerHTML = `
      ${escHtml(cat)}
      <span class="category-count">${list.length}</span>
      <svg class="category-chevron" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M5 7.5l5 5 5-5"/>
      </svg>
    `;
    toggle.addEventListener("click", () => section.classList.toggle("open"));

    const items = document.createElement("div");
    items.className = "category-items";

    list.forEach((t) => {
      const isBuiltin = DEFAULT_TEMPLATES.some((d) => d.id === t.id);
      const previewText = t.prompt.replace(/\n/g, " ").slice(0, 90) + (t.prompt.length > 90 ? "…" : "");

      const item = document.createElement("div");
      item.className = "template-item";
      item.innerHTML = `
        <div class="template-item-info">
          <div class="template-name">
            ${escHtml(t.name)}
            ${isBuiltin ? '<span class="template-badge">built-in</span>' : ""}
          </div>
          <div class="template-preview">${escHtml(previewText)}</div>
        </div>
        <div class="template-actions">
          <button class="btn btn-ghost btn-sm btn-edit" data-id="${t.id}" type="button">Edit</button>
          <button class="btn btn-danger btn-delete" data-id="${t.id}" type="button">Delete</button>
        </div>
      `;
      items.appendChild(item);
    });

    section.appendChild(toggle);
    section.appendChild(items);
    templateList.appendChild(section);
  });

  if (totalShown === 0) {
    const empty = document.createElement("div");
    empty.className = "no-results";
    empty.textContent = q ? `No templates matching "${q}"` : "No templates yet.";
    templateList.appendChild(empty);
  }

  templateList.querySelectorAll(".btn-edit").forEach((btn) => {
    btn.addEventListener("click", () => openModal(btn.dataset.id));
  });
  templateList.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", () => deleteTemplate(btn.dataset.id));
  });
}

templateSearch.addEventListener("input", (e) => {
  searchQuery = e.target.value.trim();
  renderTemplateList();
});

// ─── Template CRUD ────────────────────────────────────────────────────────────
btnNewTemplate.addEventListener("click", () => openModal(null));

function openModal(templateId) {
  editingId = templateId;
  const t = templateId ? templates.find((x) => x.id === templateId) : null;
  modalTitle.textContent = t ? "Edit Template" : "New Template";
  modalName.value   = t?.name   ?? "";
  modalPrompt.value = t?.prompt ?? "{content}";
  modalOverlay.classList.remove("hidden");
  modalName.focus();
}

function closeModal() {
  modalOverlay.classList.add("hidden");
  editingId = null;
}

modalCancel.addEventListener("click", closeModal);
modalClose.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

// Placeholder chips insert at cursor
document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    const ph    = chip.dataset.placeholder;
    const start = modalPrompt.selectionStart;
    const end   = modalPrompt.selectionEnd;
    const val   = modalPrompt.value;
    modalPrompt.value = val.slice(0, start) + ph + val.slice(end);
    modalPrompt.focus();
    modalPrompt.setSelectionRange(start + ph.length, start + ph.length);
  });
});

modalSave.addEventListener("click", async () => {
  const name   = modalName.value.trim();
  const prompt = modalPrompt.value.trim();
  if (!name)   { modalName.focus();   return; }
  if (!prompt) { modalPrompt.focus(); return; }

  if (editingId) {
    templates = templates.map((t) =>
      t.id === editingId ? { ...t, name, prompt } : t
    );
  } else {
    templates.push({ id: crypto.randomUUID(), name, prompt, isDefault: false });
  }

  await saveTemplates(templates);
  renderTemplateList();
  renderDefaultTemplateSelect();
  closeModal();
});

async function deleteTemplate(id) {
  if (!confirm("Delete this template?")) return;
  templates = templates.filter((t) => t.id !== id);
  await saveTemplates(templates);
  renderTemplateList();
  renderDefaultTemplateSelect();
}

// ─── Utils ────────────────────────────────────────────────────────────────────
function escHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ─── Start ────────────────────────────────────────────────────────────────────
init().catch((err) => console.error("[Synto] Init failed:", err));
