/**
 * Synto E2E test helpers — browser launch, extension loading, screenshot capture.
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import * as path from 'path';
import * as fs from 'fs';

let browser: Browser | null = null;

const DIST_PATH = path.resolve(process.cwd(), 'dist');

async function findExtensionPath(): Promise<string> {
  if (!fs.existsSync(DIST_PATH)) {
    throw new Error('dist/ folder not found. Run "npm run build" first.');
  }
  return DIST_PATH;
}

async function getExtensionId(browser: Browser): Promise<string> {
  const targets = await browser.targets();
  for (const target of targets) {
    const url = target.url();
    if (url.startsWith('chrome-extension://')) {
      const match = url.match(/chrome-extension:\/\/([a-p]{32})\//);
      if (match) return match[1];
    }
  }

  const contexts = browser.browserContexts();
  for (const ctx of contexts) {
    const targets2 = ctx.targets();
    for (const target of targets2) {
      const url = target.url();
      if (url.startsWith('chrome-extension://')) {
        const match = url.match(/chrome-extension:\/\/([a-p]{32})\//);
        if (match) return match[1];
      }
    }
  }

  try {
    const pages = await browser.pages();
    for (const page of pages) {
      const url = page.url();
      if (url.startsWith('chrome-extension://')) {
        const match = url.match(/chrome-extension:\/\/([a-p]{32})\//);
        if (match) return match[1];
      }
    }
  } catch { /* empty */ }

  return '';
}

export async function launchBrowser(): Promise<{ browser: Browser; extensionId: string }> {
  const extensionPath = await findExtensionPath();

  browser = await puppeteer.launch({
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  });

  await new Promise(resolve => setTimeout(resolve, 2000));

  const extensionId = await getExtensionId(browser);
  if (!extensionId) {
    throw new Error('Could not find extension ID. Make sure the extension is loaded correctly.');
  }

  console.log(`Extension ID: ${extensionId}`);
  return { browser, extensionId };
}

export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

export async function getPopupPage(browser: Browser, extensionId: string): Promise<Page> {
  const popupUrl = `chrome-extension://${extensionId}/popup/popup.html`;
  const page = await browser.newPage();
  await page.goto(popupUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
  return page;
}

export async function getOptionsPage(browser: Browser, extensionId: string): Promise<Page> {
  const optionsUrl = `chrome-extension://${extensionId}/options/options.html`;
  const page = await browser.newPage();
  await page.goto(optionsUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
  return page;
}

export async function takeScreenshot(page: Page, name: string): Promise<string> {
  const screenshotDir = path.resolve(process.cwd(), 'docs/screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
  const screenshotPath = path.join(screenshotDir, `${name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true, omitBackground: false });
  return screenshotPath;
}

export async function waitForElement(page: Page, selector: string, timeout = 5000): Promise<void> {
  await page.waitForSelector(selector, { timeout });
}

export { Browser, Page };