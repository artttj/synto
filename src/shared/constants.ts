/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */

export const MSG = {
  EXTRACT_CONTENT: 'EXTRACT_CONTENT',
  COPY_TO_CLIPBOARD: 'COPY_TO_CLIPBOARD',
  GET_TEMPLATES: 'GET_TEMPLATES',
  SAVE_TEMPLATES: 'SAVE_TEMPLATES',
  INSERT_TEXT: 'INSERT_TEXT',
  SCROLL_AND_RESCAN: 'SCROLL_AND_RESCAN',
  CONTENT_UPDATE: 'CONTENT_UPDATE',
};

export const STORAGE_KEYS = {
  TEMPLATES:      'apc_templates',
  SETTINGS:       'apc_settings',
  OPENAI_KEY:     'apc_openai_key',
  GROK_KEY:       'apc_grok_key',
  GEMINI_KEY:     'apc_gemini_key',
  OPENROUTER_KEY: 'apc_openrouter_key',
  ZAI_KEY:        'apc_zai_key',
  ANTHROPIC_KEY:  'apc_anthropic_key',
  CUSTOM_KEY:     'apc_custom_key',
  OLLAMA_KEY:     'apc_ollama_key',
  HISTORY:        'apc_history',
  TEMPLATE_USAGE: 'apc_template_usage',
  PROVIDER_HEALTH: 'apc_provider_health',
};

export const PROVIDER_MODELS: Record<string, string[]> = {
  openai:     ['gpt-4o-mini', 'gpt-4.1-mini', 'gpt-4.1'],
  gemini:     ['gemini-2.5-flash', 'gemini-2.5-pro'],
  grok:       ['grok-3-mini', 'grok-3'],
  openrouter: [
    'anthropic/claude-sonnet-4-6',
    'anthropic/claude-opus-4-7',
    'anthropic/claude-opus-4-6',
    'google/gemma-4-26b-a4b-it:free',
    'meta-llama/llama-3.3-70b-instruct',
    'deepseek/deepseek-r1:free',
    'qwen/qwen3-next-80b-a3b-instruct:free',
    'openai/gpt-oss-120b:free',
  ],
  zai:        ['zai-7b', 'zai-70b'],
  anthropic:  ['claude-sonnet-4-6', 'claude-opus-4-7', 'claude-opus-4-6', 'claude-haiku-4-5'],
  ollama:     [
    'kimi-k2.6:cloud', 'kimi-k2.5:cloud', 'kimi-k2-thinking:cloud', 'kimi-k2:1t-cloud',
    'deepseek-v4-flash:cloud', 'deepseek-v4-pro:cloud', 'deepseek-v3.2:cloud', 'deepseek-v3.1:671b-cloud',
    'gemma4:31b-cloud', 'gemma3:27b-cloud',
    'qwen3.5:397b-cloud', 'qwen3-coder:480b-cloud',
    'glm-5.1:cloud', 'glm-4.7:cloud', 'glm-4.6:cloud',
    'minimax-m2.7:cloud', 'minimax-m2:cloud',
    'nemotron-3-super:cloud',
    'gemini-3-flash-preview:cloud',
  ],
  custom:     [
    'gemma4', 'gemma3', 'gemini-3-flash-preview', 'gemini-2.5-flash',
    'llama4', 'llama3.3', 'qwen3.5', 'deepseek-r1', 'deepseek-v3',
    'phi4', 'mistral', 'kimi-k2', 'glm-5',
  ],
};

export const CUSTOM_ENDPOINT_DEFAULT = 'http://localhost:11434';

export const OLLAMA_ENDPOINT_DEFAULT = 'https://ollama.com/v1';

export const ANTHROPIC_MAX_TOKENS = 4096;

export const DEFAULT_SYSTEM_PROMPT =
  'Be specific. Use plain language. No filler, no hedging, no cliches — avoid words like leverage, streamline, dive into, furthermore, moreover, in conclusion, it\'s worth noting, crucial, essential. If something is wrong, say so directly. If it\'s fine, say so briefly. Short sentences beat long ones. Active voice. Concrete examples over abstract claims. Never start with "As a [role]" or "Based on the content provided."';

export const TEMPLATE_CATEGORIES = ['Understand', 'Decide', 'Compose', 'Brief', 'Review', 'Audit'];

export const TEMPLATE_CATEGORY_LABELS: Record<string, string> = {
  'Understand': 'Understand',
  'Decide': 'Decide',
  'Compose': 'Compose',
  'Brief': 'Brief',
  'Review': 'Review',
  'Audit': 'Audit',
};

export const DEPRECATED_TEMPLATE_IDS = new Set([
  'default-structured-brief',
  'analyze-article',
  'community-debate-map',
  'default-clean',
  'extract-key-questions',
  'lifestyle-recipe-card',
  'lifestyle-buy-decision',
  'eng-ticket-analysis',
  'decide-feature-request',
  'extract-risks-blockers',
  'lifestyle-smart-choice',
  'write-compose-answer',
  'community-rewrite-comment',
  'write-email-helper',
  'understand-audit',
  'decide-decide',
  'decide-actions',
  'decide-briefing',
  'brief-template',
  'review-feedback',
  'review-comparison',
]);

export const DEFAULT_TEMPLATES = [
  {
    id: "understand-brief",
    name: "TL;DR",
    label: "TL;DR",
    description: "Key takeaway, evidence, open questions",
    category: "Understand",
    isDefault: true,
    prompt: `What's the one thing worth remembering from this? Give me the takeaway, the strongest evidence for it, and what's still unclear.

Be specific. Use plain language. No filler, no hedging, no cliches. Avoid words like leverage, streamline, dive into, furthermore, moreover, in conclusion, it's worth noting, crucial, essential. Short sentences. Active voice. Concrete examples over abstract claims.

Do not start with "Based on the content provided" or "As an analyst." Jump straight into the answer.

Skip the summary padding — I want signal, not a recap.

---

{content}`,
  },

  {
    id: "understand-review",
    name: "Code Review",
    label: "Code Review",
    description: "Bugs, security, performance — real problems only",
    category: "Understand",
    isDefault: false,
    prompt: `Review this diff thoroughly. Check for these specific categories:

**Correctness**: Logic errors, off-by-ones, null handling, edge cases, race conditions.
**Security**: Injection, auth gaps, exposed secrets, XSS, path traversal.
**Performance**: N+1 queries, unbounded loops, memory leaks, large payloads.
**Type safety**: Type mismatches, unsafe casts, missing null checks.
**Error handling**: Missing catch blocks, swallowed errors, unhandled promise rejections.

For each real issue found, rate severity:
- **CRITICAL** — security vuln or data loss risk, must fix before merge
- **HIGH** — bug likely to cause problems, should fix
- **MEDIUM** — quality issue, fix recommended
- **LOW** — minor, optional

If the code is fine, say so in one sentence. Don't narrate what the code does — I can read it myself. Skip style nits unless they hide real problems.

Be specific. Use plain language. No filler. Point to exact lines when possible. Concrete fixes, not "consider refactoring."

---

Source: [{title}]({url})

{content}`,
  },

  {
    id: "compose-reply",
    name: "Reply",
    label: "Reply",
    description: "Direct reply, rewrite, or email draft",
    category: "Compose",
    isDefault: false,
    prompt: `Write a reply based on the context below.

**If this looks like an email or formal message**: Write a professional email. Include a subject line (6-10 words), body (120-180 words, natural tone), and a sign-off. No corporate filler — no "I hope this finds you well", no "leveraging", no "streamlining". If scheduling is needed, suggest two specific times.

**If this looks like a Slack or chat message**: Write a short, direct reply. 3-5 sentences. Acknowledge the ask, give the answer or next step, close with a clear action. No filler.

**If this is text to rewrite**: Rewrite it to be professional and direct. Cut every word that doesn't earn its place. Remove AI-sounding language — no "furthermore", "moreover", "in conclusion", "it's worth noting", no em dashes. Two variants: one short and blunt (1-2 sentences), one warmer but still concise (2-4 sentences).

Be specific. Use plain language. Active voice. Short sentences. Never start with "Based on the content provided" or "I'd be happy to help."

---

{content}`,
  },

  {
    id: "audit-seo",
    name: "SEO Audit",
    label: "SEO Audit",
    description: "On-page SEO — titles, headings, content gaps, technical signals",
    category: "Audit",
    isDefault: false,
    prompt: `Audit this page for on-page SEO. Check:

**Title tag**: Exists? Under 60 chars? Primary keyword included naturally?

**Meta description**: Present? Under 160 chars? Compelling enough to click?

**Headings**: Single H1? Logical H2/H3 hierarchy? Keywords without stuffing?

**Content**: Thin (under 300 words)? Duplicate? Written for humans or bots?

**Links**: Internal links with descriptive anchors? Broken links? Orphan page?

**Images**: Alt text on all images? File names descriptive?

**Technical**: Schema markup present? Canonical tag set? Mobile-friendly?

For each issue found:
1. **What's wrong** — be specific
2. **Why it matters** — the ranking signal affected
3. **How to fix** — one concrete action

Skip what's already working. Focus on real problems.

---

Source: [{title}]({url})

{content}`,
  },

  {
    id: "audit-accessibility",
    name: "Accessibility",
    label: "Accessibility",
    description: "WCAG compliance — contrast, keyboard nav, ARIA, screen reader support",
    category: "Audit",
    isDefault: false,
    prompt: `You are an accessibility auditor. Analyze the provided HTML for WCAG 2.1 AA compliance.

**Important**: The {content} below is raw HTML source code of the page. Use it to identify accessibility issues.

**Visual**: Color contrast ratios (4.5:1 for text, 3:1 for UI)? Focus indicators visible? No color-only information?

**Keyboard**: All interactive elements reachable via Tab? Logical focus order? No keyboard traps? Escape closes modals?

**Screen reader**: Alt text on images? Form labels present? ARIA roles used correctly? Landmark regions defined?

**Structure**: Semantic HTML (nav, main, article, aside)? Heading hierarchy logical? Lists use <ul>/<ol>?

**Motion**: Reduced motion support? No auto-playing media? Animation can be paused?

For each violation:
1. **WCAG criterion** — e.g., "1.4.3 Contrast (Minimum)"
2. **Impact** — who is excluded
3. **Fix** — specific code or design change

Prioritize by severity: Critical (blocks access) → Major (significant friction) → Minor (annoyance).

---

Source: [{title}]({url})

{content}`,
  },

  {
    id: "audit-performance",
    name: "Performance",
    label: "Performance",
    description: "Page speed — Core Web Vitals, bundle size, image optimization",
    category: "Audit",
    isDefault: false,
    prompt: `Audit this page for performance. Check:

**Core Web Vitals**:
- LCP (Largest Contentful Paint): Under 2.5s?
- INP (Interaction to Next Paint): Under 200ms?
- CLS (Cumulative Layout Shift): Under 0.1?

**Resources**:
- Total JS bundle size (target: <150KB gzipped for landing, <300KB for app)
- Total CSS size (target: <30KB)
- Images: Proper format (AVIF/WebP)? Sized correctly? Lazy-loaded below fold?
- Fonts: Subset? font-display: swap?

**Loading**:
- Render-blocking resources?
- Critical CSS inlined?
- Third-party scripts async/defer?

**Code**:
- Unused JS/CSS?
- Large dependencies that could be tree-shaken?
- N+1 requests or waterfalls?

For each issue:
1. **What's wrong** — specific metric or resource
2. **Impact** — ms added, KB wasted
3. **Fix** — concrete action

---

Source: [{title}]({url})

{content}`,
  },
];

export const TOKEN_THRESHOLDS = {
  GREEN:  4000,
  YELLOW: 16000,
  MODEL_LIMITS: {
    'gpt-4o-mini':    128000,
    'gpt-4.1-mini':  1047576,
    'gpt-4.1':       1047576,
    'gemini-2.5-flash':  1048576,
    'gemini-2.5-pro':    2097152,
    'grok-3-mini':    131072,
    'grok-3':         131072,
    'anthropic/claude-sonnet-4-6': 200000,
    'anthropic/claude-opus-4-7':   200000,
    'anthropic/claude-opus-4-6':   200000,
    'google/gemma-4-26b-a4b-it:free': 262144,
    'meta-llama/llama-3.3-70b-instruct': 131072,
    'deepseek/deepseek-r1:free': 131072,
    'qwen/qwen3-next-80b-a3b-instruct:free': 131072,
    'openai/gpt-oss-120b:free': 131072,
    'zai-7b':  131072,
    'zai-70b': 131072,
    'claude-sonnet-4-6': 200000,
    'claude-opus-4-7':   200000,
    'claude-opus-4-6':   200000,
    'claude-haiku-4-5':  200000,
    'kimi-k2.6':             131072,
    'kimi-k2.5':             131072,
    'kimi-k2-thinking':      131072,
    'kimi-k2':               131072,
    'deepseek-v4-flash':     131072,
    'deepseek-v4-pro':       131072,
    'deepseek-v3.2':         131072,
    'deepseek-v3.1':         131072,
    'gemma4':                 131072,
    'gemma3':                 131072,
    'qwen3.5':               131072,
    'qwen3-coder':           131072,
    'glm-5.1':               131072,
    'glm-4.7':               131072,
    'glm-4.6':               131072,
    'minimax-m2.7':          131072,
    'minimax-m2':            131072,
    'nemotron-3-super':      131072,
    'gemini-3-flash-preview': 1048576,
  },
};


export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4); // ~4 chars per token
}


export function tokenColorClass(tokens: number): string {
  if (tokens < TOKEN_THRESHOLDS.GREEN) {
    return 'green';
  }
  if (tokens < TOKEN_THRESHOLDS.YELLOW) {
    return 'yellow';
  }
  return 'red';
}
