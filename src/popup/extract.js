/**
 * Extract page content via content script. Handles errors and "reload tab" flow.
 */

import { MSG } from '../shared/constants.js';
import { state } from './state.js';
import { refs } from './dom.js';
import { setError, setErrorWithReload } from './errors.js';
import { applyTemplateAndUpdate } from './templates.js';


export function disableActions() {
  refs.btnCopyMd.disabled = true;
  refs.btnProcess.disabled = true;
}


export async function extractContent() {
  setError(null);
  disableActions();
  refs.previewPanel.classList.add('hidden');
  state.chatHistory = [];
  refs.chatInputRow.classList.add('hidden');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (
      !tab?.id ||
      tab.url?.startsWith('chrome://') ||
      tab.url?.startsWith('chrome-extension://')
    ) {
      throw new Error(
        'Cannot extract from this page type. Navigate to a regular web page.'
      );
    }

    const response = await chrome.tabs.sendMessage(tab.id, {
      type: MSG.EXTRACT_CONTENT,
      mode: 'markdown',
    });

    if (!response?.success) {
      throw new Error(response?.error ?? 'Extraction failed.');
    }

    state.extracted = response;
    state.rawMarkdown = response.content;
    applyTemplateAndUpdate();
  } catch (err) {
    if (err.message?.includes('Receiving end does not exist')) {
      setErrorWithReload('Extension not connected to this tab.');
    } else {
      setError(err.message);
    }
    disableActions();
  }
}
