/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */

import { DEFAULT_TEMPLATES, TEMPLATE_CATEGORIES } from '../shared/constants';
import { saveTemplates, type Template } from '../shared/storage';
import { t, tOpt } from '../shared/i18n';
import { state } from './state';
import { refs } from './dom';
import { escHtml } from './utils';
import { renderDefaultTemplateSelect } from './settings';


function populateCategorySelect(currentCategory?: string): void {
  const sel = refs.modalCategorySelect!;
  sel.innerHTML = '';

  const known = new Set(TEMPLATE_CATEGORIES);
  const extra = new Set<string>();
  for (const tpl of state.templates) {
    if (tpl.category && !known.has(tpl.category)) extra.add(tpl.category);
  }

  const allCats = [...TEMPLATE_CATEGORIES, ...[...extra].sort()];
  for (const cat of allCats) {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = t('category_' + cat.toLowerCase()) || cat;
    sel.appendChild(opt);
  }

  const newOpt = document.createElement('option');
  newOpt.value = '__new__';
  newOpt.textContent = t('options_new_category');
  sel.appendChild(newOpt);

  if (currentCategory && allCats.includes(currentCategory)) {
    sel.value = currentCategory;
  } else if (currentCategory && currentCategory !== '__new__') {
    sel.value = allCats[0];
  } else {
    sel.value = allCats[0];
  }

  refs.modalCategoryInput!.classList.add('hidden');
}


export function openModal(templateId: string | null): void {
  state.editingId = templateId;
  const tpl = templateId
    ? state.templates.find((x) => x.id === templateId)
    : null;

  refs.modalTitle!.textContent = tpl ? t('options_edit_template') : t('options_new_template');
  refs.modalName!.value = tpl?.name ?? '';
  refs.modalPrompt!.value = tpl?.prompt ?? '{content}';
  populateCategorySelect(tpl?.category);
  refs.modalOverlay!.classList.remove('hidden');
  refs.modalName!.focus();
}


export function closeModal(): void {
  refs.modalOverlay!.classList.add('hidden');
  state.editingId = null;
}


export function renderTemplateList(): void {
  refs.templateList!.innerHTML = '';
  const q = state.searchQuery.toLowerCase();
  const grouped: Record<string, Template[]> = {};

  for (const cat of TEMPLATE_CATEGORIES) {
    grouped[cat] = [];
  }
  state.templates.forEach((tpl) => {
    if (
      q &&
      !tpl.name.toLowerCase().includes(q) &&
      !tpl.prompt.toLowerCase().includes(q)
    ) {
      return;
    }
    const cat = tpl.category ?? 'Custom';
    if (!grouped[cat]) {
      grouped[cat] = [];
    }
    grouped[cat].push(tpl);
  });

  const allCats = [...TEMPLATE_CATEGORIES, 'Custom'];
  let totalShown = 0;

  allCats.forEach((cat) => {
    const list = grouped[cat];
    if (!list?.length) return;
    totalShown += list.length;

    const section = document.createElement('div');
    section.className = 'template-category open';

    const displayCat = t('category_' + cat.toLowerCase()) || cat;
    const toggle = document.createElement('button');
    toggle.className = 'category-toggle';
    toggle.setAttribute('type', 'button');
    toggle.innerHTML = `
      ${escHtml(displayCat)}
      <span class="category-count">${list.length}</span>
      <svg class="category-chevron" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M5 7.5l5 5 5-5"/>
      </svg>
    `;
    toggle.addEventListener('click', () => {
      section.classList.toggle('open');
    });

    const items = document.createElement('div');
    items.className = 'category-items';

    list.forEach((tpl) => {
      const isBuiltin = DEFAULT_TEMPLATES.some((d) => d.id === tpl.id);
      const displayName = tOpt('template_name_' + tpl.id) ?? tpl.name;
      const previewText =
        tpl.prompt.replace(/\n/g, ' ').slice(0, 90) +
        (tpl.prompt.length > 90 ? '\u2026' : '');

      const item = document.createElement('div');
      item.className = 'template-item';
      item.innerHTML = `
        <div class="template-item-info">
          <div class="template-name">
            ${escHtml(displayName)}
            ${isBuiltin ? `<span class="template-badge">${escHtml(t('options_builtin'))}</span>` : ''}
          </div>
          <div class="template-preview">${escHtml(previewText)}</div>
        </div>
        <div class="template-actions">
          <button class="btn btn-ghost btn-sm btn-edit" data-id="${tpl.id}" type="button">${escHtml(t('options_edit'))}</button>
          <button class="btn btn-danger btn-delete" data-id="${tpl.id}" type="button">${escHtml(t('options_delete'))}</button>
        </div>
      `;
      items.appendChild(item);
    });

    section.appendChild(toggle);
    section.appendChild(items);
    refs.templateList!.appendChild(section);
  });

  if (totalShown === 0) {
    const empty = document.createElement('div');
    empty.className = 'no-results';
    empty.textContent = q
      ? t('options_no_results_search').replace('{q}', q)
      : t('options_no_results');
    refs.templateList!.appendChild(empty);
  }

  refs.templateList!.querySelectorAll('.btn-edit').forEach((btn) => {
    btn.addEventListener('click', () => {
      openModal((btn as HTMLElement).dataset.id!);
    });
  });
  refs.templateList!.querySelectorAll('.btn-delete').forEach((btn) => {
    btn.addEventListener('click', () => {
      void deleteTemplate((btn as HTMLElement).dataset.id!);
    });
  });
}


export async function deleteTemplate(id: string): Promise<void> {
  if (!confirm(t('options_delete_confirm'))) return;

  state.templates = state.templates.filter((tpl) => tpl.id !== id);
  await saveTemplates(state.templates);
  renderTemplateList();
  renderDefaultTemplateSelect();
}


export function wireTemplateList(): void {
  refs.templateSearch!.addEventListener('input', (e) => {
    state.searchQuery = (e.target as HTMLInputElement).value.trim();
    renderTemplateList();
  });

  refs.btnNewTemplate!.addEventListener('click', () => {
    openModal(null);
  });
  refs.modalCancel!.addEventListener('click', closeModal);
  refs.modalClose!.addEventListener('click', closeModal);
  refs.modalOverlay!.addEventListener('click', (e) => {
    if (e.target === refs.modalOverlay) {
      closeModal();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  });

  document.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const ph = (chip as HTMLElement).dataset.placeholder ?? '';
      const start = refs.modalPrompt!.selectionStart ?? 0;
      const end = refs.modalPrompt!.selectionEnd ?? 0;
      const val = refs.modalPrompt!.value;
      refs.modalPrompt!.value = val.slice(0, start) + ph + val.slice(end);
      refs.modalPrompt!.focus();
      refs.modalPrompt!.setSelectionRange(start + ph.length, start + ph.length);
    });
  });

  refs.modalCategorySelect!.addEventListener('change', () => {
    const isNew = refs.modalCategorySelect!.value === '__new__';
    refs.modalCategoryInput!.classList.toggle('hidden', !isNew);
    if (isNew) refs.modalCategoryInput!.focus();
  });

  refs.modalSave!.addEventListener('click', async () => {
    const name = refs.modalName!.value.trim();
    const prompt = refs.modalPrompt!.value.trim();

    if (!name) {
      refs.modalName!.focus();
      return;
    }
    if (!prompt) {
      refs.modalPrompt!.focus();
      return;
    }

    let category: string;
    if (refs.modalCategorySelect!.value === '__new__') {
      category = refs.modalCategoryInput!.value.trim();
      if (!category) {
        refs.modalCategoryInput!.focus();
        return;
      }
    } else {
      category = refs.modalCategorySelect!.value;
    }

    if (state.editingId) {
      state.templates = state.templates.map((tpl) =>
        tpl.id === state.editingId ? { ...tpl, name, category, prompt } : tpl
      );
    } else {
      state.templates.push({
        id: crypto.randomUUID(),
        name,
        category,
        prompt,
        isDefault: false,
      });
    }

    await saveTemplates(state.templates);
    renderTemplateList();
    renderDefaultTemplateSelect();
    closeModal();
  });
}
