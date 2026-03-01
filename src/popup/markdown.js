// Private-use Unicode char used as placeholder during code block extraction.
// Avoids conflicts with real content and is safe in regex character classes.
const CODE_PLACEHOLDER = '\uE000';

export function renderMarkdown(raw) {
  const esc = (s) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const codeBlocks = [];
  const text = esc(raw).replace(/```(?:\w*)\n?([\s\S]*?)```/g, (_, code) => {
    codeBlocks.push(`<pre><code>${code.trimEnd()}</code></pre>`);
    return `${CODE_PLACEHOLDER}CODE${codeBlocks.length - 1}${CODE_PLACEHOLDER}`;
  });

  const inline = (s) =>
    s
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
      .replace(/__([^_\n]+)__/g, '<strong>$1</strong>')
      .replace(/_([^_\n]+)_/g, '<em>$1</em>');

  const lines = text.split('\n');
  const out = [];
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
    const codeMatch = line.trim().match(codePlaceholderRegex);
    if (codeMatch) {
      closeList();
      out.push(codeBlocks[parseInt(codeMatch[1], 10)]);
      continue;
    }

    const ul = line.match(/^[-*] (.+)$/);
    if (ul) {
      if (inOl) { out.push('</ol>'); inOl = false; }
      if (!inUl) { out.push('<ul>'); inUl = true; }
      out.push(`<li>${inline(ul[1])}</li>`);
      continue;
    }

    const ol = line.match(/^(\d+)\. (.+)$/);
    if (ol) {
      if (inUl) { out.push('</ul>'); inUl = false; }
      if (!inOl) { out.push('<ol>'); inOl = true; }
      out.push(`<li>${inline(ol[2])}</li>`);
      continue;
    }

    closeList();

    const heading = line.match(/^#{1,3} (.+)$/);
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
