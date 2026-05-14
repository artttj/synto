import { test, expect, seedSettings, clearStorage } from './fixtures';

test.describe('Options page', () => {
  test.beforeEach(async ({ serviceWorker }) => {
    await clearStorage(serviceWorker);
  });

  test('renders all navigation tabs', async ({ optionsPage }) => {
    const tabs = optionsPage.locator('.nav-item');
    await expect(tabs).toHaveCount(5);
    await expect(tabs.nth(0)).toContainText('General');
    await expect(tabs.nth(1)).toContainText('AI Connections');
    await expect(tabs.nth(2)).toContainText('Prompt Library');
    await expect(tabs.nth(3)).toContainText('Help');
    await expect(tabs.nth(4)).toContainText('About');
  });

  test('General tab is active by default', async ({ optionsPage }) => {
    const activeTab = optionsPage.locator('.nav-item.active');
    await expect(activeTab).toContainText('General');
  });

  test('General tab has settings form fields', async ({ optionsPage }) => {
    await expect(optionsPage.locator('#default-template')).toBeVisible();
    await expect(optionsPage.locator('#provider-segmented')).toBeVisible();
    await expect(optionsPage.locator('#theme-segmented')).toBeVisible();
    await expect(optionsPage.locator('#language-select')).toBeVisible();
    await expect(optionsPage.locator('#system-prompt')).toBeVisible();
  });

  test('Save Settings button persists settings', async ({ optionsPage, serviceWorker }) => {
    await optionsPage.locator('#theme-segmented .seg-btn[data-value="light"]').click();
    await optionsPage.locator('#btn-save-settings').click();

    const saved = await serviceWorker.evaluate(async () => {
      const result = await chrome.storage.sync.get('apc_settings');
      return result.apc_settings;
    });
    expect(saved.theme).toBe('light');
  });

  test('switching to AI Connections tab shows provider cards', async ({ optionsPage }) => {
    await optionsPage.locator('.nav-item[data-tab="ai-connections"]').click();

    await expect(optionsPage.locator('.provider-name', { hasText: 'OpenAI' })).toBeVisible();
    await expect(optionsPage.locator('.provider-name', { hasText: 'Gemini' })).toBeVisible();
    await expect(optionsPage.locator('.provider-name', { hasText: 'Grok' })).toBeVisible();
  });

  test('switching to Prompt Library tab shows search and templates', async ({ optionsPage }) => {
    await optionsPage.locator('.nav-item[data-tab="prompt-library"]').click();

    await expect(optionsPage.locator('#template-search')).toBeVisible();
    await expect(optionsPage.locator('#template-list .template-item').first()).toBeVisible();
  });

  test('search filters templates', async ({ optionsPage }) => {
    await optionsPage.locator('.nav-item[data-tab="prompt-library"]').click();
    await optionsPage.locator('#template-search').fill('ticket');

    const visibleTemplates = optionsPage.locator('#template-list .template-item:not(.hidden)');
    const count = await visibleTemplates.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('About tab shows version and author', async ({ optionsPage }) => {
    await optionsPage.locator('.nav-item[data-tab="about"]').click();

    await expect(optionsPage.locator('#about-version')).toBeVisible();
    await expect(optionsPage.locator('#about-author-link')).toBeVisible();
  });

  test('language dropdown lists all 9 languages', async ({ optionsPage }) => {
    const options = optionsPage.locator('#language-select option');
    const count = await options.count();
    expect(count).toBe(9);
  });

  test('theme toggle changes data-theme attribute', async ({ optionsPage }) => {
    await optionsPage.locator('#theme-segmented .seg-btn[data-value="light"]').click();
    await optionsPage.locator('#btn-save-settings').click();

    await expect(optionsPage.locator('html')).toHaveAttribute('data-theme', 'light');

    await optionsPage.locator('#theme-segmented .seg-btn[data-value="dark"]').click();
    await optionsPage.locator('#btn-save-settings').click();

    await expect(optionsPage.locator('html')).toHaveAttribute('data-theme', 'dark');
  });
});