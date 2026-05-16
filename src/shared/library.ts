/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj
 *
 * Prompt library types and the bundled seed. esbuild inlines library.json at
 * build time so first-paint never waits on a network request.
 */

import seedLibrary from '../../library/library.json';

export interface LibraryEntry {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  placeholders: string[];
  version: number;
  prompt: string;
  author: string;
  sourceUrl: string | null;
  recommendedModel: string | null;
  license: string;
}

export interface LibraryFile {
  version: string;
  entries: LibraryEntry[];
}

export const LIBRARY_REMOTE_URL =
  'https://raw.githubusercontent.com/artttj/synto/main/library/library.json';

export const LIBRARY_TTL_MS = 60 * 60 * 1000; // 1 hour

export const SEED_LIBRARY: LibraryFile = seedLibrary as LibraryFile;
