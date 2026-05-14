/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */

import {
  getTemplates,
  getSettings,
  getOpenAIKey,
  getGeminiKey,
  getGrokKey,
  getOpenRouterKey,
  getZaiKey,
  getAnthropicKey,
  getCustomKey,
  getOllamaKey,
  getHistory,
  normalizeUrl,
} from '../shared/storage';
import { STORAGE_KEYS, PROVIDER_MODELS, MSG } from '../shared/constants';
import { setLocale, applyI18n, t } from '../shared/i18n';
import { state, getAskLabel } from './state';
import { resolveRefs, refs } from './dom';
import { setError } from './errors';
import { renderTemplateUI, wireTemplateUI } from './templates';
import { wirePreview } from './preview';
import { wireChat, restoreHistoryEntry } from './chat';
import { wireKeyboard } from './keyboard';
import { extractContent, scrollAndRescan } from './extract';

type Provider = 'openai' | 'gemini' | 'grok' | 'openrouter' | 'zai' | 'anthropic' | 'ollama' | 'custom';

function isProvider(value: unknown): value is Provider {
  return typeof value === 'string' && value in PROVIDER_MODELS;
}

let toastTimer: ReturnType<typeof setTimeout> | null = null;

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


async function init(): Promise<void> {
  resolveRefs();

  const [templates, settings] = await Promise.all([getTemplates(), getSettings()]);

  setLocale(settings.language ?? 'en');
  applyI18n();

  document.documentElement.dataset.theme = settings.theme ?? 'dark';
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
  state.pinnedIds       = settings.pinnedTemplateIds;
  refs.btnProcess!.textContent = getAskLabel();

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
    if (area === 'local' && changes[STORAGE_KEYS.TEMPLATES]) {
      void getTemplates().then((templates) => {
        state.templates = templates;
        renderTemplateUI();
      });
    }
    if (area === 'sync' && !state.chatStreaming) {
      const settingsChange = changes[STORAGE_KEYS.SETTINGS]?.newValue;
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
        if (settingsChange.theme) {
          document.documentElement.dataset.theme = settingsChange.theme;
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
