import { getTemplates, getSettings } from '../shared/storage.js';
import { state, getAskLabel } from './state.js';
import { resolveRefs, refs } from './dom.js';
import { setError } from './errors.js';
import { renderTemplateSelect, wireTemplateSelect } from './templates.js';
import { wirePreview } from './preview.js';
import { wireChat } from './chat.js';
import { wireKeyboard } from './keyboard.js';
import { extractContent } from './extract.js';


async function init() {
  resolveRefs();

  const [templates, settings] = await Promise.all([getTemplates(), getSettings()]);

  document.documentElement.dataset.theme = settings.theme ?? 'dark';
  state.templates = templates;
  state.selectedTemplateId = settings.defaultTemplateId ?? templates[0]?.id ?? null;
  state.llmProvider = settings.llmProvider ?? 'openai';
  refs.btnProcess.textContent = getAskLabel();

  renderTemplateSelect();
  wireTemplateSelect();
  wirePreview();
  wireChat();
  wireKeyboard();

  refs.btnOptions.addEventListener('click', () => chrome.runtime.openOptionsPage());
  refs.chatOptionsLink.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });

  await extractContent();

  chrome.tabs.onActivated.addListener(() => extractContent());
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.active) extractContent();
  });
}


init().catch((err) => {
  console.error('[Synto] Init failed:', err);
  setError(`Initialization error: ${err.message}`);
});
