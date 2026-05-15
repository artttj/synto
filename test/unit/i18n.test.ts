/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */

import { describe, it, expect } from 'vitest';
import { setLocale, t, tOpt } from '../../src/shared/i18n';

describe('i18n', () => {
  describe('setLocale', () => {
    it('defaults to English for unknown locale', () => {
      setLocale('xx');
      // After setting unknown locale, t should fall back to en
      expect(t('template_name_audit-accessibility')).toBeDefined();
    });

    it('supports all known locales without throwing', () => {
      for (const lang of ['en', 'de', 'es', 'fr', 'it', 'pt', 'zh', 'hi', 'ja']) {
        expect(() => setLocale(lang)).not.toThrow();
      }
    });
  });

  describe('t', () => {
    it('returns translation for known key', () => {
      setLocale('en');
      const result = t('template_name_audit-accessibility');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns key itself for unknown key', () => {
      setLocale('en');
      expect(t('nonexistent_key_12345')).toBe('nonexistent_key_12345');
    });
  });

  describe('tOpt', () => {
    it('returns translation for known key', () => {
      setLocale('en');
      const result = tOpt('template_name_audit-accessibility');
      expect(typeof result).toBe('string');
    });

    it('returns undefined for unknown key', () => {
      setLocale('en');
      expect(tOpt('nonexistent_key_12345')).toBeUndefined();
    });
  });
});
