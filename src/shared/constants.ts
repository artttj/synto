/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */

export const MSG = {
  EXTRACT_CONTENT: 'EXTRACT_CONTENT',
  COPY_TO_CLIPBOARD: 'COPY_TO_CLIPBOARD',
  GET_TEMPLATES: 'GET_TEMPLATES',
  SAVE_TEMPLATES: 'SAVE_TEMPLATES',
};

export const STORAGE_KEYS = {
  TEMPLATES: 'apc_templates',
  SETTINGS:  'apc_settings',
  OPENAI_KEY: 'apc_openai_key',
  GROK_KEY:   'apc_grok_key',
  GEMINI_KEY: 'apc_gemini_key',
};

export const TEMPLATE_CATEGORIES = ['Understand', 'Decide', 'Act', 'Compose'];

export const DEPRECATED_TEMPLATE_IDS = new Set([
  'default-structured-brief',
  'analyze-article',
  'community-debate-map',
  'default-clean',
  'extract-key-questions',
  'lifestyle-recipe-card',
  'lifestyle-buy-decision',
]);

export const DEFAULT_TEMPLATES = [
  {
    id: "eng-ticket-analysis",
    name: "Ticket Analysis",
    label: "Ticket",
    description: "Summary, criteria, risks, next steps",
    category: "Understand",
    isDefault: false,
    prompt: `You are a senior product engineer. Analyze ONLY the ticket below — do not invent information. Produce a developer-ready implementation brief.

Output ONLY the following markdown structure — nothing before or after:

## Summary
One crisp sentence: what is requested and why it matters.

## Goals
- 1–3 must-achieve outcomes

## Acceptance Criteria
1. Numbered, specific, testable conditions

## Technical Approach
High-level plan: steps, affected modules/APIs/DB changes, external dependencies.

## Tasks
- Task · Role (dev/qa/ux) · Estimate (S/M/L/XL) · Dependencies

## Risks & Mitigations
- Risk → mitigation (top 3 only)

## Open Questions
- Clarifications needed from author or stakeholders

## Priority
Low / Medium / High / Critical — one-sentence rationale

---

Ticket: [{title}]({url})

{content}`,
  },

  {
    id: "eng-pr-review",
    name: "PR Review",
    label: "Code Review",
    description: "Changes, concerns, approvals, status",
    category: "Understand",
    isDefault: false,
    prompt: `You are an elite code reviewer. Analyze ONLY the PR content below. Produce a concise, actionable review brief.

Output ONLY this exact markdown structure — nothing before or after:

## Summary
One paragraph: what the PR actually does and its intent.

## Impacted Areas
- Key files / modules / systems changed

## Findings

**Bugs / Logic**
- Issue · Severity (critical/high/medium/low) · Suggested fix

**Security / Performance**
- Issue · Severity · Suggested fix

**Tests / Coverage**
- Issue · Severity · Suggested fix

**Style / Maintainability**
- Issue · Severity · Suggested fix

## Test Recommendations
- What needs verification, missing test cases, quick smoke steps

## Verdict
Approve as-is / Approve with changes / Major rework needed / Reject — one-sentence reason.

## Post-Merge Follow-ups
- Optional cleanups / tech-debt items

---

Source: [{title}]({url})

{content}`,
  },

  {
    id: "understand-structured-brief",
    name: "Structured Brief",
    label: "Brief",
    description: "Topic, key points, conclusions, open questions",
    category: "Understand",
    isDefault: true,
    prompt: `You are a senior content analyst. Create a tight briefing from ONLY the source below. Do not add external facts.

Output ONLY this structure — nothing before or after:

## TL;DR
One powerful sentence summary.

## Audience
Who this is written for (persona, role, experience level).

## Key Takeaways
- 3–5 sharp, memorable bullets

## Evidence & Context
- 3–5 strongest claims, quotes, or data points from the source

## Conclusions
What was resolved, concluded, or recommended? Write "None yet" if unclear.

## Open Questions
What remains unclear, unresolved, or worth challenging?

---

Source: [{title}]({url})

{content}`,
  },

  {
    id: "decide-brief",
    name: "Decision Brief",
    label: "Decision",
    description: "Options, trade-offs, recommendation",
    category: "Decide",
    isDefault: false,
    prompt: `Analyze the content and help make a decision. Nothing before or after the structure below.

If there are multiple options to compare:

## Context
2–3 sentences of background.

## Options

**[Option A]**
- Pros
- Cons

**[Option B]**
- Pros
- Cons

## Criteria
- Criterion (weight if useful)
(3–5 that matter for this choice)

## Recommendation
Best option + 2-sentence reason.

If it's a single item or personal decision (movie, place, product, event):

## What it is
One sentence.

## Pros
3–4 bullet points.

## Cons
2–3 bullet points.

## Verdict
⭐⭐⭐⭐☆ (4/5) — Go for it or skip — and why in one sentence.

---

{content}`,
  },

  {
    id: "decide-feature-request",
    name: "Feature Request Analysis",
    label: "Feature",
    description: "Problem, trade-offs, alternatives",
    category: "Decide",
    isDefault: false,
    prompt: `You are a senior product engineer specializing in requirements distillation. Analyze ONLY the feature request below.

Output ONLY this structure — nothing before or after:

## Core Problem
One sentence: the real user pain or goal.

## User Stories
- As a [role], I want [feature] so that [benefit]
(3–4 stories)

## Acceptance Criteria
1. Numbered, testable conditions

## Edge Cases & Non-Functional
- Important boundaries, performance, security, accessibility needs

## MVP Scope
- In: …
- Out / Later: …

## Effort Sketch
Frontend: S / M / L
Backend: S / M / L
Infra / Other: S / M / L

---

Source: [{title}]({url})

{content}`,
  },

  {
    id: "eng-action-items",
    name: "Extract Actions",
    label: "Actions",
    description: "Actions, next steps, blockers",
    category: "Act",
    isDefault: false,
    prompt: `Extract every concrete action item from the content below. Output ONLY a numbered list — no introduction, no extra sentences.

Format each item:
1. **Action**: clear verb phrase
   **Owner**: role or person (infer if not explicit)
   **Due**: date / ASAP / none
   **Priority**: High / Medium / Low
   **Evidence**: short quote supporting this action

---

Source: [{title}]({url})

{content}`,
  },

  {
    id: "extract-risks-blockers",
    name: "Risks & Blockers",
    label: "Risks",
    description: "Risks, blockers, assumptions",
    category: "Act",
    isDefault: false,
    prompt: `Identify the most important risks and blockers from the content below. Output ONLY up to 8 items in this exact format — nothing else:

- **Title**: short name
  **Description**: 1–2 sentences
  **Likelihood**: Low / Medium / High
  **Impact**: Low / Medium / High / Critical
  **Mitigation**: concrete next step
  **Owner**: who should handle this
  **Escalation**: if stalled after 3 days → who / how

---

Source: [{title}]({url})

{content}`,
  },

  {
    id: "lifestyle-smart-choice",
    name: "Smart Choice",
    label: "Recommend",
    description: "Options, trade-offs, quick verdict",
    category: "Act",
    isDefault: false,
    prompt: `Analyze the content and give a clear recommendation. Nothing before or after the structure below.

If there are multiple options to compare:

## Criteria (total weight 100)
- Criterion – weight %
(3–5 criteria that matter for this choice)

## Scorecard
| Option | Crit 1 | Crit 2 | Crit 3 | Total (weighted) |
|--------|--------|--------|--------|------------------|

## Pick
[Best option] — 1–2 sentences on why it wins.

If it's a single item to evaluate:

## What it is
One sentence.

## Best for
Who or what situation it fits.

## Verdict
⭐⭐⭐⭐☆ (4/5) — Worth it or not — and why in one sentence.

---

{content}`,
  },

  {
    id: "write-compose-answer",
    name: "Draft Reply",
    label: "Reply",
    description: "Direct reply to a question or request",
    category: "Compose",
    isDefault: false,
    prompt: `Draft a short, professional-yet-friendly reply for Slack or email based ONLY on the context below. Max 5–6 sentences.

Output ONLY the reply body text — no labels, no extras.

Structure: Start with an acknowledgment. Then give a direct answer or next step. Then a clear call-to-action (action + owner + due if relevant). End with a warm close.

---

{content}`,
  },

  {
    id: "community-rewrite-comment",
    name: "Rewrite Comment",
    label: "Rewrite",
    description: "Professional, constructive rewrite",
    category: "Compose",
    isDefault: false,
    prompt: `Rewrite the comment below to be professional, concise, and constructive while keeping the original meaning intact.

Output ONLY:

**Variant A – Short & direct**
(1–2 sentences)

**Variant B – Collaborative tone**
(2–4 sentences, warmer)

---

{content}`,
  },

  {
    id: "write-email-helper",
    name: "Email Helper",
    label: "Email",
    description: "Short professional email draft",
    category: "Compose",
    isDefault: false,
    prompt: `Write a professional, friendly email using ONLY the context below.

Output ONLY these four blocks — nothing before or after:

**Subject**
[6–10 words]

**Body**
(120–180 words, natural tone)

**Sign-off choices**
1. Best regards, [Name]
2. Thanks & best, [Name]
3. Looking forward, [Name]

**Meeting proposals** (if scheduling is needed, next 1–2 business days)
- [Day, time]
- [Alternative day, time]

---

{content}`,
  },

];

export const TOKEN_THRESHOLDS = {
  GREEN:  4000,
  YELLOW: 16000,
  MODEL_LIMITS: {
    'gpt-4o-mini':        128000,
    'gemini-2.0-flash': 1048576,
    'grok-3-mini':        131072,
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
