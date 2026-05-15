/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */

export type ResolvedTheme = 'dark' | 'light';

export function resolveTheme(theme: string): ResolvedTheme {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  return theme === 'light' ? 'light' : 'dark';
}

export function watchSystemTheme(callback: (resolved: ResolvedTheme) => void): () => void {
  const mql = window.matchMedia('(prefers-color-scheme: light)');
  const handler = (e: MediaQueryListEvent) => {
    callback(e.matches ? 'light' : 'dark');
  };
  mql.addEventListener('change', handler);
  return () => mql.removeEventListener('change', handler);
}

export function applyAndWatchTheme(
  theme: string,
  unwatchRef: { current: (() => void) | null },
): void {
  unwatchRef.current?.();
  unwatchRef.current = null;

  const resolved = resolveTheme(theme);
  document.documentElement.dataset.theme = resolved;

  if (theme === 'system') {
    unwatchRef.current = watchSystemTheme((r) => {
      document.documentElement.dataset.theme = r;
    });
  }
}