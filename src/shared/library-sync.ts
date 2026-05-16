/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj
 *
 * Library sync engine: fetches remote library.json when the cache is stale,
 * falls back silently on network failure, and computes which user templates
 * have an upgrade available.
 */

import { LIBRARY_REMOTE_URL, LIBRARY_TTL_MS, type LibraryFile, type LibraryEntry } from './library';
import {
  readLibraryCache,
  writeLibraryCache,
  readDismissMap,
  type LibraryCache,
} from './library-cache';
import type { Template } from './storage';

export type FetchOutcome =
  | { kind: 'cached'; cache: LibraryCache }
  | { kind: 'fresh'; cache: LibraryCache }
  | { kind: 'offline'; cache: LibraryCache };

export async function syncLibrary(force: boolean = false): Promise<FetchOutcome> {
  const cache = await readLibraryCache();
  const age = Date.now() - cache.fetchedAt;
  if (!force && cache.fetchedAt > 0 && age < LIBRARY_TTL_MS) {
    return { kind: 'cached', cache };
  }
  try {
    const res = await fetch(LIBRARY_REMOTE_URL);
    if (!res.ok) {
      return { kind: 'offline', cache };
    }
    const fresh = (await res.json()) as LibraryFile;
    if (!fresh || !Array.isArray(fresh.entries)) {
      return { kind: 'offline', cache };
    }
    await writeLibraryCache(fresh);
    return { kind: 'fresh', cache: { fetchedAt: Date.now(), library: fresh } };
  } catch {
    return { kind: 'offline', cache };
  }
}

export interface UpdatableTemplate {
  template: Template;
  entry: LibraryEntry;
  localVersion: number;
}

export async function computeUpdatable(
  templates: Template[],
  library: LibraryFile,
): Promise<UpdatableTemplate[]> {
  const dismiss = await readDismissMap();
  const entriesById = new Map(library.entries.map((e) => [e.id, e]));
  const out: UpdatableTemplate[] = [];
  for (const tpl of templates) {
    const entry = entriesById.get(tpl.id);
    if (!entry) continue;
    const localVersion = tpl.fromLibrary?.version ?? 1;
    if (entry.version <= localVersion) continue;
    if (dismiss[tpl.id]?.atVersion === entry.version) continue;
    out.push({ template: tpl, entry, localVersion });
  }
  return out;
}

export function applyEntryToTemplate(template: Template, entry: LibraryEntry): Template {
  return {
    ...template,
    name: entry.name,
    description: entry.description,
    category: entry.category,
    prompt: entry.prompt,
    fromLibrary: { entryId: entry.id, version: entry.version, source: 'remote' },
  };
}

export function importEntryAsTemplate(entry: LibraryEntry): Template {
  return {
    id: entry.id,
    name: entry.name,
    description: entry.description,
    category: entry.category,
    prompt: entry.prompt,
    isDefault: false,
    fromLibrary: { entryId: entry.id, version: entry.version, source: 'remote' },
  };
}

export function isInstalled(entry: LibraryEntry, templates: Template[]): boolean {
  return templates.some((t) => t.id === entry.id);
}
