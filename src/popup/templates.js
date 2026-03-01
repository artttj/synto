import { TEMPLATE_CATEGORIES } from '../shared/constants.js';
import { saveSettings } from '../shared/storage.js';
import { state } from './state.js';
import { refs } from './dom.js';
import { updatePreviewText, updateTokenDisplay, setPreviewOpen } from './preview.js';


export function applyTemplate(extracted, templateId) {
  const template = state.templates.find((t) => t.id === templateId);
  if (!template || !extracted) return '';

  const sel = extracted.selection || extracted.content || '';
  return template.prompt
    .replace(/\{content\}/g, extracted.content ?? '')
    .replace(/\{selection\}/g, sel)
    .replace(/\{title\}/g, extracted.title ?? '')
    .replace(/\{url\}/g, extracted.url ?? '')
    .replace(/\{excerpt\}/g, extracted.excerpt ?? '')
    .replace(/\{byline\}/g, extracted.byline ?? '')
    .replace(/\{siteName\}/g, extracted.siteName ?? '');
}


export function applyTemplateAndUpdate() {
  if (!state.extracted) return;

  state.finalText = applyTemplate(state.extracted, state.selectedTemplateId);
  updateTokenDisplay(state.finalText);
  refs.btnCopyMd.disabled = false;
  refs.btnProcess.disabled = false;
  updatePreviewText();

  if (refs.previewPanel.classList.contains('hidden')) {
    refs.previewPanel.classList.remove('hidden');
    setPreviewOpen(true);
  }
}


export function renderTemplateSelect() {
  refs.templateSelect.innerHTML = '';

  const grouped = {};
  for (const cat of TEMPLATE_CATEGORIES) {
    grouped[cat] = [];
  }
  state.templates.forEach((t) => {
    const cat = t.category ?? 'General';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(t);
  });

  for (const cat of TEMPLATE_CATEGORIES) {
    const list = grouped[cat];
    if (!list?.length) continue;

    const group = document.createElement('optgroup');
    group.label = cat;
    list.forEach((t) => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = t.name;
      if (t.id === state.selectedTemplateId) opt.selected = true;
      group.appendChild(opt);
    });
    refs.templateSelect.appendChild(group);
  }

  const knownIds = new Set(
    state.templates
      .filter((t) => TEMPLATE_CATEGORIES.includes(t.category ?? 'General'))
      .map((t) => t.id)
  );
  const uncategorized = state.templates.filter((t) => !knownIds.has(t.id));

  if (uncategorized.length) {
    const group = document.createElement('optgroup');
    group.label = 'Custom';
    uncategorized.forEach((t) => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = t.name;
      if (t.id === state.selectedTemplateId) opt.selected = true;
      group.appendChild(opt);
    });
    refs.templateSelect.appendChild(group);
  }
}


export function wireTemplateSelect() {
  refs.templateSelect.addEventListener('change', async () => {
    state.selectedTemplateId = refs.templateSelect.value;
    await saveSettings({ defaultTemplateId: state.selectedTemplateId });
    applyTemplateAndUpdate();
  });
}
