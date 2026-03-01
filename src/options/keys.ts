/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */
import {
  getOpenAIKey,
  getGeminiKey,
  getGrokKey,
} from '../shared/storage';
import { refs } from './dom';


function flash(el: HTMLElement): void {
  el.classList.remove('hidden');
  setTimeout(() => {
    el.classList.add('hidden');
  }, 2000);
}


function setBadge(id: string, connected: boolean): void {
  const badge = document.getElementById(id);
  if (!badge) return;

  badge.textContent = connected ? 'Connected' : 'Not Configured';
  badge.className = 'status-badge ' + (connected ? 'connected' : 'unconfigured');
}


export async function loadApiKeyStatuses(): Promise<void> {
  const [oaiKey, gemKey, grkKey] = await Promise.all([
    getOpenAIKey(),
    getGeminiKey(),
    getGrokKey(),
  ]);

  setBadge('badge-openai', !!oaiKey);
  setBadge('badge-gemini', !!gemKey);
  setBadge('badge-grok', !!grkKey);
  refs.navAiWarning!.classList.toggle(
    'hidden',
    !!(oaiKey && gemKey && grkKey)
  );
}


interface KeySectionConfig {
  inputId: string;
  toggleId: string;
  saveId: string;
  clearId: string;
  savedId: string;
  getKey: () => Promise<string>;
  saveKey: (key: string) => Promise<void>;
}

export function wireKeySection({
  inputId,
  toggleId,
  saveId,
  clearId,
  savedId,
  getKey,
  saveKey,
}: KeySectionConfig): void {
  const inputEl = document.getElementById(inputId) as HTMLInputElement;
  const toggleEl = document.getElementById(toggleId)!;
  const saveEl = document.getElementById(saveId)!;
  const clearEl = document.getElementById(clearId)!;
  const savedEl = document.getElementById(savedId)!;

  void getKey().then((k) => {
    if (k) inputEl.value = k;
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
