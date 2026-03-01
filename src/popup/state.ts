/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */
import { type Template } from '../shared/storage';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ExtractedContent {
  content: string;
  selection?: string;
  title: string;
  url: string;
  excerpt?: string;
  byline?: string;
  siteName?: string;
  source?: string;
  success?: boolean;
  error?: string;
  mode?: string;
}

export const PROVIDER_MODELS: Record<string, string> = {
  openai: 'gpt-4o-mini',
  gemini: 'gemini-2.0-flash',
  grok: 'grok-3-mini',
};

export const PROVIDER_LABELS: Record<string, string> = {
  openai: 'Ask ChatGPT',
  gemini: 'Ask Gemini',
  grok: 'Ask Grok',
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
};


export function getAskLabel(): string {
  return PROVIDER_LABELS[state.llmProvider] ?? 'Ask AI';
}
