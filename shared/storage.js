import { STORAGE_KEYS, DEFAULT_TEMPLATES } from "./constants.js";

// API keys use storage.local — stay on this device only, never synced to Google.
export async function getOpenAIKey() {
  const result = await chrome.storage.local.get(STORAGE_KEYS.OPENAI_KEY);
  return result[STORAGE_KEYS.OPENAI_KEY] ?? "";
}

export async function saveOpenAIKey(key) {
  await chrome.storage.local.set({ [STORAGE_KEYS.OPENAI_KEY]: key });
}

export async function getGrokKey() {
  const result = await chrome.storage.local.get(STORAGE_KEYS.GROK_KEY);
  return result[STORAGE_KEYS.GROK_KEY] ?? "";
}

export async function saveGrokKey(key) {
  await chrome.storage.local.set({ [STORAGE_KEYS.GROK_KEY]: key });
}

export async function getGeminiKey() {
  const result = await chrome.storage.local.get(STORAGE_KEYS.GEMINI_KEY);
  return result[STORAGE_KEYS.GEMINI_KEY] ?? "";
}

export async function saveGeminiKey(key) {
  await chrome.storage.local.set({ [STORAGE_KEYS.GEMINI_KEY]: key });
}

/**
 * Returns saved templates, merging in any new built-in templates that are
 * not yet present in storage (identified by id). This ensures new default
 * templates added in future versions appear without requiring a reinstall.
 * @returns {Promise<Array>}
 */
export async function getTemplates() {
  const result = await chrome.storage.sync.get(STORAGE_KEYS.TEMPLATES);
  const saved = result[STORAGE_KEYS.TEMPLATES];
  if (!saved) return DEFAULT_TEMPLATES;

  const savedIds = new Set(saved.map((t) => t.id));
  const missing = DEFAULT_TEMPLATES.filter((t) => !savedIds.has(t.id));
  return missing.length > 0 ? [...saved, ...missing] : saved;
}

/**
 * Persists templates array.
 * @param {Array} templates
 * @returns {Promise<void>}
 */
export async function saveTemplates(templates) {
  await chrome.storage.sync.set({ [STORAGE_KEYS.TEMPLATES]: templates });
}

/**
 * Returns saved settings with defaults.
 * @returns {Promise<object>}
 */
export async function getSettings() {
  const result = await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS);
  return {
    defaultTemplateId: "default-structured-brief",
    theme: "dark",
    llmProvider: "openai",
    ...result[STORAGE_KEYS.SETTINGS],
  };
}

/**
 * Merges and persists settings.
 * @param {object} partial
 * @returns {Promise<void>}
 */
export async function saveSettings(partial) {
  const current = await getSettings();
  await chrome.storage.sync.set({
    [STORAGE_KEYS.SETTINGS]: { ...current, ...partial },
  });
}
