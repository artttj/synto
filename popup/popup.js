import { MSG, estimateTokens, tokenColorClass } from "../shared/constants.js";
import { getTemplates, getSettings, saveSettings, getOpenAIKey, getGrokKey, getGeminiKey } from "../shared/storage.js";

// ─── State ────────────────────────────────────────────────────────────────────
const state = {
  templates: [],
  selectedTemplateId: null,
  extracted: null,        // { content, title, url, ... }
  finalText: "",
  previewOpen: true,
  chatStreaming: false,
  llmProvider: "openai",  // "openai" | "gemini" | "grok"
};

// ─── DOM refs ─────────────────────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);

const btnOptions       = $("btn-options");
const templateSelect   = $("template-select");
const errorMsg         = $("error-msg");
const tokenRow         = $("token-row");
const tokenCount       = $("token-count");
const btnCopy            = $("btn-copy");
const copyStatus         = $("copy-status");
const previewPanel       = $("preview-panel");
const previewText        = $("preview-text");
const btnPreviewToggle   = $("btn-preview-toggle");
const previewArrow       = $("preview-arrow");

const chatPanel        = $("chat-panel");
const chatNoKey        = $("chat-no-key");
const chatOptionsLink  = $("chat-options-link");
const chatMessages     = $("chat-messages");
const btnProcess       = $("btn-process");

// ─── Init ─────────────────────────────────────────────────────────────────────
async function init() {
  const [templates, settings] = await Promise.all([getTemplates(), getSettings()]);

  document.documentElement.dataset.theme = settings.theme ?? "dark";

  state.templates = templates;
  state.selectedTemplateId = settings.defaultTemplateId ?? templates[0]?.id;
  state.llmProvider = settings.llmProvider ?? "openai";

  renderTemplateSelect();
  updateAskButtonLabel();

  await extractContent();
}

function updateAskButtonLabel() {
  const labels = { openai: "Ask ChatGPT", gemini: "Ask Gemini", grok: "Ask Grok" };
  btnProcess.textContent = labels[state.llmProvider] ?? "Ask AI";
}

// ─── Template select ──────────────────────────────────────────────────────────
function renderTemplateSelect() {
  templateSelect.innerHTML = "";
  state.templates.forEach((t) => {
    const opt = document.createElement("option");
    opt.value = t.id;
    opt.textContent = t.name;
    if (t.id === state.selectedTemplateId) opt.selected = true;
    templateSelect.appendChild(opt);
  });
}

templateSelect.addEventListener("change", async () => {
  state.selectedTemplateId = templateSelect.value;
  await saveSettings({ defaultTemplateId: state.selectedTemplateId });
  applyTemplateAndUpdate();
});

// ─── Extraction ───────────────────────────────────────────────────────────────
async function extractContent() {
  setError(null);
  btnCopy.disabled = true;
  btnCopy.textContent = "Extracting…";
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
    });

    if (!response?.success) {
      throw new Error(response?.error ?? "Extraction failed.");
    }

    state.extracted = response;
    applyTemplateAndUpdate();
  } catch (err) {
    if (err.message?.includes("Receiving end does not exist")) {
      setErrorWithReload("Extension not connected to this tab.");
    } else {
      setError(err.message);
    }
    btnCopy.textContent = "Copy to Clipboard";
    btnCopy.disabled = true;
  }
}

// ─── Template application ─────────────────────────────────────────────────────
function applyTemplate(extracted, templateId) {
  const template = state.templates.find((t) => t.id === templateId);
  if (!template || !extracted) return "";

  return template.prompt
    .replace(/\{content\}/g, extracted.content ?? "")
    .replace(/\{title\}/g, extracted.title ?? "")
    .replace(/\{url\}/g, extracted.url ?? "")
    .replace(/\{excerpt\}/g, extracted.excerpt ?? "")
    .replace(/\{byline\}/g, extracted.byline ?? "")
    .replace(/\{siteName\}/g, extracted.siteName ?? "");
}

function applyTemplateAndUpdate() {
  if (!state.extracted) return;

  state.finalText = applyTemplate(state.extracted, state.selectedTemplateId);
  updateTokenDisplay(state.finalText);

  btnCopy.disabled = false;
  btnCopy.textContent = "Copy to Clipboard";
  btnProcess.disabled = false;

  previewText.value = state.finalText;

  // On first reveal: show panel expanded; on template change: keep current state
  if (previewPanel.classList.contains("hidden")) {
    previewPanel.classList.remove("hidden");
    setPreviewOpen(true);
  }
}

// ─── Preview toggle ────────────────────────────────────────────────────────────
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
  const tokens = estimateTokens(text);
  const formatted = tokens.toLocaleString();
  const source = state.extracted?.source ?? "";
  const extractorLabel = source ? ` · ${source}` : "";
  tokenCount.textContent = `~${formatted}${extractorLabel}`;
  tokenCount.className = `token-count ${tokenColorClass(tokens)}`;
  tokenRow.classList.remove("hidden");
}

// ─── Copy to clipboard ────────────────────────────────────────────────────────
btnCopy.addEventListener("click", async () => {
  if (!state.finalText) return;

  btnCopy.classList.add("loading");
  btnCopy.disabled = true;
  btnCopy.textContent = "Copying…";

  try {
    await navigator.clipboard.writeText(state.finalText);
    showCopySuccess();
  } catch (err) {
    setError(`Copy failed: ${err.message}`);
  } finally {
    btnCopy.classList.remove("loading");
    btnCopy.disabled = false;
    btnCopy.textContent = "Copy to Clipboard";
  }
});

function showCopySuccess() {
  copyStatus.classList.remove("hidden");
  setTimeout(() => copyStatus.classList.add("hidden"), 2500);
}

// ─── Options link ─────────────────────────────────────────────────────────────
btnOptions.addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

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

// ─── Process with AI ──────────────────────────────────────────────────────────
btnProcess.addEventListener("click", processWithAI);

async function processWithAI() {
  if (!state.finalText || state.chatStreaming) return;

  // Reveal AI panel on first use; collapse preview to make room
  chatPanel.classList.remove("hidden");
  if (state.previewOpen) setPreviewOpen(false);

  // All providers require an API key
  const KEY_GETTERS = { openai: getOpenAIKey, gemini: getGeminiKey, grok: getGrokKey };
  const key = await KEY_GETTERS[state.llmProvider]?.();
  if (!key) {
    chatNoKey.classList.remove("hidden");
    return;
  }
  chatNoKey.classList.add("hidden");

  const bubble = appendBubble("assistant", "");
  bubble.classList.add("streaming");
  state.chatStreaming = true;
  btnProcess.disabled = true;

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
    bubble.classList.remove("streaming");
  }
}

async function processWithOpenAI(bubble) {
  const key = await getOpenAIKey();
  if (!key) throw new Error("No OpenAI API key. Add it in Options.");
  await streamOpenAICompat(bubble, {
    url: "https://api.openai.com/v1/chat/completions",
    model: "gpt-4o-mini",
    key,
  });
}

async function processWithGemini(bubble) {
  const key = await getGeminiKey();
  if (!key) throw new Error("No Gemini API key. Add it in Options.");
  await streamOpenAICompat(bubble, {
    url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    model: "gemini-2.0-flash",
    key,
  });
}

async function processWithGrok(bubble) {
  const key = await getGrokKey();
  if (!key) throw new Error("No Grok API key. Add it in Options.");
  await streamOpenAICompat(bubble, {
    url: "https://api.x.ai/v1/chat/completions",
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
  const reader = response.body.getReader();
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

chatOptionsLink.addEventListener("click", (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

// ─── Markdown renderer (for chat assistant bubbles) ───────────────────────────
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
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*\n]+)\*/g, "<em>$1</em>")
      .replace(/__([^_\n]+)__/g, "<strong>$1</strong>")
      .replace(/_([^_\n]+)_/g, "<em>$1</em>");

  const lines = text.split("\n");
  const out = [];
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
