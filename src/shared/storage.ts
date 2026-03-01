import { STORAGE_KEYS, DEFAULT_TEMPLATES } from './constants';

export interface Template {
  id: string;
  name: string;
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
export async function getTemplates(): Promise<Template[]> {
  const result = await chrome.storage.sync.get(STORAGE_KEYS.TEMPLATES);
  const saved = result[STORAGE_KEYS.TEMPLATES] as Template[] | undefined;

  if (!saved) {
    return DEFAULT_TEMPLATES;
  }

  const savedIds = new Set(saved.map((t) => t.id));
  const missing = DEFAULT_TEMPLATES.filter((t) => !savedIds.has(t.id));
  return missing.length > 0 ? [...saved, ...missing] : saved;
}


export async function saveTemplates(templates: Template[]): Promise<void> {
  await chrome.storage.sync.set({ [STORAGE_KEYS.TEMPLATES]: templates });
}


export async function getSettings(): Promise<Settings> {
  const result = await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS);
  return {
    defaultTemplateId: 'default-structured-brief',
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
