import { MSG_EXTRACT } from './selectors.js';
import { extractContent } from './extract.js';

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type !== MSG_EXTRACT) return;

  try {
    const result = extractContent(message.mode ?? 'markdown');
    sendResponse(result);
  } catch (err) {
    sendResponse({ success: false, error: err.message });
  }

  return true;
});
