export const MSG = {
  EXTRACT_CONTENT: "EXTRACT_CONTENT",
  COPY_TO_CLIPBOARD: "COPY_TO_CLIPBOARD",
  GET_TEMPLATES: "GET_TEMPLATES",
  SAVE_TEMPLATES: "SAVE_TEMPLATES",
};

export const STORAGE_KEYS = {
  TEMPLATES: "apc_templates",
  SETTINGS: "apc_settings",
  OPENAI_KEY: "apc_openai_key",
  GROK_KEY: "apc_grok_key",
  GEMINI_KEY: "apc_gemini_key",
};

export const DEFAULT_TEMPLATES = [
  {
    id: "default-clean",
    name: "Clean Copy",
    prompt: "{content}",
    isDefault: true,
  },
  {
    id: "default-rewrite-comment",
    name: "Rewrite Comment",
    prompt: `Rewrite the following comment to be clearer, more professional, and constructive. Keep the core message intact but improve tone, clarity, and structure. Return only the rewritten comment, nothing else.

---

{content}`,
    isDefault: false,
  },
  {
    id: "default-summarize-thread",
    name: "Summarize Thread",
    prompt: `Summarize this discussion thread. Structure your response as:

**TL;DR** (1–2 sentences)

**What was decided or resolved:**
(bullet points)

**Open questions or next steps:**
(bullet points)

**Key participants and their positions** (if relevant):
(bullet points)

---

{content}`,
    isDefault: false,
  },
  {
    id: "default-ticket-analysis",
    name: "Ticket Analysis",
    prompt: `Analyze this ticket and provide a structured breakdown:

**Summary**: What is being requested or reported?

**Problem / Goal**: What problem does this solve or what outcome is expected?

**Risks & Edge Cases**: What could go wrong? What edge cases should be considered?

**Dependencies**: Are there blockers, related tickets, or external dependencies?

**Suggested Next Steps**: What should happen next?

Ticket: [{title}]({url})

---

{content}`,
    isDefault: false,
  },
  {
    id: "default-llm-summary",
    name: "Article Analysis",
    prompt: `Analyze the following and provide:

1. **Main Thesis**: One sentence summary.
2. **Key Points**: 3–5 bullet points.
3. **Conclusions**: Takeaways or recommendations.

Source: [{title}]({url})

---

{content}`,
    isDefault: false,
  },
  {
    id: "default-diet-menu",
    name: "Dietetic Menu",
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
    isDefault: false,
  },
];

export const TOKEN_THRESHOLDS = {
  GREEN: 4000,
  YELLOW: 16000,
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
  if (tokens < TOKEN_THRESHOLDS.GREEN) return "green";
  if (tokens < TOKEN_THRESHOLDS.YELLOW) return "yellow";
  return "red";
}
