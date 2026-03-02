/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */

import { TOKEN_THRESHOLDS, estimateTokens, tokenColorClass } from '../shared/constants';
import { t } from '../shared/i18n';
import { state, PROVIDER_MODELS } from './state';
import { refs } from './dom';
import { setError } from './errors';


export function updatePreviewText(): void {
  const isPrompt = state.previewTab === 'prompt';
  refs.previewText!.value = isPrompt ? state.finalText : state.rawMarkdown;
  refs.btnCopyMd!.textContent = isPrompt ? t('popup_copy_prompt') : t('popup_copy_markdown');
}


export function setPreviewOpen(open: boolean): void {
  state.previewOpen = open;
  refs.previewPanel!.classList.toggle('collapsed', !open);
  refs.previewArrow!.textContent = open ? '▴' : '▾';
  refs.btnPreviewToggle!.setAttribute('aria-expanded', String(open));
}


export function updateTokenDisplay(text: string): void {
  const tokens = estimateTokens(text);
  const src = state.extracted?.source ?? '';
  refs.tokenCount!.textContent = `~${tokens.toLocaleString()}${src ? ` · ${src}` : ''}`;
  refs.tokenCount!.className = `token-count ${tokenColorClass(tokens)}`;

  const model = PROVIDER_MODELS[state.llmProvider];
  const limit = TOKEN_THRESHOLDS.MODEL_LIMITS[model as keyof typeof TOKEN_THRESHOLDS.MODEL_LIMITS] ?? 128000;
  refs.tokenWarning!.classList.toggle('hidden', tokens <= limit * 0.85);
}


export async function copyPreviewText(text: string, btn: HTMLButtonElement): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    showCopySuccess(btn);
  } catch (err: unknown) {
    setError(`Copy failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}


function showCopySuccess(btn: HTMLButtonElement): void {
  const isMain = btn === refs.btnCopyMd;
  const originalText = isMain ? btn.textContent : null;

  btn.classList.add('copy-success');
  if (isMain) btn.textContent = t('popup_copied');

  setTimeout(() => {
    btn.classList.remove('copy-success');
    if (isMain && originalText) btn.textContent = originalText;
  }, 2000);
}


export function wirePreview(): void {
  refs.btnPreviewToggle!.addEventListener('click', () => {
    setPreviewOpen(!state.previewOpen);
  });

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

  refs.btnCopyMd!.addEventListener('click', async () => {
    const text = state.previewTab === 'prompt' ? state.finalText : state.rawMarkdown;
    if (!text) return;
    await copyPreviewText(text, refs.btnCopyMd!);
  });

  refs.btnPreviewCopy!.addEventListener('click', async () => {
    const text = state.previewTab === 'prompt' ? state.finalText : state.rawMarkdown;
    if (!text) return;
    await copyPreviewText(text, refs.btnPreviewCopy!);
  });
}
