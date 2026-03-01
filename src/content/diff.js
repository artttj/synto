/**
 * Diff table → <pre> preprocessing for Bitbucket, GitLab, etc.
 */

export function preprocessDiffTables(root) {
  root.querySelectorAll('table').forEach((table) => {
    if (!looksLikeDiffTable(table)) return;

    const lines = [];
    table.querySelectorAll('tr').forEach((row) => {
      const cls = row.className || '';

      if (/\b(hunk|expander|bb-udiff-hunk|line-hunk)\b/i.test(cls)) {
        const hunkCell = row.querySelector(
          "[class*='hunk'], [class*='segment'], td:last-child"
        );
        const text = (hunkCell || row).textContent.trim();
        if (text) {
          lines.push(text);
        }
        return;
      }

      const cells = row.querySelectorAll('td');
      if (!cells.length) return;

      const codeCell =
        row.querySelector(
          "td.source, td.blob-code-inner, td[class*='code'], td[class*='source'], td[class*='content']"
        ) || cells[cells.length - 1];
      const text = (codeCell.textContent || '').trimEnd();
      lines.push(text);
    });

    if (lines.length > 1) {
      const pre = document.createElement('pre');
      pre.textContent = lines.join('\n');
      table.parentNode?.replaceChild(pre, table);
    }
  });
}


export function looksLikeDiffTable(table) {
  const rows = Array.from(table.querySelectorAll('tr'));
  if (rows.length < 2) return false;

  const meta =
    (table.className || '') +
    (table.getAttribute('data-diff-type') || '') +
    (table.getAttribute('data-qa') || '');

  if (/diff|hunk/i.test(meta)) return true;

  if (table.closest("[class*='diff'], [data-qa*='diff'], [id*='diff'], [data-testid*='diff']")) {
    return true;
  }

  const sample = rows.slice(0, Math.min(6, rows.length));
  return sample.some((row) =>
    /\b(addition|deletion|added|removed|context|unchanged|hunk|insert|delete|bb-udiff)\b/i.test(
      row.className || ''
    )
  );
}
