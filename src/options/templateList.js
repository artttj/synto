import { DEFAULT_TEMPLATES, TEMPLATE_CATEGORIES } from '../shared/constants.js';
import { saveTemplates } from '../shared/storage.js';
import { state } from './state.js';
import { refs } from './dom.js';
import { escHtml } from './utils.js';
import { renderDefaultTemplateSelect } from './settings.js';


export function openModal(templateId) {
  state.editingId = templateId;
  const t = templateId
    ? state.templates.find((x) => x.id === templateId)
    : null;

  refs.modalTitle.textContent = t ? 'Edit Template' : 'New Template';
  refs.modalName.value = t?.name ?? '';
  refs.modalPrompt.value = t?.prompt ?? '{content}';
  refs.modalOverlay.classList.remove('hidden');
  refs.modalName.focus();
}


export function closeModal() {
  refs.modalOverlay.classList.add('hidden');
  state.editingId = null;
}


export function renderTemplateList() {
  refs.templateList.innerHTML = '';
  const q = state.searchQuery.toLowerCase();
  const grouped = {};

  for (const cat of TEMPLATE_CATEGORIES) {
    grouped[cat] = [];
  }
  state.templates.forEach((t) => {
    if (
      q &&
      !t.name.toLowerCase().includes(q) &&
      !t.prompt.toLowerCase().includes(q)
    ) {
      return;
    }
    const cat = t.category ?? 'Custom';
    if (!grouped[cat]) {
      grouped[cat] = [];
    }
    grouped[cat].push(t);
  });

  const allCats = [...TEMPLATE_CATEGORIES, 'Custom'];
  let totalShown = 0;

  allCats.forEach((cat) => {
    const list = grouped[cat];
    if (!list?.length) return;
    totalShown += list.length;

    const section = document.createElement('div');
    section.className = 'template-category open';

    const toggle = document.createElement('button');
    toggle.className = 'category-toggle';
    toggle.setAttribute('type', 'button');
    toggle.innerHTML = `
      ${escHtml(cat)}
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

    list.forEach((t) => {
      const isBuiltin = DEFAULT_TEMPLATES.some((d) => d.id === t.id);
      const previewText =
        t.prompt.replace(/\n/g, ' ').slice(0, 90) +
        (t.prompt.length > 90 ? '…' : '');

      const item = document.createElement('div');
      item.className = 'template-item';
      item.innerHTML = `
        <div class="template-item-info">
          <div class="template-name">
            ${escHtml(t.name)}
            ${isBuiltin ? '<span class="template-badge">built-in</span>' : ''}
          </div>
          <div class="template-preview">${escHtml(previewText)}</div>
        </div>
        <div class="template-actions">
          <button class="btn btn-ghost btn-sm btn-edit" data-id="${t.id}" type="button">Edit</button>
          <button class="btn btn-danger btn-delete" data-id="${t.id}" type="button">Delete</button>
        </div>
      `;
      items.appendChild(item);
    });

    section.appendChild(toggle);
    section.appendChild(items);
    refs.templateList.appendChild(section);
  });

  if (totalShown === 0) {
    const empty = document.createElement('div');
    empty.className = 'no-results';
    empty.textContent = q
      ? `No templates matching "${q}"`
      : 'No templates yet.';
    refs.templateList.appendChild(empty);
  }

  refs.templateList.querySelectorAll('.btn-edit').forEach((btn) => {
    btn.addEventListener('click', () => {
      openModal(btn.dataset.id);
    });
  });
  refs.templateList.querySelectorAll('.btn-delete').forEach((btn) => {
    btn.addEventListener('click', () => {
      deleteTemplate(btn.dataset.id);
    });
  });
}


export async function deleteTemplate(id) {
  if (!confirm('Delete this template?')) return;

  state.templates = state.templates.filter((t) => t.id !== id);
  await saveTemplates(state.templates);
  renderTemplateList();
  renderDefaultTemplateSelect();
}


export function wireTemplateList() {
  refs.templateSearch.addEventListener('input', (e) => {
    state.searchQuery = e.target.value.trim();
    renderTemplateList();
  });

  refs.btnNewTemplate.addEventListener('click', () => {
    openModal(null);
  });
  refs.modalCancel.addEventListener('click', closeModal);
  refs.modalClose.addEventListener('click', closeModal);
  refs.modalOverlay.addEventListener('click', (e) => {
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
      const ph = chip.dataset.placeholder;
      const start = refs.modalPrompt.selectionStart;
      const end = refs.modalPrompt.selectionEnd;
      const val = refs.modalPrompt.value;
      refs.modalPrompt.value = val.slice(0, start) + ph + val.slice(end);
      refs.modalPrompt.focus();
      refs.modalPrompt.setSelectionRange(start + ph.length, start + ph.length);
    });
  });

  refs.modalSave.addEventListener('click', async () => {
    const name = refs.modalName.value.trim();
    const prompt = refs.modalPrompt.value.trim();

    if (!name) {
      refs.modalName.focus();
      return;
    }
    if (!prompt) {
      refs.modalPrompt.focus();
      return;
    }

    if (state.editingId) {
      state.templates = state.templates.map((t) =>
        t.id === state.editingId ? { ...t, name, prompt } : t
      );
    } else {
      state.templates.push({
        id: crypto.randomUUID(),
        name,
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
