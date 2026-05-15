/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */

import { getTemplates, getSettings, saveSettings } from '../shared/storage';
import { CUSTOM_ENDPOINT_DEFAULT, OLLAMA_ENDPOINT_DEFAULT } from '../shared/constants';
import {
  getOpenAIKey,
  saveOpenAIKey,
  getGeminiKey,
  saveGeminiKey,
  getGrokKey,
  saveGrokKey,
  getOpenRouterKey,
  saveOpenRouterKey,
  getZaiKey,
  saveZaiKey,
  getAnthropicKey,
  saveAnthropicKey,
  getCustomKey,
  saveCustomKey,
  getOllamaKey,
  saveOllamaKey,
} from '../shared/storage';
import { setLocale, applyI18n } from '../shared/i18n';
import { resolveRefs, refs } from './dom';
import { state } from './state';
import {
  applyTheme,
  renderSettingsForm,
  wireAutoSave,
  updateProviderCardVisibility,
} from './settings';
import { loadApiKeyStatuses, wireKeySection } from './keys';
import {
  renderTemplateList,
  wireTemplateList,
} from './templateList';
import { showToast } from './utils';


async function init(): Promise<void> {
  resolveRefs();

  const [templates, settings] = await Promise.all([
    getTemplates(),
    getSettings(),
  ]);

  state.templates = templates;
  state.settings = settings;

  setLocale(settings.language ?? 'en');
  applyTheme(state.settings.theme ?? 'system');
  applyI18n();

  renderSettingsForm();
  updateProviderCardVisibility(state.settings.llmProvider ?? 'openai');
  renderTemplateList();

  refs.languageEl!.addEventListener('change', () => {
    const lang = refs.languageEl!.value;
    setLocale(lang);
    applyI18n();
    renderTemplateList();
    void loadApiKeyStatuses();
    void saveSettings({ language: lang });
  });

  const manifest = chrome.runtime.getManifest();
  const versionEl = document.getElementById('about-version');
  if (versionEl) versionEl.textContent = manifest.version;
  await loadApiKeyStatuses();

  wireAutoSave();

  wireKeySection({
    inputId: 'openai-key',
    toggleId: 'btn-toggle-key',
    saveId: 'btn-save-key',
    clearId: 'btn-clear-key',
    savedId: 'key-saved',
    provider: 'OpenAI',
    getKey: getOpenAIKey,
    saveKey: saveOpenAIKey,
  });
  wireKeySection({
    inputId: 'gemini-key',
    toggleId: 'btn-toggle-gemini-key',
    saveId: 'btn-save-gemini-key',
    clearId: 'btn-clear-gemini-key',
    savedId: 'gemini-key-saved',
    provider: 'Gemini',
    getKey: getGeminiKey,
    saveKey: saveGeminiKey,
  });
  wireKeySection({
    inputId: 'grok-key',
    toggleId: 'btn-toggle-grok-key',
    saveId: 'btn-save-grok-key',
    clearId: 'btn-clear-grok-key',
    savedId: 'grok-key-saved',
    provider: 'Grok',
    getKey: getGrokKey,
    saveKey: saveGrokKey,
  });
  wireKeySection({
    inputId: 'openrouter-key',
    toggleId: 'btn-toggle-openrouter-key',
    saveId: 'btn-save-openrouter-key',
    clearId: 'btn-clear-openrouter-key',
    savedId: 'openrouter-key-saved',
    provider: 'OpenRouter',
    getKey: getOpenRouterKey,
    saveKey: saveOpenRouterKey,
  });
  wireKeySection({
    inputId: 'zai-key',
    toggleId: 'btn-toggle-zai-key',
    saveId: 'btn-save-zai-key',
    clearId: 'btn-clear-zai-key',
    savedId: 'zai-key-saved',
    provider: 'Zai',
    getKey: getZaiKey,
    saveKey: saveZaiKey,
  });
  wireKeySection({
    inputId: 'anthropic-key',
    toggleId: 'btn-toggle-anthropic-key',
    saveId: 'btn-save-anthropic-key',
    clearId: 'btn-clear-anthropic-key',
    savedId: 'anthropic-key-saved',
    provider: 'Anthropic',
    getKey: getAnthropicKey,
    saveKey: saveAnthropicKey,
  });
  wireKeySection({
    inputId: 'custom-key',
    toggleId: 'btn-toggle-custom-key',
    saveId: 'btn-save-custom',
    clearId: 'btn-clear-custom',
    savedId: 'custom-key-saved',
    provider: 'Custom',
    getKey: getCustomKey,
    saveKey: saveCustomKey,
  });
  wireKeySection({
    inputId: 'ollama-key',
    toggleId: 'btn-toggle-ollama-key',
    saveId: 'btn-save-ollama',
    clearId: 'btn-clear-ollama',
    savedId: 'ollama-key-saved',
    provider: 'Ollama',
    getKey: getOllamaKey,
    saveKey: saveOllamaKey,
  });

  refs.btnSaveCustom!.addEventListener('click', async () => {
    await saveSettings({
      customEndpoint: refs.customEndpointEl?.value ?? CUSTOM_ENDPOINT_DEFAULT,
      customModel: refs.customModelEl?.value ?? '',
      customUseAuth: refs.customUseAuthEl?.checked ?? false,
    });
    showToast('Custom endpoint saved');
  });

  refs.btnClearCustom!.addEventListener('click', async () => {
    if (refs.customEndpointEl) refs.customEndpointEl.value = CUSTOM_ENDPOINT_DEFAULT;
    if (refs.customModelEl) refs.customModelEl.value = '';
    if (refs.customUseAuthEl) refs.customUseAuthEl.checked = false;
    await saveSettings({
      customEndpoint: CUSTOM_ENDPOINT_DEFAULT,
      customModel: '',
      customUseAuth: false,
    });
    showToast('Custom endpoint cleared');
  });

  refs.btnSaveOllama!.addEventListener('click', async () => {
    await saveSettings({
      ollamaEndpoint: refs.ollamaEndpointEl?.value ?? OLLAMA_ENDPOINT_DEFAULT,
      ollamaModel: refs.ollamaModelEl?.value ?? 'kimi-k2.6',
      ollamaUseAuth: refs.ollamaUseAuthEl?.checked ?? true,
    });
    showToast('Ollama settings saved');
  });

  refs.btnClearOllama!.addEventListener('click', async () => {
    if (refs.ollamaEndpointEl) refs.ollamaEndpointEl.value = OLLAMA_ENDPOINT_DEFAULT;
    if (refs.ollamaModelEl) refs.ollamaModelEl.value = 'kimi-k2.6';
    if (refs.ollamaUseAuthEl) refs.ollamaUseAuthEl.checked = true;
    await saveSettings({
      ollamaEndpoint: OLLAMA_ENDPOINT_DEFAULT,
      ollamaModel: 'kimi-k2.6',
      ollamaUseAuth: true,
    });
    showToast('Ollama settings cleared');
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
