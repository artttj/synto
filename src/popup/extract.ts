/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */

import { MSG } from '../shared/constants';
import { state } from './state';
import type { ExtractedContent } from './state';
import { refs } from './dom';
import { setError } from './errors';
import { applyTemplateAndUpdate } from './templates';
import { t } from '../shared/i18n';
import { showContentToast } from './popup';


export function disableActions(): void {
  refs.btnCopyMd!.disabled = true;
  refs.btnProcess!.disabled = true;
}


function errMsg(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function isRestrictedUrl(url?: string): boolean {
  if (!url) return true;
  return url.startsWith('chrome://') || url.startsWith('chrome-extension://') || url.startsWith('about:') || url.startsWith('edge://');
}

async function sendTabMessage(tabId: number, message: Record<string, string>): Promise<ExtractedContent> {
  try {
    const response = await chrome.tabs.sendMessage(tabId, message) as unknown as ExtractedContent;
    if (!response?.success) throw new Error(response?.error ?? 'Extraction failed.');
    return response;
  } catch (err: unknown) {
    if (!errMsg(err).includes('Receiving end does not exist')) throw err;
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content/content.js'],
    });
    const retry = await chrome.tabs.sendMessage(tabId, message) as unknown as ExtractedContent;
    if (!retry?.success) throw new Error(retry?.error ?? 'Extraction failed.');
    return retry;
  }
}

function applyResponse(response: ExtractedContent): void {
  state.extracted = response;
  state.rawMarkdown = response.content;
  applyTemplateAndUpdate();
}


async function sendExtract(tabId: number): Promise<ExtractedContent> {
  const response = await sendTabMessage(tabId, { type: MSG.EXTRACT_CONTENT, mode: 'markdown' });
  applyResponse(response);
  return response;
}


export async function extractContent(): Promise<void> {
  setError(null);
  disableActions();
  refs.previewPanel!.classList.add('hidden');
  state.chatHistory = [];
  refs.chatInputRow!.classList.add('hidden');
  refs.chatExportRow!.classList.add('hidden');
  refs.chatHistoryBanner!.classList.add('hidden');

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab?.id || isRestrictedUrl(tab.url)) {
    return;
  }

  try {
    const response = await sendExtract(tab.id);
    if (response.autoRescanned) {
      showContentToast(t('popup_auto_rescanned'));
    }
  } catch (err: unknown) {
    setError(errMsg(err));
    disableActions();
  }
}


export async function scrollAndRescan(): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab?.id || isRestrictedUrl(tab.url)) {
    return;
  }

  refs.btnScrollRescan!.disabled = true;
  refs.scrollLabelFull!.textContent = t('popup_scrolling');
  refs.scrollLabelShort!.textContent = t('popup_scrolling');

  try {
    const response = await sendTabMessage(tab.id, { type: MSG.SCROLL_AND_RESCAN, mode: 'markdown' });
    applyResponse(response);
  } catch (err: unknown) {
    setError(errMsg(err));
    disableActions();
  } finally {
    refs.btnScrollRescan!.disabled = false;
    refs.scrollLabelFull!.textContent = t('popup_scroll_rescan');
    refs.scrollLabelShort!.textContent = t('popup_scroll_rescan_short');
  }
}