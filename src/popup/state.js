/**
 * Popup UI state. Single mutable object shared by popup modules.
 */

export const PROVIDER_MODELS = {
  openai: 'gpt-4o-mini',
  gemini: 'gemini-2.0-flash',
  grok: 'grok-3-mini',
};

export const PROVIDER_LABELS = {
  openai: 'Ask ChatGPT',
  gemini: 'Ask Gemini',
  grok: 'Ask Grok',
};

export const state = {
  templates: [],
  selectedTemplateId: null,
  extracted: null,   // { content, selection, title, url, ... }
  rawMarkdown: '',
  finalText: '',
  previewOpen: true,
  previewTab: 'content',   // 'content' | 'prompt'
  chatStreaming: false,
  chatHistory: [],         // { role, content }[]
  llmProvider: 'openai',
};


export function getAskLabel() {
  return PROVIDER_LABELS[state.llmProvider] ?? 'Ask AI';
}
