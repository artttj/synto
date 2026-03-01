import { STORAGE_KEYS, DEFAULT_TEMPLATES } from '../shared/constants';

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((err) => {
    console.error('[Synto] setPanelBehavior failed:', err);
  });

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason !== 'install') return;

  try {
    const existing = await chrome.storage.sync.get(STORAGE_KEYS.TEMPLATES);
    if (!existing[STORAGE_KEYS.TEMPLATES]) {
      await chrome.storage.sync.set({
        [STORAGE_KEYS.TEMPLATES]: DEFAULT_TEMPLATES,
      });
    }
  } catch (err) {
    console.error('[Synto] onInstalled seed failed:', err);
  }
});
