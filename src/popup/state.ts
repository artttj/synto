/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */

import { type Template, type ChatMessage } from '../shared/storage';
import { t } from '../shared/i18n';

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
}

const DEFAULT_MODELS: Record<string, string> = {
  openai: 'gpt-4o-mini',
  gemini: 'gemini-2.0-flash',
  grok:   'grok-3-mini',
};

const PROVIDER_LABEL_KEYS: Record<string, string> = {
  openai: 'popup_ask_chatgpt',
  gemini: 'popup_ask_gemini',
  grok:   'popup_ask_grok',
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
  pinnedIds: string[];
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
  openaiModel: DEFAULT_MODELS.openai,
  geminiModel: DEFAULT_MODELS.gemini,
  grokModel:   DEFAULT_MODELS.grok,
  pinnedIds: [],
};


export function getActiveModel(): string {
  if (state.llmProvider === 'gemini') return state.geminiModel;
  if (state.llmProvider === 'grok')   return state.grokModel;
  return state.openaiModel;
}


export function getAskLabel(): string {
  const key = PROVIDER_LABEL_KEYS[state.llmProvider];
  return key ? t(key) : t('popup_ask_ai');
}
