/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj
 *
 * Library cache backed by chrome.storage.local. Hydrates from bundled seed on
 * first read so callers always get a usable LibraryFile even offline.
 */

import { STORAGE_KEYS } from './constants';
import { SEED_LIBRARY, type LibraryFile } from './library';

export interface LibraryCache {
  fetchedAt: number;
  library: LibraryFile;
}

export interface DismissMap {
  [entryId: string]: { atVersion: number };
}

export async function readLibraryCache(): Promise<LibraryCache> {
  const { [STORAGE_KEYS.LIBRARY_CACHE]: cached } = await chrome.storage.local.get(STORAGE_KEYS.LIBRARY_CACHE);
  if (cached && typeof cached === 'object' && 'library' in cached) {
    return cached as LibraryCache;
  }
  return { fetchedAt: 0, library: SEED_LIBRARY };
}

export async function writeLibraryCache(library: LibraryFile): Promise<void> {
  const entry: LibraryCache = { fetchedAt: Date.now(), library };
  await chrome.storage.local.set({ [STORAGE_KEYS.LIBRARY_CACHE]: entry });
}

export async function readDismissMap(): Promise<DismissMap> {
  const { [STORAGE_KEYS.LIBRARY_DISMISS]: dismiss } = await chrome.storage.local.get(STORAGE_KEYS.LIBRARY_DISMISS);
  return (dismiss as DismissMap | undefined) ?? {};
}

export async function dismissEntryUpdate(entryId: string, atVersion: number): Promise<void> {
  const current = await readDismissMap();
  await chrome.storage.local.set({
    [STORAGE_KEYS.LIBRARY_DISMISS]: { ...current, [entryId]: { atVersion } },
  });
}
