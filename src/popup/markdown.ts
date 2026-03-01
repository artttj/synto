/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */

// Private-use Unicode char used as placeholder during code block extraction.
// Avoids conflicts with real content and is safe in regex character classes.
const CODE_PLACEHOLDER = '\uE000';

/** Strip repeated leading "N. " so LLM output like "1. 1. 1. text" becomes "text". */
function stripLeadingNumber(s: string): string {
  let t = s.trim();
  let prev = '';
  while (t !== prev) {
    prev = t;
    t = t.replace(/^\d+\.\s+/, '').trim();
  }
  return t || s;
}

export function renderMarkdown(raw: string): string {
  const esc = (s: string): string =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const codeBlocks: string[] = [];
  const text = esc(raw).replace(/```(?:\w*)\n?([\s\S]*?)```/g, (_: string, code: string) => {
    codeBlocks.push(`<pre><code>${code.trimEnd()}</code></pre>`);
    return `${CODE_PLACEHOLDER}CODE${codeBlocks.length - 1}${CODE_PLACEHOLDER}`;
  });

  const inline = (s: string): string =>
    s
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
      .replace(/__([^_\n]+)__/g, '<strong>$1</strong>')
      .replace(/_([^_\n]+)_/g, '<em>$1</em>');

  const lines = text.split('\n');
  const out: string[] = [];
  let inUl = false;
  let inOl = false;

  const closeList = () => {
    if (inUl) { out.push('</ul>'); inUl = false; }
    if (inOl) { out.push('</ol>'); inOl = false; }
  };

  const codePlaceholderRegex = new RegExp(
    `^${CODE_PLACEHOLDER}CODE(\\d+)${CODE_PLACEHOLDER}$`
  );

  for (const line of lines) {
    const codeMatch = codePlaceholderRegex.exec(line.trim());
    if (codeMatch) {
      closeList();
      out.push(codeBlocks[parseInt(codeMatch[1], 10)]);
      continue;
    }

    const ul = /^[-*] (.+)$/.exec(line);
    if (ul) {
      if (inOl) { out.push('</ol>'); inOl = false; }
      if (!inUl) { out.push('<ul>'); inUl = true; }
      out.push(`<li>${inline(ul[1])}</li>`);
      continue;
    }

    const ol = /^(\d+)\. (.+)$/.exec(line);
    if (ol) {
      if (inUl) { out.push('</ul>'); inUl = false; }
      if (!inOl) { out.push('<ol>'); inOl = true; }
      // Strip repeated leading "N. " so "1. 1. 1. text" from LLM becomes "text"
      const listContent = stripLeadingNumber(ol[2]);
      out.push(`<li>${inline(listContent)}</li>`);
      continue;
    }

    closeList();

    const heading = /^#{1,3} (.+)$/.exec(line);
    if (heading) {
      out.push(`<strong>${inline(heading[1])}</strong><br>`);
      continue;
    }

    if (line.trim() === '') {
      out.push('<br>');
      continue;
    }

    out.push(`${inline(line)}<br>`);
  }

  closeList();
  return out.join('').replace(/(<br>){3,}/g, '<br><br>');
}
