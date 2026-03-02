/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */

import en from './locales/en';
import de from './locales/de';

let current: Record<string, string> = en;

export function setLocale(lang: string): void {
  current = lang === 'de' ? de : en;
}

export function t(key: string): string {
  return current[key] ?? en[key] ?? key;
}

export function applyI18n(root: Document | Element = document): void {
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.getAttribute('data-i18n')!);
  });
  root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    (el as HTMLElement).setAttribute(
      'placeholder',
      t(el.getAttribute('data-i18n-placeholder')!)
    );
  });
  root.querySelectorAll('[data-i18n-title]').forEach((el) => {
    (el as HTMLElement).setAttribute(
      'title',
      t(el.getAttribute('data-i18n-title')!)
    );
  });
}
