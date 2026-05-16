/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */

export function escHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function showToast(message: string): void {
  const toast = document.getElementById('save-toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 1800);
}


export function wireModalClose(
  overlay: HTMLElement | null,
  closeBtn: HTMLElement | null,
  onClose: () => void,
): void {
  if (!overlay) return;
  closeBtn?.addEventListener('click', onClose);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) onClose();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlay.classList.contains('hidden')) onClose();
  });
}
