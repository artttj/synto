/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 *
 * Site detection: scores library templates against the active URL and page
 * signals, returning the highest-scoring match (or undefined when no rule
 * matches).
 */

import type { Template } from '../shared/storage';
import type { SiteMatch, PageSignals } from '../shared/library';

export interface DetectionResult {
  templateId: string;
  category?: string;
}

export function hostMatches(pattern: string, host: string): boolean {
  const p = pattern.toLowerCase();
  const h = host.toLowerCase();

  if (p.endsWith('.')) {
    const stem = p.slice(0, -1);
    const idx = h.indexOf(stem + '.');
    if (idx === -1) return false;
    return idx === 0 || h[idx - 1] === '.';
  }

  if (h === p) return true;
  return h.endsWith('.' + p);
}

function hostFromUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try { return new URL(url).hostname; } catch { return undefined; }
}

function pathFromUrl(url: string | undefined): string {
  if (!url) return '';
  try { return new URL(url).pathname.toLowerCase(); } catch { return ''; }
}

function scoreMatch(
  match: SiteMatch | undefined,
  host: string | undefined,
  path: string,
  signals: PageSignals | undefined,
): number {
  if (!match) return 0;
  let score = 0;

  if (host && match.hosts) {
    for (const pattern of match.hosts) {
      if (hostMatches(pattern, host)) {
        score += 2;
        break;
      }
    }
  }

  if (path && match.pathContains) {
    for (const fragment of match.pathContains) {
      if (path.includes(fragment.toLowerCase())) {
        score += 3;
        break;
      }
    }
  }

  if (signals && match.signals) {
    if (match.signals.schemaTypes && signals.schemaTypes.length > 0) {
      for (const t of match.signals.schemaTypes) {
        if (signals.schemaTypes.includes(t)) { score += 5; break; }
      }
    }
    if (match.signals.ogTypes && signals.ogType === 'article' && match.signals.ogTypes.includes('article')) {
      score += 1;
    }
  }

  return score;
}

export function detectTemplateId(
  url: string | undefined,
  templates: Template[],
  signals: PageSignals | undefined,
): DetectionResult | undefined {
  const host = hostFromUrl(url);
  const path = pathFromUrl(url);

  let bestScore = 0;
  let bestTemplate: Template | undefined;
  for (const template of templates) {
    const match = (template as Template & { match?: SiteMatch }).match;
    const score = scoreMatch(match, host, path, signals);
    if (score > bestScore) {
      bestScore = score;
      bestTemplate = template;
    }
  }

  if (!bestTemplate || bestScore === 0) return undefined;

  const match = (bestTemplate as Template & { match?: SiteMatch }).match;
  return { templateId: bestTemplate.id, category: match?.category };
}
