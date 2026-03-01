/**
 * DOM refs for the popup. Centralized so modules receive the same elements.
 */

export const $ = (id) => document.getElementById(id);

export const refs = {
  btnOptions: null,
  templateSelect: null,
  errorMsg: null,
  tokenCount: null,
  tokenWarning: null,
  previewPanel: null,
  previewText: null,
  btnPreviewToggle: null,
  previewArrow: null,
  btnCopyMd: null,
  btnProcess: null,
  chatPanel: null,
  chatNoKey: null,
  chatOptionsLink: null,
  chatMessages: null,
  chatInputRow: null,
  chatInput: null,
  btnChatSend: null,
};


/**
 * Resolve all refs. Call once when popup loads.
 */
export function resolveRefs() {
  refs.btnOptions = $('btn-options');
  refs.templateSelect = $('template-select');
  refs.errorMsg = $('error-msg');
  refs.tokenCount = $('token-count');
  refs.tokenWarning = $('token-warning');
  refs.previewPanel = $('preview-panel');
  refs.previewText = $('preview-text');
  refs.btnPreviewToggle = $('btn-preview-toggle');
  refs.previewArrow = $('preview-arrow');
  refs.btnCopyMd = $('btn-copy-md');
  refs.btnProcess = $('btn-process');
  refs.chatPanel = $('chat-panel');
  refs.chatNoKey = $('chat-no-key');
  refs.chatOptionsLink = $('chat-options-link');
  refs.chatMessages = $('chat-messages');
  refs.chatInputRow = $('chat-input-row');
  refs.chatInput = $('chat-input');
  refs.btnChatSend = $('btn-chat-send');
}
