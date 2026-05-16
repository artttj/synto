/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 *
 * Library update detection: hydrate cache, sync remote on options open, and
 * surface a side-by-side diff when a user template is behind the library version.
 */

import { syncLibrary, computeUpdatable, applyEntryToTemplate } from '../shared/library-sync';
import { readLibraryCache, dismissEntryUpdate } from '../shared/library-cache';
import type { LibraryEntry } from '../shared/library';
import { saveTemplates, type Template } from '../shared/storage';

import { refs } from './dom';
import { state } from './state';
import { showToast, wireModalClose } from './utils';
import { renderTemplateList } from './templateList';
import { renderDefaultTemplateSelect } from './settings';

let remoteSyncStarted = false;

export async function hydrateLibraryFromCache(): Promise<void> {
  const cache = await readLibraryCache();
  state.library = cache.library;
  await recomputeUpdatable();
  renderTemplateList();
  void fetchRemoteOnce();
}

async function fetchRemoteOnce(): Promise<void> {
  if (remoteSyncStarted) return;
  remoteSyncStarted = true;
  const outcome = await syncLibrary(false);
  state.library = outcome.cache.library;
  if (outcome.kind === 'fresh') {
    await recomputeUpdatable();
    renderTemplateList();
  }
}

async function recomputeUpdatable(): Promise<void> {
  const updatable = await computeUpdatable(state.templates, state.library);
  state.updatableEntries = new Map(updatable.map((u) => [u.template.id, u.entry]));
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
    const line = document.createElement('div');
    line.className = `lib-diff-line lib-diff-${part.type}`;
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
  await recomputeUpdatable();
  renderTemplateList();
  renderDefaultTemplateSelect();
  showToast(`Updated ${entry.name} to v${entry.version}`);
}

async function dismissDiff(): Promise<void> {
  if (!diffContext) return;
  const { entry } = diffContext;
  await dismissEntryUpdate(entry.id, entry.version);
  closeDiff();
  await recomputeUpdatable();
  renderTemplateList();
}

export function openLibraryDiff(template: Template, entry: LibraryEntry): void {
  openDiff(template, entry);
}

export function wireLibrary(): void {
  wireModalClose(refs.libDiffOverlay, refs.libDiffClose, closeDiff);
  refs.libDiffKeep?.addEventListener('click', () => void dismissDiff());
  refs.libDiffApply?.addEventListener('click', () => void applyDiff());
}
