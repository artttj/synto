/**
 * Selection and body extraction. Dispatcher and helpers.
 */

import { STRIP_SELECTORS, MAIN_SELECTORS } from './selectors.js';
import { preprocessDiffTables } from './diff.js';
import { toMarkdown } from './turndown.js';


export function extractContent(mode) {
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
  if (selectionText) {
    return {
      success: true,
      mode: 'markdown',
      source: 'selection',
      content: selectionText,
      selection: selectionText,
      title: document.title,
      url: location.href,
      excerpt: '',
      byline: '',
      siteName: '',
    };
  }

  return extractBody();
}


export function captureSelection() {
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


function extractBody() {
  const mainEl = findMainContent();
  const root = mainEl ?? document.body;
  const clone = root.cloneNode(true);

  preprocessDiffTables(clone);
  clone.querySelectorAll(STRIP_SELECTORS).forEach((el) => el.remove());
  let markdown = toMarkdown(clone.innerHTML);

  if ((!markdown || markdown.trim().length < 20) && mainEl) {
    const bodyClone = document.body.cloneNode(true);
    preprocessDiffTables(bodyClone);
    bodyClone.querySelectorAll(STRIP_SELECTORS).forEach((el) => el.remove());
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
    excerpt: '',
    byline: '',
    siteName: '',
  };
}


function findMainContent() {
  for (const sel of MAIN_SELECTORS) {
    const el = document.querySelector(sel);
    if (el && el.textContent.trim().length > 150) {
      return el;
    }
  }
  return null;
}


function isDiffPage() {
  return /github\.com\/.+\/(pull|commit)|bitbucket\.org\/.+\/pull-requests|gitlab\.com\/.+-\/merge_requests/i.test(
    location.href
  );
}
