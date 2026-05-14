/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */

import { STRIP_SELECTORS, MAIN_SELECTORS } from './selectors';
import { preprocessDiffTables } from './diff';
import { toMarkdown } from './turndown';
import type { ExtractedContent } from '../popup/state';


export function extractContent(mode: string): ExtractedContent {
  if (mode === 'html') {
    return {
      success: true,
      mode: 'html',
      content: document.documentElement.outerHTML,
      title: document.title,
      url: location.href,
    };
  }

  const selectionText = captureSelection();
  if (selectionText && selectionText.trim().length >= 20) {
    return {
      success: true,
      mode: 'markdown',
      source: 'selection',
      content: selectionText,
      selection: selectionText,
      title: document.title,
      url: location.href,
      siteName: '',
    };
  }

  return extractBody();
}


export function captureSelection(): string {
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed || sel.rangeCount === 0) return '';

  const container = document.createElement('div');
  for (let i = 0; i < sel.rangeCount; i++) {
    container.appendChild(sel.getRangeAt(i).cloneContents());
  }

  const html = container.innerHTML.trim();
  if (!html) return '';

  const md = toMarkdown(html);
  return md.trim().length >= 10 ? md : '';
}


function deepClone(root: HTMLElement): HTMLElement {
  if (!root.shadowRoot) {
    return root.cloneNode(true) as HTMLElement;
  }

  const clone = root.cloneNode(false) as HTMLElement;
  const shadowClone = deepClone(root.shadowRoot as unknown as HTMLElement);
  clone.appendChild(shadowClone);

  for (const child of root.childNodes) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      clone.appendChild(deepClone(child as HTMLElement));
    } else {
      clone.appendChild(child.cloneNode(true));
    }
  }

  return clone;
}


function extractBody(): ExtractedContent {
  const mainEl = findMainContent();
  const root = mainEl ?? document.body;
  const clone = deepClone(root);

  preprocessDiffTables(clone);
  clone.querySelectorAll(STRIP_SELECTORS).forEach((el: Element) => el.remove());
  let markdown = toMarkdown(clone.innerHTML);

  if ((!markdown || markdown.trim().length < 20) && mainEl && mainEl !== document.body) {
    const bodyClone = deepClone(document.body);
    preprocessDiffTables(bodyClone);
    bodyClone.querySelectorAll(STRIP_SELECTORS).forEach((el: Element) => el.remove());
    markdown = toMarkdown(bodyClone.innerHTML);
  }

  if (!markdown || markdown.trim().length < 20) {
    const hint = isDiffPage()
      ? 'Diff content not yet loaded. Scroll to the bottom of the PR/MR to load all files, then try again.'
      : 'No meaningful content detected on this page. Try selecting text manually before clipping.';
    return { success: false, error: hint, title: document.title, url: location.href };
  }

  return {
    success: true,
    mode: 'markdown',
    source: mainEl ? 'article' : 'body',
    content: markdown,
    selection: '',
    title: document.title,
    url: location.href,
    siteName: '',
  };
}


function findMainContent(): HTMLElement | null {
  for (const sel of MAIN_SELECTORS) {
    const el = document.querySelector(sel);
    if (el && el.textContent.trim().length > 150) {
      return el as HTMLElement;
    }
  }
  return null;
}


function isDiffPage(): boolean {
  return /github\.com\/.+\/(pull|commit)|bitbucket\.org\/.+\/pull-requests|gitlab\.com\/.+-\/merge_requests/i.test(
    location.href
  );
}