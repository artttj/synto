import { MSG, TEMPLATE_CATEGORIES, TOKEN_THRESHOLDS, estimateTokens, tokenColorClass } from "../shared/constants.js";
import {
  getTemplates, getSettings, saveSettings,
  getOpenAIKey, getGrokKey, getGeminiKey,
} from "../shared/storage.js";

// ─── Provider → model map ─────────────────────────────────────────────────────
const PROVIDER_MODELS = {
  openai: "gpt-4o-mini",
  gemini: "gemini-2.0-flash",
  grok:   "grok-3-mini",
};

const PROVIDER_LABELS = {
  openai: "Run with ChatGPT",
  gemini: "Run with Gemini",
  grok:   "Run with Grok",
};

// ─── State ────────────────────────────────────────────────────────────────────
const state = {
  templates:          [],
  selectedTemplateId: null,
  extracted:          null,   // { content, selection, title, url, ... }
  rawMarkdown:        "",     // extracted.content with no template applied
  finalText:          "",     // template applied
  previewOpen:        true,
  chatStreaming:      false,
  llmProvider:        "openai",
  sourceAnchoring:    false,
  mergeMode:          false,
  allTabs:            [],     // [{id, title, url, active}] for merge list
};

// ─── DOM refs ─────────────────────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);

const btnOptions       = $("btn-options");
const templateSelect   = $("template-select");
const chkSourceAnch    = $("chk-source-anchoring");
const chkMergeMode     = $("chk-merge-mode");
const mergePanel       = $("merge-panel");
const mergeTabList     = $("merge-tab-list");
const errorMsg         = $("error-msg");
const tokenRow         = $("token-row");
const tokenCount       = $("token-count");
const tokenWarning     = $("token-warning");
const previewPanel     = $("preview-panel");
const previewText      = $("preview-text");
const btnPreviewToggle = $("btn-preview-toggle");
const previewArrow     = $("preview-arrow");
const actionRow        = document.querySelector(".action-row");
const btnCopyMd        = $("btn-copy-md");
const btnCopyPrompt    = $("btn-copy-prompt");
const copyStatus       = $("copy-status");
const btnProcess       = $("btn-process");
const chatPanel        = $("chat-panel");
const chatNoKey        = $("chat-no-key");
const chatOptionsLink  = $("chat-options-link");
const chatMessages     = $("chat-messages");

// ─── Init ─────────────────────────────────────────────────────────────────────
async function init() {
  const [templates, settings] = await Promise.all([getTemplates(), getSettings()]);

  document.documentElement.dataset.theme = settings.theme ?? "dark";

  state.templates          = templates;
  state.selectedTemplateId = settings.defaultTemplateId ?? templates[0]?.id;
  state.llmProvider        = settings.llmProvider ?? "openai";
  state.sourceAnchoring    = settings.sourceAnchoring ?? false;

  chkSourceAnch.checked = state.sourceAnchoring;
  renderTemplateSelect();
  updateRunButtonLabel();

  await extractContent();
}

// ─── Template select ──────────────────────────────────────────────────────────
function renderTemplateSelect() {
  templateSelect.innerHTML = "";

  // Group templates by category; preserve declared order.
  const grouped = {};
  for (const cat of TEMPLATE_CATEGORIES) grouped[cat] = [];

  state.templates.forEach((t) => {
    const cat = t.category ?? "General";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(t);
  });

  for (const cat of TEMPLATE_CATEGORIES) {
    const list = grouped[cat];
    if (!list?.length) continue;

    const group = document.createElement("optgroup");
    group.label = cat;

    list.forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t.id;
      opt.textContent = t.name;
      if (t.id === state.selectedTemplateId) opt.selected = true;
      group.appendChild(opt);
    });

    templateSelect.appendChild(group);
  }

  // Catch any templates with unknown/custom categories.
  const knownIds = new Set(state.templates.filter(t => TEMPLATE_CATEGORIES.includes(t.category ?? "General")).map(t => t.id));
  const uncategorized = state.templates.filter(t => !knownIds.has(t.id));
  if (uncategorized.length) {
    const group = document.createElement("optgroup");
    group.label = "Custom";
    uncategorized.forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t.id;
      opt.textContent = t.name;
      if (t.id === state.selectedTemplateId) opt.selected = true;
      group.appendChild(opt);
    });
    templateSelect.appendChild(group);
  }
}

templateSelect.addEventListener("change", async () => {
  state.selectedTemplateId = templateSelect.value;
  await saveSettings({ defaultTemplateId: state.selectedTemplateId });
  applyTemplateAndUpdate();
});

// ─── Source anchoring toggle ──────────────────────────────────────────────────
chkSourceAnch.addEventListener("change", async () => {
  state.sourceAnchoring = chkSourceAnch.checked;
  await saveSettings({ sourceAnchoring: state.sourceAnchoring });
  // Re-extract so author annotations are applied (or removed).
  await extractContent();
});

// ─── Merge mode toggle ────────────────────────────────────────────────────────
chkMergeMode.addEventListener("change", async () => {
  state.mergeMode = chkMergeMode.checked;
  if (state.mergeMode) {
    await loadMergeTabs();
    mergePanel.classList.remove("hidden");
  } else {
    mergePanel.classList.add("hidden");
    // Revert to single-tab extraction.
    await extractContent();
  }
});

async function loadMergeTabs() {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  state.allTabs = tabs.filter(
    (t) => t.url && !t.url.startsWith("chrome://") && !t.url.startsWith("chrome-extension://")
  );

  mergeTabList.innerHTML = "";
  state.allTabs.forEach((tab) => {
    const item = document.createElement("div");
    item.className = "merge-tab-item" + (tab.active ? " current" : "");

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.id = `merge-tab-${tab.id}`;
    cb.value = String(tab.id);
    cb.checked = tab.active; // pre-check current tab
    cb.addEventListener("change", onMergeSelectionChange);

    const lbl = document.createElement("label");
    lbl.htmlFor = cb.id;
    lbl.textContent = tab.title || tab.url || `Tab ${tab.id}`;
    lbl.title = tab.url || "";

    item.appendChild(cb);
    item.appendChild(lbl);
    mergeTabList.appendChild(item);
  });

  await extractMerged();
}

async function onMergeSelectionChange() {
  await extractMerged();
}

async function extractMerged() {
  setError(null);
  disableActions("Merging…");
  previewPanel.classList.add("hidden");
  tokenRow.classList.add("hidden");

  const checkedIds = [...mergeTabList.querySelectorAll("input:checked")]
    .map((cb) => parseInt(cb.value));

  if (!checkedIds.length) {
    setError("Select at least one tab to merge.");
    return;
  }

  const results = await Promise.allSettled(
    checkedIds.map(async (tabId) => {
      const tab = state.allTabs.find((t) => t.id === tabId);
      const res = await chrome.tabs.sendMessage(tabId, {
        type: MSG.EXTRACT_CONTENT,
        mode: "markdown",
        sourceAnchoring: state.sourceAnchoring,
      }).catch(() => null);
      return { tab, res };
    })
  );

  const sections = [];
  const errors   = [];

  results.forEach((outcome, i) => {
    if (outcome.status === "rejected") { errors.push(`Tab ${checkedIds[i]}: failed`); return; }
    const { tab, res } = outcome.value;
    if (!res?.success) {
      errors.push(`"${tab?.title ?? "?"}": ${res?.error ?? "no content script"}`);
      return;
    }
    const label = tab?.title || tab?.url || `Source ${i + 1}`;
    sections.push(`## Source ${sections.length + 1}: ${label}\n\n${res.content}`);
  });

  if (!sections.length) {
    setError("Could not extract any content.\n" + errors.join("\n"));
    return;
  }

  const merged = sections.join("\n\n---\n\n");
  // Build a synthetic extracted object for template application.
  const firstTab = state.allTabs.find((t) => checkedIds.includes(t.id));
  state.extracted = {
    content:  merged,
    selection: "",
    title:    firstTab?.title ?? "Merged tabs",
    url:      firstTab?.url ?? "",
    excerpt: "", byline: "", siteName: "",
  };
  state.rawMarkdown = merged;

  if (errors.length) {
    setError(`Some tabs failed: ${errors.join("; ")}`);
  }

  applyTemplateAndUpdate();
}

// ─── Single-tab extraction ────────────────────────────────────────────────────
async function extractContent() {
  if (state.mergeMode) return; // merge mode has its own path

  setError(null);
  disableActions("Extracting…");
  tokenRow.classList.add("hidden");
  previewPanel.classList.add("hidden");

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab?.id || tab.url?.startsWith("chrome://") || tab.url?.startsWith("chrome-extension://")) {
      throw new Error("Cannot extract from this page type. Navigate to a regular web page.");
    }

    const response = await chrome.tabs.sendMessage(tab.id, {
      type: MSG.EXTRACT_CONTENT,
      mode: "markdown",
      sourceAnchoring: state.sourceAnchoring,
    });

    if (!response?.success) {
      throw new Error(response?.error ?? "Extraction failed.");
    }

    state.extracted   = response;
    state.rawMarkdown = response.content;
    applyTemplateAndUpdate();

  } catch (err) {
    if (err.message?.includes("Receiving end does not exist")) {
      setErrorWithReload("Extension not connected to this tab.");
    } else {
      setError(err.message);
    }
    disableActions("Copy Markdown");
  }
}

function disableActions(label = "Copy Markdown") {
  btnCopyMd.disabled     = true;
  btnCopyPrompt.disabled = true;
  btnProcess.disabled    = true;
  btnCopyMd.textContent  = label;
}

// ─── Template application ─────────────────────────────────────────────────────
function applyTemplate(extracted, templateId) {
  const template = state.templates.find((t) => t.id === templateId);
  if (!template || !extracted) return "";

  const sel = extracted.selection || extracted.content || "";

  return template.prompt
    .replace(/\{content\}/g,   extracted.content  ?? "")
    .replace(/\{selection\}/g, sel)
    .replace(/\{title\}/g,     extracted.title    ?? "")
    .replace(/\{url\}/g,       extracted.url      ?? "")
    .replace(/\{excerpt\}/g,   extracted.excerpt  ?? "")
    .replace(/\{byline\}/g,    extracted.byline   ?? "")
    .replace(/\{siteName\}/g,  extracted.siteName ?? "");
}

function applyTemplateAndUpdate() {
  if (!state.extracted) return;

  state.finalText = applyTemplate(state.extracted, state.selectedTemplateId);
  updateTokenDisplay(state.finalText);

  btnCopyMd.disabled     = false;
  btnCopyMd.textContent  = "Copy Markdown";
  btnCopyPrompt.disabled = false;
  btnProcess.disabled    = false;

  previewText.value = state.finalText;

  if (previewPanel.classList.contains("hidden")) {
    previewPanel.classList.remove("hidden");
    setPreviewOpen(true);
  }
}

// ─── Preview toggle ───────────────────────────────────────────────────────────
function setPreviewOpen(open) {
  state.previewOpen = open;
  previewPanel.classList.toggle("collapsed", !open);
  previewArrow.textContent = open ? "▴" : "▾";
}

btnPreviewToggle.addEventListener("click", () => {
  setPreviewOpen(!state.previewOpen);
});

// ─── Token display ────────────────────────────────────────────────────────────
function updateTokenDisplay(text) {
  const tokens    = estimateTokens(text);
  const formatted = tokens.toLocaleString();
  const src       = state.extracted?.source ?? "";
  const srcLabel  = src ? ` · ${src}` : "";

  tokenCount.textContent = `~${formatted}${srcLabel}`;
  tokenCount.className   = `token-count ${tokenColorClass(tokens)}`;
  tokenRow.classList.remove("hidden");

  // Model limit warning
  const model     = PROVIDER_MODELS[state.llmProvider];
  const limit     = TOKEN_THRESHOLDS.MODEL_LIMITS[model] ?? 128000;
  const nearLimit = tokens > limit * 0.85;
  tokenWarning.classList.toggle("hidden", !nearLimit);
}

// ─── Copy actions ─────────────────────────────────────────────────────────────
btnCopyMd.addEventListener("click", async () => {
  if (!state.rawMarkdown) return;
  await copyText(state.rawMarkdown);
});

btnCopyPrompt.addEventListener("click", async () => {
  if (!state.finalText) return;
  await copyText(state.finalText);
});

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    showCopySuccess();
  } catch (err) {
    setError(`Copy failed: ${err.message}`);
  }
}

function showCopySuccess() {
  copyStatus.classList.remove("hidden");
  setTimeout(() => copyStatus.classList.add("hidden"), 2500);
}

// ─── Options link ─────────────────────────────────────────────────────────────
btnOptions.addEventListener("click", () => { chrome.runtime.openOptionsPage(); });
chatOptionsLink.addEventListener("click", (e) => { e.preventDefault(); chrome.runtime.openOptionsPage(); });

// ─── Error display ────────────────────────────────────────────────────────────
function setError(msg) {
  if (msg) {
    errorMsg.textContent = msg;
    errorMsg.classList.remove("hidden");
  } else {
    errorMsg.classList.add("hidden");
    errorMsg.textContent = "";
  }
}

function setErrorWithReload(msg) {
  errorMsg.innerHTML = "";
  errorMsg.appendChild(document.createTextNode(msg + " "));
  const link = document.createElement("a");
  link.href = "#";
  link.textContent = "Reload tab";
  link.addEventListener("click", async (e) => {
    e.preventDefault();
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) chrome.tabs.reload(tab.id);
    window.close();
  });
  errorMsg.appendChild(link);
  errorMsg.classList.remove("hidden");
}

// ─── Run Template (AI) ────────────────────────────────────────────────────────
btnProcess.addEventListener("click", processWithAI);

function updateRunButtonLabel() {
  btnProcess.textContent = PROVIDER_LABELS[state.llmProvider] ?? "Run Template";
}

async function processWithAI() {
  if (!state.finalText || state.chatStreaming) return;

  chatPanel.classList.remove("hidden");
  if (state.previewOpen) setPreviewOpen(false);

  const KEY_GETTERS = { openai: getOpenAIKey, gemini: getGeminiKey, grok: getGrokKey };
  const key = await KEY_GETTERS[state.llmProvider]?.();
  if (!key) { chatNoKey.classList.remove("hidden"); return; }
  chatNoKey.classList.add("hidden");

  const bubble = appendBubble("assistant", "");
  bubble.classList.add("streaming");
  state.chatStreaming = true;
  btnProcess.disabled = true;
  btnProcess.classList.add("loading");

  try {
    if (state.llmProvider === "gemini") {
      await processWithGemini(bubble);
    } else if (state.llmProvider === "grok") {
      await processWithGrok(bubble);
    } else {
      await processWithOpenAI(bubble);
    }
  } catch (err) {
    bubble.remove();
    appendBubble("error", `Error: ${err.message}`);
  } finally {
    state.chatStreaming = false;
    btnProcess.disabled = false;
    btnProcess.classList.remove("loading");
    bubble.classList.remove("streaming");
  }
}

async function processWithOpenAI(bubble) {
  const key = await getOpenAIKey();
  if (!key) throw new Error("No OpenAI API key. Add it in Options.");
  await streamOpenAICompat(bubble, {
    url:   "https://api.openai.com/v1/chat/completions",
    model: "gpt-4o-mini",
    key,
  });
}

async function processWithGemini(bubble) {
  const key = await getGeminiKey();
  if (!key) throw new Error("No Gemini API key. Add it in Options.");
  await streamOpenAICompat(bubble, {
    url:   "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    model: "gemini-2.0-flash",
    key,
  });
}

async function processWithGrok(bubble) {
  const key = await getGrokKey();
  if (!key) throw new Error("No Grok API key. Add it in Options.");
  await streamOpenAICompat(bubble, {
    url:   "https://api.x.ai/v1/chat/completions",
    model: "grok-3-mini",
    key,
  });
}

async function streamOpenAICompat(bubble, { url, model, key }) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: state.finalText }],
      stream: true,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message ?? `HTTP ${response.status}`);
  }

  let reply = "";
  const reader  = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const lines = decoder.decode(value).split("\n");
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      if (data === "[DONE]") break;
      try {
        const delta = JSON.parse(data).choices?.[0]?.delta?.content ?? "";
        reply += delta;
        bubble.textContent = reply;
        chatMessages.scrollTop = chatMessages.scrollHeight;
      } catch { /* partial chunk */ }
    }
  }

  bubble.classList.remove("streaming");
  bubble.innerHTML = renderMarkdown(reply);
}

function appendBubble(role, text) {
  const div = document.createElement("div");
  div.className = `chat-bubble ${role}`;
  div.textContent = text;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return div;
}

// ─── Keyboard shortcuts ───────────────────────────────────────────────────────
// Alt+Shift+C  → Copy Prompt
// Alt+Shift+Enter → Run Template

document.addEventListener("keydown", (e) => {
  if (!e.altKey || !e.shiftKey) return;
  if (e.key === "C") {
    e.preventDefault();
    if (!btnCopyPrompt.disabled) btnCopyPrompt.click();
  }
  if (e.key === "Enter") {
    e.preventDefault();
    if (!btnProcess.disabled) btnProcess.click();
  }
});

// ─── Markdown renderer (chat assistant bubbles) ───────────────────────────────
function renderMarkdown(raw) {
  const esc = (s) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const codeBlocks = [];
  let text = esc(raw).replace(/```(?:\w*)\n?([\s\S]*?)```/g, (_, code) => {
    codeBlocks.push(`<pre><code>${code.trimEnd()}</code></pre>`);
    return `\x00CODE${codeBlocks.length - 1}\x00`;
  });

  const inline = (s) =>
    s
      .replace(/`([^`]+)`/g,      "<code>$1</code>")
      .replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*\n]+)\*/g,  "<em>$1</em>")
      .replace(/__([^_\n]+)__/g,  "<strong>$1</strong>")
      .replace(/_([^_\n]+)_/g,    "<em>$1</em>");

  const lines = text.split("\n");
  const out   = [];
  let inUl = false, inOl = false;

  const closeList = () => {
    if (inUl) { out.push("</ul>"); inUl = false; }
    if (inOl) { out.push("</ol>"); inOl = false; }
  };

  for (const line of lines) {
    if (/^\x00CODE\d+\x00$/.test(line.trim())) {
      closeList();
      out.push(codeBlocks[parseInt(line.match(/\d+/)[0])]);
      continue;
    }
    const ul = line.match(/^[-*] (.+)$/);
    if (ul) {
      if (inOl) { out.push("</ol>"); inOl = false; }
      if (!inUl) { out.push("<ul>"); inUl = true; }
      out.push(`<li>${inline(ul[1])}</li>`);
      continue;
    }
    const ol = line.match(/^(\d+)\. (.+)$/);
    if (ol) {
      if (inUl) { out.push("</ul>"); inUl = false; }
      if (!inOl) { out.push("<ol>"); inOl = true; }
      out.push(`<li>${inline(ol[2])}</li>`);
      continue;
    }
    closeList();
    const h3 = line.match(/^### (.+)$/);
    if (h3) { out.push(`<strong>${inline(h3[1])}</strong><br>`); continue; }
    const h2 = line.match(/^## (.+)$/);
    if (h2) { out.push(`<strong>${inline(h2[1])}</strong><br>`); continue; }
    const h1 = line.match(/^# (.+)$/);
    if (h1) { out.push(`<strong>${inline(h1[1])}</strong><br>`); continue; }
    if (line.trim() === "") { out.push("<br>"); continue; }
    out.push(`${inline(line)}<br>`);
  }
  closeList();

  return out.join("").replace(/(<br>){3,}/g, "<br><br>");
}

// ─── Start ────────────────────────────────────────────────────────────────────
init().catch((err) => {
  console.error("[APC] Init failed:", err);
  setError(`Initialization error: ${err.message}`);
});
