export const $ = (id: string): HTMLElement | null => document.getElementById(id);

export const refs = {
  btnOptions: null as HTMLElement | null,
  templateSelect: null as HTMLSelectElement | null,
  errorMsg: null as HTMLElement | null,
  tokenCount: null as HTMLElement | null,
  tokenWarning: null as HTMLElement | null,
  previewPanel: null as HTMLElement | null,
  previewText: null as HTMLTextAreaElement | null,
  btnPreviewToggle: null as HTMLElement | null,
  previewArrow: null as HTMLElement | null,
  btnCopyMd: null as HTMLButtonElement | null,
  btnPreviewCopy: null as HTMLButtonElement | null,
  btnProcess: null as HTMLButtonElement | null,
  chatPanel: null as HTMLElement | null,
  chatNoKey: null as HTMLElement | null,
  chatOptionsLink: null as HTMLElement | null,
  chatMessages: null as HTMLElement | null,
  chatInputRow: null as HTMLElement | null,
  chatInput: null as HTMLTextAreaElement | null,
  btnChatSend: null as HTMLButtonElement | null,
};


export function resolveRefs() {
  refs.btnOptions = $('btn-options');
  refs.templateSelect = $('template-select') as HTMLSelectElement | null;
  refs.errorMsg = $('error-msg');
  refs.tokenCount = $('token-count');
  refs.tokenWarning = $('token-warning');
  refs.previewPanel = $('preview-panel');
  refs.previewText = $('preview-text') as HTMLTextAreaElement | null;
  refs.btnPreviewToggle = $('btn-preview-toggle');
  refs.previewArrow = $('preview-arrow');
  refs.btnCopyMd = $('btn-copy-md') as HTMLButtonElement | null;
  refs.btnPreviewCopy = $('btn-preview-copy') as HTMLButtonElement | null;
  refs.btnProcess = $('btn-process') as HTMLButtonElement | null;
  refs.chatPanel = $('chat-panel');
  refs.chatNoKey = $('chat-no-key');
  refs.chatOptionsLink = $('chat-options-link');
  refs.chatMessages = $('chat-messages');
  refs.chatInputRow = $('chat-input-row');
  refs.chatInput = $('chat-input') as HTMLTextAreaElement | null;
  refs.btnChatSend = $('btn-chat-send') as HTMLButtonElement | null;
}
