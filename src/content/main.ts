/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */

import { MSG } from '../shared/constants';
import { DIFF_EXPAND_SELECTORS } from './selectors';
import { extractContent, isDiffPage } from './extract';


async function scrollAndRescan(): Promise<{ ok: boolean }> {
  const viewportHeight = window.innerHeight;
  const step = Math.max(viewportHeight * 0.8, 300);
  let pos = 0;
  let stableCount = 0;
  const maxTime = 12000;
  const start = Date.now();
  const clickedButtons = new Set<HTMLElement>();

  while (Date.now() - start < maxTime) {
    const currentHeight = document.documentElement.scrollHeight;
    if (pos >= currentHeight) {
      stableCount++;
      if (stableCount >= 3) break;
    } else {
      stableCount = 0;
    }
    window.scrollTo(0, pos);

    for (const btn of document.querySelectorAll<HTMLElement>(DIFF_EXPAND_SELECTORS)) {
      if (btn.offsetParent !== null && !clickedButtons.has(btn)) {
        clickedButtons.add(btn);
        btn.click();
      }
    }

    pos += step;
    await new Promise((r) => setTimeout(r, 400));
  }

  window.scrollTo(0, 0);
  await new Promise((r) => setTimeout(r, 500));

  try {
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      const range = document.createRange();
      range.selectNodeContents(document.body);
      sel.addRange(range);
    }
    await new Promise((r) => setTimeout(r, 300));
  } catch { /* ignore */ }

  return { ok: true };
}

function isEditableElement(el: Element): boolean {
  if (el.tagName === 'TEXTAREA') return true;
  if (el.tagName === 'INPUT') {
    const type = (el as HTMLInputElement).type;
    return !type || type === 'text' || type === 'search' || type === 'email' || type === 'url' || type === 'tel';
  }
  if ((el as HTMLElement).isContentEditable) return true;
  return false;
}

interface InsertSnapshot {
  el: HTMLElement;
  type: 'input' | 'textarea' | 'contenteditable';
  prevValue: string;
  prevSelectionStart: number | null;
  prevSelectionEnd: number | null;
  prevHTML: string;
}

let undoSnapshot: InsertSnapshot | null = null;

function clearUndoSnapshot(): void {
  undoSnapshot = null;
}

function captureSnapshot(el: HTMLElement): InsertSnapshot {
  const tag = el.tagName;
  const type = tag === 'INPUT' ? 'input' : tag === 'TEXTAREA' ? 'textarea' : 'contenteditable';
  const snapshot: InsertSnapshot = {
    el,
    type,
    prevValue: '',
    prevSelectionStart: null,
    prevSelectionEnd: null,
    prevHTML: '',
  };

  if (type === 'input' || type === 'textarea') {
    const inputEl = el as HTMLInputElement | HTMLTextAreaElement;
    snapshot.prevValue = inputEl.value;
    snapshot.prevSelectionStart = inputEl.selectionStart;
    snapshot.prevSelectionEnd = inputEl.selectionEnd;
  } else {
    snapshot.prevHTML = el.innerHTML;
    snapshot.prevValue = el.innerText;
  }

  return snapshot;
}

function undoInsert(): void {
  if (!undoSnapshot) return;
  const { el, type, prevValue, prevSelectionStart, prevSelectionEnd, prevHTML } = undoSnapshot;
  clearUndoSnapshot();

  if (type === 'input' || type === 'textarea') {
    const inputEl = el as HTMLInputElement | HTMLTextAreaElement;
    inputEl.value = prevValue;
    inputEl.selectionStart = prevSelectionStart;
    inputEl.selectionEnd = prevSelectionEnd;
  } else {
    el.innerHTML = prevHTML;
  }

  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  el.focus();
}

let lastFocusedInput: HTMLElement | null = null;
document.addEventListener('focusin', (e) => {
  const target = e.target as HTMLElement;
  if (target && isEditableElement(target)) {
    lastFocusedInput = target;
  }
});

function findBestInput(): HTMLElement | null {
  const active = document.activeElement as HTMLElement;
  if (active && isEditableElement(active)) return active;

  if (lastFocusedInput && lastFocusedInput.isConnected && isEditableElement(lastFocusedInput)) {
    return lastFocusedInput;
  }

  const inputs = Array.from(document.querySelectorAll<HTMLElement>('input, textarea, [contenteditable="true"]'))
    .filter((el) => isEditableElement(el) && el.offsetParent !== null);

  if (inputs.length === 0) return null;

  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  let best = inputs[0];
  let bestScore = -Infinity;

  for (const el of inputs) {
    const rect = el.getBoundingClientRect();
    const area = rect.width * rect.height;
    const elCX = rect.left + rect.width / 2;
    const elCY = rect.top + rect.height / 2;
    const dist = Math.sqrt((elCX - centerX) ** 2 + (elCY - centerY) ** 2);
    const score = area - dist * 10;
    if (score > bestScore) {
      bestScore = score;
      best = el;
    }
  }

  return best;
}

function insertTextToInput(text: string): { error?: string } {
  const el = findBestInput();
  if (!el) return { error: 'No input field found on this page.' };

  clearUndoSnapshot();
  undoSnapshot = captureSnapshot(el);

  if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
    const inputEl = el as HTMLInputElement | HTMLTextAreaElement;
    const start = inputEl.selectionStart ?? inputEl.value.length;
    const end = inputEl.selectionEnd ?? start;
    inputEl.value = inputEl.value.slice(0, start) + text + inputEl.value.slice(end);
    inputEl.selectionStart = inputEl.selectionEnd = start + text.length;
    inputEl.dispatchEvent(new Event('change', { bubbles: true }));
    inputEl.dispatchEvent(new InputEvent('input', { inputType: 'insertText', data: text, bubbles: true }));
    inputEl.focus();
  } else {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(text));
      range.collapse(false);
    } else {
      el.innerText += text;
    }
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.focus();
  }

  return {};
}

function showToast(message: string, action?: { label: string; onClick: () => void }): void {
  const existing = document.getElementById('synto-insert-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'synto-insert-toast';
  toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1C1C1E;color:#fff;padding:8px 18px;border-radius:8px;font:13px/1.5 system-ui,sans-serif;z-index:2147483647;opacity:0;transition:opacity .2s;display:flex;align-items:center;gap:12px;';

  const label = document.createElement('span');
  label.textContent = message;
  toast.appendChild(label);

  if (action) {
    const btn = document.createElement('button');
    btn.textContent = action.label;
    btn.style.cssText = 'background:rgba(255,255,255,0.15);color:#fff;border:none;padding:3px 10px;border-radius:5px;cursor:pointer;font:13px/1.5 system-ui,sans-serif;';
    btn.addEventListener('click', () => {
      action.onClick();
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 200);
    });
    toast.appendChild(btn);
  }

  document.body.appendChild(toast);
  requestAnimationFrame(() => { toast.style.opacity = '1'; });

  const dismissMs = action ? 5000 : 1800;
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.remove();
      if (action) clearUndoSnapshot();
    }, 200);
  }, dismissMs);
}


let scrollController: AbortController | null = null;
let scrollDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let lastContentHash = '';

function startScrollListener(): void {
  if (scrollController) return;
  scrollController = new AbortController();

  const opts = { passive: true, signal: scrollController.signal };
  window.addEventListener('scroll', onScroll, opts);
  window.addEventListener('resize', onScroll, opts);
}

function onScroll(): void {
  if (scrollDebounceTimer) clearTimeout(scrollDebounceTimer);
  scrollDebounceTimer = setTimeout(() => {
    const result = extractContent('markdown');
    if (result.success) {
      const hash = `${result.content.length}:${result.content.slice(0, 64)}${result.content.slice(-64)}`;
      if (hash === lastContentHash) return;
      lastContentHash = hash;
      chrome.runtime.sendMessage({ type: MSG.CONTENT_UPDATE, ...result }).catch(() => { lastContentHash = ''; });
    }
  }, 800);
}


chrome.runtime.onMessage.addListener((message: { type: string; mode?: string; text?: string }, _sender, sendResponse) => {
  if (message.type === MSG.EXTRACT_CONTENT) {
    startScrollListener();
    if (isDiffPage()) {
      void scrollAndRescan().then(() => {
        try {
          const result = extractContent(message.mode ?? 'markdown');
          sendResponse({ ...result, autoRescanned: true });
        } catch (err: unknown) {
          sendResponse({ success: false, error: err instanceof Error ? err.message : String(err) });
        }
      });
      return true;
    }
    try {
      sendResponse(extractContent(message.mode ?? 'markdown'));
    } catch (err: unknown) {
      sendResponse({ success: false, error: err instanceof Error ? err.message : String(err) });
    }
    return true;
  }

  if (message.type === MSG.INSERT_TEXT && message.text) {
    const result = insertTextToInput(message.text);
    if (result.error) {
      sendResponse({ error: result.error });
    } else {
      showToast('Inserted', { label: 'Undo', onClick: undoInsert });
      sendResponse({ ok: true });
    }
    return true;
  }

  if (message.type === MSG.SCROLL_AND_RESCAN) {
    void scrollAndRescan().then(() => {
      startScrollListener();
      try {
        sendResponse(extractContent(message.mode ?? 'markdown'));
      } catch (err: unknown) {
        sendResponse({ success: false, error: err instanceof Error ? err.message : String(err) });
      }
    });
    return true;
  }
});