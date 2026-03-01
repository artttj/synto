/**
 * HTML → Markdown via TurndownService (loaded as global before this bundle).
 */

const TurndownService = globalThis.TurndownService;
const turndownPluginGfm = globalThis.turndownPluginGfm;


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

  if (typeof turndownPluginGfm !== 'undefined') {
    td.use(turndownPluginGfm.gfm);
  }

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
