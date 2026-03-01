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

  applyTheme(state.settings.theme ?? 'dark');
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

  function navigateToTab(tabId: string) {
    document.querySelectorAll('.nav-item').forEach((n) => n.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach((p) => p.classList.add('hidden'));
    const navBtn = document.querySelector<HTMLElement>(`.nav-item[data-tab="${tabId}"]`);
    if (navBtn) navBtn.classList.add('active');
    const panel = document.getElementById(`tab-${tabId}`);
    if (panel) panel.classList.remove('hidden');
    refs.btnNewTemplate!.classList.toggle('hidden', tabId !== 'prompt-library');
  }

  document.querySelectorAll('.nav-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      navigateToTab((btn as HTMLElement).dataset.tab!);
    });
  });

  // Support deep-linking via hash (e.g. options.html#help)
  const hash = location.hash.replace('#', '');
  if (hash && document.querySelector(`.nav-item[data-tab="${hash}"]`)) {
    navigateToTab(hash);
  }
}


init().catch((err: unknown) => {
  console.error('[Synto] Init failed:', err instanceof Error ? err.message : String(err));
});
