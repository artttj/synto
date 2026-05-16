/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */

import { MSG } from '../shared/constants';
import { state } from './state';
import type { ExtractedContent } from './state';
import { refs } from './dom';
import { setError } from './errors';
import { applyTemplateAndUpdate, selectTemplateForUrl, renderTemplateUI } from './templates';
import { t } from '../shared/i18n';
import { showContentToast } from './popup';

let extractionRequestId = 0;


export function disableActions(): void {
  refs.btnProcess!.disabled = true;
}


function errMsg(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function isRestrictedUrl(url?: string): boolean {
  if (!url) return true;
  return url.startsWith('chrome://') || url.startsWith('chrome-extension://') || url.startsWith('about:') || url.startsWith('edge://');
}

async function getActiveTab(): Promise<chrome.tabs.Tab | undefined> {
  const [active] = await chrome.tabs.query({ active: true, currentWindow: true });
  return active;
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

async function applyResponse(response: ExtractedContent, requestId: number): Promise<boolean> {
  if (requestId !== extractionRequestId) return false;

  state.extracted = response;
  state.rawMarkdown = response.content;
  await selectTemplateForUrl(response.url);
  if (requestId !== extractionRequestId) return false;

  renderTemplateUI();
  applyTemplateAndUpdate();
  return true;
}


function shouldExtractHtml(): boolean {
  // Accessibility audit template needs HTML for proper analysis
  return state.selectedTemplateId === 'audit-accessibility';
}

async function sendExtract(tabId: number, requestId: number): Promise<ExtractedContent> {
  const mode = shouldExtractHtml() ? 'html' : 'markdown';
  const response = await sendTabMessage(tabId, { type: MSG.EXTRACT_CONTENT, mode });
  await applyResponse(response, requestId);
  return response;
}

function clearExtractedState(): void {
  state.extracted = null;
  state.rawMarkdown = '';
  state.finalText = '';
  if (refs.previewText) refs.previewText.value = '';
}

export async function extractContent(): Promise<void> {
  const requestId = ++extractionRequestId;
  setError(null);
  disableActions();
  refs.previewPanel!.classList.add('hidden');
  state.chatHistory = [];
  refs.chatInputRow!.classList.add('hidden');
  refs.chatExportRow!.classList.add('hidden');
  refs.chatHistoryBanner!.classList.add('hidden');

  const tab = await getActiveTab();

  if (!tab?.id || isRestrictedUrl(tab.url)) {
    clearExtractedState();
    setError(t('popup_restricted_page'), 'info');
    return;
  }

  try {
    const response = await sendExtract(tab.id, requestId);
    if (requestId === extractionRequestId) {
      refs.btnScrollRescan?.classList.toggle('hint', Boolean(response.isDiffPage));
    }
  } catch (err: unknown) {
    if (requestId !== extractionRequestId) return;
    setError(errMsg(err));
    disableActions();
  }
}


export async function scrollAndRescan(): Promise<void> {
  const requestId = ++extractionRequestId;
  const tab = await getActiveTab();

  if (!tab?.id || isRestrictedUrl(tab.url)) {
    clearExtractedState();
    setError(t('popup_restricted_page'), 'info');
    return;
  }

  refs.btnScrollRescan!.disabled = true;
  refs.scrollLabelFull!.textContent = t('popup_scrolling');
  refs.scrollLabelShort!.textContent = t('popup_scrolling');

  try {
    const mode = shouldExtractHtml() ? 'html' : 'markdown';
    const response = await sendTabMessage(tab.id, { type: MSG.SCROLL_AND_RESCAN, mode });
    await applyResponse(response, requestId);
  } catch (err: unknown) {
    if (requestId !== extractionRequestId) return;
    setError(errMsg(err));
    disableActions();
  } finally {
    if (requestId === extractionRequestId) {
      refs.btnScrollRescan!.disabled = false;
      refs.scrollLabelFull!.textContent = t('popup_scroll_rescan');
      refs.scrollLabelShort!.textContent = t('popup_scroll_rescan_short');
    }
  }
}
