/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */

import { MSG_EXTRACT } from './selectors';
import { extractContent } from './extract';

chrome.runtime.onMessage.addListener((message: { type: string; mode?: string }, _sender, sendResponse) => {
  if (message.type !== MSG_EXTRACT) return;

  try {
    const result = extractContent(message.mode ?? 'markdown');
    sendResponse(result);
  } catch (err: unknown) {
    sendResponse({ success: false, error: err instanceof Error ? err.message : String(err) });
  }

  return true;
});
