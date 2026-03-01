import { getTemplates, getSettings } from '../shared/storage';
import { state, getAskLabel } from './state';
import { resolveRefs, refs } from './dom';
import { setError } from './errors';
import { renderTemplateSelect, wireTemplateSelect } from './templates';
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

  renderTemplateSelect();
  wireTemplateSelect();
  wirePreview();
  wireChat();
  wireKeyboard();

  refs.btnOptions!.addEventListener('click', () => chrome.runtime.openOptionsPage());
  refs.chatOptionsLink!.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });

  await extractContent();

  chrome.tabs.onActivated.addListener(() => extractContent());
  chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.active) extractContent();
  });
}


init().catch((err: unknown) => {
  console.error('[Synto] Init failed:', err);
  setError(`Initialization error: ${err instanceof Error ? err.message : String(err)}`);
});
