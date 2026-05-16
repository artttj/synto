/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */

import { describe, it, expect } from 'vitest';
import { resolveLocalized } from '../../src/shared/library';

describe('resolveLocalized', () => {
  it('returns plain string unchanged', () => {
    expect(resolveLocalized('TL;DR', 'de')).toBe('TL;DR');
  });

  it('returns matching locale from object', () => {
    expect(resolveLocalized({ en: 'Reply', de: 'Antwort' }, 'de')).toBe('Antwort');
  });

  it('falls back to en when locale missing', () => {
    expect(resolveLocalized({ en: 'Reply', de: 'Antwort' }, 'fr')).toBe('Reply');
  });

  it('falls back to first key when en missing', () => {
    expect(resolveLocalized({ ja: '返信' } as Record<string, string>, 'fr')).toBe('返信');
  });

  it('returns empty string for empty object', () => {
    expect(resolveLocalized({}, 'en')).toBe('');
  });
});
