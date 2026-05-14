import { test as base, chromium, type BrowserContext, type Page, type Worker } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

process.env.PW_CHROMIUM_ATTACH_TO_OTHER = '1';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const extensionPath = path.resolve(__dirname, '../dist');

type ExtensionFixtures = {
  context: BrowserContext;
  extensionId: string;
  serviceWorker: Worker;
  popupPage: Page;
  optionsPage: Page;
};

export const test = base.extend<ExtensionFixtures>({
  context: async ({}, use) => {
    const context = await chromium.launchPersistentContext('', {
      headless: false,
      channel: 'chromium',
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
    });
    await use(context);
    await context.close();
  },

  extensionId: async ({ context }, use) => {
    let [sw] = context.serviceWorkers();
    if (!sw) sw = await context.waitForEvent('serviceworker');
    const extensionId = sw.url().split('/')[2];
    await use(extensionId);
  },

  serviceWorker: async ({ context }, use) => {
    let [sw] = context.serviceWorkers();
    if (!sw) sw = await context.waitForEvent('serviceworker');
    await use(sw);
  },

  popupPage: async ({ context, extensionId }, use) => {
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/popup/popup.html`);
    await use(page);
  },

  optionsPage: async ({ context, extensionId }, use) => {
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/options/options.html`);
    await use(page);
  },
});

export const expect = test.expect;

/**
 * Seed chrome.storage.sync with settings via the service worker.
 * Merges with defaults — only specify the fields you want to override.
 */
export async function seedSettings(sw: Worker, overrides: Record<string, unknown> = {}): Promise<void> {
  await sw.evaluate(async (patch) => {
    const current = await chrome.storage.sync.get('apc_settings');
    const existing = current.apc_settings ?? {};
    await chrome.storage.sync.set({ apc_settings: { ...existing, ...patch } });
  }, overrides);
}

/**
 * Seed chrome.storage.local with API keys via the service worker.
 */
export async function seedApiKeys(sw: Worker, keys: { openai?: string; gemini?: string; grok?: string } = {}): Promise<void> {
  const data: Record<string, string> = {};
  if (keys.openai !== undefined) data.apc_openai_key = keys.openai;
  if (keys.gemini !== undefined) data.apc_gemini_key = keys.gemini;
  if (keys.grok !== undefined) data.apc_grok_key = keys.grok;
  await sw.evaluate(async (d) => {
    await chrome.storage.local.set(d);
  }, data);
}

/**
 * Clear all extension storage (sync + local) via the service worker.
 */
export async function clearStorage(sw: Worker): Promise<void> {
  await sw.evaluate(async () => {
    await chrome.storage.sync.clear();
    await chrome.storage.local.clear();
  });
}

/**
 * Navigate a web page so the content script can inject.
 * Returns the page object for further interaction.
 */
export async function openWebPage(context: BrowserContext, url: string): Promise<Page> {
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  return page;
}