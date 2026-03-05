/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */

import { TEMPLATE_CATEGORIES, PROVIDER_MODELS } from '../shared/constants';
import { saveSettings, type Settings, type Template } from '../shared/storage';

import { state } from './state';
import { refs } from './dom';


export function applyTheme(theme: string): void {
  document.documentElement.dataset.theme = theme;
}


export function initSegmented(container: HTMLElement, value: string, onChange?: (value: string) => void): void {
  container.querySelectorAll('.seg-btn').forEach((btn) => {
    if ((btn as HTMLElement).dataset.value === value) {
      btn.classList.add('active');
    }
    btn.addEventListener('click', () => {
      container.querySelectorAll('.seg-btn').forEach((b) => {
        b.classList.remove('active');
      });
      btn.classList.add('active');
      onChange?.((btn as HTMLElement).dataset.value ?? '');
    });
  });
}


export function getSegmentedValue(container: HTMLElement): string | undefined {
  return container.querySelector<HTMLElement>('.seg-btn.active')?.dataset.value;
}


export function renderDefaultTemplateSelect(): void {
  refs.defaultTplEl!.innerHTML = '';

  const grouped: Record<string, Template[]> = {};
  for (const cat of TEMPLATE_CATEGORIES) {
    grouped[cat] = [];
  }
  state.templates.forEach((tpl) => {
    const cat = tpl.category ?? 'General';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(tpl);
  });

  [...TEMPLATE_CATEGORIES, 'Custom'].forEach((cat) => {
    const list = grouped[cat];
    if (!list?.length) return;

    const group = document.createElement('optgroup');
    group.label = cat;
    list.forEach((tpl) => {
      const opt = document.createElement('option');
      opt.value = tpl.id;
      opt.textContent = tpl.name;
      opt.selected = tpl.id === state.settings.defaultTemplateId;
      group.appendChild(opt);
    });
    refs.defaultTplEl!.appendChild(group);
  });
}


function populateModelSelect(el: HTMLSelectElement, provider: string, selectedModel: string): void {
  el.innerHTML = '';
  for (const model of (PROVIDER_MODELS[provider] ?? [])) {
    const opt = document.createElement('option');
    opt.value = model;
    opt.textContent = model;
    opt.selected = model === selectedModel;
    el.appendChild(opt);
  }
}


export function renderSettingsForm(): void {
  renderDefaultTemplateSelect();
  initSegmented(refs.providerSeg!, state.settings.llmProvider ?? 'openai');
  initSegmented(refs.themeSeg!, state.settings.theme ?? 'dark', applyTheme);
  refs.languageEl!.value = state.settings.language ?? 'en';

  if (refs.systemPromptEl) {
    refs.systemPromptEl.value = state.settings.systemPrompt ?? '';
  }

  populateModelSelect(refs.openaiModelEl!, 'openai', state.settings.openaiModel);
  populateModelSelect(refs.geminiModelEl!, 'gemini', state.settings.geminiModel);
  populateModelSelect(refs.grokModelEl!,   'grok',   state.settings.grokModel);
}


function flash(el: HTMLElement): void {
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 2000);
}


export function wireSettingsSave(getSettingsAsync: () => Promise<Settings>): void {
  refs.btnSaveSettings!.addEventListener('click', async () => {
    await saveSettings({
      defaultTemplateId: refs.defaultTplEl!.value,
      theme: getSegmentedValue(refs.themeSeg!) ?? 'dark',
      llmProvider: getSegmentedValue(refs.providerSeg!) ?? 'openai',
      language: refs.languageEl?.value ?? 'en',
      systemPrompt: refs.systemPromptEl?.value ?? '',
      openaiModel: refs.openaiModelEl?.value ?? 'gpt-4o-mini',
      geminiModel: refs.geminiModelEl?.value ?? 'gemini-2.0-flash',
      grokModel: refs.grokModelEl?.value ?? 'grok-3-mini',
    });
    state.settings = await getSettingsAsync();
    flash(refs.settingsSaved!);
  });
}
