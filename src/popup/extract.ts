/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */

import { MSG } from '../shared/constants';
import { state } from './state';
import { refs } from './dom';
import { setError } from './errors';
import { applyTemplateAndUpdate } from './templates';


export function disableActions(): void {
  refs.btnCopyMd!.disabled = true;
  refs.btnProcess!.disabled = true;
}


interface ExtractResponse {
  success: boolean;
  error?: string;
  content: string;
  selection?: string;
  title: string;
  url: string;
  excerpt?: string;
  byline?: string;
  siteName?: string;
  source?: string;
  mode?: string;
}

async function sendExtract(tabId: number): Promise<void> {
  const response = (await chrome.tabs.sendMessage(tabId, {
    type: MSG.EXTRACT_CONTENT,
    mode: 'markdown',
  })) as unknown as ExtractResponse;

  if (!response?.success) throw new Error(response?.error ?? 'Extraction failed.');

  state.extracted = response;
  state.rawMarkdown = response.content;
  applyTemplateAndUpdate();
}


export async function extractContent(): Promise<void> {
  setError(null);
  disableActions();
  refs.previewPanel!.classList.add('hidden');
  state.chatHistory = [];
  refs.chatInputRow!.classList.add('hidden');

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab?.id || tab.url?.startsWith('chrome://') || tab.url?.startsWith('chrome-extension://')) {
    setError('Cannot extract from this page type. Navigate to a regular web page.');
    disableActions();
    return;
  }

  try {
    await sendExtract(tab.id);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message?.includes('Receiving end does not exist')) {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content/content.js'],
        });
        await sendExtract(tab.id);
      } catch {
        setError('Could not reach the page. Click ↻ to try again.');
        disableActions();
      }
    } else {
      setError(message);
      disableActions();
    }
  }
}
