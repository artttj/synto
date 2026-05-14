import { test, expect, seedSettings, clearStorage } from './fixtures';

test.describe('Localization', () => {
  test.beforeEach(async ({ serviceWorker }) => {
    await clearStorage(serviceWorker);
  });

  test('default language is English on fresh install', async ({ optionsPage }) => {
    const languageSelect = optionsPage.locator('#language-select');
    await expect(languageSelect).toHaveValue('en');
  });

  test('switching to Japanese updates visible strings', async ({ optionsPage, serviceWorker }) => {
    await seedSettings(serviceWorker, { language: 'ja' });

    await optionsPage.reload();
    await optionsPage.waitForLoadState('domcontentloaded');

    const generalTab = optionsPage.locator('.nav-item', { hasText: '一般' });
    await expect(generalTab).toBeVisible();
  });

  test('switching back to English restores English strings', async ({ optionsPage, serviceWorker }) => {
    await seedSettings(serviceWorker, { language: 'ja' });
    await optionsPage.reload();
    await optionsPage.waitForLoadState('domcontentloaded');

    await optionsPage.locator('#language-select').selectOption('en');
    await optionsPage.locator('#btn-save-settings').click();

    await optionsPage.reload();
    await optionsPage.waitForLoadState('domcontentloaded');

    const generalTab = optionsPage.locator('.nav-item', { hasText: 'General' });
    await expect(generalTab).toBeVisible();
  });

  test('popup respects language setting', async ({ popupPage, serviceWorker }) => {
    await seedSettings(serviceWorker, { language: 'ja' });

    await popupPage.reload();
    await popupPage.waitForLoadState('domcontentloaded');

    const tab = popupPage.locator('#intent-tabs .intent-tab', { hasText: '理解' });
    await expect(tab).toBeVisible();
  });

  test('missing keys fall back to English', async ({ popupPage }) => {
    const previewLabel = popupPage.locator('[data-i18n="popup_preview"]');
    await expect(previewLabel).toHaveText('Preview');
  });
});