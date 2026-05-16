/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */

import { describe, it, expect } from 'vitest';
import { hostMatches, detectTemplateId } from '../../src/popup/site-detect';
import type { Template } from '../../src/shared/storage';

const fakeTemplates = (entries: Partial<Template>[]): Template[] =>
  entries.map((e) => ({
    id: 'x',
    name: 'x',
    description: 'x',
    category: 'x',
    tags: [],
    placeholders: [],
    version: 1,
    prompt: 'x',
    ...e,
  })) as Template[];

describe('hostMatches', () => {
  it('matches exact host', () => {
    expect(hostMatches('booking.com', 'www.booking.com')).toBe(true);
  });

  it('matches suffix pattern with trailing dot for any TLD', () => {
    expect(hostMatches('airbnb.', 'www.airbnb.de')).toBe(true);
    expect(hostMatches('airbnb.', 'airbnb.com')).toBe(true);
    expect(hostMatches('airbnb.', 'airbnb.co.uk')).toBe(true);
  });

  it('rejects non-suffix collisions', () => {
    expect(hostMatches('airbnb.', 'fakeairbnb.com')).toBe(false);
    expect(hostMatches('booking.com', 'fake-booking.com')).toBe(false);
  });

  it('matches subdomains for non-trailing-dot patterns', () => {
    expect(hostMatches('booking.com', 'secure.booking.com')).toBe(true);
  });
});

describe('detectTemplateId', () => {
  it('returns undefined when no template has a match block', () => {
    const templates = fakeTemplates([{ id: 'a' }]);
    expect(detectTemplateId('https://example.com/x', templates, undefined)).toBeUndefined();
  });

  it('picks host suffix match', () => {
    const templates = fakeTemplates([
      { id: 'a' },
      { id: 'b', match: { hosts: ['airbnb.'] } },
    ]);
    const result = detectTemplateId('https://www.airbnb.de/rooms/12345', templates, undefined);
    expect(result?.templateId).toBe('b');
  });

  it('path beats host alone', () => {
    const templates = fakeTemplates([
      { id: 'a', match: { hosts: ['github.com'] } },
      { id: 'b', match: { hosts: ['github.com'], pathContains: ['/pull/'] } },
    ]);
    const result = detectTemplateId('https://github.com/foo/bar/pull/1', templates, undefined);
    expect(result?.templateId).toBe('b');
  });

  it('schemaTypes outscore host', () => {
    const templates = fakeTemplates([
      { id: 'a', match: { hosts: ['booking.com'] } },
      { id: 'b', match: { signals: { schemaTypes: ['Hotel'] } } },
    ]);
    const result = detectTemplateId(
      'https://www.booking.com/hotel/x',
      templates,
      { schemaTypes: ['Hotel'], ogType: null },
    );
    expect(result?.templateId).toBe('b');
  });

  it('returns category from matched template', () => {
    const templates = fakeTemplates([
      { id: 'a', match: { hosts: ['airbnb.'], category: 'stay' } },
    ]);
    const result = detectTemplateId('https://airbnb.com/rooms/1', templates, undefined);
    expect(result).toEqual({ templateId: 'a', category: 'stay' });
  });

  it('og:type=article is weak signal (+1)', () => {
    const templates = fakeTemplates([
      { id: 'a', match: { hosts: ['nytimes.com'] } },
      { id: 'b', match: { signals: { ogTypes: ['article'] } } },
    ]);
    const result = detectTemplateId(
      'https://nytimes.com/2026/05/16/foo.html',
      templates,
      { schemaTypes: [], ogType: 'article' },
    );
    expect(result?.templateId).toBe('a');
  });
});
