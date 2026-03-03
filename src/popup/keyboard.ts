/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */

import { refs } from './dom';
import { extractContent } from './extract';

export function wireKeyboard(): void {
  document.addEventListener('keydown', (e) => {
    if (!e.altKey || !e.shiftKey || e.key !== 'Enter') return;
    e.preventDefault();
    if (!refs.btnProcess!.disabled) {
      refs.btnProcess!.click();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (!(e.key === 'a' || e.key === 'A') || !(e.ctrlKey || e.metaKey)) return;
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.isContentEditable) return;
    if (target.tagName === 'TEXTAREA' && !(target as HTMLTextAreaElement).readOnly) return;
    e.preventDefault();
    void extractContent();
  });
}
