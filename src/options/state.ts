/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */

import { type Template, type Settings } from '../shared/storage';

export const state: {
  templates: Template[];
  settings: Settings;
  editingId: string | null;
  searchQuery: string;
} = {
  templates: [],
  settings: {
    defaultTemplateId: 'understand-structured-brief',
    theme: 'dark',
    llmProvider: 'openai',
    language: 'en',
    systemPrompt: '',
    openaiModel: 'gpt-4o-mini',
    geminiModel: 'gemini-2.0-flash',
    grokModel: 'grok-3-mini',
    pinnedTemplateIds: [],
  },
  editingId: null,
  searchQuery: '',
};
