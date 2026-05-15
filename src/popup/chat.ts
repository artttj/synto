/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */

import {
  getOpenAIKey,
  getGeminiKey,
  getGrokKey,
  getOpenRouterKey,
  getZaiKey,
  getAnthropicKey,
  getCustomKey,
  getOllamaKey,
  saveHistory,
  normalizeUrl,
} from '../shared/storage';
import { t } from '../shared/i18n';
import { state, getAskLabel, getActiveModel, type ChatMessage } from './state';
import { refs } from './dom';
import { setError } from './errors';
import { setPreviewOpen, richCopy } from './preview';
import { renderMarkdown } from './markdown';

interface SSEChunk {
  choices?: { delta?: { content?: string } }[];
}

interface APIErrorBody {
  error?: { message?: string };
}

export function appendBubble(role: string, text: string): HTMLDivElement {
  const wrap = document.createElement('div');
  wrap.className = `chat-bubble-wrap ${role}`;

  const div = document.createElement('div');
  div.className = `chat-bubble ${role}`;
  div.textContent = text;
  wrap.appendChild(div);

  refs.chatMessages!.appendChild(wrap);
  // Scroll to the top of the new bubble (start of response)
  wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return div;
}


function addBubbleCopyButton(bubble: HTMLDivElement, text: string): void {
  const wrap = bubble.parentElement;
  if (!wrap) return;

  const btn = document.createElement('button');
  btn.className = 'chat-bubble-copy';
  btn.type = 'button';
  btn.title = 'Copy response';
  btn.setAttribute('aria-label', 'Copy response');
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

  btn.addEventListener('click', async () => {
    try {
      await richCopy(text);
      btn.classList.add('copy-success');
      setTimeout(() => btn.classList.remove('copy-success'), 2000);
    } catch (err: unknown) {
      setError(`Copy failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  });

  const actions = document.createElement('div');
  actions.className = 'chat-bubble-actions';
  actions.appendChild(btn);

  const insertBtn = document.createElement('button');
  insertBtn.className = 'chat-bubble-insert';
  insertBtn.type = 'button';
  insertBtn.title = 'Insert into page';
  insertBtn.setAttribute('aria-label', 'Insert into page');
  insertBtn.insertAdjacentHTML('beforeend', '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V4"/><path d="m5 11 7-7 7 7"/></svg>');
  insertBtn.addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) throw new Error('No active tab');
      const resp = await chrome.tabs.sendMessage(tab.id, { type: 'INSERT_TEXT', text });
      if (resp?.error) throw new Error(resp.error);
      insertBtn.classList.add('copy-success');
      setTimeout(() => insertBtn.classList.remove('copy-success'), 2000);
    } catch (err: unknown) {
      setError(`Insert failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  });

  actions.appendChild(insertBtn);
  wrap.appendChild(actions);
}


async function streamOpenAICompat(bubble: HTMLDivElement, { url, model, key, extraHeaders, signal }: { url: string; model: string; key: string; extraHeaders?: Record<string, string>; signal?: AbortSignal }): Promise<void> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${key}`,
    ...extraHeaders,
  };
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      messages: state.chatHistory,
      stream: true,
    }),
    signal,
  });

  if (!response.ok) {
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      const hint = retryAfter ? ` Retry after ${retryAfter}s.` : ' Wait a moment and try again.';
      throw new Error(`Rate limited (429).${hint}`);
    }
    const body = await response.json().catch(() => ({})) as APIErrorBody;
    throw new Error(body.error?.message ?? `HTTP ${response.status}`);
  }

  let reply = '';
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (data === '[DONE]') break;
      try {
        const chunk = JSON.parse(data) as SSEChunk;
        const delta = chunk.choices?.[0]?.delta?.content ?? '';
        reply += delta;
        bubble.textContent = reply;
        refs.chatMessages!.scrollTop = refs.chatMessages!.scrollHeight;
      } catch {
      }
    }
  }
  buffer += decoder.decode();
  if (buffer.startsWith('data: ')) {
    const data = buffer.slice(6).trim();
    if (data && data !== '[DONE]') {
      try {
        const chunk = JSON.parse(data) as SSEChunk;
        const delta = chunk.choices?.[0]?.delta?.content ?? '';
        reply += delta;
      } catch {
      }
    }
  }

  bubble.classList.remove('streaming');
  bubble.innerHTML = renderMarkdown(reply);
  state.chatHistory.push({ role: 'assistant', content: reply });
  addBubbleCopyButton(bubble, reply);
}


async function streamAnthropic(bubble: HTMLDivElement, { model, key, signal }: { model: string; key: string; signal?: AbortSignal }): Promise<void> {
  const systemMessage = state.chatHistory.find(m => m.role === 'system');
  const messages = state.chatHistory.filter(m => m.role !== 'system');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      system: systemMessage?.content || 'You are a helpful assistant.',
      messages,
      max_tokens: 4096,
      stream: true,
    }),
    signal,
  });

  if (!response.ok) {
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      const hint = retryAfter ? ` Retry after ${retryAfter}s.` : ' Wait a moment and try again.';
      throw new Error(`Rate limited (429).${hint}`);
    }
    const body = await response.json().catch(() => ({})) as APIErrorBody;
    throw new Error(body.error?.message ?? `HTTP ${response.status}`);
  }

  let reply = '';
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (data === '[DONE]') continue;
      try {
        const event = JSON.parse(data);
        if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
          reply += event.delta.text;
          bubble.textContent = reply;
          refs.chatMessages!.scrollTop = refs.chatMessages!.scrollHeight;
        }
      } catch {
        // skip malformed chunks
      }
    }
  }
  buffer += decoder.decode();
  if (buffer.startsWith('data: ')) {
    const data = buffer.slice(6).trim();
    if (data && data !== '[DONE]') {
      try {
        const event = JSON.parse(data);
        if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
          reply += event.delta.text;
        }
      } catch {
        // skip
      }
    }
  }

  bubble.classList.remove('streaming');
  // renderMarkdown sanitizes output before setting innerHTML
  bubble.innerHTML = renderMarkdown(reply);
  state.chatHistory.push({ role: 'assistant', content: reply });
  addBubbleCopyButton(bubble, reply);
}


async function processWithOpenAI(bubble: HTMLDivElement, signal?: AbortSignal): Promise<void> {
  const key = await getOpenAIKey();
  if (!key) throw new Error(t('error_no_key_openai'));
  await streamOpenAICompat(bubble, {
    url: 'https://api.openai.com/v1/chat/completions',
    model: state.openaiModel,
    key,
    signal,
  });
}


async function processWithGemini(bubble: HTMLDivElement, signal?: AbortSignal): Promise<void> {
  const key = await getGeminiKey();
  if (!key) throw new Error(t('error_no_key_gemini'));
  await streamOpenAICompat(bubble, {
    url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    model: state.geminiModel,
    key,
    signal,
  });
}


async function processWithGrok(bubble: HTMLDivElement, signal?: AbortSignal): Promise<void> {
  const key = await getGrokKey();
  if (!key) throw new Error(t('error_no_key_grok'));
  await streamOpenAICompat(bubble, {
    url: 'https://api.x.ai/v1/chat/completions',
    model: state.grokModel,
    key,
    signal,
  });
}


async function processWithOpenRouter(bubble: HTMLDivElement, signal?: AbortSignal): Promise<void> {
  const key = await getOpenRouterKey();
  if (!key) throw new Error(t('error_no_key_openrouter'));
  await streamOpenAICompat(bubble, {
    url: 'https://openrouter.ai/api/v1/chat/completions',
    model: state.openrouterModel,
    key,
    extraHeaders: {
      'HTTP-Referer': chrome.runtime.getURL(''),
      'X-Title': 'Synto',
    },
    signal,
  });
}


async function processWithZai(bubble: HTMLDivElement, signal?: AbortSignal): Promise<void> {
  const key = await getZaiKey();
  if (!key) throw new Error(t('error_no_key_zai'));
  await streamOpenAICompat(bubble, {
    url: 'https://api.zai.ai/v1/chat/completions',
    model: state.zaiModel,
    key,
    signal,
  });
}


async function processWithAnthropic(bubble: HTMLDivElement, signal?: AbortSignal): Promise<void> {
  const key = await getAnthropicKey();
  if (!key) throw new Error(t('error_no_key_anthropic'));
  await streamAnthropic(bubble, { model: state.anthropicModel, key, signal });
}


function buildChatUrl(baseUrl: string): string {
  const base = baseUrl.replace(/\/+$/, '');
  if (base.endsWith('/chat/completions')) return base;
  if (base.endsWith('/v1')) return `${base}/chat/completions`;
  return `${base}/v1/chat/completions`;
}


async function processWithCustom(bubble: HTMLDivElement, signal?: AbortSignal): Promise<void> {
  const baseUrl = state.customEndpoint?.trim();
  if (!baseUrl) throw new Error(t('error_no_custom_endpoint'));
  const model = state.customModel?.trim();
  if (!model) throw new Error(t('error_no_custom_model'));

  const key = state.customUseAuth ? (await getCustomKey()) : '';
  await streamOpenAICompat(bubble, { url: buildChatUrl(baseUrl), model, key: key || 'unused', signal });
}


async function processWithOllama(bubble: HTMLDivElement, signal?: AbortSignal): Promise<void> {
  const baseUrl = state.ollamaEndpoint?.trim() || 'https://ollama.com/v1';
  const key = state.ollamaUseAuth ? (await getOllamaKey()) : '';
  await streamOpenAICompat(bubble, { url: buildChatUrl(baseUrl), model: state.ollamaModel, key: key || 'unused', signal });
}


async function dispatchToProvider(bubble: HTMLDivElement, signal?: AbortSignal): Promise<void> {
  switch (state.llmProvider) {
    case 'gemini':     await processWithGemini(bubble, signal); break;
    case 'grok':       await processWithGrok(bubble, signal); break;
    case 'openrouter': await processWithOpenRouter(bubble, signal); break;
    case 'zai':        await processWithZai(bubble, signal); break;
    case 'anthropic':  await processWithAnthropic(bubble, signal); break;
    case 'ollama':     await processWithOllama(bubble, signal); break;
    case 'custom':     await processWithCustom(bubble, signal); break;
    default:           await processWithOpenAI(bubble, signal); break;
  }
}


let abortController: AbortController | null = null;

export function stopStreaming(): void {
  if (abortController) {
    abortController.abort();
    abortController = null;
  }
  if (state.chatStreaming) {
    state.chatStreaming = false;
    refs.btnProcess!.disabled = false;
    refs.btnProcess!.textContent = getAskLabel();
    refs.btnProcess!.classList.remove('loading');
    refs.btnChatStop?.classList.add('hidden');
  }
}

async function persistHistory(): Promise<void> {
  const url = state.extracted?.url;
  if (!url || !state.selectedTemplateId) return;
  await saveHistory(normalizeUrl(url), {
    ts: Date.now(),
    templateId: state.selectedTemplateId,
    provider: state.llmProvider,
    model: getActiveModel(),
    messages: state.chatHistory,
  });
}


export async function processWithAI(): Promise<void> {
  if (!state.finalText || state.chatStreaming) return;

  refs.chatPanel!.classList.remove('hidden');
  setPreviewOpen(false);

  if (state.llmProvider === 'custom') {
    if (!state.customEndpoint?.trim()) {
      refs.chatNoKey!.classList.remove('hidden');
      return;
    }
    if (state.customUseAuth) {
      const customKey = await getCustomKey();
      if (!customKey) {
        refs.chatNoKey!.classList.remove('hidden');
        return;
      }
    }
  } else if (state.llmProvider === 'ollama') {
    if (state.ollamaUseAuth) {
      const ollamaKey = await getOllamaKey();
      if (!ollamaKey) {
        refs.chatNoKey!.classList.remove('hidden');
        return;
      }
    }
  } else {
    const keyGetters: Record<string, () => Promise<string>> = {
      openai:     getOpenAIKey,
      gemini:     getGeminiKey,
      grok:       getGrokKey,
      openrouter: getOpenRouterKey,
      zai:        getZaiKey,
      anthropic:  getAnthropicKey,
    };
    const key = await keyGetters[state.llmProvider]?.();
    if (!key) {
      refs.chatNoKey!.classList.remove('hidden');
      return;
    }
  }
  refs.chatNoKey!.classList.add('hidden');

  if (state.systemPrompt && state.chatHistory.length === 0) {
    state.chatHistory.unshift({ role: 'system', content: state.systemPrompt });
  }

  state.chatHistory.push({ role: 'user', content: state.finalText });

  const bubble = appendBubble('assistant', '');
  bubble.classList.add('streaming');
  state.chatStreaming = true;
  refs.btnProcess!.disabled = true;
  refs.btnProcess!.textContent = t('popup_asking');
  refs.btnProcess!.classList.add('loading');
  refs.btnChatStop?.classList.remove('hidden');

  abortController = new AbortController();

  try {
    await dispatchToProvider(bubble, abortController.signal);
    refs.chatInputRow!.classList.remove('hidden');
    refs.chatExportRow!.classList.remove('hidden');
    refs.chatHistoryBanner!.classList.add('hidden');
    void persistHistory();
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      bubble.textContent += '\n\n[Stopped]';
      bubble.classList.remove('streaming');
      state.chatHistory.push({ role: 'assistant', content: bubble.textContent });
      addBubbleCopyButton(bubble, bubble.textContent);
    } else {
      (bubble.parentElement ?? bubble).remove();
      state.chatHistory.pop();
      appendBubble('error', `Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  } finally {
    if (state.chatStreaming) {
      state.chatStreaming = false;
      refs.btnProcess!.disabled = false;
      refs.btnProcess!.textContent = getAskLabel();
      refs.btnProcess!.classList.remove('loading');
      refs.btnChatStop?.classList.add('hidden');
    }
    abortController = null;
  }
}


function autoResize(el: HTMLTextAreaElement): void {
  el.style.height = 'auto';
  el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
}


export async function sendFollowUp(): Promise<void> {
  const text = refs.chatInput!.value.trim();
  if (!text || state.chatStreaming) return;

  refs.chatInput!.value = '';
  autoResize(refs.chatInput!);

  appendBubble('user', text);
  state.chatHistory.push({ role: 'user', content: text });

  const bubble = appendBubble('assistant', '');
  bubble.classList.add('streaming');
  state.chatStreaming = true;
  refs.btnChatSend!.disabled = true;
  refs.btnProcess!.disabled = true;
  refs.btnChatStop?.classList.remove('hidden');

  abortController = new AbortController();

  try {
    await dispatchToProvider(bubble, abortController.signal);
    void persistHistory();
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      bubble.textContent += '\n\n[Stopped]';
      bubble.classList.remove('streaming');
      state.chatHistory.push({ role: 'assistant', content: bubble.textContent });
      addBubbleCopyButton(bubble, bubble.textContent);
    } else {
      (bubble.parentElement ?? bubble).remove();
      state.chatHistory.pop();
      appendBubble('error', `Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  } finally {
    if (state.chatStreaming) {
      state.chatStreaming = false;
      refs.btnChatSend!.disabled = false;
      refs.btnProcess!.disabled = false;
      refs.btnChatStop?.classList.add('hidden');
    }
    abortController = null;
    bubble.classList.remove('streaming');
    refs.chatInput!.focus();
  }
}


export function restoreHistoryEntry(messages: ChatMessage[]): void {
  refs.chatPanel!.classList.remove('hidden');
  refs.chatHistoryBanner!.classList.add('hidden');
  refs.chatMessages!.innerHTML = '';

  for (const msg of messages) {
    if (msg.role === 'system') continue;
    const bubble = appendBubble(msg.role, '');
    bubble.innerHTML = msg.role === 'assistant' ? renderMarkdown(msg.content) : '';
    if (msg.role !== 'assistant') bubble.textContent = msg.content;
    if (msg.role === 'assistant') addBubbleCopyButton(bubble, msg.content);
  }

  state.chatHistory = messages;
  refs.chatInputRow!.classList.remove('hidden');
  refs.chatExportRow!.classList.remove('hidden');
  setPreviewOpen(false);
}


function exportChat(): void {
  const messages = state.chatHistory.filter((m) => m.role !== 'system');
  if (!messages.length) return;

  const isoString = new Date().toISOString();
  const date = isoString.slice(0, 10);
  const model = getActiveModel();
  const lines: string[] = [
    `# ${state.extracted?.title ?? 'Chat export'}`,
    state.extracted?.url ?? '',
    `${isoString} · ${state.llmProvider} · ${model}`,
    state.selectedTemplateId ? `Template: ${state.selectedTemplateId}` : '',
    '',
    '---',
    '',
  ];

  for (const msg of messages) {
    const label = msg.role === 'user' ? '**You:**' : '**AI:**';
    lines.push(`${label}\n\n${msg.content}`, '', '---', '');
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
  const slug = (state.extracted?.title ?? 'chat').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${slug}-${date}.md`;
  a.click();
  URL.revokeObjectURL(a.href);
}


export function wireChat(): void {
  refs.btnProcess!.addEventListener('click', processWithAI);
  refs.btnChatStop!.addEventListener('click', stopStreaming);

  refs.chatInput!.addEventListener('input', () => {
    autoResize(refs.chatInput!);
  });

  refs.chatInput!.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendFollowUp();
    }
  });

  refs.btnChatSend!.addEventListener('click', sendFollowUp);
  refs.btnExportChat!.addEventListener('click', exportChat);
}
