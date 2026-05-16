/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */

import { TEMPLATE_CATEGORIES, PROVIDER_MODELS, CUSTOM_ENDPOINT_DEFAULT, OLLAMA_ENDPOINT_DEFAULT, DEFAULT_SYSTEM_PROMPT } from '../shared/constants';
import { saveSettings, type Settings, type Template } from '../shared/storage';
import { applyAndWatchTheme } from '../shared/theme';

import { state } from './state';
import { refs } from './dom';


const unwatchRef = { current: null as (() => void) | null };

export function applyTheme(theme: string): void {
  applyAndWatchTheme(theme, unwatchRef);
}


export function initSegmented(container: HTMLElement, value: string, onChange?: (value: string) => void): void {
  const buttons = Array.from(container.querySelectorAll('.seg-btn'));
  buttons.forEach((btn) => {
    if ((btn as HTMLElement).dataset.value === value) {
      btn.classList.add('active');
    }
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const val = (btn as HTMLElement).dataset.value ?? '';
      onChange?.(val);
      if (btn.hasAttribute('data-auto-save')) autoSaveSettings();
    });
  });
}


export function getSegmentedValue(container: HTMLElement): string {
  return container.querySelector<HTMLElement>('.seg-btn.active')?.dataset.value ?? '';
}


export function renderDefaultTemplateSelect(): void {
  refs.defaultTplEl!.textContent = '';

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


function buildModelOptions(provider: string, selectedModel?: string): HTMLOptionElement[] {
  return (PROVIDER_MODELS[provider] ?? []).map((model) => {
    const opt = document.createElement('option');
    opt.value = model;
    opt.textContent = model;
    if (selectedModel !== undefined) opt.selected = model === selectedModel;
    return opt;
  });
}

function populateModelSelect(el: HTMLSelectElement, provider: string, selectedModel: string): void {
  el.replaceChildren(...buildModelOptions(provider, selectedModel));
}

function populateDatalist(id: string, provider: string): void {
  const list = document.getElementById(id) as HTMLDataListElement | null;
  if (!list) return;
  list.replaceChildren(...buildModelOptions(provider));
}


function onProviderChange(value: string): void {
  void saveSettings({ llmProvider: value });
  state.settings.llmProvider = value;
  syncProviderSegmented(value);
  updateProviderCardVisibility(value);
}

export function renderSettingsForm(): void {
  renderDefaultTemplateSelect();
  initSegmented(refs.aiProviderSeg!, state.settings.llmProvider ?? 'openai', onProviderChange);
  initSegmented(refs.themeSeg!, state.settings.theme ?? 'system', applyTheme);
  refs.languageEl!.value = state.settings.language ?? 'en';

  if (refs.systemPromptEl) {
    refs.systemPromptEl.value = state.settings.systemPrompt || DEFAULT_SYSTEM_PROMPT;
  }

  populateModelSelect(refs.openaiModelEl!, 'openai', state.settings.openaiModel);
  populateModelSelect(refs.geminiModelEl!, 'gemini', state.settings.geminiModel);
  populateModelSelect(refs.grokModelEl!,   'grok',   state.settings.grokModel);
  populateModelSelect(refs.openrouterModelEl!, 'openrouter', state.settings.openrouterModel);
  populateModelSelect(refs.zaiModelEl!,     'zai',    state.settings.zaiModel);
  populateModelSelect(refs.anthropicModelEl!, 'anthropic', state.settings.anthropicModel);
  if (refs.ollamaModelEl) refs.ollamaModelEl.value = state.settings.ollamaModel ?? 'kimi-k2.6:cloud';
  populateDatalist('ollama-model-list', 'ollama');
  populateDatalist('custom-model-list', 'custom');

  if (refs.customEndpointEl) refs.customEndpointEl.value = state.settings.customEndpoint ?? CUSTOM_ENDPOINT_DEFAULT;
  if (refs.customModelEl) refs.customModelEl.value = state.settings.customModel ?? '';
  if (refs.customUseAuthEl) refs.customUseAuthEl.checked = state.settings.customUseAuth ?? false;

  if (refs.ollamaEndpointEl) refs.ollamaEndpointEl.value = state.settings.ollamaEndpoint ?? OLLAMA_ENDPOINT_DEFAULT;
  if (refs.ollamaUseAuthEl) refs.ollamaUseAuthEl.checked = state.settings.ollamaUseAuth ?? true;
}


let saveTimer: ReturnType<typeof setTimeout> | null = null;

export function showToast(message?: string): void {
  const toast = refs.saveToast;
  if (!toast) return;
  if (message) toast.textContent = message;
  toast.classList.remove('hidden');
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    toast.classList.add('hidden');
    saveTimer = null;
  }, 1800);
}

function describeChange(source?: HTMLElement | null): string {
  if (!source) return 'Settings saved';
  if (refs.themeSeg?.contains(source)) return 'Theme applied';
  if (refs.aiProviderSeg?.contains(source)) return 'Provider changed';
  if (source === refs.languageEl) return 'Language changed';
  return 'Settings saved';
}

export function autoSaveSettings(source?: HTMLElement | null): void {
  const partial: Partial<Settings> = {
    defaultTemplateId: refs.defaultTplEl!.value,
    theme: getSegmentedValue(refs.themeSeg!) ?? 'system',
    llmProvider: getSegmentedValue(refs.aiProviderSeg!) ?? 'openai',
    language: refs.languageEl?.value ?? 'en',
    systemPrompt: refs.systemPromptEl?.value ?? '',
    openaiModel: refs.openaiModelEl?.value ?? 'gpt-4.1-mini',
    geminiModel: refs.geminiModelEl?.value ?? 'gemini-2.5-flash',
    grokModel: refs.grokModelEl?.value ?? 'grok-3-mini',
    openrouterModel: refs.openrouterModelEl?.value ?? 'anthropic/claude-sonnet-4-6',
    zaiModel: refs.zaiModelEl?.value ?? 'zai-7b',
    anthropicModel: refs.anthropicModelEl?.value ?? 'claude-sonnet-4-6',
    customEndpoint: refs.customEndpointEl?.value ?? CUSTOM_ENDPOINT_DEFAULT,
    customModel: refs.customModelEl?.value ?? '',
    customUseAuth: refs.customUseAuthEl?.checked ?? false,
    ollamaModel: refs.ollamaModelEl?.value ?? 'kimi-k2.6:cloud',
    ollamaEndpoint: refs.ollamaEndpointEl?.value ?? OLLAMA_ENDPOINT_DEFAULT,
    ollamaUseAuth: refs.ollamaUseAuthEl?.checked ?? true,
  };
  state.settings = { ...state.settings, ...partial };
  const message = describeChange(source);
  void saveSettings(partial).then(() => showToast(message));
}

let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleAutoSave(source: HTMLElement): void {
  if (autoSaveTimer) clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(() => {
    autoSaveTimer = null;
    autoSaveSettings(source);
  }, 200);
}

export function wireAutoSave(): void {
  document.addEventListener('change', (e) => {
    const el = e.target as HTMLElement | null;
    if (el?.closest('[data-auto-save]')) autoSaveSettings(el);
  });

  document.addEventListener('input', (e) => {
    const el = e.target as HTMLElement | null;
    if (el?.closest('[data-auto-save]')) scheduleAutoSave(el);
  });

  refs.themeSeg!.querySelectorAll('.seg-btn').forEach((btn) => {
    btn.setAttribute('data-auto-save', 'true');
  });

  refs.aiProviderSeg!.querySelectorAll('.seg-btn').forEach((btn) => {
    btn.setAttribute('data-auto-save', 'true');
  });

  // Wire Ollama and Custom inputs for auto-save
  const ollamaInputs = [refs.ollamaModelEl, refs.ollamaEndpointEl, refs.ollamaUseAuthEl];
  ollamaInputs.forEach((el) => {
    el?.setAttribute('data-auto-save', 'true');
  });

  const customInputs = [refs.customEndpointEl, refs.customModelEl, refs.customUseAuthEl];
  customInputs.forEach((el) => {
    el?.setAttribute('data-auto-save', 'true');
  });
}


export function updateProviderCardVisibility(active: string): void {
  document.querySelectorAll<HTMLElement>('.provider-card[data-provider]').forEach((card) => {
    card.classList.toggle('hidden', card.dataset.provider !== active);
  });
}


export function syncProviderSegmented(value: string): void {
  const seg = refs.aiProviderSeg;
  if (!seg) return;
  seg.querySelectorAll('.seg-btn').forEach((btn) => {
    btn.classList.toggle('active', (btn as HTMLElement).dataset.value === value);
  });
}