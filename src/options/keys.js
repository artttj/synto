import {
  getOpenAIKey,
  getGeminiKey,
  getGrokKey,
} from '../shared/storage.js';
import { refs } from './dom.js';


function flash(el) {
  el.classList.remove('hidden');
  setTimeout(() => {
    el.classList.add('hidden');
  }, 2000);
}


function setBadge(id, connected) {
  const badge = document.getElementById(id);
  if (!badge) return;

  badge.textContent = connected ? 'Connected' : 'Not Configured';
  badge.className = 'status-badge ' + (connected ? 'connected' : 'unconfigured');
}


export async function loadApiKeyStatuses() {
  const [oaiKey, gemKey, grkKey] = await Promise.all([
    getOpenAIKey(),
    getGeminiKey(),
    getGrokKey(),
  ]);

  setBadge('badge-openai', !!oaiKey);
  setBadge('badge-gemini', !!gemKey);
  setBadge('badge-grok', !!grkKey);
  refs.navAiWarning.classList.toggle(
    'hidden',
    !!(oaiKey && gemKey && grkKey)
  );
}


export function wireKeySection({
  inputId,
  toggleId,
  saveId,
  clearId,
  savedId,
  getKey,
  saveKey,
}) {
  const inputEl = document.getElementById(inputId);
  const toggleEl = document.getElementById(toggleId);
  const saveEl = document.getElementById(saveId);
  const clearEl = document.getElementById(clearId);
  const savedEl = document.getElementById(savedId);

  getKey().then((k) => {
    if (k) {
      inputEl.value = k;
    }
  });

  toggleEl.addEventListener('click', () => {
    inputEl.type = inputEl.type === 'password' ? 'text' : 'password';
  });

  saveEl.addEventListener('click', async () => {
    await saveKey(inputEl.value.trim());
    await loadApiKeyStatuses();
    flash(savedEl);
  });

  clearEl.addEventListener('click', async () => {
    inputEl.value = '';
    await saveKey('');
    await loadApiKeyStatuses();
    flash(savedEl);
  });
}
