export const MSG = {
  EXTRACT_CONTENT: "EXTRACT_CONTENT",
  COPY_TO_CLIPBOARD: "COPY_TO_CLIPBOARD",
  GET_TEMPLATES: "GET_TEMPLATES",
  SAVE_TEMPLATES: "SAVE_TEMPLATES",
};

export const STORAGE_KEYS = {
  TEMPLATES: "apc_templates",
  SETTINGS:  "apc_settings",
  OPENAI_KEY: "apc_openai_key",
  GROK_KEY:   "apc_grok_key",
  GEMINI_KEY: "apc_gemini_key",
};

export const TEMPLATE_CATEGORIES = ["General", "Engineering", "Product", "Community"];

export const DEFAULT_TEMPLATES = [

  // ── General ────────────────────────────────────────────────────────────────

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
    id: "default-article-analysis",
    name: "Article Analysis",
    category: "General",
    isDefault: false,
    prompt: `Analyze the following article and produce a structured breakdown. No preamble — start with the first heading.

## Main Thesis
One sentence.

## Key Points
3–5 bullet points covering the core claims or findings.

## Evidence & Sources
What data, research, or examples does the author cite?

## Conclusions
What does the author recommend or conclude?

## Critical Take
What is missing, overstated, or worth questioning?

---

Source: [{title}]({url})

{content}`,
  },

  {
    id: "default-diet-menu",
    name: "Dietetic Menu",
    category: "General",
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

  // ── Engineering ────────────────────────────────────────────────────────────

  {
    id: "eng-decision-brief",
    name: "Decision Brief",
    category: "Engineering",
    isDefault: false,
    prompt: `Produce a decision brief from this technical discussion. No preamble — start with the first heading.

## Context
What problem or situation triggered this discussion?

## Options Considered
List each proposal or approach raised, one bullet per option with a one-line description.

## Arguments For / Against
For the top two options, summarize the strongest arguments on each side.

## Decision
What was decided, merged, or closed? Who made the call?

## Rationale
Why was this option chosen over the others?

## Consequences & Trade-offs
What is being accepted, deferred, or sacrificed?

## Open Items
What was left unresolved or needs follow-up?

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

  // ── Product ────────────────────────────────────────────────────────────────

  {
    id: "product-feature-analysis",
    name: "Feature Request Analysis",
    category: "Product",
    isDefault: false,
    prompt: `Analyze this feature request or product discussion. No preamble.

## What Is Being Asked For
What is the user or stakeholder requesting? (one paragraph)

## The Real Problem
What underlying need or frustration is driving this request?

## Who Is Affected
Which user segments or personas are impacted?

## Proposed Solutions
What solutions were suggested in the discussion?

## Trade-offs
What are the costs, risks, or downsides of building this?

## Alternatives
What workarounds or alternative approaches exist?

## Priority Signals
Any data points, urgency signals, or business justifications mentioned?

---

Source: [{title}]({url})

{content}`,
  },

  {
    id: "product-user-feedback",
    name: "User Feedback Synthesis",
    category: "Product",
    isDefault: false,
    prompt: `Synthesize user feedback from this thread into a structured report. No preamble.

## Dominant Themes
The top 3–5 recurring topics or complaints. Bullet points.

## Sentiment Breakdown
Overall tone: positive / negative / mixed? Approximate ratio.

## Specific Pain Points
Concrete problems users describe, with brief representative quotes where possible.

## Feature Requests
Explicit asks or suggestions from users.

## Praise & Strengths
What users value or appreciate.

## Recommended Actions
Based on this feedback, the 3 highest-priority things to address.

---

Source: [{title}]({url})

{content}`,
  },

  // ── Community ──────────────────────────────────────────────────────────────

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
    "gpt-4o-mini":        128000,
    "gemini-2.0-flash": 1048576,
    "grok-3-mini":        131072,
  },
};

/**
 * Rough token estimate: ~4 characters per token.
 * @param {string} text
 * @returns {number}
 */
export function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

/**
 * Returns a CSS color class based on token count.
 * @param {number} tokens
 * @returns {"green"|"yellow"|"red"}
 */
export function tokenColorClass(tokens) {
  if (tokens < TOKEN_THRESHOLDS.GREEN)  return "green";
  if (tokens < TOKEN_THRESHOLDS.YELLOW) return "yellow";
  return "red";
}
