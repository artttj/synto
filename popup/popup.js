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
  openai: "Ask ChatGPT",
  gemini: "Ask Gemini",
  grok:   "Ask Grok",
};

function getAskLabel() {
  return PROVIDER_LABELS[state.llmProvider] ?? "Ask AI";
}

// ─── State ────────────────────────────────────────────────────────────────────
const state = {
  templates:          [],
  selectedTemplateId: null,
  extracted:          null,   // { content, selection, title, url, ... }
  rawMarkdown:        "",     // extracted.content with no template applied
  finalText:          "",     // template applied
  previewOpen:        true,
  previewTab:         "content", // "content" | "prompt"
  chatStreaming:      false,
  chatHistory:        [],     // { role, content }[] — full conversation
  llmProvider:        "openai",
};

// ─── DOM refs ─────────────────────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);

const btnOptions       = $("btn-options");
const templateSelect   = $("template-select");
const errorMsg         = $("error-msg");
const tokenCount       = $("token-count");
const tokenWarning     = $("token-warning");
const previewPanel     = $("preview-panel");
const previewText      = $("preview-text");
const btnPreviewToggle = $("btn-preview-toggle");
const previewArrow     = $("preview-arrow");
const btnCopyMd        = $("btn-copy-md");
const btnProcess       = $("btn-process");
const chatPanel        = $("chat-panel");
const chatNoKey        = $("chat-no-key");
const chatOptionsLink  = $("chat-options-link");
const chatMessages     = $("chat-messages");
const chatInputRow     = $("chat-input-row");
const chatInput        = $("chat-input");
const btnChatSend      = $("btn-chat-send");

// ─── Init ─────────────────────────────────────────────────────────────────────
async function init() {
  const [templates, settings] = await Promise.all([getTemplates(), getSettings()]);

  document.documentElement.dataset.theme = settings.theme ?? "dark";

  state.templates          = templates;
  state.selectedTemplateId = settings.defaultTemplateId ?? templates[0]?.id;
  state.llmProvider        = settings.llmProvider ?? "openai";
  btnProcess.textContent   = getAskLabel();

  renderTemplateSelect();

  await extractContent();
}

// ─── Template select ──────────────────────────────────────────────────────────
function renderTemplateSelect() {
  templateSelect.innerHTML = "";

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

  // Custom/unknown category templates
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

// ─── Extraction ───────────────────────────────────────────────────────────────
async function extractContent() {
  setError(null);
  disableActions();
  previewPanel.classList.add("hidden");
  state.chatHistory = [];
  chatInputRow.classList.add("hidden");
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab?.id || tab.url?.startsWith("chrome://") || tab.url?.startsWith("chrome-extension://")) {
      throw new Error("Cannot extract from this page type. Navigate to a regular web page.");
    }

    const response = await chrome.tabs.sendMessage(tab.id, {
      type: MSG.EXTRACT_CONTENT,
      mode: "markdown",
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
    disableActions();
  }
}

function disableActions() {
  btnCopyMd.disabled  = true;
  btnProcess.disabled = true;
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

  btnCopyMd.disabled  = false;
  btnProcess.disabled = false;

  updatePreviewText();

  if (previewPanel.classList.contains("hidden")) {
    previewPanel.classList.remove("hidden");
    setPreviewOpen(true);
  }
}

// ─── Preview text ─────────────────────────────────────────────────────────────
function updatePreviewText() {
  const isPrompt = state.previewTab === "prompt";
  previewText.value  = isPrompt ? state.finalText : state.rawMarkdown;
  btnCopyMd.textContent = isPrompt ? "Copy Prompt" : "Copy Markdown";
}

// ─── Preview toggle ───────────────────────────────────────────────────────────
function setPreviewOpen(open) {
  state.previewOpen = open;
  previewPanel.classList.toggle("collapsed", !open);
  previewArrow.textContent = open ? "▴" : "▾";
  btnPreviewToggle.setAttribute("aria-expanded", String(open));
}

btnPreviewToggle.addEventListener("click", () => {
  setPreviewOpen(!state.previewOpen);
});

// ─── Preview tab switching ────────────────────────────────────────────────────
document.querySelectorAll(".preview-tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".preview-tab").forEach((b) => {
      b.classList.remove("active");
      b.setAttribute("aria-selected", "false");
    });
    btn.classList.add("active");
    btn.setAttribute("aria-selected", "true");
    state.previewTab = btn.dataset.tab;
    updatePreviewText();
    // Expand preview if collapsed
    if (!state.previewOpen) setPreviewOpen(true);
  });
});

// ─── Token display ────────────────────────────────────────────────────────────
function updateTokenDisplay(text) {
  const tokens    = estimateTokens(text);
  const formatted = tokens.toLocaleString();
  const src       = state.extracted?.source ?? "";
  const srcLabel  = src ? ` · ${src}` : "";

  tokenCount.textContent = `~${formatted}${srcLabel}`;
  tokenCount.className   = `token-count ${tokenColorClass(tokens)}`;

  const model     = PROVIDER_MODELS[state.llmProvider];
  const limit     = TOKEN_THRESHOLDS.MODEL_LIMITS[model] ?? 128000;
  const nearLimit = tokens > limit * 0.85;
  tokenWarning.classList.toggle("hidden", !nearLimit);
}

// ─── Copy button ──────────────────────────────────────────────────────────────
btnCopyMd.addEventListener("click", async () => {
  const text = state.previewTab === "prompt" ? state.finalText : state.rawMarkdown;
  if (!text) return;
  await copyText(text, btnCopyMd);
});

async function copyText(text, btn) {
  try {
    await navigator.clipboard.writeText(text);
    showCopySuccess(btn);
  } catch (err) {
    setError(`Copy failed: ${err.message}`);
  }
}

function showCopySuccess(btn) {
  const isMain = btn === btnCopyMd;
  const originalText = isMain ? btn.textContent : null;
  btn.classList.add("copy-success");
  if (isMain) btn.textContent = "Copied!";
  setTimeout(() => {
    btn.classList.remove("copy-success");
    if (isMain) btn.textContent = originalText;
  }, 2000);
}

// ─── Options link ─────────────────────────────────────────────────────────────
btnOptions.addEventListener("click", () => { chrome.runtime.openOptionsPage(); });
chatOptionsLink.addEventListener("click", (e) => { e.preventDefault(); chrome.runtime.openOptionsPage(); });

// ─── Follow-up input ──────────────────────────────────────────────────────────
function autoResize(el) {
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 120) + "px";
}

chatInput.addEventListener("input", () => autoResize(chatInput));

chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendFollowUp();
  }
});

btnChatSend.addEventListener("click", sendFollowUp);

async function sendFollowUp() {
  const text = chatInput.value.trim();
  if (!text || state.chatStreaming) return;

  chatInput.value = "";
  autoResize(chatInput);

  appendBubble("user", text);
  state.chatHistory.push({ role: "user", content: text });

  const bubble = appendBubble("assistant", "");
  bubble.classList.add("streaming");
  state.chatStreaming   = true;
  btnChatSend.disabled = true;
  btnProcess.disabled  = true;

  try {
    if (state.llmProvider === "gemini") {
      await processWithGemini(bubble);
    } else if (state.llmProvider === "grok") {
      await processWithGrok(bubble);
    } else {
      await processWithOpenAI(bubble);
    }
  } catch (err) {
    (bubble.parentElement ?? bubble).remove();
    state.chatHistory.pop();
    appendBubble("error", `Error: ${err.message}`);
  } finally {
    state.chatStreaming   = false;
    btnChatSend.disabled = false;
    btnProcess.disabled  = false;
    bubble.classList.remove("streaming");
    chatInput.focus();
  }
}

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

// ─── Ask AI ───────────────────────────────────────────────────────────────────
btnProcess.addEventListener("click", processWithAI);

async function processWithAI() {
  if (!state.finalText || state.chatStreaming) return;

  chatPanel.classList.remove("hidden");
  if (state.previewOpen) setPreviewOpen(false);

  const KEY_GETTERS = { openai: getOpenAIKey, gemini: getGeminiKey, grok: getGrokKey };
  const key = await KEY_GETTERS[state.llmProvider]?.();
  if (!key) { chatNoKey.classList.remove("hidden"); return; }
  chatNoKey.classList.add("hidden");

  state.chatHistory.push({ role: "user", content: state.finalText });

  const bubble = appendBubble("assistant", "");
  bubble.classList.add("streaming");
  state.chatStreaming  = true;
  btnProcess.disabled  = true;
  btnProcess.textContent = "Asking…";
  btnProcess.classList.add("loading");

  try {
    if (state.llmProvider === "gemini") {
      await processWithGemini(bubble);
    } else if (state.llmProvider === "grok") {
      await processWithGrok(bubble);
    } else {
      await processWithOpenAI(bubble);
    }
    chatInputRow.classList.remove("hidden");
  } catch (err) {
    (bubble.parentElement ?? bubble).remove();
    state.chatHistory.pop();
    appendBubble("error", `Error: ${err.message}`);
  } finally {
    state.chatStreaming     = false;
    btnProcess.disabled    = false;
    btnProcess.textContent = getAskLabel();
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
      messages: state.chatHistory,
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
  state.chatHistory.push({ role: "assistant", content: reply });
  addBubbleCopyButton(bubble, reply);
}

function appendBubble(role, text) {
  const wrap = document.createElement("div");
  wrap.className = `chat-bubble-wrap ${role}`;

  const div = document.createElement("div");
  div.className = `chat-bubble ${role}`;
  div.textContent = text;
  wrap.appendChild(div);

  chatMessages.appendChild(wrap);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return div; // caller uses this for streaming
}

function addBubbleCopyButton(bubble, text) {
  const wrap = bubble.parentElement;
  if (!wrap) return;

  const btn = document.createElement("button");
  btn.className = "chat-bubble-copy";
  btn.type = "button";
  btn.title = "Copy response";
  btn.setAttribute("aria-label", "Copy response");
  btn.innerHTML = `
    <svg class="icon-copy" width="11" height="11" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
    <svg class="icon-check" width="11" height="11" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>`;

  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(text);
      btn.classList.add("copy-success");
      setTimeout(() => btn.classList.remove("copy-success"), 2000);
    } catch (err) {
      setError(`Copy failed: ${err.message}`);
    }
  });

  wrap.appendChild(btn);
}

// ─── Keyboard shortcuts ───────────────────────────────────────────────────────
// Alt+Shift+C     → Copy Markdown
// Alt+Shift+Enter → Ask AI

document.addEventListener("keydown", (e) => {
  if (!e.altKey || !e.shiftKey) return;
  if (e.key === "C") {
    e.preventDefault();
    if (!btnCopyMd.disabled) btnCopyMd.click();
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
  console.error("[Synto] Init failed:", err);
  setError(`Initialization error: ${err.message}`);
});
