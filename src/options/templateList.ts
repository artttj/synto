/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */

import { DEFAULT_TEMPLATES } from '../shared/constants';
import { saveTemplates, type Template } from '../shared/storage';
import { t, tOpt } from '../shared/i18n';
import { state } from './state';
import { refs } from './dom';
import { showToast } from './utils';
import { renderDefaultTemplateSelect } from './settings';


export function openModal(templateId: string | null): void {
  state.editingId = templateId;
  const tpl = templateId
    ? state.templates.find((x) => x.id === templateId)
    : null;

  refs.modalTitle!.textContent = tpl ? t('options_edit_template') : t('options_new_template');
  refs.modalName!.value = tpl?.name ?? '';
  refs.modalPrompt!.value = tpl?.prompt ?? '{content}';
  refs.modalOverlay!.classList.remove('hidden');
  refs.modalName!.focus();
}


export function closeModal(): void {
  refs.modalOverlay!.classList.add('hidden');
  state.editingId = null;
}


function el(tag: string, className?: string, text?: string): HTMLElement {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}


function dragHandleIcon(): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '14');
  svg.setAttribute('height', '14');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  const dots = [
    [9, 6], [15, 6], [9, 12], [15, 12], [9, 18], [15, 18],
  ];
  for (const [cx, cy] of dots) {
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('cx', String(cx));
    c.setAttribute('cy', String(cy));
    c.setAttribute('r', '1');
    svg.appendChild(c);
  }
  return svg;
}


function buildTemplateItem(tpl: Template): HTMLElement {
  const isBuiltin = DEFAULT_TEMPLATES.some((d) => d.id === tpl.id);
  const displayName = tOpt('template_label_' + tpl.id) ?? tpl.label ?? tpl.name;
  const previewText = tpl.prompt.replace(/\n/g, ' ').slice(0, 90) + (tpl.prompt.length > 90 ? '…' : '');

  const item = el('div', 'template-item');
  item.setAttribute('draggable', 'true');
  item.dataset.id = tpl.id;

  const handle = el('span', 'drag-handle');
  handle.setAttribute('aria-hidden', 'true');
  handle.setAttribute('title', 'Drag to reorder');
  handle.appendChild(dragHandleIcon());

  const info = el('div', 'template-item-info');
  const nameRow = el('div', 'template-name');
  nameRow.appendChild(document.createTextNode(displayName));
  if (isBuiltin) {
    nameRow.appendChild(el('span', 'template-badge', t('options_builtin')));
  }
  info.appendChild(nameRow);
  info.appendChild(el('div', 'template-preview', previewText));

  const actions = el('div', 'template-actions');
  const editBtn = el('button', 'btn btn-ghost btn-sm btn-edit', t('options_edit'));
  editBtn.setAttribute('type', 'button');
  (editBtn as HTMLButtonElement).dataset.id = tpl.id;
  const deleteBtn = el('button', 'btn btn-danger btn-delete', t('options_delete'));
  deleteBtn.setAttribute('type', 'button');
  (deleteBtn as HTMLButtonElement).dataset.id = tpl.id;
  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);

  item.appendChild(handle);
  item.appendChild(info);
  item.appendChild(actions);
  return item;
}


export function renderTemplateList(): void {
  const container = refs.templateList!;
  container.replaceChildren();

  const q = state.searchQuery.toLowerCase();
  const filtered = state.templates.filter((tpl) =>
    !q ||
    tpl.name.toLowerCase().includes(q) ||
    tpl.prompt.toLowerCase().includes(q)
  );

  if (filtered.length === 0) {
    const empty = el('div', 'no-results');
    empty.textContent = q
      ? t('options_no_results_search').replace('{q}', q)
      : t('options_no_results');
    container.appendChild(empty);
    return;
  }

  for (const tpl of filtered) container.appendChild(buildTemplateItem(tpl));
  wireListInteractions();
}


function wireListInteractions(): void {
  const container = refs.templateList!;

  container.querySelectorAll<HTMLElement>('.btn-edit').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openModal(btn.dataset.id!);
    });
  });

  container.querySelectorAll<HTMLElement>('.btn-delete').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      void deleteTemplate(btn.dataset.id!);
    });
  });

  let dragSourceId: string | null = null;

  container.querySelectorAll<HTMLElement>('.template-item').forEach((item) => {
    item.addEventListener('dragstart', (e) => {
      dragSourceId = item.dataset.id ?? null;
      item.classList.add('dragging');
      e.dataTransfer?.setData('text/plain', dragSourceId ?? '');
      if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
    });

    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
      container.querySelectorAll('.template-item.drop-target').forEach((n) => n.classList.remove('drop-target'));
      dragSourceId = null;
    });

    item.addEventListener('dragover', (e) => {
      if (!dragSourceId || item.dataset.id === dragSourceId) return;
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
      item.classList.add('drop-target');
    });

    item.addEventListener('dragleave', () => {
      item.classList.remove('drop-target');
    });

    item.addEventListener('drop', (e) => {
      e.preventDefault();
      item.classList.remove('drop-target');
      const targetId = item.dataset.id;
      if (!dragSourceId || !targetId || dragSourceId === targetId) return;
      void reorderTemplates(dragSourceId, targetId);
    });
  });
}


async function reorderTemplates(sourceId: string, targetId: string): Promise<void> {
  const next = [...state.templates];
  const srcIdx = next.findIndex((t) => t.id === sourceId);
  const tgtIdx = next.findIndex((t) => t.id === targetId);
  if (srcIdx === -1 || tgtIdx === -1) return;
  const [moved] = next.splice(srcIdx, 1);
  next.splice(tgtIdx, 0, moved);
  state.templates = next;
  await saveTemplates(state.templates);
  renderTemplateList();
  renderDefaultTemplateSelect();
}


export async function deleteTemplate(id: string): Promise<void> {
  if (!confirm(t('options_delete_confirm'))) return;

  state.templates = state.templates.filter((tpl) => tpl.id !== id);
  await saveTemplates(state.templates);
  renderTemplateList();
  renderDefaultTemplateSelect();
  showToast('Template deleted');
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

    if (state.editingId) {
      state.templates = state.templates.map((tpl) =>
        tpl.id === state.editingId ? { ...tpl, name, prompt } : tpl
      );
    } else {
      state.templates.push({
        id: crypto.randomUUID(),
        name,
        prompt,
        category: 'Custom',
        isDefault: false,
      });
    }

    await saveTemplates(state.templates);
    renderTemplateList();
    renderDefaultTemplateSelect();
    showToast(state.editingId ? 'Template updated' : 'Template created');
    closeModal();
  });
}
