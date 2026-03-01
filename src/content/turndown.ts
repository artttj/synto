/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

export function toMarkdown(html: string): string {
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
    replacement: (_content: string, node: TurndownService.Node) => {
      const alt = ((node as HTMLElement).getAttribute('alt') ?? '').trim();
      if (!alt || /^:[a-z_]+:$/.test(alt)) return '';
      return `[${alt}]`;
    },
  });

  td.addRule('anchor-only-links', {
    filter: (node: HTMLElement) =>
      node.nodeName === 'A' && (node.getAttribute('href') ?? '').startsWith('#'),
    replacement: (_content: string, node: TurndownService.Node) => (node.textContent ?? '').trim(),
  });

  const raw = td.turndown(html);
  return raw
    .replace(/^-\s*$/gm, '')
    .replace(/^\s*\[?\s*\]?\s*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
