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
} from '../shared/storage';
import { STORAGE_KEYS } from '../shared/constants';
import { state, getAskLabel } from './state';
import { resolveRefs, refs } from './dom';
import { setError } from './errors';
import { renderTemplateUI, wireTemplateUI } from './templates';
import { wirePreview } from './preview';
import { wireChat } from './chat';
import { wireKeyboard } from './keyboard';
import { extractContent } from './extract';


async function init(): Promise<void> {
  resolveRefs();

  const [templates, settings] = await Promise.all([getTemplates(), getSettings()]);

  document.documentElement.dataset.theme = settings.theme ?? 'dark';
  state.templates = templates;
  state.selectedTemplateId = settings.defaultTemplateId ?? templates[0]?.id ?? null;
  state.llmProvider = settings.llmProvider ?? 'openai';
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

  await extractContent();

  const keyGetters: Record<string, () => Promise<string>> = {
    openai: getOpenAIKey,
    gemini: getGeminiKey,
    grok: getGrokKey,
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
    if (changes['llmProvider'] && !state.chatStreaming) {
      state.llmProvider = String(changes['llmProvider'].newValue ?? 'openai');
      refs.btnProcess!.textContent = getAskLabel();
    }
  });
}


init().catch((err: unknown) => {
  console.error('[Synto] Init failed:', err);
  setError(`Initialization error: ${err instanceof Error ? err.message : String(err)}`);
});
