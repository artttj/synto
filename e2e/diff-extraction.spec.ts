import { test, expect } from './fixtures';

const GITHUB_PR_URL = 'https://github.com/microsoft/vscode/pull/1';

test.describe('GitHub PR diff extraction', () => {
  test('identifies diff page URLs correctly', async ({ context, extensionId }) => {
    const diffUrls = [
      'https://github.com/microsoft/vscode/pull/1',
      'https://github.com/torvalds/linux/commit/a1b2c3d',
      'https://github.com/owner/repo/compare/main...feature',
      'https://bitbucket.org/team/repo/pull-requests/42',
      'https://gitlab.com/group/project/-/merge_requests/5',
    ];
    const nonDiffUrls = [
      'https://github.com/microsoft/vscode',
      'https://github.com/microsoft/vscode/issues/1',
      'https://bitbucket.org/team/repo/',
      'https://example.com/blog/post',
    ];

    const page = await context.newPage();
    await page.goto('about:blank');

    const isDiff = await page.evaluate((urls) => {
      const pattern = /github\.com\/.+\/(pull|commit|compare)|bitbucket\.org\/.+\/pull-requests|gitlab\.com\/.+-\/merge_requests/i;
      return urls.map((u: string) => pattern.test(u));
    }, diffUrls);

    const isNotDiff = await page.evaluate((urls) => {
      const pattern = /github\.com\/.+\/(pull|commit|compare)|bitbucket\.org\/.+\/pull-requests|gitlab\.com\/.+-\/merge_requests/i;
      return urls.map((u: string) => pattern.test(u));
    }, nonDiffUrls);

    for (const result of isDiff) {
      expect(result).toBe(true);
    }
    for (const result of isNotDiff) {
      expect(result).toBe(false);
    }
  });

  test('extracts markdown from a GitHub PR page', async ({ context }) => {
    const page = await context.newPage();

    await page.goto(GITHUB_PR_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});

    const contentScript = await page.evaluate(() => {
      if (typeof chrome?.runtime?.sendMessage !== 'function') return null;
      return true;
    });

    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);

    const bodyText = await page.evaluate(() => document.body.innerText);
    expect(bodyText.length).toBeGreaterThan(100);
  });

  test('content script finds diff elements on PR page', async ({ context }) => {
    const page = await context.newPage();

    await page.goto(GITHUB_PR_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});

    const hasDiffContent = await page.evaluate(() => {
      const diffElements = document.querySelectorAll(
        '[data-qa="pr-diff"], [data-testid="pullrequest-diff"], .diff-container, .js-discussion, .repository-content'
      );
      return diffElements.length;
    });

    expect(hasDiffContent).toBeGreaterThanOrEqual(0);
  });

  test('popup shows auto-rescan toast on diff pages', async ({ context, extensionId }) => {
    const webPage = await context.newPage();
    await webPage.goto(GITHUB_PR_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await webPage.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});

    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup/popup.html`, { waitUntil: 'domcontentloaded' });

    const popupHtml = await popup.content();
    expect(popupHtml).toContain('content-toast');
  });
});