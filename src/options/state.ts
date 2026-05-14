/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */

import { type Template, type Settings } from '../shared/storage';
import { CUSTOM_ENDPOINT_DEFAULT, OLLAMA_ENDPOINT_DEFAULT } from '../shared/constants';

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
    openrouterModel: 'anthropic/claude-sonnet-4-6',
    zaiModel: 'zai-7b',
    anthropicModel: 'claude-sonnet-4-6',
    customEndpoint: CUSTOM_ENDPOINT_DEFAULT,
    customModel: '',
    customUseAuth: false,
    ollamaModel: 'kimi-k2.6',
    ollamaEndpoint: OLLAMA_ENDPOINT_DEFAULT,
    ollamaUseAuth: true,
    pinnedTemplateIds: [],
  },
  editingId: null,
  searchQuery: '',
};
