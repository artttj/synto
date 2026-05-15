/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */

import { type Template, type ChatMessage } from '../shared/storage';
import { t } from '../shared/i18n';
import { CUSTOM_ENDPOINT_DEFAULT, OLLAMA_ENDPOINT_DEFAULT } from '../shared/constants';

export type { ChatMessage };

export interface ExtractedContent {
  content: string;
  selection?: string;
  title: string;
  url: string;
  siteName?: string;
  source?: string;
  success?: boolean;
  error?: string;
  mode?: string;
  autoRescanned?: boolean;
}

const DEFAULT_MODELS: Record<string, string> = {
  openai:     'gpt-4o-mini',
  gemini:     'gemini-2.5-flash',
  grok:       'grok-3-mini',
  openrouter: 'anthropic/claude-sonnet-4-6',
  zai:        'zai-7b',
  anthropic:  'claude-sonnet-4-6',
  ollama:     'kimi-k2.6',
  custom:     '',
};

const _PROVIDER_LABEL_KEYS: Record<string, string> = {
  openai:     'popup_ask_chatgpt',
  gemini:     'popup_ask_gemini',
  grok:       'popup_ask_grok',
  openrouter: 'popup_ask_openrouter',
  zai:        'popup_ask_zai',
  anthropic:  'popup_ask_anthropic',
  ollama:     'popup_ask_ollama',
  custom:     'popup_ask_custom',
};

export const state: {
  templates: Template[];
  selectedTemplateId: string | null;
  extracted: ExtractedContent | null;
  rawMarkdown: string;
  finalText: string;
  previewOpen: boolean;
  previewTab: 'content' | 'prompt';
  chatStreaming: boolean;
  chatHistory: ChatMessage[];
  llmProvider: string;
  systemPrompt: string;
  openaiModel: string;
  geminiModel: string;
  grokModel: string;
  openrouterModel: string;
  zaiModel: string;
  anthropicModel: string;
  customEndpoint: string;
  customModel: string;
  customUseAuth: boolean;
  ollamaModel: string;
  ollamaEndpoint: string;
  ollamaUseAuth: boolean;
} = {
  templates: [],
  selectedTemplateId: null,
  extracted: null,
  rawMarkdown: '',
  finalText: '',
  previewOpen: true,
  previewTab: 'content',
  chatStreaming: false,
  chatHistory: [],
  llmProvider: 'openai',
  systemPrompt: '',
  openaiModel:      DEFAULT_MODELS.openai,
  geminiModel:      DEFAULT_MODELS.gemini,
  grokModel:        DEFAULT_MODELS.grok,
  openrouterModel:  DEFAULT_MODELS.openrouter,
  zaiModel:         DEFAULT_MODELS.zai,
  anthropicModel:   DEFAULT_MODELS.anthropic,
  customEndpoint:   CUSTOM_ENDPOINT_DEFAULT,
  customModel:      '',
  customUseAuth:    false,
  ollamaModel:      'kimi-k2.6',
  ollamaEndpoint:   OLLAMA_ENDPOINT_DEFAULT,
  ollamaUseAuth:    true,
};


export function getActiveModel(): string {
  switch (state.llmProvider) {
    case 'gemini':     return state.geminiModel;
    case 'grok':       return state.grokModel;
    case 'openrouter': return state.openrouterModel;
    case 'zai':        return state.zaiModel;
    case 'anthropic':  return state.anthropicModel;
    case 'ollama':     return state.ollamaModel;
    case 'custom':     return state.customModel || 'custom';
    default:           return state.openaiModel;
  }
}


export function getAskLabel(): string {
  const model = getActiveModel();
  return `${t('popup_ask_ai')} ${model}`;
}
