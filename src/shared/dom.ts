/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */

export const $ = (id: string): HTMLElement | null => document.getElementById(id);


export function el(tag: string, className?: string, text?: string): HTMLElement {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
