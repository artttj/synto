import { test, expect, clearStorage } from './fixtures';

test.describe('Popup', () => {
  test.beforeEach(async ({ serviceWorker }) => {
    await clearStorage(serviceWorker);
  });

  test('renders logo and header on load', async ({ popupPage }) => {
    await expect(popupPage.locator('.logo-text')).toHaveText('Synto');
    await expect(popupPage.locator('#btn-options')).toBeVisible();
    await expect(popupPage.locator('#btn-help')).toBeVisible();
  });

  test('shows intent tabs for template categories', async ({ popupPage }) => {
    const tabs = popupPage.locator('#intent-tabs .intent-tab');
    await expect(tabs).toHaveCount(4);
    await expect(tabs.nth(0)).toContainText('Understand');
    await expect(tabs.nth(1)).toContainText('Decide');
    await expect(tabs.nth(2)).toContainText('Act');
    await expect(tabs.nth(3)).toContainText('Compose');
  });

  test('shows template cards in Understand category', async ({ popupPage }) => {
    const cards = popupPage.locator('#template-cards .template-card');
    await expect(cards.first()).toBeVisible();
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('switching intent tabs shows different templates', async ({ popupPage }) => {
    const decideTab = popupPage.locator('#intent-tabs .intent-tab', { hasText: 'Decide' });
    await decideTab.click();

    const cards = popupPage.locator('#template-cards .template-card');
    await expect(cards.first()).toBeVisible();
  });

  test('pin toggle adds Pinned tab', async ({ popupPage }) => {
    const pinBtn = popupPage.locator('#template-cards .card-pin-btn').first();
    await pinBtn.click();

    const pinnedTab = popupPage.locator('#intent-tabs .intent-tab', { hasText: 'Pinned' });
    await expect(pinnedTab).toBeVisible();
  });

  test('preview panel has Content and Prompt tab elements', async ({ popupPage }) => {
    const contentTab = popupPage.locator('.preview-tab[data-tab="content"]');
    const promptTab = popupPage.locator('.preview-tab[data-tab="prompt"]');
    await expect(contentTab).toBeAttached();
    await expect(promptTab).toBeAttached();
  });

  test('Copy Markdown button exists and is disabled initially', async ({ popupPage }) => {
    const copyBtn = popupPage.locator('#btn-copy-md');
    await expect(copyBtn).toBeAttached();
    await expect(copyBtn).toBeDisabled();
  });

  test('Ask AI button is present and disabled without content', async ({ popupPage }) => {
    const askBtn = popupPage.locator('#btn-process');
    await expect(askBtn).toBeVisible();
    await expect(askBtn).toBeDisabled();
  });

  test('error message area exists', async ({ popupPage }) => {
    const errorMsg = popupPage.locator('#error-msg');
    await expect(errorMsg).toBeAttached();
  });

  test('chat panel is hidden initially', async ({ popupPage }) => {
    const chatPanel = popupPage.locator('#chat-panel');
    await expect(chatPanel).toHaveClass(/hidden/);
  });
});