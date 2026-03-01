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


export function setErrorWithReload(msg) {
  refs.errorMsg.innerHTML = '';
  refs.errorMsg.appendChild(document.createTextNode(msg + ' '));

  const link = document.createElement('a');
  link.href = '#';
  link.textContent = 'Reload tab';
  link.addEventListener('click', async (e) => {
    e.preventDefault();
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      chrome.tabs.reload(tab.id);
    }
    window.close();
  });

  refs.errorMsg.appendChild(link);
  refs.errorMsg.classList.remove('hidden');
}
