/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj
 *
 * Prompt library types and the bundled seed. esbuild inlines library.json at
 * build time so first-paint never waits on a network request.
 */

import seedLibrary from '../../library/library.json';

export type LocalizedString = string | { [locale: string]: string };

export function resolveLocalized(value: LocalizedString, locale: string): string {
  if (typeof value === 'string') return value;
  return value[locale] ?? value.en ?? Object.values(value)[0] ?? '';
}

export interface SiteMatch {
  hosts?: string[];
  pathContains?: string[];
  signals?: {
    schemaTypes?: string[];
    ogTypes?: string[];
  };
  category?: string;
}

export interface PageSignals {
  schemaTypes: string[];
  ogType: string | null;
}

export interface LibraryEntry {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  category: string;
  tags: string[];
  placeholders: string[];
  version: number;
  prompt: LocalizedString;
  author: string;
  sourceUrl: string | null;
  recommendedModel: string | null;
  license: string;
  match?: SiteMatch;
  useFullContent?: boolean;
  usesWebSearch?: boolean;
}

export interface LibraryFile {
  version: string;
  entries: LibraryEntry[];
}

export const LIBRARY_REMOTE_URL =
  'https://raw.githubusercontent.com/artttj/synto/main/library/library.json';

export const LIBRARY_TTL_MS = 60 * 60 * 1000; // 1 hour

export const SEED_LIBRARY: LibraryFile = seedLibrary as LibraryFile;
