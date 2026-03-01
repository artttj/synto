/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */

import { refs } from './dom';

export function wireKeyboard(): void {
  document.addEventListener('keydown', (e) => {
    if (!e.altKey || !e.shiftKey || e.key !== 'Enter') return;
    e.preventDefault();
    if (!refs.btnProcess!.disabled) {
      refs.btnProcess!.click();
    }
  });
}
