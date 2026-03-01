/**
 * DOM refs for the options page.
 */

export const $ = (id) => document.getElementById(id);

export const refs = {};


/**
 * Resolve all refs. Call once when options page loads.
 */
export function resolveRefs() {
  refs.defaultTplEl = $('default-template');
  refs.providerSeg = $('provider-segmented');
  refs.themeSeg = $('theme-segmented');
  refs.btnSaveSettings = $('btn-save-settings');
  refs.settingsSaved = $('settings-saved');
  refs.navAiWarning = $('nav-ai-warning');
  refs.templateSearch = $('template-search');
  refs.templateList = $('template-list');
  refs.btnNewTemplate = $('btn-new-template');
  refs.modalOverlay = $('modal-overlay');
  refs.modalTitle = $('modal-title');
  refs.modalName = $('modal-name');
  refs.modalPrompt = $('modal-prompt');
  refs.modalCancel = $('modal-cancel');
  refs.modalClose = $('modal-close');
  refs.modalSave = $('modal-save');
}
