import { describe, expect, it } from 'vitest';
import {
  pickRememberedTemplateId,
  providerHealthLabel,
  type ProviderHealthEntry,
  type Template,
  type TemplateUsage,
} from '../../src/shared/storage';

const templates: Template[] = [
  { id: 'understand-brief', name: 'Brief', prompt: '{content}' },
  { id: 'understand-review', name: 'Review', prompt: '{content}' },
  { id: 'understand-audit', name: 'SEO Audit', prompt: '{content}' },
];

describe('template usage helpers', () => {
  it('prefers hostname selection over configured default', () => {
    const usage: TemplateUsage = {
      globalTemplateId: 'understand-review',
      byHost: { 'github.com': 'understand-audit' },
    };

    expect(
      pickRememberedTemplateId('https://github.com/artttj/synto/pull/1', templates, usage, 'understand-brief')
    ).toBe('understand-audit');
  });

  it('falls back to default before global selection', () => {
    const usage: TemplateUsage = {
      globalTemplateId: 'understand-review',
      byHost: {},
    };

    expect(
      pickRememberedTemplateId('https://example.com/post', templates, usage, 'understand-brief')
    ).toBe('understand-brief');
  });

  it('skips deleted remembered templates', () => {
    const usage: TemplateUsage = {
      globalTemplateId: 'deleted-template',
      byHost: { 'example.com': 'also-deleted' },
    };

    expect(
      pickRememberedTemplateId('https://example.com/post', templates, usage, 'understand-review')
    ).toBe('understand-review');
  });

  it('falls back to global selection when host and default are unavailable', () => {
    const usage: TemplateUsage = {
      globalTemplateId: 'understand-review',
      byHost: {},
    };

    expect(
      pickRememberedTemplateId('https://example.com/post', templates, usage)
    ).toBe('understand-review');
  });

  it('falls back to first template when no remembered selections are available', () => {
    const usage: TemplateUsage = {
      globalTemplateId: 'deleted-template',
      byHost: {},
    };

    expect(
      pickRememberedTemplateId('https://example.com/post', templates, usage)
    ).toBe('understand-brief');
  });
});

describe('provider health helpers', () => {
  it.each([
    [undefined, 'No recent status'],
    [{ status: 'ok', ts: 1 }, 'Connected'],
    [{ status: 'no_key', ts: 1 }, 'No key'],
    [{ status: 'rate_limited', ts: 1 }, 'Rate limited'],
    [{ status: 'error', ts: 1, message: 'HTTP 500' }, 'Last failed'],
  ] satisfies [ProviderHealthEntry | undefined, string][])('maps %s to %s', (entry, label) => {
    expect(providerHealthLabel(entry)).toBe(label);
  });
});
