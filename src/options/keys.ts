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
} from '../shared/storage';
import { t } from '../shared/i18n';
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

  badge.textContent = connected ? t('status_connected') : t('status_not_configured');
  badge.className = 'status-badge ' + (connected ? 'connected' : 'unconfigured');
}


export async function loadApiKeyStatuses(): Promise<void> {
  const [oaiKey, gemKey, grkKey, orKey, zaiKey, antKey, custKey] = await Promise.all([
    getOpenAIKey(),
    getGeminiKey(),
    getGrokKey(),
    getOpenRouterKey(),
    getZaiKey(),
    getAnthropicKey(),
    getCustomKey(),
  ]);

  setBadge('badge-openai', !!oaiKey);
  setBadge('badge-gemini', !!gemKey);
  setBadge('badge-grok', !!grkKey);
  setBadge('badge-openrouter', !!orKey);
  setBadge('badge-zai', !!zaiKey);
  setBadge('badge-anthropic', !!antKey);

  const customEndpoint = (document.getElementById('custom-endpoint') as HTMLInputElement)?.value?.trim();
  setBadge('badge-custom', !!customEndpoint);

  const anyConfigured = !!(oaiKey || gemKey || grkKey || orKey || zaiKey || antKey || customEndpoint);
  refs.navAiWarning!.classList.toggle('hidden', anyConfigured);
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
