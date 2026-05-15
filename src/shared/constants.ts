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
    'kimi-k2.6', 'kimi-k2.5', 'kimi-k2-thinking', 'kimi-k2',
    'deepseek-v4-flash', 'deepseek-v4-pro', 'deepseek-v3.2', 'deepseek-v3.1',
    'gemma4', 'gemma3',
    'qwen3.5', 'qwen3-coder',
    'glm-5.1', 'glm-4.7', 'glm-4.6',
    'minimax-m2.7', 'minimax-m2',
    'nemotron-3-super',
    'gemini-3-flash-preview',
  ],
  custom:     [
    'gemma4', 'gemma3', 'gemini-3-flash-preview', 'gemini-2.5-flash',
    'llama4', 'llama3.3', 'qwen3.5', 'deepseek-r1', 'deepseek-v3',
    'phi4', 'mistral', 'kimi-k2', 'glm-5',
  ],
};

export const CUSTOM_ENDPOINT_DEFAULT = 'http://localhost:11434';

export const OLLAMA_ENDPOINT_DEFAULT = 'https://ollama.com/v1';

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
]);

export const DEFAULT_TEMPLATES = [
  {
    id: "understand-brief",
    name: "Brief",
    label: "Brief",
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
    id: "understand-audit",
    name: "SEO Audit",
    label: "SEO Audit",
    description: "Content gaps, structure, search visibility",
    category: "Understand",
    isDefault: false,
    prompt: `Audit this page for search visibility and content quality. Check these areas:

**Title & Meta**: Does the title tag exist, is it under 60 chars, does it contain the primary keyword naturally? Meta description — present, under 160 chars, compelling enough to click?

**Headings**: Single H1? Logical H2/H3 hierarchy? Keywords in headings without stuffing?

**Content Quality**: Thin content flags (under 300 words of body text)? Duplicate or boilerplate content? Readability — is it written for humans or search engines?

**Structure**: Internal links with descriptive anchor text? Broken or redirecting links? Images with alt text? Proper use of lists and tables for structured data?

**Technical Signals**: Schema markup opportunities missed? Canonical issues? Orphan pages (no internal links pointing to it)?

For each issue, give me:
1. **What's wrong** — specific, not "improve SEO"
2. **Why it matters** — the search signal it affects
3. **How to fix it** — one concrete action

Skip things that are already working well. Focus on real problems that affect ranking or click-through.

---

Source: [{title}]({url})

{content}`,
  },

  {
    id: "decide-decide",
    name: "Decide",
    label: "Decide",
    description: "Pick a side — options, trade-offs, verdict",
    category: "Decide",
    isDefault: true,
    prompt: `Pick a side. What's the best option and why?

If the content is creative (movie, book, album, game) — be a sharp critic. Love it or hate it, no middle ground. Use "I" statements. Mediocre means no. Back your take with specific details, not vague praise or generic criticism. End with VERDICT including a star rating (⭐ and ☆) and a score like 3.5/5.

If it's a choice between options — name the winner in two sentences, then explain the trade-off you're accepting. No hedging, no "it depends." End with VERDICT.

If it's a purchase or product — best pick, what trade-off you're accepting, and who should skip it. End with VERDICT.

Be specific. Use plain language. No filler, no hedging, no cliches. Avoid words like leverage, streamline, dive into, furthermore, moreover, crucial, essential. Short sentences. Active voice. Never start with "Based on the content" or "As a [role]."

---

{content}`,
  },

  {
    id: "decide-actions",
    name: "Actions",
    label: "Action Items",
    description: "Concrete tasks, owners, deadlines, blockers",
    category: "Decide",
    isDefault: false,
    prompt: `Extract every concrete action from this content. For each action, give me:

1. **What** — clear verb phrase (e.g. "Fix the login timeout", not "Look into login")
2. **Who** — the person or role responsible (infer if not explicit)
3. **When** — deadline or urgency (ASAP / this week / no deadline)
4. **Evidence** — short quote from the source that backs this action

Also flag real blockers and risks — things that would actually derail the work. Skip theoretical risks. Only include things that a reasonable person would add to their task list.

Be specific. Use plain language. No filler, no hedging, no cliches. Avoid words like leverage, streamline, crucial, essential. Short sentences. Active voice. Never start with "Based on the content provided" or "Here are the action items."

Number the list.

---

{content}`,
  },

  {
    id: "decide-briefing",
    name: "Strategy Briefing",
    label: "Strategy Briefing",
    description: "Stakeholder view — what matters, what to watch, what to decide",
    category: "Decide",
    isDefault: false,
    prompt: `Give me a strategy briefing on this content. I need three things:

**What matters** — the 2-3 points that should be on a decision-maker's radar. Not everything — just what moves the needle. Skip operational details that are below the strategic level.

**What to watch** — risks, dependencies, or market shifts that could change the picture. Only things that would materially affect a go/no-go decision or a budget allocation. Not "could potentially" — things that are actually brewing.

**What to decide** — the specific decision this content is asking for, or the decision it should trigger. If no decision is needed, say so directly.

Write for a busy executive who will skim this in 30 seconds. Be direct. No "it's important to note" or "stakeholders should consider." Name the thing, say why it matters, move on.

---

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
    id: "brief-template",
    name: "Brief Template",
    label: "Brief Template",
    description: "Project brief — goals, audience, constraints",
    category: "Brief",
    isDefault: false,
    prompt: `Create a project brief from this content. Give me:

**Goal**: The one-sentence outcome. What does done look like?

**Audience**: Who is this for? Be specific — "busy parents" beats "everyone".

**Constraints**: Budget, timeline, technical limits, compliance needs. Only real constraints, not nice-to-haves.

**Success criteria**: How do we know this worked? Measurable signals, not feelings.

**Risks**: What could actually derail this? Skip theoretical worries — only things that would keep you up at night.

Be specific. Use plain language. No filler. Short sentences. Active voice.

---

{content}`,
  },

  {
    id: "review-feedback",
    name: "Feedback",
    label: "Feedback",
    description: "Structured feedback — what works, what doesn't, how to fix",
    category: "Review",
    isDefault: false,
    prompt: `Give structured feedback on this work. Be honest and direct.

**What works**: Name 2-3 specific things that are working well. Point to concrete details, not vague praise.

**What doesn't**: Name 2-3 specific problems. Explain why each one matters — the actual impact, not just "it could be better."

**How to fix**: For each problem, give one concrete action. Not "consider revising" — actual moves like "cut paragraph 2" or "move the CTA above the fold."

Skip the sandwich approach. Don't soften criticism with fake praise. Be kind but clear.

Be specific. Use plain language. No filler. No "I think" or "in my opinion."

---

{content}`,
  },

  {
    id: "review-comparison",
    name: "Comparison",
    label: "Comparison",
    description: "Side-by-side comparison — features, trade-offs, recommendation",
    category: "Review",
    isDefault: false,
    prompt: `Compare these options side-by-side. Give me:

**Features**: What does each one actually do? List the capabilities that matter for this decision. Skip marketing fluff.

**Trade-offs**: What do you gain and lose with each option? Price vs. quality? Speed vs. durability? Name the actual tension.

**Who should pick which**: For each option, say who it's best for and who should skip it. Be specific — "freelancers on a budget" not "everyone."

**Recommendation**: Pick one. Say why in two sentences. No hedging.

Use a table if it helps. Be direct. No "it depends" unless there's genuinely no right answer.

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
    name: "Accessibility Audit",
    label: "Accessibility Audit",
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
    name: "Performance Audit",
    label: "Performance Audit",
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
