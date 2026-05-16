/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';

interface ChromeStub {
  storage: {
    sync: {
      get: ReturnType<typeof vi.fn>;
      set: ReturnType<typeof vi.fn>;
    };
  };
}

function stubChrome(storedSettings: Record<string, unknown> | undefined): ChromeStub {
  const data = storedSettings === undefined ? {} : { apc_settings: storedSettings };
  return {
    storage: {
      sync: {
        get: vi.fn(async (key: string) => (key in data ? { [key]: data[key as keyof typeof data] } : {})),
        set: vi.fn(async () => undefined),
      },
    },
  };
}

describe('proMode default', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('returns proMode: false when no settings are stored', async () => {
    (globalThis as unknown as { chrome: ChromeStub }).chrome = stubChrome(undefined);
    const { getSettings } = await import('../../src/shared/storage');
    const settings = await getSettings();
    expect(settings.proMode).toBe(false);
  });

  it('returns proMode: false when stored settings predate the field', async () => {
    (globalThis as unknown as { chrome: ChromeStub }).chrome = stubChrome({ theme: 'dark', llmProvider: 'openai' });
    const { getSettings } = await import('../../src/shared/storage');
    const settings = await getSettings();
    expect(settings.proMode).toBe(false);
  });

  it('returns proMode: true when stored as true', async () => {
    (globalThis as unknown as { chrome: ChromeStub }).chrome = stubChrome({ proMode: true });
    const { getSettings } = await import('../../src/shared/storage');
    const settings = await getSettings();
    expect(settings.proMode).toBe(true);
  });
});
