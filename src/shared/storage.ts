/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */

import { STORAGE_KEYS, DEFAULT_TEMPLATES, DEPRECATED_TEMPLATE_IDS } from './constants';

export interface Template {
  id: string;
  name: string;
  label?: string;
  description?: string;
  category?: string;
  isDefault?: boolean;
  prompt: string;
}

export interface Settings {
  defaultTemplateId: string;
  theme: string;
  llmProvider: string;
  language: string;
  systemPrompt: string;
  openaiModel: string;
  geminiModel: string;
  grokModel: string;
  pinnedTemplateIds: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface HistoryEntry {
  ts: number;
  templateId: string;
  provider: string;
  model: string;
  messages: ChatMessage[];
}

export async function getOpenAIKey(): Promise<string> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.OPENAI_KEY);
  return (result[STORAGE_KEYS.OPENAI_KEY] as string) ?? '';
}

export async function saveOpenAIKey(key: string): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.OPENAI_KEY]: key });
}

export async function getGrokKey(): Promise<string> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.GROK_KEY);
  return (result[STORAGE_KEYS.GROK_KEY] as string) ?? '';
}

export async function saveGrokKey(key: string): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.GROK_KEY]: key });
}

export async function getGeminiKey(): Promise<string> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.GEMINI_KEY);
  return (result[STORAGE_KEYS.GEMINI_KEY] as string) ?? '';
}

export async function saveGeminiKey(key: string): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.GEMINI_KEY]: key });
}

export async function getTemplates(): Promise<Template[]> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.TEMPLATES);
  const saved = result[STORAGE_KEYS.TEMPLATES] as Template[] | undefined;

  if (!saved) {
    return DEFAULT_TEMPLATES;
  }

  const defaultsById = new Map(DEFAULT_TEMPLATES.map((t) => [t.id, t]));
  const active = saved.filter((t) => !DEPRECATED_TEMPLATE_IDS.has(t.id));
  const merged = active.map((t) => {
    const def = defaultsById.get(t.id);
    if (!def) return t;
    return {
      ...t,
      name:        def.name,
      label:       def.label,
      category:    def.category,
      description: def.description,
    };
  });

  const savedIds = new Set(merged.map((t) => t.id));
  const missing = DEFAULT_TEMPLATES.filter((t) => !savedIds.has(t.id));
  return missing.length > 0 ? [...merged, ...missing] : merged;
}


export async function saveTemplates(templates: Template[]): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.TEMPLATES]: templates });
}


export async function getSettings(): Promise<Settings> {
  const result = await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS);
  return {
    defaultTemplateId: 'understand-structured-brief',
    theme: 'dark',
    llmProvider: 'openai',
    language: 'en',
    systemPrompt: '',
    openaiModel: 'gpt-4o-mini',
    geminiModel: 'gemini-2.0-flash',
    grokModel: 'grok-3-mini',
    pinnedTemplateIds: [],
    ...(result[STORAGE_KEYS.SETTINGS] as Partial<Settings> | undefined),
  };
}


export async function saveSettings(partial: Partial<Settings>): Promise<void> {
  const current = await getSettings();
  await chrome.storage.sync.set({
    [STORAGE_KEYS.SETTINGS]: { ...current, ...partial },
  });
}


export function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = '';
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid', 'ref'];
    for (const p of trackingParams) u.searchParams.delete(p);
    return u.toString();
  } catch {
    return url;
  }
}


export async function getHistory(url: string): Promise<HistoryEntry[]> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.HISTORY);
  const all = (result[STORAGE_KEYS.HISTORY] ?? {}) as Record<string, HistoryEntry[]>;
  return all[url] ?? [];
}


export async function saveHistory(url: string, entry: HistoryEntry): Promise<void> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.HISTORY);
  const all = (result[STORAGE_KEYS.HISTORY] ?? {}) as Record<string, HistoryEntry[]>;

  const existing = all[url] ?? [];
  all[url] = [entry, ...existing].slice(0, 3);

  const keys = Object.keys(all);
  if (keys.length > 40) {
    const sorted = keys
      .map((k) => ({ k, ts: all[k][0]?.ts ?? 0 }))
      .sort((a, b) => a.ts - b.ts);
    for (let i = 0; i < keys.length - 40; i++) {
      delete all[sorted[i].k];
    }
  }

  await chrome.storage.local.set({ [STORAGE_KEYS.HISTORY]: all });
}
