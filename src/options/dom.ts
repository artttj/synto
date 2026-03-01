export const $ = (id: string): HTMLElement | null => document.getElementById(id);

export const refs: {
  defaultTplEl: HTMLSelectElement | null;
  providerSeg: HTMLElement | null;
  themeSeg: HTMLElement | null;
  btnSaveSettings: HTMLElement | null;
  settingsSaved: HTMLElement | null;
  navAiWarning: HTMLElement | null;
  templateSearch: HTMLInputElement | null;
  templateList: HTMLElement | null;
  btnNewTemplate: HTMLElement | null;
  modalOverlay: HTMLElement | null;
  modalTitle: HTMLElement | null;
  modalName: HTMLInputElement | null;
  modalPrompt: HTMLTextAreaElement | null;
  modalCancel: HTMLElement | null;
  modalClose: HTMLElement | null;
  modalSave: HTMLElement | null;
} = {
  defaultTplEl: null,
  providerSeg: null,
  themeSeg: null,
  btnSaveSettings: null,
  settingsSaved: null,
  navAiWarning: null,
  templateSearch: null,
  templateList: null,
  btnNewTemplate: null,
  modalOverlay: null,
  modalTitle: null,
  modalName: null,
  modalPrompt: null,
  modalCancel: null,
  modalClose: null,
  modalSave: null,
};


export function resolveRefs(): void {
  refs.defaultTplEl = $('default-template') as HTMLSelectElement;
  refs.providerSeg = $('provider-segmented') as HTMLElement;
  refs.themeSeg = $('theme-segmented') as HTMLElement;
  refs.btnSaveSettings = $('btn-save-settings') as HTMLElement;
  refs.settingsSaved = $('settings-saved') as HTMLElement;
  refs.navAiWarning = $('nav-ai-warning') as HTMLElement;
  refs.templateSearch = $('template-search') as HTMLInputElement;
  refs.templateList = $('template-list') as HTMLElement;
  refs.btnNewTemplate = $('btn-new-template') as HTMLElement;
  refs.modalOverlay = $('modal-overlay') as HTMLElement;
  refs.modalTitle = $('modal-title') as HTMLElement;
  refs.modalName = $('modal-name') as HTMLInputElement;
  refs.modalPrompt = $('modal-prompt') as HTMLTextAreaElement;
  refs.modalCancel = $('modal-cancel') as HTMLElement;
  refs.modalClose = $('modal-close') as HTMLElement;
  refs.modalSave = $('modal-save') as HTMLElement;
}
