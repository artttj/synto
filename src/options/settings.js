import { TEMPLATE_CATEGORIES } from '../shared/constants.js';
import { saveSettings } from '../shared/storage.js';
import { state } from './state.js';
import { refs } from './dom.js';


export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}


export function initSegmented(container, value, onChange) {
  container.querySelectorAll('.seg-btn').forEach((btn) => {
    if (btn.dataset.value === value) {
      btn.classList.add('active');
    }
    btn.addEventListener('click', () => {
      container.querySelectorAll('.seg-btn').forEach((b) => {
        b.classList.remove('active');
      });
      btn.classList.add('active');
      onChange(btn.dataset.value ?? '');
    });
  });
}


export function getSegmentedValue(container) {
  return container.querySelector('.seg-btn.active')?.dataset.value;
}


export function renderDefaultTemplateSelect() {
  refs.defaultTplEl.innerHTML = '';

  const grouped = {};
  for (const cat of TEMPLATE_CATEGORIES) {
    grouped[cat] = [];
  }
  state.templates.forEach((t) => {
    const cat = t.category ?? 'General';
    if (!grouped[cat]) {
      grouped[cat] = [];
    }
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
      if (t.id === state.settings.defaultTemplateId) {
        opt.selected = true;
      }
      group.appendChild(opt);
    });
    refs.defaultTplEl.appendChild(group);
  });
}


export function renderSettingsForm() {
  renderDefaultTemplateSelect();
  initSegmented(refs.providerSeg, state.settings.llmProvider ?? 'openai', () => {});
  initSegmented(refs.themeSeg, state.settings.theme ?? 'dark', (val) => {
    applyTheme(val);
  });
}


function flash(el) {
  el.classList.remove('hidden');
  setTimeout(() => {
    el.classList.add('hidden');
  }, 2000);
}


export function wireSettingsSave(getSettingsAsync) {
  refs.btnSaveSettings.addEventListener('click', async () => {
    await saveSettings({
      defaultTemplateId: refs.defaultTplEl.value,
      theme: getSegmentedValue(refs.themeSeg) ?? 'dark',
      llmProvider: getSegmentedValue(refs.providerSeg) ?? 'openai',
    });
    state.settings = await getSettingsAsync();
    flash(refs.settingsSaved);
  });
}
