/**
 * Error display for the popup. Shows messages and optional "Reload tab" link.
 */

import { refs } from './dom.js';


export function setError(msg) {
  if (msg) {
    refs.errorMsg.textContent = msg;
    refs.errorMsg.classList.remove('hidden');
  } else {
    refs.errorMsg.classList.add('hidden');
    refs.errorMsg.textContent = '';
  }
}


