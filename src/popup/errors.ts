/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */

import { refs } from './dom';

type StatusKind = 'error' | 'info';

export function setError(msg: string | null, kind: StatusKind = 'error') {
  if (msg) {
    refs.errorMsg!.textContent = msg;
    refs.errorMsg!.classList.remove('hidden');
    refs.errorMsg!.classList.toggle('error', kind === 'error');
  } else {
    refs.errorMsg!.classList.add('hidden');
    refs.errorMsg!.textContent = '';
    refs.errorMsg!.classList.add('error');
  }
}
