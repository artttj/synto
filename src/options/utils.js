/**
 * Escapes a string for safe insertion into HTML text content.
 * @param {string} str - Raw string (e.g. template name or preview)
 * @returns {string} HTML-escaped string
 */
export function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
