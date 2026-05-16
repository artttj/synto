/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */

import { type Template, type Settings } from '../shared/storage';
import { CUSTOM_ENDPOINT_DEFAULT, OLLAMA_ENDPOINT_DEFAULT, DEFAULT_SYSTEM_PROMPT } from '../shared/constants';
import { SEED_LIBRARY, type LibraryFile, type LibraryEntry } from '../shared/library';

export type LibraryView = 'mine' | 'browse';

export const state: {
  templates: Template[];
  settings: Settings;
  editingId: string | null;
  searchQuery: string;
  libraryView: LibraryView;
  libraryCategory: string;
  library: LibraryFile;
  libraryOffline: boolean;
  updatableEntries: Map<string, LibraryEntry>;
} = {
  templates: [],
  libraryView: 'mine',
  libraryCategory: '',
  library: SEED_LIBRARY,
  libraryOffline: false,
  updatableEntries: new Map(),
  settings: {
    defaultTemplateId: 'understand-brief',
    theme: 'system',
    llmProvider: 'openai',
    language: 'en',
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    openaiModel: 'gpt-4o-mini',
    geminiModel: 'gemini-2.5-flash',
    grokModel: 'grok-3-mini',
    openrouterModel: 'anthropic/claude-sonnet-4-6',
    zaiModel: 'zai-7b',
    anthropicModel: 'claude-sonnet-4-6',
    customEndpoint: CUSTOM_ENDPOINT_DEFAULT,
    customModel: '',
    customUseAuth: false,
    ollamaModel: 'kimi-k2.6:cloud',
    ollamaEndpoint: OLLAMA_ENDPOINT_DEFAULT,
    ollamaUseAuth: true,
  },
  editingId: null,
  searchQuery: '',
};
