/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */

import en from './locales/en';
import de from './locales/de';
import es from './locales/es';
import fr from './locales/fr';
import it from './locales/it';
import pt from './locales/pt';
import zh from './locales/zh';
import hi from './locales/hi';

let current: Record<string, string> = en;

export function setLocale(lang: string): void {
  if (lang === 'de') {
    current = de;
    return;
  }
  if (lang === 'es') {
    current = es;
    return;
  }
  if (lang === 'fr') {
    current = fr;
    return;
  }
  if (lang === 'it') {
    current = it;
    return;
  }
  if (lang === 'pt') {
    current = pt;
    return;
  }
  if (lang === 'zh') {
    current = zh;
    return;
  }
  if (lang === 'hi') {
    current = hi;
    return;
  }
  current = en;
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
