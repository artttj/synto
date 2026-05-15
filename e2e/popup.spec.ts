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

  test('shows concise intent tabs without horizontal scrolling', async ({ popupPage }) => {
    await popupPage.setViewportSize({ width: 280, height: 720 });

    const labels = await popupPage.locator('#intent-tabs .intent-tab').allTextContents();
    expect(labels).toEqual(['Understand', 'Decide', 'Compose', 'Brief', 'Review', 'SEO']);

    const hasOverflow = await popupPage.locator('#intent-tabs').evaluate((el) => el.scrollWidth > el.clientWidth);
    expect(hasOverflow).toBe(false);

    const clippedLabels = await popupPage.locator('#intent-tabs .intent-tab').evaluateAll((tabs) =>
      tabs
        .filter((tab) => tab.scrollWidth > tab.clientWidth)
        .map((tab) => tab.textContent?.trim() ?? '')
    );
    expect(clippedLabels).toEqual([]);
  });

  test('labels the SEO audit template clearly', async ({ popupPage }) => {
    await popupPage.locator('#intent-tabs .intent-tab', { hasText: 'SEO' }).click();
    const seoAuditCard = popupPage.locator('#template-cards .template-card[data-id="audit-seo"]');
    await expect(seoAuditCard).toBeVisible();
    await expect(seoAuditCard).toHaveText('SEO Audit');
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
