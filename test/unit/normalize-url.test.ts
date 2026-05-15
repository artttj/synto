/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */

import { describe, it, expect } from 'vitest';
import { normalizeUrl } from '../../src/shared/storage';

describe('normalizeUrl', () => {
  it('strips hash fragments', () => {
    expect(normalizeUrl('https://example.com/page#section')).toBe('https://example.com/page');
  });

  it('strips utm tracking params', () => {
    const result = normalizeUrl('https://example.com/page?utm_source=twitter&foo=bar');
    expect(result).toBe('https://example.com/page?foo=bar');
  });

  it('strips fbclid and gclid', () => {
    const result = normalizeUrl('https://example.com/page?fbclid=abc&gclid=def&keep=1');
    expect(result).toBe('https://example.com/page?keep=1');
  });

  it('keeps non-tracking params', () => {
    const result = normalizeUrl('https://example.com/page?q=search&page=2');
    expect(result).toBe('https://example.com/page?q=search&page=2');
  });

  it('returns original string on invalid URL', () => {
    expect(normalizeUrl('not-a-url')).toBe('not-a-url');
  });

  it('handles URL with no query or hash', () => {
    expect(normalizeUrl('https://example.com/path')).toBe('https://example.com/path');
  });
});
