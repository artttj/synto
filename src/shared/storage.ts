/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */

import { STORAGE_KEYS, DEPRECATED_TEMPLATE_IDS, DEFAULT_SYSTEM_PROMPT } from './constants';
import { SEED_LIBRARY } from './library';

export const DEFAULT_TEMPLATES: Template[] = SEED_LIBRARY.entries.map((e) => ({
  id: e.id,
  name: e.name,
  label: e.name,
  description: e.description,
  category: e.category,
  isDefault: e.id === 'understand-brief',
  prompt: e.prompt,
}));

export interface Template {
  id: string;
  name: string;
  label?: string;
  description?: string;
  category?: string;
  isDefault?: boolean;
  prompt: string;
  fromLibrary?: {
    entryId: string;
    version: number;
    source: 'bundled' | 'remote';
  };
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
  openrouterModel: string;
  zaiModel: string;
  anthropicModel: string;
  customEndpoint: string;
  customModel: string;
  customUseAuth: boolean;
  ollamaModel: string;
  ollamaEndpoint: string;
  ollamaUseAuth: boolean;
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

export interface TemplateUsage {
  globalTemplateId?: string;
  byHost: Record<string, string>;
}

export type ProviderHealthStatus = 'ok' | 'no_key' | 'rate_limited' | 'error';

export interface ProviderHealthEntry {
  status: ProviderHealthStatus;
  ts: number;
  message?: string;
}

export type ProviderHealth = Record<string, ProviderHealthEntry>;

function hostFromUrl(url?: string): string | undefined {
  if (!url) return undefined;

  try {
    return new URL(url).hostname;
  } catch {
    return undefined;
  }
}

function hasTemplate(templates: Template[], templateId?: string): templateId is string {
  return Boolean(templateId && templates.some((template) => template.id === templateId));
}

export function pickRememberedTemplateId(
  url: string | undefined,
  templates: Template[],
  usage: TemplateUsage,
  defaultTemplateId?: string,
  detected?: { templateId: string }
): string {
  const host = hostFromUrl(url);
  const hostTemplateId = host ? usage.byHost[host] : undefined;

  if (hasTemplate(templates, hostTemplateId)) return hostTemplateId;
  if (detected && hasTemplate(templates, detected.templateId)) return detected.templateId;
  if (hasTemplate(templates, defaultTemplateId)) return defaultTemplateId;
  if (hasTemplate(templates, usage.globalTemplateId)) return usage.globalTemplateId;

  return templates[0]?.id ?? defaultTemplateId ?? '';
}

export function providerHealthLabel(entry?: ProviderHealthEntry): string {
  if (!entry) return 'No recent status';

  if (entry.status === 'ok') return 'Connected';
  if (entry.status === 'no_key') return 'No key';
  if (entry.status === 'rate_limited') return 'Rate limited';
  return 'Last failed';
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

export async function getOpenRouterKey(): Promise<string> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.OPENROUTER_KEY);
  return (result[STORAGE_KEYS.OPENROUTER_KEY] as string) ?? '';
}

export async function saveOpenRouterKey(key: string): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.OPENROUTER_KEY]: key });
}

export async function getZaiKey(): Promise<string> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.ZAI_KEY);
  return (result[STORAGE_KEYS.ZAI_KEY] as string) ?? '';
}

export async function saveZaiKey(key: string): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.ZAI_KEY]: key });
}

export async function getAnthropicKey(): Promise<string> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.ANTHROPIC_KEY);
  return (result[STORAGE_KEYS.ANTHROPIC_KEY] as string) ?? '';
}

export async function saveAnthropicKey(key: string): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.ANTHROPIC_KEY]: key });
}

export async function getCustomKey(): Promise<string> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.CUSTOM_KEY);
  return (result[STORAGE_KEYS.CUSTOM_KEY] as string) ?? '';
}

export async function saveCustomKey(key: string): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.CUSTOM_KEY]: key });
}

export async function getOllamaKey(): Promise<string> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.OLLAMA_KEY);
  return (result[STORAGE_KEYS.OLLAMA_KEY] as string) ?? '';
}

export async function saveOllamaKey(key: string): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.OLLAMA_KEY]: key });
}

const SEED_LIBRARY_BY_ID = new Map(SEED_LIBRARY.entries.map((e) => [e.id, e]));

function stampWithLibrary(t: Template): Template {
  if (t.fromLibrary) return t;
  const entry = SEED_LIBRARY_BY_ID.get(t.id);
  if (!entry) return t;
  return { ...t, fromLibrary: { entryId: entry.id, version: 1, source: 'bundled' } };
}

export async function getTemplates(): Promise<Template[]> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.TEMPLATES);
  const saved = result[STORAGE_KEYS.TEMPLATES] as Template[] | undefined;

  if (!saved) {
    return DEFAULT_TEMPLATES.map(stampWithLibrary);
  }

  const defaultsById = new Map(DEFAULT_TEMPLATES.map((t) => [t.id, t]));
  const active = saved.filter((t) => !DEPRECATED_TEMPLATE_IDS.has(t.id));
  const merged = active.map((t) => {
    const def = defaultsById.get(t.id);
    const base = def
      ? { ...t, name: def.name, label: def.label, category: def.category, description: def.description }
      : t;
    return stampWithLibrary(base);
  });

  const savedIds = new Set(merged.map((t) => t.id));
  const missing = DEFAULT_TEMPLATES.filter((t) => !savedIds.has(t.id)).map(stampWithLibrary);
  return missing.length > 0 ? [...merged, ...missing] : merged;
}


export async function saveTemplates(templates: Template[]): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.TEMPLATES]: templates });
}


export async function getTemplateUsage(): Promise<TemplateUsage> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.TEMPLATE_USAGE);
  const saved = result[STORAGE_KEYS.TEMPLATE_USAGE] as Partial<TemplateUsage> | undefined;

  return {
    globalTemplateId: saved?.globalTemplateId,
    byHost: saved?.byHost ?? {},
  };
}

let templateUsageWriteQueue: Promise<void> = Promise.resolve();

export function rememberTemplateUsage(url: string | undefined, templateId: string): Promise<void> {
  const write = templateUsageWriteQueue.catch(() => undefined).then(async () => {
    const usage = await getTemplateUsage();
    const host = hostFromUrl(url);
    const next: TemplateUsage = {
      globalTemplateId: templateId,
      byHost: { ...usage.byHost },
    };

    if (host) {
      next.byHost[host] = templateId;
    }

    await chrome.storage.local.set({ [STORAGE_KEYS.TEMPLATE_USAGE]: next });
  });

  templateUsageWriteQueue = write.catch(() => undefined);
  return write;
}


export async function getRememberedTemplateId(
  url: string | undefined,
  templates: Template[],
  defaultTemplateId?: string,
  detected?: { templateId: string }
): Promise<string> {
  return pickRememberedTemplateId(url, templates, await getTemplateUsage(), defaultTemplateId, detected);
}


export async function getProviderHealth(): Promise<ProviderHealth> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.PROVIDER_HEALTH);
  return (result[STORAGE_KEYS.PROVIDER_HEALTH] as ProviderHealth | undefined) ?? {};
}


export async function saveProviderHealth(provider: string, entry: ProviderHealthEntry): Promise<void> {
  const health = await getProviderHealth();
  await chrome.storage.local.set({
    [STORAGE_KEYS.PROVIDER_HEALTH]: {
      ...health,
      [provider]: entry,
    },
  });
}


export async function getSettings(): Promise<Settings> {
  const result = await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS);
  return {
    defaultTemplateId: 'understand-brief',
    theme: 'dark',
    llmProvider: 'openai',
    language: 'en',
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    openaiModel: 'gpt-4.1-mini',
    geminiModel: 'gemini-2.5-flash',
    grokModel: 'grok-3-mini',
    openrouterModel: 'anthropic/claude-sonnet-4-6',
    zaiModel: 'zai-7b',
    anthropicModel: 'claude-sonnet-4-6',
    customEndpoint: 'http://localhost:11434',
    customModel: '',
    customUseAuth: false,
    ollamaModel: 'kimi-k2.6:cloud',
    ollamaEndpoint: 'https://ollama.com/v1',
    ollamaUseAuth: true,
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
    const keep = new Set(sorted.slice(keys.length - 40).map(({ k }) => k));
    const trimmed: Record<string, HistoryEntry[]> = {};
    for (const key of keys) {
      if (keep.has(key)) trimmed[key] = all[key];
    }
    await chrome.storage.local.set({ [STORAGE_KEYS.HISTORY]: trimmed });
    return;
  }

  await chrome.storage.local.set({ [STORAGE_KEYS.HISTORY]: all });
}


interface MigrationFlags {
  scanRentalToShouldI?: boolean;
}

async function migrateScanRentalToShouldI(): Promise<void> {
  const usage = await getTemplateUsage();
  let usageChanged = false;

  if (usage.globalTemplateId === 'scan-rental') {
    usage.globalTemplateId = 'should-i';
    usageChanged = true;
  }
  for (const host of Object.keys(usage.byHost)) {
    if (usage.byHost[host] === 'scan-rental') {
      usage.byHost[host] = 'should-i';
      usageChanged = true;
    }
  }
  if (usageChanged) {
    await chrome.storage.local.set({ [STORAGE_KEYS.TEMPLATE_USAGE]: usage });
  }

  const settings = await getSettings();
  if (settings.defaultTemplateId === 'scan-rental') {
    await saveSettings({ defaultTemplateId: 'should-i' });
  }
}

export async function runMigrations(): Promise<void> {
  const stored = await chrome.storage.local.get(STORAGE_KEYS.MIGRATIONS);
  const flags: MigrationFlags = (stored[STORAGE_KEYS.MIGRATIONS] as MigrationFlags | undefined) ?? {};

  if (!flags.scanRentalToShouldI) {
    await migrateScanRentalToShouldI();
    flags.scanRentalToShouldI = true;
    await chrome.storage.local.set({ [STORAGE_KEYS.MIGRATIONS]: flags });
  }
}
