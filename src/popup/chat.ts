/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */

import {
  getOpenAIKey,
  getGeminiKey,
  getGrokKey,
  saveHistory,
  normalizeUrl,
} from '../shared/storage';
import { t } from '../shared/i18n';
import { state, getAskLabel, getActiveModel, type ChatMessage } from './state';
import { refs } from './dom';
import { setError } from './errors';
import { setPreviewOpen } from './preview';
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
  refs.chatMessages!.scrollTop = refs.chatMessages!.scrollHeight;
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
      await navigator.clipboard.writeText(text);
      btn.classList.add('copy-success');
      setTimeout(() => btn.classList.remove('copy-success'), 2000);
    } catch (err: unknown) {
      setError(`Copy failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  });

  wrap.appendChild(btn);
}


async function streamOpenAICompat(bubble: HTMLDivElement, { url, model, key }: { url: string; model: string; key: string }): Promise<void> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      messages: state.chatHistory,
      stream: true,
    }),
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

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    for (const line of decoder.decode(value).split('\n')) {
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

  bubble.classList.remove('streaming');
  bubble.innerHTML = renderMarkdown(reply);
  state.chatHistory.push({ role: 'assistant', content: reply });
  addBubbleCopyButton(bubble, reply);
}


async function processWithOpenAI(bubble: HTMLDivElement): Promise<void> {
  const key = await getOpenAIKey();
  if (!key) throw new Error(t('error_no_key_openai'));
  await streamOpenAICompat(bubble, {
    url: 'https://api.openai.com/v1/chat/completions',
    model: state.openaiModel,
    key,
  });
}


async function processWithGemini(bubble: HTMLDivElement): Promise<void> {
  const key = await getGeminiKey();
  if (!key) throw new Error(t('error_no_key_gemini'));
  await streamOpenAICompat(bubble, {
    url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    model: state.geminiModel,
    key,
  });
}


async function processWithGrok(bubble: HTMLDivElement): Promise<void> {
  const key = await getGrokKey();
  if (!key) throw new Error(t('error_no_key_grok'));
  await streamOpenAICompat(bubble, {
    url: 'https://api.x.ai/v1/chat/completions',
    model: state.grokModel,
    key,
  });
}


async function dispatchToProvider(bubble: HTMLDivElement): Promise<void> {
  if (state.llmProvider === 'gemini') {
    await processWithGemini(bubble);
  } else if (state.llmProvider === 'grok') {
    await processWithGrok(bubble);
  } else {
    await processWithOpenAI(bubble);
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

  const keyGetters: Record<string, () => Promise<string>> = {
    openai: getOpenAIKey,
    gemini: getGeminiKey,
    grok: getGrokKey,
  };
  const key = await keyGetters[state.llmProvider]?.();
  if (!key) {
    refs.chatNoKey!.classList.remove('hidden');
    return;
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

  try {
    await dispatchToProvider(bubble);
    refs.chatInputRow!.classList.remove('hidden');
    refs.chatExportRow!.classList.remove('hidden');
    refs.chatHistoryBanner!.classList.add('hidden');
    void persistHistory();
  } catch (err: unknown) {
    (bubble.parentElement ?? bubble).remove();
    state.chatHistory.pop();
    appendBubble('error', `Error: ${err instanceof Error ? err.message : String(err)}`);
  } finally {
    state.chatStreaming = false;
    refs.btnProcess!.disabled = false;
    refs.btnProcess!.textContent = getAskLabel();
    refs.btnProcess!.classList.remove('loading');
    bubble.classList.remove('streaming');
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

  try {
    await dispatchToProvider(bubble);
    void persistHistory();
  } catch (err: unknown) {
    (bubble.parentElement ?? bubble).remove();
    state.chatHistory.pop();
    appendBubble('error', `Error: ${err instanceof Error ? err.message : String(err)}`);
  } finally {
    state.chatStreaming = false;
    refs.btnChatSend!.disabled = false;
    refs.btnProcess!.disabled = false;
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
    `# ${state.extracted?.title || 'Chat export'}`,
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
  const slug = (state.extracted?.title || 'chat').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${slug}-${date}.md`;
  a.click();
  URL.revokeObjectURL(a.href);
}


export function wireChat(): void {
  refs.btnProcess!.addEventListener('click', processWithAI);

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
