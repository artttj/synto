/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */

import { $ } from '../shared/dom';

export { $ };

export const refs = {
  btnOptions: null as HTMLElement | null,
  btnHelp:    null as HTMLElement | null,
  btnTheme:   null as HTMLButtonElement | null,
  templateCards: null as HTMLElement | null,
  btnTemplatesManage: null as HTMLButtonElement | null,
  errorMsg: null as HTMLElement | null,
  tokenCount: null as HTMLElement | null,
  tokenWarning: null as HTMLElement | null,
  previewPanel: null as HTMLElement | null,
  previewText: null as HTMLTextAreaElement | null,
  btnPreviewCopy: null as HTMLButtonElement | null,
  btnRefreshContent: null as HTMLButtonElement | null,
  btnScrollRescan: null as HTMLButtonElement | null,
  scrollLabelFull: null as HTMLElement | null,
  scrollLabelShort: null as HTMLElement | null,
  btnProcess: null as HTMLButtonElement | null,
  chatPanel: null as HTMLElement | null,
  chatNoKey: null as HTMLElement | null,
  chatOptionsLink: null as HTMLElement | null,
  chatMessages: null as HTMLElement | null,
  chatInputRow: null as HTMLElement | null,
  chatInput: null as HTMLTextAreaElement | null,
  btnChatSend: null as HTMLButtonElement | null,
  chatExportRow: null as HTMLElement | null,
  btnExportChat: null as HTMLButtonElement | null,
  chatHistoryBanner: null as HTMLElement | null,
  chatHistoryLabel: null as HTMLElement | null,
  btnHistoryRestore: null as HTMLButtonElement | null,
  btnHistoryDismiss: null as HTMLButtonElement | null,
  contentToast: null as HTMLElement | null,
  btnChatStop: null as HTMLElement | null,
  providerHealth: null as HTMLElement | null,
  footerProvider: null as HTMLElement | null,
  footerModel: null as HTMLElement | null,
  footerVersion: null as HTMLElement | null,
};


export function renderFooter(provider: string, model: string): void {
  if (refs.footerProvider) refs.footerProvider.textContent = provider;
  if (refs.footerModel) refs.footerModel.textContent = model;
  if (refs.footerVersion && !refs.footerVersion.textContent) {
    const v = chrome.runtime.getManifest().version;
    refs.footerVersion.textContent = `v${v}`;
  }
}


export function resolveRefs() {
  refs.btnOptions = $('btn-options');
  refs.btnHelp    = $('btn-help');
  refs.btnTheme   = $('btn-theme') as HTMLButtonElement | null;
  refs.templateCards = $('template-cards');
  refs.btnTemplatesManage = $('btn-templates-manage') as HTMLButtonElement | null;
  refs.errorMsg = $('error-msg');
  refs.tokenCount = $('token-count');
  refs.tokenWarning = $('token-warning');
  refs.previewPanel = $('preview-panel');
  refs.previewText = $('preview-text') as HTMLTextAreaElement | null;
  refs.btnPreviewCopy = $('btn-preview-copy') as HTMLButtonElement | null;
  refs.btnRefreshContent = $('btn-refresh-content') as HTMLButtonElement | null;
  refs.btnScrollRescan = $('btn-scroll-rescan') as HTMLButtonElement | null;
  refs.scrollLabelFull = $('scroll-label-full');
  refs.scrollLabelShort = $('scroll-label-short');
  refs.btnProcess = $('btn-process') as HTMLButtonElement | null;
  refs.chatPanel = $('chat-panel');
  refs.chatNoKey = $('chat-no-key');
  refs.chatOptionsLink = $('chat-options-link');
  refs.chatMessages = $('chat-messages');
  refs.chatInputRow = $('chat-input-row');
  refs.chatInput = $('chat-input') as HTMLTextAreaElement | null;
  refs.btnChatSend = $('btn-chat-send') as HTMLButtonElement | null;
  refs.chatExportRow = $('chat-export-row');
  refs.btnExportChat = $('btn-export-chat') as HTMLButtonElement | null;
  refs.chatHistoryBanner = $('chat-history-banner');
  refs.chatHistoryLabel = $('chat-history-label');
  refs.btnHistoryRestore = $('btn-history-restore') as HTMLButtonElement | null;
  refs.btnHistoryDismiss = $('btn-history-dismiss') as HTMLButtonElement | null;
  refs.contentToast = $('content-toast');
  refs.btnChatStop = $('btn-chat-stop') as HTMLButtonElement | null;
  refs.providerHealth = $('provider-health');
  refs.footerProvider = $('footer-provider');
  refs.footerModel = $('footer-model');
  refs.footerVersion = $('footer-version');
}
