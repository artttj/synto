/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */

import { getTemplates, getSettings } from '../shared/storage';
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
    void chrome.runtime.openOptionsPage();
  });

  await extractContent();

  chrome.tabs.onActivated.addListener(() => { void extractContent(); });
  chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.active) void extractContent();
  });
}


init().catch((err: unknown) => {
  console.error('[Synto] Init failed:', err);
  setError(`Initialization error: ${err instanceof Error ? err.message : String(err)}`);
});
