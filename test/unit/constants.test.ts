/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */

import { describe, it, expect } from 'vitest';
import {
  MSG,
  STORAGE_KEYS,
  PROVIDER_MODELS,
  TEMPLATE_CATEGORIES,
  ANTHROPIC_MAX_TOKENS,
} from '../../src/shared/constants';

describe('constants', () => {
  it('has all required message types', () => {
    expect(MSG.EXTRACT_CONTENT).toBe('EXTRACT_CONTENT');
    expect(MSG.INSERT_TEXT).toBe('INSERT_TEXT');
    expect(MSG.SCROLL_AND_RESCAN).toBe('SCROLL_AND_RESCAN');
    expect(MSG.CONTENT_UPDATE).toBe('CONTENT_UPDATE');
  });

  it('has all storage keys defined', () => {
    expect(STORAGE_KEYS.TEMPLATES).toBeDefined();
    expect(STORAGE_KEYS.SETTINGS).toBeDefined();
    expect(STORAGE_KEYS.OPENAI_KEY).toBeDefined();
    expect(STORAGE_KEYS.ANTHROPIC_KEY).toBeDefined();
    expect(STORAGE_KEYS.OLLAMA_KEY).toBeDefined();
    expect(STORAGE_KEYS.HISTORY).toBeDefined();
  });

  it('has models for all providers', () => {
    expect(PROVIDER_MODELS.openai.length).toBeGreaterThan(0);
    expect(PROVIDER_MODELS.gemini.length).toBeGreaterThan(0);
    expect(PROVIDER_MODELS.grok.length).toBeGreaterThan(0);
    expect(PROVIDER_MODELS.openrouter.length).toBeGreaterThan(0);
    expect(PROVIDER_MODELS.zai.length).toBeGreaterThan(0);
    expect(PROVIDER_MODELS.anthropic.length).toBeGreaterThan(0);
  });

  it('has template categories', () => {
    expect(TEMPLATE_CATEGORIES.length).toBeGreaterThan(0);
    expect(TEMPLATE_CATEGORIES).toContain('Understand');
    expect(TEMPLATE_CATEGORIES).toContain('Decide');
  });

  it('defines ANTHROPIC_MAX_TOKENS', () => {
    expect(ANTHROPIC_MAX_TOKENS).toBe(4096);
  });
});
