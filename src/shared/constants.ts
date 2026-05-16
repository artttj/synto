/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */

export const MSG = {
  EXTRACT_CONTENT: 'EXTRACT_CONTENT',
  COPY_TO_CLIPBOARD: 'COPY_TO_CLIPBOARD',
  GET_TEMPLATES: 'GET_TEMPLATES',
  SAVE_TEMPLATES: 'SAVE_TEMPLATES',
  INSERT_TEXT: 'INSERT_TEXT',
  SCROLL_AND_RESCAN: 'SCROLL_AND_RESCAN',
  CONTENT_UPDATE: 'CONTENT_UPDATE',
};

export const STORAGE_KEYS = {
  TEMPLATES:      'apc_templates',
  SETTINGS:       'apc_settings',
  OPENAI_KEY:     'apc_openai_key',
  GROK_KEY:       'apc_grok_key',
  GEMINI_KEY:     'apc_gemini_key',
  OPENROUTER_KEY: 'apc_openrouter_key',
  ZAI_KEY:        'apc_zai_key',
  ANTHROPIC_KEY:  'apc_anthropic_key',
  CUSTOM_KEY:     'apc_custom_key',
  OLLAMA_KEY:     'apc_ollama_key',
  HISTORY:        'apc_history',
  TEMPLATE_USAGE: 'apc_template_usage',
  PROVIDER_HEALTH: 'apc_provider_health',
  LIBRARY_CACHE:  'apc_library_cache',
  LIBRARY_DISMISS: 'apc_library_dismiss',
};

export const PROVIDER_MODELS: Record<string, string[]> = {
  openai:     ['gpt-4o-mini', 'gpt-4.1-mini', 'gpt-4.1'],
  gemini:     ['gemini-2.5-flash', 'gemini-2.5-pro'],
  grok:       ['grok-3-mini', 'grok-3'],
  openrouter: [
    'anthropic/claude-sonnet-4-6',
    'anthropic/claude-opus-4-7',
    'anthropic/claude-opus-4-6',
    'google/gemma-4-26b-a4b-it:free',
    'meta-llama/llama-3.3-70b-instruct',
    'deepseek/deepseek-r1:free',
    'qwen/qwen3-next-80b-a3b-instruct:free',
    'openai/gpt-oss-120b:free',
  ],
  zai:        ['zai-7b', 'zai-70b'],
  anthropic:  ['claude-sonnet-4-6', 'claude-opus-4-7', 'claude-opus-4-6', 'claude-haiku-4-5'],
  ollama:     [
    'kimi-k2.6:cloud', 'kimi-k2.5:cloud', 'kimi-k2-thinking:cloud', 'kimi-k2:1t-cloud',
    'deepseek-v4-flash:cloud', 'deepseek-v4-pro:cloud', 'deepseek-v3.2:cloud', 'deepseek-v3.1:671b-cloud',
    'gemma4:31b-cloud', 'gemma3:27b-cloud',
    'qwen3.5:397b-cloud', 'qwen3-coder:480b-cloud',
    'glm-5.1:cloud', 'glm-4.7:cloud', 'glm-4.6:cloud',
    'minimax-m2.7:cloud', 'minimax-m2:cloud',
    'nemotron-3-super:cloud',
    'gemini-3-flash-preview:cloud',
  ],
  custom:     [
    'gemma4', 'gemma3', 'gemini-3-flash-preview', 'gemini-2.5-flash',
    'llama4', 'llama3.3', 'qwen3.5', 'deepseek-r1', 'deepseek-v3',
    'phi4', 'mistral', 'kimi-k2', 'glm-5',
  ],
};

export const CUSTOM_ENDPOINT_DEFAULT = 'http://localhost:11434';

export const OLLAMA_ENDPOINT_DEFAULT = 'https://ollama.com/v1';

export const ANTHROPIC_MAX_TOKENS = 4096;

export const DEFAULT_SYSTEM_PROMPT =
  'Be specific. Use plain language. No filler, no hedging, no cliches — avoid words like leverage, streamline, dive into, furthermore, moreover, in conclusion, it\'s worth noting, crucial, essential. If something is wrong, say so directly. If it\'s fine, say so briefly. Short sentences beat long ones. Active voice. Concrete examples over abstract claims. Never start with "As a [role]" or "Based on the content provided."';

export const TEMPLATE_CATEGORIES = ['Understand', 'Decide', 'Compose', 'Brief', 'Review', 'Audit'];

export const TEMPLATE_CATEGORY_LABELS: Record<string, string> = {
  'Understand': 'Understand',
  'Decide': 'Decide',
  'Compose': 'Compose',
  'Brief': 'Brief',
  'Review': 'Review',
  'Audit': 'Audit',
};

export const DEPRECATED_TEMPLATE_IDS = new Set([
  'default-structured-brief',
  'analyze-article',
  'community-debate-map',
  'default-clean',
  'extract-key-questions',
  'lifestyle-recipe-card',
  'lifestyle-buy-decision',
  'eng-ticket-analysis',
  'decide-feature-request',
  'extract-risks-blockers',
  'lifestyle-smart-choice',
  'write-compose-answer',
  'community-rewrite-comment',
  'write-email-helper',
  'understand-audit',
  'decide-decide',
  'decide-actions',
  'decide-briefing',
  'brief-template',
  'review-feedback',
  'review-comparison',
  'understand-thread',
  'understand-meeting',
  'understand-counter',
  'audit-performance',
  'compose-diff-summary',
  'audit-security',
  'compose-linkedin',
  'compose-x-thread',
  'audit-schema',
]);

export const TOKEN_THRESHOLDS = {
  GREEN:  4000,
  YELLOW: 16000,
  MODEL_LIMITS: {
    'gpt-4o-mini':    128000,
    'gpt-4.1-mini':  1047576,
    'gpt-4.1':       1047576,
    'gemini-2.5-flash':  1048576,
    'gemini-2.5-pro':    2097152,
    'grok-3-mini':    131072,
    'grok-3':         131072,
    'anthropic/claude-sonnet-4-6': 200000,
    'anthropic/claude-opus-4-7':   200000,
    'anthropic/claude-opus-4-6':   200000,
    'google/gemma-4-26b-a4b-it:free': 262144,
    'meta-llama/llama-3.3-70b-instruct': 131072,
    'deepseek/deepseek-r1:free': 131072,
    'qwen/qwen3-next-80b-a3b-instruct:free': 131072,
    'openai/gpt-oss-120b:free': 131072,
    'zai-7b':  131072,
    'zai-70b': 131072,
    'claude-sonnet-4-6': 200000,
    'claude-opus-4-7':   200000,
    'claude-opus-4-6':   200000,
    'claude-haiku-4-5':  200000,
    'kimi-k2.6':             131072,
    'kimi-k2.5':             131072,
    'kimi-k2-thinking':      131072,
    'kimi-k2':               131072,
    'deepseek-v4-flash':     131072,
    'deepseek-v4-pro':       131072,
    'deepseek-v3.2':         131072,
    'deepseek-v3.1':         131072,
    'gemma4':                 131072,
    'gemma3':                 131072,
    'qwen3.5':               131072,
    'qwen3-coder':           131072,
    'glm-5.1':               131072,
    'glm-4.7':               131072,
    'glm-4.6':               131072,
    'minimax-m2.7':          131072,
    'minimax-m2':            131072,
    'nemotron-3-super':      131072,
    'gemini-3-flash-preview': 1048576,
  },
};


export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4); // ~4 chars per token
}


export function tokenColorClass(tokens: number): string {
  if (tokens < TOKEN_THRESHOLDS.GREEN) {
    return 'green';
  }
  if (tokens < TOKEN_THRESHOLDS.YELLOW) {
    return 'yellow';
  }
  return 'red';
}
