/**
 * HTML → Markdown via TurndownService (bundled via npm).
 */

import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';


export function toMarkdown(html) {
  const td = new TurndownService({
    headingStyle: 'atx',
    hr: '---',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    fence: '```',
    emDelimiter: '_',
    strongDelimiter: '**',
    linkStyle: 'inlined',
  });

  td.use(gfm);

  td.keep(['sup', 'sub', 'mark']);

  td.addRule('img-to-alt', {
    filter: 'img',
    replacement: (_content, node) => {
      const alt = (node.getAttribute('alt') || '').trim();
      if (!alt || /^:[a-z_]+:$/.test(alt)) return '';
      return `[${alt}]`;
    },
  });

  td.addRule('anchor-only-links', {
    filter: (node) =>
      node.nodeName === 'A' && (node.getAttribute('href') || '').startsWith('#'),
    replacement: (_content, node) => node.textContent.trim(),
  });

  const raw = td.turndown(html);
  return raw
    .replace(/^-\s*$/gm, '')
    .replace(/^\s*\[?\s*\]?\s*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
