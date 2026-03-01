/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */

import { refs } from './dom';

export function wireKeyboard() {
  document.addEventListener('keydown', (e) => {
    if (!e.altKey || !e.shiftKey) return;

    if (e.key === 'C') {
      e.preventDefault();
      if (!refs.btnCopyMd!.disabled) refs.btnCopyMd!.click();
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (!refs.btnProcess!.disabled) refs.btnProcess!.click();
    }
  });
}
