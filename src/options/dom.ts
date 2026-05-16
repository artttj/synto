/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */

import { $ } from '../shared/dom';

export { $ };

export const refs: {
  defaultTplEl: HTMLSelectElement | null;
  aiProviderSeg: HTMLElement | null;
  themeSeg: HTMLElement | null;
  proModeEl: HTMLInputElement | null;
  languageEl: HTMLSelectElement | null;
  saveToast: HTMLElement | null;
  navAiWarning: HTMLElement | null;
  templateSearch: HTMLInputElement | null;
  templateList: HTMLElement | null;
  btnNewTemplate: HTMLElement | null;
  fabHint: HTMLElement | null;
  modalOverlay: HTMLElement | null;
  modalTitle: HTMLElement | null;
  modalName: HTMLInputElement | null;
  modalPrompt: HTMLTextAreaElement | null;
  modalCancel: HTMLElement | null;
  modalClose: HTMLElement | null;
  modalSave: HTMLElement | null;
  systemPromptEl: HTMLTextAreaElement | null;
  openaiModelEl: HTMLSelectElement | null;
  geminiModelEl: HTMLSelectElement | null;
  grokModelEl: HTMLSelectElement | null;
  openrouterModelEl: HTMLSelectElement | null;
  zaiModelEl: HTMLSelectElement | null;
  anthropicModelEl: HTMLSelectElement | null;
  ollamaModelEl: HTMLInputElement | null;
  ollamaEndpointEl: HTMLInputElement | null;
  ollamaUseAuthEl: HTMLInputElement | null;
  customEndpointEl: HTMLInputElement | null;
  customModelEl: HTMLInputElement | null;
  customUseAuthEl: HTMLInputElement | null;
  btnSaveCustom: HTMLElement | null;
  btnClearCustom: HTMLElement | null;
  btnSaveOllama: HTMLElement | null;
  btnClearOllama: HTMLElement | null;
  libDiffOverlay: HTMLElement | null;
  libDiffMeta: HTMLElement | null;
  libDiffYours: HTMLElement | null;
  libDiffLibrary: HTMLElement | null;
  libDiffKeep: HTMLElement | null;
  libDiffApply: HTMLElement | null;
  libDiffClose: HTMLElement | null;
} = {
  defaultTplEl: null,
  aiProviderSeg: null,
  themeSeg: null,
  proModeEl: null,
  languageEl: null,
  saveToast: null,
  navAiWarning: null,
  templateSearch: null,
  templateList: null,
  btnNewTemplate: null,
  fabHint: null,
  modalOverlay: null,
  modalTitle: null,
  modalName: null,
  modalPrompt: null,
  modalCancel: null,
  modalClose: null,
  modalSave: null,
  systemPromptEl: null,
  openaiModelEl: null,
  geminiModelEl: null,
  grokModelEl: null,
  openrouterModelEl: null,
  zaiModelEl: null,
  anthropicModelEl: null,
  ollamaModelEl: null,
  ollamaEndpointEl: null,
  ollamaUseAuthEl: null,
  customEndpointEl: null,
  customModelEl: null,
  customUseAuthEl: null,
  btnSaveCustom: null,
  btnClearCustom: null,
  btnSaveOllama: null,
  btnClearOllama: null,
  libDiffOverlay: null,
  libDiffMeta: null,
  libDiffYours: null,
  libDiffLibrary: null,
  libDiffKeep: null,
  libDiffApply: null,
  libDiffClose: null,
};


export function resolveRefs(): void {
  refs.defaultTplEl = $('default-template') as HTMLSelectElement;
  refs.aiProviderSeg = $('ai-provider-segmented')!;
  refs.themeSeg = $('theme-segmented')!;
  refs.proModeEl = $('opt-pro-mode') as HTMLInputElement;
  refs.languageEl = $('language-select') as HTMLSelectElement;
  refs.saveToast = $('save-toast')!;
  refs.navAiWarning = $('nav-ai-warning')!;
  refs.templateSearch = $('template-search') as HTMLInputElement;
  refs.templateList = $('template-list')!;
  refs.btnNewTemplate = $('btn-new-template')!;
  refs.fabHint        = $('fab-hint');
  refs.modalOverlay = $('modal-overlay')!;
  refs.modalTitle = $('modal-title')!;
  refs.modalName = $('modal-name') as HTMLInputElement;
  refs.modalPrompt = $('modal-prompt') as HTMLTextAreaElement;
  refs.modalCancel = $('modal-cancel')!;
  refs.modalClose = $('modal-close')!;
  refs.modalSave = $('modal-save')!;
  refs.systemPromptEl = $('system-prompt') as HTMLTextAreaElement;
  refs.openaiModelEl  = $('openai-model') as HTMLSelectElement;
  refs.geminiModelEl  = $('gemini-model') as HTMLSelectElement;
  refs.grokModelEl    = $('grok-model') as HTMLSelectElement;
  refs.openrouterModelEl = $('openrouter-model') as HTMLSelectElement;
  refs.zaiModelEl     = $('zai-model') as HTMLSelectElement;
  refs.anthropicModelEl = $('anthropic-model') as HTMLSelectElement;
  refs.ollamaModelEl    = $('ollama-model') as HTMLInputElement;
  refs.ollamaEndpointEl = $('ollama-endpoint') as HTMLInputElement;
  refs.ollamaUseAuthEl  = $('ollama-use-auth') as HTMLInputElement;
  refs.customEndpointEl = $('custom-endpoint') as HTMLInputElement;
  refs.customModelEl  = $('custom-override-model') as HTMLInputElement;
  refs.customUseAuthEl = $('custom-use-auth') as HTMLInputElement;
  refs.btnSaveCustom = $('btn-save-custom')!;
  refs.btnClearCustom = $('btn-clear-custom')!;
  refs.btnSaveOllama  = $('btn-save-ollama')!;
  refs.btnClearOllama  = $('btn-clear-ollama')!;
  refs.libDiffOverlay = $('lib-diff-overlay');
  refs.libDiffMeta = $('lib-diff-meta');
  refs.libDiffYours = $('lib-diff-yours');
  refs.libDiffLibrary = $('lib-diff-library');
  refs.libDiffKeep = $('lib-diff-keep');
  refs.libDiffApply = $('lib-diff-apply');
  refs.libDiffClose = $('lib-diff-close');
}
