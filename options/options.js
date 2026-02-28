import { DEFAULT_TEMPLATES, TEMPLATE_CATEGORIES } from "../shared/constants.js";
import { getTemplates, saveTemplates, getSettings, saveSettings, getOpenAIKey, saveOpenAIKey, getGrokKey, saveGrokKey, getGeminiKey, saveGeminiKey } from "../shared/storage.js";

// ─── State ────────────────────────────────────────────────────────────────────
let templates = [];
let settings = {};
let editingId = null; // null = new template

// ─── DOM refs ─────────────────────────────────────────────────────────────────
const defaultTplEl     = document.getElementById("default-template");
const themeToggleEl    = document.getElementById("theme-toggle");
const llmProviderEl    = document.getElementById("llm-provider");
const btnSaveSettings  = document.getElementById("btn-save-settings");
const settingsSaved    = document.getElementById("settings-saved");
const btnNewTemplate   = document.getElementById("btn-new-template");
const templateList     = document.getElementById("template-list");

const modalOverlay     = document.getElementById("modal-overlay");
const modalTitle       = document.getElementById("modal-title");
const modalName        = document.getElementById("modal-name");
const modalPrompt      = document.getElementById("modal-prompt");
const modalCancel      = document.getElementById("modal-cancel");
const modalSave        = document.getElementById("modal-save");

// ─── Init ─────────────────────────────────────────────────────────────────────
async function init() {
  [templates, settings] = await Promise.all([getTemplates(), getSettings()]);
  applyTheme(settings.theme ?? "dark");
  renderSettingsForm();
  renderTemplateList();
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

// ─── Settings form ────────────────────────────────────────────────────────────
function renderSettingsForm() {
  themeToggleEl.checked = (settings.theme ?? "dark") === "light";
  llmProviderEl.value = settings.llmProvider ?? "openai";
  renderDefaultTemplateSelect();
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
    theme: themeToggleEl.checked ? "light" : "dark",
    llmProvider: llmProviderEl.value,
  });
  settingsSaved.classList.remove("hidden");
  setTimeout(() => settingsSaved.classList.add("hidden"), 2000);
});

themeToggleEl.addEventListener("change", () => {
  applyTheme(themeToggleEl.checked ? "light" : "dark");
});

// ─── Template list ────────────────────────────────────────────────────────────
function renderTemplateList() {
  templateList.innerHTML = "";
  templates.forEach((t) => {
    const item = document.createElement("div");
    item.className = "template-item";
    item.dataset.id = t.id;

    const isBuiltin = DEFAULT_TEMPLATES.some((d) => d.id === t.id);
    const previewText = t.prompt.replace(/\n/g, " ").slice(0, 80) + (t.prompt.length > 80 ? "…" : "");
    const category = t.category ?? "";

    item.innerHTML = `
      <div class="template-item-info">
        <div class="template-name">
          ${escHtml(t.name)}
          ${category ? `<span class="template-badge">${escHtml(category)}</span>` : ""}
          ${isBuiltin ? '<span class="template-badge">built-in</span>' : ""}
        </div>
        <div class="template-preview">${escHtml(previewText)}</div>
      </div>
      <div class="template-actions">
        <button class="btn btn-secondary btn-edit" data-id="${t.id}">Edit</button>
        <button class="btn btn-danger btn-delete" data-id="${t.id}">Delete</button>
      </div>
    `;
    templateList.appendChild(item);
  });

  templateList.querySelectorAll(".btn-edit").forEach((btn) => {
    btn.addEventListener("click", () => openModal(btn.dataset.id));
  });
  templateList.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", () => deleteTemplate(btn.dataset.id));
  });
}

// ─── Template CRUD ────────────────────────────────────────────────────────────
btnNewTemplate.addEventListener("click", () => openModal(null));

function openModal(templateId) {
  editingId = templateId;
  const t = templateId ? templates.find((x) => x.id === templateId) : null;
  modalTitle.textContent = t ? "Edit Template" : "New Template";
  modalName.value = t?.name ?? "";
  modalPrompt.value = t?.prompt ?? "{content}";
  modalOverlay.classList.remove("hidden");
  modalName.focus();
}

function closeModal() {
  modalOverlay.classList.add("hidden");
  editingId = null;
}

modalCancel.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

modalSave.addEventListener("click", async () => {
  const name = modalName.value.trim();
  const prompt = modalPrompt.value.trim();
  if (!name) { modalName.focus(); return; }
  if (!prompt) { modalPrompt.focus(); return; }

  if (editingId) {
    // Update existing
    templates = templates.map((t) =>
      t.id === editingId ? { ...t, name, prompt } : t
    );
  } else {
    // Create new
    templates.push({
      id: crypto.randomUUID(),
      name,
      prompt,
      isDefault: false,
    });
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

// ─── API key helper ───────────────────────────────────────────────────────────
function wireKeySection({ inputId, toggleId, saveId, clearId, savedId, getKey, saveKey }) {
  const inputEl  = document.getElementById(inputId);
  const toggleEl = document.getElementById(toggleId);
  const saveEl   = document.getElementById(saveId);
  const clearEl  = document.getElementById(clearId);
  const savedEl  = document.getElementById(savedId);

  getKey().then((k) => { if (k) inputEl.value = k; });

  toggleEl.addEventListener("click", () => {
    const isPassword = inputEl.type === "password";
    inputEl.type = isPassword ? "text" : "password";
    toggleEl.textContent = isPassword ? "Hide" : "Show";
  });

  const flash = () => {
    savedEl.classList.remove("hidden");
    setTimeout(() => savedEl.classList.add("hidden"), 2000);
  };

  saveEl.addEventListener("click", async () => {
    await saveKey(inputEl.value.trim());
    flash();
  });

  clearEl.addEventListener("click", async () => {
    inputEl.value = "";
    await saveKey("");
    flash();
  });
}

wireKeySection({
  inputId: "openai-key", toggleId: "btn-toggle-key",
  saveId: "btn-save-key", clearId: "btn-clear-key", savedId: "key-saved",
  getKey: getOpenAIKey, saveKey: saveOpenAIKey,
});

wireKeySection({
  inputId: "gemini-key", toggleId: "btn-toggle-gemini-key",
  saveId: "btn-save-gemini-key", clearId: "btn-clear-gemini-key", savedId: "gemini-key-saved",
  getKey: getGeminiKey, saveKey: saveGeminiKey,
});

wireKeySection({
  inputId: "grok-key", toggleId: "btn-toggle-grok-key",
  saveId: "btn-save-grok-key", clearId: "btn-clear-grok-key", savedId: "grok-key-saved",
  getKey: getGrokKey, saveKey: saveGrokKey,
});

// ─── Start ────────────────────────────────────────────────────────────────────
init().catch((err) => console.error("[APC Options] Init failed:", err));
