import { Template, Settings } from '../shared/storage';

export const state: {
  templates: Template[];
  settings: Settings;
  editingId: string | null;
  searchQuery: string;
} = {
  templates: [],
  settings: { defaultTemplateId: 'default-structured-brief', theme: 'dark', llmProvider: 'openai' },
  editingId: null,
  searchQuery: '',
};
