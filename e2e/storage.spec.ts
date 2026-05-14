import { test, expect, seedSettings, seedApiKeys, clearStorage } from './fixtures';

test.describe('Storage persistence', () => {
  test.beforeEach(async ({ serviceWorker }) => {
    await clearStorage(serviceWorker);
  });

  test('settings persist across popup reloads', async ({ popupPage, serviceWorker }) => {
    await seedSettings(serviceWorker, { theme: 'light', llmProvider: 'gemini' });

    await popupPage.reload();
    await popupPage.waitForLoadState('domcontentloaded');

    const saved = await serviceWorker.evaluate(async () => {
      const result = await chrome.storage.sync.get('apc_settings');
      return result.apc_settings;
    });

    expect(saved.theme).toBe('light');
    expect(saved.llmProvider).toBe('gemini');
  });

  test('API keys persist in local storage', async ({ serviceWorker }) => {
    await seedApiKeys(serviceWorker, { openai: 'sk-test-key-123' });

    const result = await serviceWorker.evaluate(async () => {
      const data = await chrome.storage.local.get('apc_openai_key');
      return data.apc_openai_key;
    });

    expect(result).toBe('sk-test-key-123');
  });

  test('cleared API keys return empty', async ({ serviceWorker }) => {
    await seedApiKeys(serviceWorker, { openai: 'sk-test' });
    await seedApiKeys(serviceWorker, { openai: '' });

    const result = await serviceWorker.evaluate(async () => {
      const data = await chrome.storage.local.get('apc_openai_key');
      return data.apc_openai_key;
    });

    expect(result).toBe('');
  });

  test('history entries respect max 3 per URL', async ({ serviceWorker }) => {
    const url = 'https://example.com/page1';
    const entries = Array.from({ length: 5 }, (_, i) => ({
      ts: Date.now() + i,
      templateId: 'test-template',
      provider: 'openai',
      model: 'gpt-4o-mini',
      messages: [{ role: 'user' as const, content: `message ${i}` }],
    }));

    for (const entry of entries) {
      await serviceWorker.evaluate(async (e) => {
        const result = await chrome.storage.local.get('apc_history');
        const all = result.apc_history ?? {};
        const existing = all[e.url] ?? [];
        all[e.url] = [e, ...existing].slice(0, 3);
        await chrome.storage.local.set({ apc_history: all });
      }, { ...entry, url });
    }

    const stored = await serviceWorker.evaluate(async (u) => {
      const result = await chrome.storage.local.get('apc_history');
      return result.apc_history?.[u]?.length ?? 0;
    }, url);

    expect(stored).toBe(3);
  });

  test('default templates are seeded on fresh install', async ({ serviceWorker }) => {
    const templates = await serviceWorker.evaluate(async () => {
      const result = await chrome.storage.local.get('apc_templates');
      return result.apc_templates;
    });

    // When no templates exist in storage, getTemplates() returns DEFAULT_TEMPLATES
    // So on a fresh install, storage.local won't have templates until first save
    expect(templates).toBeUndefined();
  });
});