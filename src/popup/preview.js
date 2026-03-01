import { TOKEN_THRESHOLDS, estimateTokens, tokenColorClass } from '../shared/constants.js';
import { state, PROVIDER_MODELS } from './state.js';
import { refs } from './dom.js';
import { setError } from './errors.js';


export function updatePreviewText() {
  const isPrompt = state.previewTab === 'prompt';
  refs.previewText.value = isPrompt ? state.finalText : state.rawMarkdown;
  refs.btnCopyMd.textContent = isPrompt ? 'Copy Prompt' : 'Copy Markdown';
}


export function setPreviewOpen(open) {
  state.previewOpen = open;
  refs.previewPanel.classList.toggle('collapsed', !open);
  refs.previewArrow.textContent = open ? '▴' : '▾';
  refs.btnPreviewToggle.setAttribute('aria-expanded', String(open));
}


export function updateTokenDisplay(text) {
  const tokens = estimateTokens(text);
  const src = state.extracted?.source ?? '';
  refs.tokenCount.textContent = `~${tokens.toLocaleString()}${src ? ` · ${src}` : ''}`;
  refs.tokenCount.className = `token-count ${tokenColorClass(tokens)}`;

  const model = PROVIDER_MODELS[state.llmProvider];
  const limit = TOKEN_THRESHOLDS.MODEL_LIMITS[model] ?? 128000;
  refs.tokenWarning.classList.toggle('hidden', tokens <= limit * 0.85);
}


export async function copyPreviewText(text, btn) {
  try {
    await navigator.clipboard.writeText(text);
    showCopySuccess(btn);
  } catch (err) {
    setError(`Copy failed: ${err.message}`);
  }
}


function showCopySuccess(btn) {
  const isMain = btn === refs.btnCopyMd;
  const originalText = isMain ? btn.textContent : null;

  btn.classList.add('copy-success');
  if (isMain) btn.textContent = 'Copied!';

  setTimeout(() => {
    btn.classList.remove('copy-success');
    if (isMain) btn.textContent = originalText;
  }, 2000);
}


export function wirePreview() {
  refs.btnPreviewToggle.addEventListener('click', () => {
    setPreviewOpen(!state.previewOpen);
  });

  document.querySelectorAll('.preview-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.preview-tab').forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      state.previewTab = btn.dataset.tab;
      updatePreviewText();
      if (!state.previewOpen) setPreviewOpen(true);
    });
  });

  refs.btnCopyMd.addEventListener('click', async () => {
    const text = state.previewTab === 'prompt' ? state.finalText : state.rawMarkdown;
    if (!text) return;
    await copyPreviewText(text, refs.btnCopyMd);
  });
}
