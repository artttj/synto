/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */

import { getTemplates, getSettings } from '../shared/storage';
import {
  getOpenAIKey,
  saveOpenAIKey,
  getGeminiKey,
  saveGeminiKey,
  getGrokKey,
  saveGrokKey,
} from '../shared/storage';
import { setLocale, applyI18n } from '../shared/i18n';
import { resolveRefs, refs } from './dom';
import { state } from './state';
import {
  applyTheme,
  renderSettingsForm,
  wireSettingsSave,
} from './settings';
import { loadApiKeyStatuses, wireKeySection } from './keys';
import {
  renderTemplateList,
  wireTemplateList,
} from './templateList';


async function init(): Promise<void> {
  resolveRefs();

  const [templates, settings] = await Promise.all([
    getTemplates(),
    getSettings(),
  ]);

  state.templates = templates;
  state.settings = settings;

  setLocale(settings.language ?? 'en');
  applyTheme(state.settings.theme ?? 'dark');
  applyI18n();

  renderSettingsForm();
  renderTemplateList();

  const manifest = chrome.runtime.getManifest();
  const versionEl = document.getElementById('about-version');
  if (versionEl) versionEl.textContent = manifest.version;
  await loadApiKeyStatuses();

  wireSettingsSave(getSettings);

  wireKeySection({
    inputId: 'openai-key',
    toggleId: 'btn-toggle-key',
    saveId: 'btn-save-key',
    clearId: 'btn-clear-key',
    savedId: 'key-saved',
    getKey: getOpenAIKey,
    saveKey: saveOpenAIKey,
  });
  wireKeySection({
    inputId: 'gemini-key',
    toggleId: 'btn-toggle-gemini-key',
    saveId: 'btn-save-gemini-key',
    clearId: 'btn-clear-gemini-key',
    savedId: 'gemini-key-saved',
    getKey: getGeminiKey,
    saveKey: saveGeminiKey,
  });
  wireKeySection({
    inputId: 'grok-key',
    toggleId: 'btn-toggle-grok-key',
    saveId: 'btn-save-grok-key',
    clearId: 'btn-clear-grok-key',
    savedId: 'grok-key-saved',
    getKey: getGrokKey,
    saveKey: saveGrokKey,
  });

  wireTemplateList();

  const HINT_KEY = 'apc_hint_fab';

  async function dismissFabHint(): Promise<void> {
    refs.fabHint?.classList.add('hidden');
    await chrome.storage.local.set({ [HINT_KEY]: true });
  }

  refs.btnNewTemplate!.addEventListener('click', dismissFabHint, { once: true });

  const { [HINT_KEY]: hintSeen } = await chrome.storage.local.get(HINT_KEY);

  function navigateToTab(tabId: string) {
    document.querySelectorAll('.nav-item').forEach((n) => n.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach((p) => p.classList.add('hidden'));
    const navBtn = document.querySelector<HTMLElement>(`.nav-item[data-tab="${tabId}"]`);
    if (navBtn) navBtn.classList.add('active');
    const panel = document.getElementById(`tab-${tabId}`);
    if (panel) panel.classList.remove('hidden');
    const isLibrary = tabId === 'prompt-library';
    refs.btnNewTemplate!.classList.toggle('hidden', !isLibrary);
    refs.fabHint?.classList.toggle('hidden', !isLibrary || !!hintSeen);
  }

  document.querySelectorAll('.nav-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      navigateToTab((btn as HTMLElement).dataset.tab!);
    });
  });

  const hash = location.hash.replace('#', '');
  if (hash && document.querySelector(`.nav-item[data-tab="${hash}"]`)) {
    navigateToTab(hash);
  }
}


init().catch((err: unknown) => {
  console.error('[Synto] Init failed:', err instanceof Error ? err.message : String(err));
});
