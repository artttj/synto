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

export const TEMPLATE_CATEGORIES = ['General', 'Engineering', 'Community', 'Lifestyle'];

export const DEFAULT_TEMPLATES = [

  {
    id: "default-clean",
    name: "Clean Copy",
    category: "General",
    isDefault: true,
    prompt: "{content}",
  },

  {
    id: "default-structured-brief",
    name: "Structured Brief",
    category: "General",
    isDefault: true,
    prompt: `Analyze the following and produce a structured brief. Use exactly these section headings. Be concise and factual — no padding, no preamble, no meta-commentary.

## Problem
What is being discussed, requested, or reported?

## Key Arguments
What are the main positions, proposals, or points raised? Bullet points only.

## Decisions Made
What was agreed, merged, closed, or resolved? If none, write "None yet."

## Open Questions
What remains unanswered, blocked, or under debate?

## Risks / Unknowns
What could go wrong? What assumptions are being made?

---

Source: [{title}]({url})

{content}`,
  },

  {
    id: "eng-pr-review",
    name: "PR Review Summary",
    category: "Engineering",
    isDefault: false,
    prompt: `Summarize this pull request discussion as a structured review brief. No preamble.

## What This PR Does
One paragraph: purpose, scope, approach.

## Requested Changes
Bullet list of explicit change requests from reviewers. Be specific — include file names or function names where mentioned.

## Concerns Raised
Bullet list of concerns, questions, or objections that were not explicit change requests.

## Approvals & Blockers
Who approved? Who is blocking and why?

## Key Technical Decisions
Any architectural or implementation choices debated in the review.

## Status
Open / Merged / Closed. Any conditions remaining before merge?

---

Source: [{title}]({url})

{content}`,
  },

  {
    id: "eng-ticket-analysis",
    name: "Ticket Analysis",
    category: "Engineering",
    isDefault: false,
    prompt: `Analyze this ticket and produce a structured implementation brief. No preamble.

## Summary
What is being requested or reported? (one sentence)

## Problem Statement
What user pain, system failure, or goal does this address?

## Acceptance Criteria
List the explicit or implied conditions for this ticket to be "done."

## Risks & Edge Cases
What could break? What inputs or states need special handling?

## Dependencies
Blockers, related tickets, external systems, or teams involved.

## Suggested Approach
If the discussion includes implementation hints, summarize them.

## Next Steps
What should happen immediately after reading this?

---

Ticket: [{title}]({url})

{content}`,
  },

  {
    id: "eng-action-items",
    name: "Extract Action Items",
    category: "Engineering",
    isDefault: false,
    prompt: `Extract all action items, tasks, and commitments from this discussion. No preamble.

## Committed Actions
Tasks explicitly assigned or agreed upon.
- [ ] Action (Owner if mentioned)

## Implied Next Steps
Things that logically need to happen but were not explicitly assigned.

## Blockers
Items that are blocked and what they are waiting on.

## Decisions Needed
Unresolved questions that require a decision before work can proceed.

---

Source: [{title}]({url})

{content}`,
  },

  {
    id: "community-debate-map",
    name: "Debate Map",
    category: "Community",
    isDefault: false,
    prompt: `Map the debate in this discussion thread. No preamble.

## Central Question
What is the core disagreement or topic being debated?

## Position A
What is the first major position? Who holds it?

## Position B
What is the opposing or alternative position? Who holds it?

## Additional Positions
Any minority views, nuanced takes, or third options.

## Strongest Arguments
The single best argument made for each major side (one bullet per side).

## Weakest Arguments / Fallacies
Weak reasoning, strawmen, or logical errors in the discussion.

## Common Ground
What do all sides agree on?

## Current Status
Is there a resolution, or is the debate ongoing?

---

Source: [{title}]({url})

{content}`,
  },

  {
    id: "lifestyle-diet-menu",
    name: "Dietetic Menu",
    category: "Lifestyle",
    isDefault: false,
    prompt: `You are a nutrition expert. Based on the restaurant menu below, suggest exactly 3 dishes for a dietetic meal (e.g. starter, main, dessert — or 3 mains if that fits better).

Requirements:
- Low carb: under 30g net carbs per dish
- Low fat: under 15g fat per dish
- High protein where possible
- Only suggest dishes actually listed on the menu

For each dish provide:
| Dish | Est. calories | Carbs | Fat | Protein |
|------|--------------|-------|-----|---------|

Then add a one-line note on why this combination works dietetically.

---

{content}`,
  },

  {
    id: "lifestyle-recipe-card",
    name: "Recipe Card",
    category: "Lifestyle",
    isDefault: false,
    prompt: `Extract and format this recipe as a clean, printable card. No preamble.

## {title}

**Prep time / Cook time / Servings** — fill from the page if available.

## Ingredients
Bullet list. Group by section (e.g. Sauce, Dough) if the recipe does.

## Instructions
Numbered steps. Keep each step to one action. Trim filler text.

## Notes & Tips
Any substitutions, storage advice, or variations mentioned.

---

{content}`,
  },

  {
    id: "lifestyle-buy-decision",
    name: "Buy Decision",
    category: "Lifestyle",
    isDefault: false,
    prompt: `Help me decide whether to buy this product. Analyze the page and any reviews. No preamble.

## What It Is
One sentence: product name, category, price if listed.

## Top Pros
The 3–5 strongest reasons to buy, drawn from the description and reviews.

## Top Cons
The 3–5 most common complaints or weaknesses from reviews.

## Who It's For
What type of user or use case is this best suited for?

## Red Flags
Any quality issues, misleading claims, or recurring problems worth knowing.

## Verdict
Buy / Skip / Wait for better price — with a one-sentence reason.

---

{content}`,
  },

  {
    id: "community-rewrite-comment",
    name: "Rewrite Comment",
    category: "Community",
    isDefault: false,
    prompt: `Rewrite the following comment to be clearer, more professional, and constructive. Keep the core message intact but improve tone, clarity, and structure. Return only the rewritten comment, nothing else.

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
