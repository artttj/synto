/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */

import { STRIP_SELECTORS, MAIN_SELECTORS } from './selectors';
import { preprocessDiffTables } from './diff';
import { toMarkdown } from './turndown';
import type { ExtractedContent } from '../popup/state';
import type { PageSignals } from '../shared/library';

export function readPageSignals(): PageSignals {
  const schemaTypes: string[] = [];

  const itemtypeNodes = document.querySelectorAll<HTMLElement>('[itemscope][itemtype]');
  for (const node of itemtypeNodes) {
    const t = node.getAttribute('itemtype');
    if (!t) continue;
    const tail = t.split('/').pop();
    if (tail) schemaTypes.push(tail);
  }

  const jsonldNodes = document.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]');
  for (const node of jsonldNodes) {
    try {
      const parsed = JSON.parse(node.textContent ?? '');
      const collect = (obj: unknown): void => {
        if (!obj || typeof obj !== 'object') return;
        const o = obj as Record<string, unknown>;
        const t = o['@type'];
        if (typeof t === 'string') schemaTypes.push(t);
        else if (Array.isArray(t)) for (const s of t) if (typeof s === 'string') schemaTypes.push(s);
        const graph = o['@graph'];
        if (Array.isArray(graph)) for (const g of graph) collect(g);
      };
      collect(parsed);
    } catch { /* ignore malformed */ }
  }

  const ogType = document.querySelector<HTMLMetaElement>('meta[property="og:type"]')?.content ?? null;

  return { schemaTypes: Array.from(new Set(schemaTypes)), ogType };
}


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


function deepClone(root: Node): HTMLElement {
  if (!(root instanceof Element) || !root.shadowRoot) {
    return root.cloneNode(true) as HTMLElement;
  }

  const clone = root.cloneNode(false) as HTMLElement;
  const shadowClone = deepClone(root.shadowRoot);
  clone.appendChild(shadowClone);

  for (const child of root.childNodes) {
    if (child instanceof Element) {
      clone.appendChild(deepClone(child));
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
    return { success: false, error: hint, content: '', title: document.title, url: location.href };
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


export function isDiffPage(): boolean {
  return /github\.com\/.+\/(pull|commit|compare)|bitbucket\.org\/.+\/pull-requests|gitlab\.com\/.+-\/merge_requests/i.test(
    location.href
  );
}