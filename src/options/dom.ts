/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */
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
  modalCategorySelect: HTMLSelectElement | null;
  modalCategoryInput: HTMLInputElement | null;
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
  modalCategorySelect: null,
  modalCategoryInput: null,
  modalPrompt: null,
  modalCancel: null,
  modalClose: null,
  modalSave: null,
};


export function resolveRefs(): void {
  refs.defaultTplEl = $('default-template') as HTMLSelectElement;
  refs.providerSeg = $('provider-segmented')!;
  refs.themeSeg = $('theme-segmented')!;
  refs.btnSaveSettings = $('btn-save-settings')!;
  refs.settingsSaved = $('settings-saved')!;
  refs.navAiWarning = $('nav-ai-warning')!;
  refs.templateSearch = $('template-search') as HTMLInputElement;
  refs.templateList = $('template-list')!;
  refs.btnNewTemplate = $('btn-new-template')!;
  refs.modalOverlay = $('modal-overlay')!;
  refs.modalTitle = $('modal-title')!;
  refs.modalName = $('modal-name') as HTMLInputElement;
  refs.modalCategorySelect = $('modal-category-select') as HTMLSelectElement;
  refs.modalCategoryInput = $('modal-category-input') as HTMLInputElement;
  refs.modalPrompt = $('modal-prompt') as HTMLTextAreaElement;
  refs.modalCancel = $('modal-cancel')!;
  refs.modalClose = $('modal-close')!;
  refs.modalSave = $('modal-save')!;
}
