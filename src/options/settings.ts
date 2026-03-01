/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */
import { TEMPLATE_CATEGORIES } from '../shared/constants';
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
  state.templates.forEach((t) => {
    const cat = t.category ?? 'General';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(t);
  });

  [...TEMPLATE_CATEGORIES, 'Custom'].forEach((cat) => {
    const list = grouped[cat];
    if (!list?.length) return;

    const group = document.createElement('optgroup');
    group.label = cat;
    list.forEach((t) => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = t.name;
      opt.selected = t.id === state.settings.defaultTemplateId;
      group.appendChild(opt);
    });
    refs.defaultTplEl!.appendChild(group);
  });
}


export function renderSettingsForm(): void {
  renderDefaultTemplateSelect();
  initSegmented(refs.providerSeg!, state.settings.llmProvider ?? 'openai');
  initSegmented(refs.themeSeg!, state.settings.theme ?? 'dark', applyTheme);
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
    });
    state.settings = await getSettingsAsync();
    flash(refs.settingsSaved!);
  });
}
