/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */

import { MSG_EXTRACT } from './selectors';
import { extractContent, expandBitbucketDiffs, isBitbucketPr } from './extract';

function doExtract(mode: string) {
  try {
    return extractContent(mode ?? 'markdown');
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

chrome.runtime.onMessage.addListener((message: { type: string; mode?: string }, _sender, sendResponse) => {
  if (message.type !== MSG_EXTRACT) return;

  if (isBitbucketPr()) {
    expandBitbucketDiffs();
    const mode = message.mode ?? 'markdown';
    setTimeout(() => {
      sendResponse(doExtract(mode));
    }, 3500);
    return true;
  }

  sendResponse(doExtract(message.mode ?? 'markdown'));
  return true;
});
