/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */

import { TOKEN_THRESHOLDS, estimateTokens, tokenColorClass } from '../shared/constants';
import { state, getActiveModel } from './state';
import { refs } from './dom';
import { setError } from './errors';
import { renderMarkdown } from './markdown';


export async function richCopy(text: string, html?: string): Promise<void> {
  const plainText = text;
  const htmlContent = html ?? renderMarkdown(text);
  const styledHtml = `<div style="font-family:system-ui,-apple-system,sans-serif;font-size:14px;line-height:1.6;color:canvastext;background:canvas">${htmlContent}</div>`;
  const htmlBlob = new Blob([styledHtml], { type: 'text/html' });
  const textBlob = new Blob([plainText], { type: 'text/plain' });

  if (typeof ClipboardItem !== 'undefined') {
    try {
      const item = new ClipboardItem({
        'text/html': htmlBlob,
        'text/plain': textBlob,
      });
      await navigator.clipboard.write([item]);
      return;
    } catch {
      // Fallback to plain text
    }
  }
  await navigator.clipboard.writeText(plainText);
}


export function updatePreviewText(): void {
  const isPrompt = state.previewTab === 'prompt';
  refs.previewText!.value = isPrompt ? state.finalText : state.rawMarkdown;
}


export function setPreviewOpen(open: boolean): void {
  state.previewOpen = open;
  refs.previewPanel!.classList.toggle('hidden', !open);
}


export function updateTokenDisplay(text: string): void {
  const tokens = estimateTokens(text);
  refs.tokenCount!.textContent = `~${tokens.toLocaleString()}`;
  refs.tokenCount!.className = `token-count ${tokenColorClass(tokens)}`;

  const model = getActiveModel();
  const limit = TOKEN_THRESHOLDS.MODEL_LIMITS[model as keyof typeof TOKEN_THRESHOLDS.MODEL_LIMITS] ?? 128000;
  refs.tokenWarning!.classList.toggle('hidden', tokens <= limit * 0.85);
}


export async function copyPreviewText(text: string, btn: HTMLButtonElement): Promise<void> {
  try {
    await richCopy(text);
    btn.classList.add('copy-success');
    setTimeout(() => btn.classList.remove('copy-success'), 2000);
  } catch (err: unknown) {
    setError(`Copy failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}


export function wirePreview(): void {
  document.querySelectorAll<HTMLElement>('.preview-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.preview-tab').forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      state.previewTab = btn.dataset.tab as 'content' | 'prompt';
      updatePreviewText();
      if (!state.previewOpen) setPreviewOpen(true);
    });
  });

  refs.btnPreviewCopy!.addEventListener('click', async () => {
    const text = state.previewTab === 'prompt' ? state.finalText : state.rawMarkdown;
    if (!text) return;
    await copyPreviewText(text, refs.btnPreviewCopy!);
  });
}
