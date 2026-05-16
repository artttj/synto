/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */

import {
  getTemplates,
  getSettings,
  saveSettings,
  getOpenAIKey,
  getGeminiKey,
  getGrokKey,
  getOpenRouterKey,
  getZaiKey,
  getAnthropicKey,
  getCustomKey,
  getOllamaKey,
  getHistory,
  getProviderHealth,
  providerHealthLabel,
  normalizeUrl,
  runMigrations,
  type Settings,
} from '../shared/storage';
import { STORAGE_KEYS, MSG } from '../shared/constants';
import { setLocale, applyI18n, t } from '../shared/i18n';
import { applyAndWatchTheme } from '../shared/theme';
import { state, getAskLabel, getActiveModel } from './state';
import { resolveRefs, refs, renderFooter } from './dom';
import { setError } from './errors';
import { renderTemplateUI, wireTemplateUI } from './templates';
import { wirePreview } from './preview';
import { wireChat, restoreHistoryEntry } from './chat';
import { wireKeyboard } from './keyboard';
import { extractContent, scrollAndRescan } from './extract';

let toastTimer: ReturnType<typeof setTimeout> | null = null;

async function renderProviderHealth(): Promise<void> {
  if (!refs.providerHealth) return;
  const health = await getProviderHealth();
  const entry = health[state.llmProvider];
  if (!entry) {
    refs.providerHealth.classList.add('hidden');
    return;
  }
  refs.providerHealth.classList.remove('hidden');
  refs.providerHealth.className = `provider-health ${entry.status}`;
  refs.providerHealth.title = `${providerHealthLabel(entry)} — ${new Date(entry.ts).toLocaleString()}`;
}

export function showContentToast(message: string): void {
  if (!refs.contentToast) return;
  refs.contentToast.textContent = message;
  refs.contentToast.classList.add('visible');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    refs.contentToast!.classList.remove('visible');
    toastTimer = null;
  }, 2000);
}


function wireThemeToggle(unwatchTheme: { current: (() => void) | null }, initialTheme: string): void {
  const themeOrder = ['system', 'light', 'dark'] as const;
  const sync = (mode: string) => {
    refs.btnTheme?.setAttribute('data-theme-mode', mode);
    refs.btnTheme?.setAttribute('title', `Theme: ${mode}`);
  };
  sync(initialTheme);
  refs.btnTheme?.addEventListener('click', () => {
    const current = (refs.btnTheme!.dataset.themeMode ?? 'dark') as typeof themeOrder[number];
    const idx = themeOrder.indexOf(current);
    const next = themeOrder[(idx + 1) % themeOrder.length];
    sync(next);
    applyAndWatchTheme(next, unwatchTheme);
    void saveSettings({ theme: next });
  });
}


async function init(): Promise<void> {
  resolveRefs();

  const unwatchTheme = { current: null as (() => void) | null };
  wireThemeToggle(unwatchTheme, 'system');

  await runMigrations();

  const [templates, settings] = await Promise.all([getTemplates(), getSettings()]);

  setLocale(settings.language ?? 'en');
  applyI18n();

  refs.btnTheme?.setAttribute('data-theme-mode', settings.theme ?? 'dark');
  refs.btnTheme?.setAttribute('title', `Theme: ${settings.theme ?? 'dark'}`);
  applyAndWatchTheme(settings.theme ?? 'dark', unwatchTheme);
  state.templates = templates;
  state.selectedTemplateId = settings.defaultTemplateId ?? templates[0]?.id ?? null;
  state.llmProvider = settings.llmProvider ?? 'openai';
  state.systemPrompt = settings.systemPrompt;
  state.openaiModel     = settings.openaiModel;
  state.geminiModel     = settings.geminiModel;
  state.grokModel       = settings.grokModel;
  state.openrouterModel = settings.openrouterModel;
  state.zaiModel        = settings.zaiModel;
  state.anthropicModel  = settings.anthropicModel;
  state.customEndpoint  = settings.customEndpoint;
  state.customModel     = settings.customModel ?? '';
  state.customUseAuth   = settings.customUseAuth;
  state.ollamaModel     = settings.ollamaModel;
  state.ollamaEndpoint  = settings.ollamaEndpoint;
  state.ollamaUseAuth   = settings.ollamaUseAuth;
  refs.btnProcess!.textContent = getAskLabel();
  renderFooter(state.llmProvider, getActiveModel());
  void renderProviderHealth();

  renderTemplateUI();
  wireTemplateUI();
  wirePreview();
  wireChat();
  wireKeyboard();

  refs.btnOptions!.addEventListener('click', () => { void chrome.runtime.openOptionsPage(); });
  refs.btnHelp!.addEventListener('click', () => {
    void chrome.tabs.create({ url: chrome.runtime.getURL('options/options.html') + '#help' });
  });

  refs.chatOptionsLink!.addEventListener('click', (e) => {
    e.preventDefault();
    void chrome.tabs.create({ url: chrome.runtime.getURL('options/options.html#ai-connections') });
  });

  refs.btnRefreshContent!.addEventListener('click', () => { void extractContent(); });
  refs.btnScrollRescan!.addEventListener('click', () => { void scrollAndRescan(); });

  const btnInfo = document.getElementById('btn-content-info')! as HTMLButtonElement;
  const infoPopover = document.getElementById('content-info-popover')!;
  const key = navigator.userAgent.includes('Mac') ? '⌘A' : 'Ctrl+A';
  infoPopover.textContent = `Content not fully loaded? Press ${key} to re-extract.`;
  btnInfo.addEventListener('click', (e) => { e.stopPropagation(); infoPopover.classList.toggle('hidden'); });
  document.addEventListener('click', () => { infoPopover.classList.add('hidden'); });

  await extractContent();

  const currentUrl = state.extracted?.url;
  if (currentUrl) {
    const history = await getHistory(normalizeUrl(currentUrl));
    if (history.length > 0) {
      const entry = history[0];
      const date = new Date(entry.ts).toLocaleDateString();
      refs.chatPanel!.classList.remove('hidden');
      refs.chatHistoryBanner!.classList.remove('hidden');
      if (refs.chatHistoryLabel) {
        refs.chatHistoryLabel.textContent = `${t('popup_history_restore')} — ${date}`;
      }
      refs.btnHistoryRestore!.addEventListener('click', () => {
        restoreHistoryEntry(entry.messages);
      });
      refs.btnHistoryDismiss!.addEventListener('click', () => {
        refs.chatHistoryBanner!.classList.add('hidden');
        refs.chatPanel!.classList.add('hidden');
      });
    }
  }

  const keyGetters: Record<string, () => Promise<string>> = {
    openai:     getOpenAIKey,
    gemini:     getGeminiKey,
    grok:       getGrokKey,
    openrouter: getOpenRouterKey,
    zai:        getZaiKey,
    anthropic:  getAnthropicKey,
    ollama:     getOllamaKey,
    custom:     getCustomKey,
  };
  const currentKey = await keyGetters[state.llmProvider]?.();
  if (currentKey) refs.chatNoKey?.classList.add('hidden');

  chrome.tabs.onActivated.addListener(() => { void extractContent(); });
  chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.active) void extractContent();
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local') {
      if (changes[STORAGE_KEYS.TEMPLATES]) {
        void getTemplates().then((templates) => {
          state.templates = templates;
          renderTemplateUI();
        });
      }
      if (changes[STORAGE_KEYS.PROVIDER_HEALTH]) {
        void renderProviderHealth();
      }
    }
    if (area === 'sync' && !state.chatStreaming) {
      const settingsChange = changes[STORAGE_KEYS.SETTINGS]?.newValue as Partial<Settings> | undefined;
      if (settingsChange) {
        state.llmProvider = settingsChange.llmProvider ?? state.llmProvider;
        state.openaiModel = settingsChange.openaiModel ?? state.openaiModel;
        state.geminiModel = settingsChange.geminiModel ?? state.geminiModel;
        state.grokModel = settingsChange.grokModel ?? state.grokModel;
        state.openrouterModel = settingsChange.openrouterModel ?? state.openrouterModel;
        state.zaiModel = settingsChange.zaiModel ?? state.zaiModel;
        state.anthropicModel = settingsChange.anthropicModel ?? state.anthropicModel;
        state.ollamaModel = settingsChange.ollamaModel ?? state.ollamaModel;
        state.ollamaEndpoint = settingsChange.ollamaEndpoint ?? state.ollamaEndpoint;
        state.ollamaUseAuth = settingsChange.ollamaUseAuth ?? state.ollamaUseAuth;
        state.customEndpoint = settingsChange.customEndpoint ?? state.customEndpoint;
        state.customModel = settingsChange.customModel ?? state.customModel;
        state.customUseAuth = settingsChange.customUseAuth ?? state.customUseAuth;
        refs.btnProcess!.textContent = getAskLabel();
        renderFooter(state.llmProvider, getActiveModel());
        if (settingsChange.theme) {
          applyAndWatchTheme(settingsChange.theme, unwatchTheme);
          refs.btnTheme?.setAttribute('data-theme-mode', settingsChange.theme);
          refs.btnTheme?.setAttribute('title', `Theme: ${settingsChange.theme}`);
        }
      }
    }
  });

  chrome.runtime.onMessage.addListener((message: { type: string }) => {
    if (message.type === MSG.CONTENT_UPDATE) {
      void extractContent().then(() => {
        showContentToast(t('popup_content_updated'));
      });
    }
  });
}


init().catch((err: unknown) => {
  console.error('[Synto] Init failed:', err);
  setError(`Initialization error: ${err instanceof Error ? err.message : String(err)}`);
});
