/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj
 *
 * Browse, install, and update prompts from the shared library.
 */

import {
  syncLibrary,
  computeUpdatable,
  applyEntryToTemplate,
  importEntryAsTemplate,
  isInstalled,
} from '../shared/library-sync';
import { readLibraryCache, dismissEntryUpdate } from '../shared/library-cache';
import type { LibraryEntry } from '../shared/library';
import { saveTemplates, type Template } from '../shared/storage';
import { t } from '../shared/i18n';
import { el } from '../shared/dom';

import { refs } from './dom';
import { state, type LibraryView } from './state';
import { showToast, wireModalClose } from './utils';
import { renderTemplateList } from './templateList';
import { renderDefaultTemplateSelect, syncSegmented } from './settings';

let remoteSyncStarted = false;

export async function hydrateLibraryFromCache(): Promise<void> {
  const cache = await readLibraryCache();
  state.library = cache.library;
  await recomputeUpdatable();
}

async function fetchRemoteOnce(): Promise<void> {
  if (remoteSyncStarted) return;
  remoteSyncStarted = true;
  const outcome = await syncLibrary(false);
  state.library = outcome.cache.library;
  state.libraryOffline = outcome.kind === 'offline';
  applyOfflineHint();
  if (outcome.kind === 'fresh') await refreshLibraryUi();
}

async function recomputeUpdatable(): Promise<void> {
  const updatable = await computeUpdatable(state.templates, state.library);
  state.updatableEntries = new Map(updatable.map((u) => [u.template.id, u.entry]));
}

function applyOfflineHint(): void {
  const browseActive = state.libraryView === 'browse';
  refs.libraryOfflineHint?.classList.toggle('hidden', !state.libraryOffline || !browseActive);
}

export async function refreshLibraryUi(): Promise<void> {
  await recomputeUpdatable();
  renderBrowseCount();
  renderTemplateList();
  if (state.libraryView === 'browse') renderBrowseList();
}

function renderBrowseCount(): void {
  const count = state.library.entries.filter((e) => !isInstalled(e, state.templates)).length;
  if (refs.libraryBrowseCount) {
    refs.libraryBrowseCount.textContent = count > 0 ? String(count) : '';
    refs.libraryBrowseCount.classList.toggle('hidden', count === 0);
  }
}

function buildBrowseCard(entry: LibraryEntry, local: Template | undefined): HTMLElement {
  const card = el('div', 'lib-card');
  card.dataset.id = entry.id;

  const head = el('div', 'lib-card-head');
  head.appendChild(el('div', 'lib-card-title', entry.name));
  if (entry.category) head.appendChild(el('span', 'lib-card-cat', entry.category));
  card.appendChild(head);

  card.appendChild(el('div', 'lib-card-desc', entry.description));

  if (entry.tags.length > 0) {
    const tagRow = el('div', 'lib-card-tags');
    for (const tag of entry.tags.slice(0, 4)) tagRow.appendChild(el('span', 'lib-card-tag', tag));
    card.appendChild(tagRow);
  }

  const foot = el('div', 'lib-card-foot');
  if (entry.author && entry.author !== 'synto') {
    foot.appendChild(el('span', 'lib-card-author', `by ${entry.author}`));
  }

  const action = el('div', 'lib-card-action');
  if (!local) {
    const addBtn = el('button', 'btn btn-primary btn-sm', t('options_library_add'));
    addBtn.addEventListener('click', () => void installEntry(entry));
    action.appendChild(addBtn);
  } else {
    const localVersion = local.fromLibrary?.version ?? 1;
    if (entry.version > localVersion) {
      const upBtn = el('button', 'btn btn-pill btn-sm', `↑ v${entry.version}`);
      upBtn.title = t('options_library_update_available');
      upBtn.addEventListener('click', () => openDiff(local, entry));
      action.appendChild(upBtn);
    } else {
      action.appendChild(el('span', 'lib-card-installed', t('options_library_installed')));
    }
  }
  foot.appendChild(action);
  card.appendChild(foot);

  return card;
}

function renderBrowseList(): void {
  const container = refs.libraryBrowseList;
  if (!container) return;
  container.replaceChildren();

  const q = state.searchQuery.toLowerCase();
  const cat = state.libraryCategory;
  const filtered = state.library.entries.filter((e) => {
    if (cat && e.category !== cat) return false;
    if (!q) return true;
    return (
      e.name.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  });

  if (filtered.length === 0) {
    container.appendChild(el('div', 'no-results', t('options_no_results')));
    return;
  }

  const localById = new Map(state.templates.map((tpl) => [tpl.id, tpl]));
  const grid = el('div', 'lib-card-grid');
  for (const entry of filtered) grid.appendChild(buildBrowseCard(entry, localById.get(entry.id)));
  container.appendChild(grid);
}

async function installEntry(entry: LibraryEntry): Promise<void> {
  if (isInstalled(entry, state.templates)) return;
  state.templates = [...state.templates, importEntryAsTemplate(entry)];
  await saveTemplates(state.templates);
  await refreshLibraryUi();
  renderDefaultTemplateSelect();
  showToast(`Added ${entry.name}`);
}

interface DiffPart {
  type: 'add' | 'remove' | 'same';
  line: string;
}

function lineDiff(a: string, b: string): { left: DiffPart[]; right: DiffPart[] } {
  const aLines = a.split('\n');
  const bLines = b.split('\n');
  const aSet = new Set(aLines);
  const bSet = new Set(bLines);
  const left: DiffPart[] = aLines.map((line) => ({
    type: bSet.has(line) ? 'same' : 'remove',
    line,
  }));
  const right: DiffPart[] = bLines.map((line) => ({
    type: aSet.has(line) ? 'same' : 'add',
    line,
  }));
  return { left, right };
}

function renderDiffColumn(target: HTMLElement, parts: DiffPart[]): void {
  target.replaceChildren();
  for (const part of parts) {
    const line = el('div', `lib-diff-line lib-diff-${part.type}`);
    line.textContent = part.line === '' ? ' ' : part.line;
    target.appendChild(line);
  }
}

let diffContext: { template: Template; entry: LibraryEntry } | null = null;

function openDiff(template: Template, entry: LibraryEntry): void {
  diffContext = { template, entry };
  if (refs.libDiffMeta) {
    const localVersion = template.fromLibrary?.version ?? 1;
    refs.libDiffMeta.textContent = `${entry.name}: v${localVersion} → v${entry.version}`;
  }
  const { left, right } = lineDiff(template.prompt, entry.prompt);
  if (refs.libDiffYours) renderDiffColumn(refs.libDiffYours, left);
  if (refs.libDiffLibrary) renderDiffColumn(refs.libDiffLibrary, right);
  refs.libDiffOverlay?.classList.remove('hidden');
}

function closeDiff(): void {
  refs.libDiffOverlay?.classList.add('hidden');
  diffContext = null;
}

async function applyDiff(): Promise<void> {
  if (!diffContext) return;
  const { template, entry } = diffContext;
  state.templates = state.templates.map((tpl) =>
    tpl.id === template.id ? applyEntryToTemplate(tpl, entry) : tpl,
  );
  await saveTemplates(state.templates);
  closeDiff();
  await refreshLibraryUi();
  renderDefaultTemplateSelect();
  showToast(`Updated ${entry.name} to v${entry.version}`);
}

async function dismissDiff(): Promise<void> {
  if (!diffContext) return;
  const { entry } = diffContext;
  await dismissEntryUpdate(entry.id, entry.version);
  closeDiff();
  await refreshLibraryUi();
}

export function openLibraryDiff(template: Template, entry: LibraryEntry): void {
  openDiff(template, entry);
}

export function renderCurrentLibraryView(): void {
  if (state.libraryView === 'browse') renderBrowseList();
  else renderTemplateList();
}

function setLibraryView(next: LibraryView): void {
  state.libraryView = next;
  syncSegmented(refs.libraryViewSeg, next);
  refs.libraryCategoryRow?.classList.toggle('hidden', next !== 'browse');
  refs.libraryBrowseList?.classList.toggle('hidden', next !== 'browse');
  refs.templateList?.classList.toggle('hidden', next !== 'mine');
  refs.btnLibraryRefresh?.classList.toggle('hidden', next !== 'browse');
  refs.btnNewTemplate?.classList.toggle('hidden', next !== 'mine');
  applyOfflineHint();
  if (next === 'browse') {
    renderBrowseList();
    void fetchRemoteOnce();
  }
}

export function wireLibrary(): void {
  refs.libraryViewSeg?.querySelectorAll<HTMLElement>('.seg-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      setLibraryView((btn.dataset.value as LibraryView) ?? 'mine');
    });
  });

  refs.libraryCategoryRow?.querySelectorAll<HTMLElement>('.lib-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      state.libraryCategory = chip.dataset.cat ?? '';
      refs.libraryCategoryRow?.querySelectorAll('.lib-chip').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      renderBrowseList();
    });
  });

  refs.btnLibraryRefresh?.addEventListener('click', async () => {
    refs.btnLibraryRefresh?.classList.add('spinning');
    try {
      remoteSyncStarted = false;
      const outcome = await syncLibrary(true);
      state.library = outcome.cache.library;
      state.libraryOffline = outcome.kind === 'offline';
      applyOfflineHint();
      await refreshLibraryUi();
      showToast(t(state.libraryOffline ? 'options_library_refresh_failed' : 'options_library_refresh_ok'));
    } finally {
      refs.btnLibraryRefresh?.classList.remove('spinning');
    }
  });

  wireModalClose(refs.libDiffOverlay, refs.libDiffClose, closeDiff);
  refs.libDiffKeep?.addEventListener('click', () => void dismissDiff());
  refs.libDiffApply?.addEventListener('click', () => void applyDiff());
}
