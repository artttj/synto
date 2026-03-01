/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */

import { refs } from './dom';

export function setError(msg: string | null) {
  if (msg) {
    refs.errorMsg!.textContent = msg;
    refs.errorMsg!.classList.remove('hidden');
  } else {
    refs.errorMsg!.classList.add('hidden');
    refs.errorMsg!.textContent = '';
  }
}
