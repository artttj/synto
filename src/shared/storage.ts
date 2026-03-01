/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */
import { STORAGE_KEYS, DEFAULT_TEMPLATES, DEPRECATED_TEMPLATE_IDS } from './constants';

export interface Template {
  id: string;
  name: string;
  label?: string;       // short display label for compact controls
  description?: string;
  category?: string;
  isDefault?: boolean;
  prompt: string;
}

export interface Settings {
  defaultTemplateId: string;
  theme: string;
  llmProvider: string;
}


// API keys use storage.local — stay on this device only, never synced to Google.

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


// Merges new built-in templates into saved ones so new defaults appear without reinstall.
// Also back-fills category/description for built-in IDs saved before those fields existed.
export async function getTemplates(): Promise<Template[]> {
  const result = await chrome.storage.sync.get(STORAGE_KEYS.TEMPLATES);
  const saved = result[STORAGE_KEYS.TEMPLATES] as Template[] | undefined;

  if (!saved) {
    return DEFAULT_TEMPLATES;
  }

  const defaultsById = new Map(DEFAULT_TEMPLATES.map((t) => [t.id, t]));

  // Drop deprecated built-in IDs; keep all user-created templates.
  const active = saved.filter((t) => !DEPRECATED_TEMPLATE_IDS.has(t.id));

  // Always use canonical metadata for remaining built-in templates,
  // so renames/recategorisations take effect without a reinstall.
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
  await chrome.storage.sync.set({ [STORAGE_KEYS.TEMPLATES]: templates });
}


export async function getSettings(): Promise<Settings> {
  const result = await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS);
  return {
    defaultTemplateId: 'understand-structured-brief',
    theme: 'dark',
    llmProvider: 'openai',
    ...(result[STORAGE_KEYS.SETTINGS] as Partial<Settings> | undefined),
  };
}


export async function saveSettings(partial: Partial<Settings>): Promise<void> {
  const current = await getSettings();
  await chrome.storage.sync.set({
    [STORAGE_KEYS.SETTINGS]: { ...current, ...partial },
  });
}
