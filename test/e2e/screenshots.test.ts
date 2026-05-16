import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { launchBrowser, closeBrowser, getPopupPage, getOptionsPage, takeScreenshot, waitForElement } from './setup';
import type { Browser } from 'puppeteer';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function setViewport(page: import('puppeteer').Page, width: number, height: number, scale: number = 2): Promise<void> {
  await page.setViewport({ width, height, deviceScaleFactor: scale });
}

async function setTheme(page: import('puppeteer').Page, theme: 'dark' | 'light' | 'system'): Promise<void> {
  await page.evaluate((t) => {
    const settings = { theme: t };
    chrome.storage.sync.set({ apc_settings: settings });
  }, theme);
}

async function setProMode(page: import('puppeteer').Page, proMode: boolean): Promise<void> {
  await page.evaluate((pm) => {
    return new Promise<void>((resolve) => {
      chrome.storage.sync.get('apc_settings', (result) => {
        const current = (result.apc_settings ?? {}) as Record<string, unknown>;
        chrome.storage.sync.set({ apc_settings: { ...current, proMode: pm } }, () => resolve());
      });
    });
  }, proMode);
}

async function injectSampleContent(page: import('puppeteer').Page): Promise<void> {
  await page.evaluate(() => {
    const settings = {
      theme: 'dark',
      llmProvider: 'openai',
      openaiModel: 'gpt-4o-mini',
    };
    chrome.storage.sync.set({ apc_settings: settings });
    chrome.storage.local.set({
      apc_openai_key: 'screenshot-test-key-not-real',
    });
  });
  await delay(300);
}

describe('Screenshot Generation', () => {
  let browser: Browser;
  let extensionId: string;

  beforeAll(async () => {
    const result = await launchBrowser();
    browser = result.browser;
    extensionId = result.extensionId;
  }, 30000);

  afterAll(async () => {
    await closeBrowser();
  });

  it('captures popup dark theme — preview open', async () => {
    const popup = await getPopupPage(browser, extensionId);
    await setViewport(popup, 400, 700);
    await setTheme(popup, 'dark');
    await injectSampleContent(popup);
    await popup.reload({ waitUntil: 'domcontentloaded' });
    await waitForElement(popup, '#preview-panel');
    await delay(600);

    const screenshotPath = await takeScreenshot(popup, 'popup_dark');
    expect(screenshotPath).toBeTruthy();
  });

  it('captures popup light theme — preview open', async () => {
    const popup = await getPopupPage(browser, extensionId);
    await setViewport(popup, 400, 700);
    await setTheme(popup, 'light');
    await injectSampleContent(popup);
    await popup.reload({ waitUntil: 'domcontentloaded' });
    await waitForElement(popup, '#preview-panel');
    await delay(600);

    const screenshotPath = await takeScreenshot(popup, 'popup_light');
    expect(screenshotPath).toBeTruthy();
  });

  it('captures popup narrow width (360px)', async () => {
    const popup = await getPopupPage(browser, extensionId);
    await setViewport(popup, 360, 700);
    await setTheme(popup, 'dark');
    await injectSampleContent(popup);
    await popup.reload({ waitUntil: 'domcontentloaded' });
    await waitForElement(popup, '#preview-panel');
    await delay(600);

    const screenshotPath = await takeScreenshot(popup, 'popup_narrow');
    expect(screenshotPath).toBeTruthy();
  });

  it('captures options page — general tab', async () => {
    const options = await getOptionsPage(browser, extensionId);
    await setViewport(options, 900, 1000);
    await waitForElement(options, '.settings-layout');
    await delay(500);

    const screenshotPath = await takeScreenshot(options, 'options_general');
    expect(screenshotPath).toBeTruthy();
  });

  it('captures options page — AI connections tab', async () => {
    const options = await getOptionsPage(browser, extensionId);
    await setViewport(options, 900, 1000);
    await waitForElement(options, '.settings-layout');

    await options.click('[data-tab="ai-connections"]');
    await delay(400);

    const screenshotPath = await takeScreenshot(options, 'options_ai');
    expect(screenshotPath).toBeTruthy();
  });

  it('captures popup light mode — dark theme', async () => {
    const popup = await getPopupPage(browser, extensionId);
    await setViewport(popup, 400, 700);
    await setTheme(popup, 'dark');
    await injectSampleContent(popup);
    await setProMode(popup, false);
    await popup.reload({ waitUntil: 'domcontentloaded' });
    await waitForElement(popup, '#btn-pro-mode');
    await delay(600);
    const screenshotPath = await takeScreenshot(popup, 'popup_light_mode_dark_theme');
    expect(screenshotPath).toBeTruthy();
  });

  it('captures popup light mode — light theme', async () => {
    const popup = await getPopupPage(browser, extensionId);
    await setViewport(popup, 400, 700);
    await setTheme(popup, 'light');
    await injectSampleContent(popup);
    await setProMode(popup, false);
    await popup.reload({ waitUntil: 'domcontentloaded' });
    await waitForElement(popup, '#btn-pro-mode');
    await delay(600);
    const screenshotPath = await takeScreenshot(popup, 'popup_light_mode_light_theme');
    expect(screenshotPath).toBeTruthy();
  });

  it('captures popup pro mode — dark theme', async () => {
    const popup = await getPopupPage(browser, extensionId);
    await setViewport(popup, 400, 700);
    await setTheme(popup, 'dark');
    await injectSampleContent(popup);
    await setProMode(popup, true);
    await popup.reload({ waitUntil: 'domcontentloaded' });
    await waitForElement(popup, '#preview-panel');
    await delay(600);
    const screenshotPath = await takeScreenshot(popup, 'popup_pro_mode_dark_theme');
    expect(screenshotPath).toBeTruthy();
  });

  it('captures popup pro mode — light theme', async () => {
    const popup = await getPopupPage(browser, extensionId);
    await setViewport(popup, 400, 700);
    await setTheme(popup, 'light');
    await injectSampleContent(popup);
    await setProMode(popup, true);
    await popup.reload({ waitUntil: 'domcontentloaded' });
    await waitForElement(popup, '#preview-panel');
    await delay(600);
    const screenshotPath = await takeScreenshot(popup, 'popup_pro_mode_light_theme');
    expect(screenshotPath).toBeTruthy();
  });
});