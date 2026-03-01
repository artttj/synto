# Synto

A Chrome extension that turns any web page into AI-ready structured content — directly in your sidebar.

Built for **engineers, PMs, and founders** who spend too much time manually copying content into AI chat windows.

No backend. No accounts. No tracking. Fully client-side.

---

## What It Does

Synto is not a summarizer. It is a **structured thinking layer** between raw web content and your AI of choice.

It extracts the meaningful content from any page, applies a prompt template, and lets you ask GPT, Gemini, or Grok about it — streamed directly in Chrome's side panel, with full follow-up conversation.

---

## Before / After

**Before:** You copy a 200-comment Jira ticket, paste it into ChatGPT, type "summarize this", and get a paragraph that tells you nothing actionable.

**After:** You open Synto, select "Ticket Analysis", click "Ask", and get:

```
## Summary
Auth service times out under load when Redis connection pool is exhausted.

## Problem Statement
Users hit 504s during peak hours. Root cause traced to connection pool limit of 10.

## Acceptance Criteria
- Pool size configurable via env var
- Graceful degradation when pool is full (queue, not fail)
- Load test at 500 RPS passes

## Risks & Edge Cases
- Increasing pool size may exhaust Redis server connections
- Queue depth needs a cap to avoid memory growth
- Existing tests mock Redis — need integration test

## Next Steps
1. @backend-team: spike connection pooling library options
2. @devops: get current Redis maxclients value
3. Add ticket to sprint for next Monday
```

---

## Templates

Templates are grouped by intent: **Understand** · **Decide** · **Act** · **Compose**. Each produces structured output with clear section headings.

### Understand — help me understand what is going on

| Template             | Purpose                                                              |
| -------------------- | -------------------------------------------------------------------- |
| **Structured Brief** | Topic, key points, conclusions, open questions                       |
| **Ticket Analysis**  | Summary, acceptance criteria, risks, next steps                      |
| **PR Review**        | Changes, concerns, approvals, status                                 |

### Decide — help me make a decision

| Template                       | Purpose                                              |
| ------------------------------ | ---------------------------------------------------- |
| **Decision Brief**             | Options, trade-offs, recommendation                  |
| **Feature Request Analysis**   | Problem, trade-offs, alternatives                    |

### Act — give me what I need to act

| Template              | Purpose                                              |
| --------------------- | ---------------------------------------------------- |
| **Extract Actions**   | Committed tasks, next steps, blockers                |
| **Risks & Blockers**  | Risks, blockers, assumptions                         |
| **Smart Choice**      | Options, trade-offs, quick verdict                   |

### Compose — help me respond

| Template              | Purpose                                              |
| --------------------- | ---------------------------------------------------- |
| **Draft Reply**       | Direct answer to a question or request               |
| **Rewrite Comment**   | Professional, constructive rewrite                   |
| **Email Helper**      | Short professional email draft                       |

All templates support `{content}`, `{selection}`, `{title}`, `{url}` placeholders. Custom templates can be created in Options.

---

## Workflow Examples

### Engineering: PR review in 30 seconds

1. Open a GitHub PR with 40+ review comments
2. Open Synto → select **PR Review**
3. Click **Ask**
4. Get a structured brief: what changed, who is blocking, what they want fixed
5. Ask follow-up questions directly in the panel

### Product: Jira ticket into a decision-ready brief

1. Open a Jira ticket with discussion
2. Open Synto → select **Ticket Analysis**
3. Click **Copy Markdown** → paste into your PM tool or share with team

### Decision: evaluate a feature request

1. Open the GitHub issue or internal doc
2. Open Synto → select **Feature Request Analysis**
3. Click **Ask** → get problem framing, trade-offs, and alternatives

---

## Features

### Smart Extraction

- Prioritizes semantic content: `<article>`, `<main>`, `[role=main]`, `#centerCol` (Amazon), `.js-discussion` (GitHub), `#issue-content` (Jira), `#pullrequest-diff` (Bitbucket), `.diff-files-holder` (GitLab)
- Strips navigation, footers, sidebars, cookie banners, ads, and floating widgets
- If you **select text** before opening the panel, that selection is used as content — use `{selection}` in templates
- Converts HTML to clean, normalised Markdown via [Turndown](https://github.com/mixmark-io/turndown) + GFM tables/code blocks
- Diff tables (Bitbucket, GitLab) are converted to readable `<pre>` blocks before conversion

### Side Panel

- Lives in Chrome's native sidebar — stays open as you navigate
- No tab switching, no lost conversation
- Resizable by dragging

### AI Conversation

- Ask ChatGPT (`gpt-4o-mini`), Gemini (`gemini-2.0-flash`), or Grok (`grok-3-mini`)
- Streamed responses rendered directly in the panel
- Full follow-up conversation with context preserved

### Preview

- **Content tab** — shows the extracted Markdown before any template is applied
- **Prompt tab** — shows the final prompt with template merged in
- Token count badge with colour coding (muted → yellow → red as you approach limits)

### Keyboard Shortcuts

- `⌥⇧C` — open Synto side panel; when focused, copies the preview content to clipboard
- `⌥⇧↩` — trigger Ask AI (when panel is focused)

---

## Privacy & Data

API keys are stored in `chrome.storage.local` — device-only, never synced, never sent anywhere by this extension.

When you use **Ask**, page content is transmitted directly from your browser to the selected provider. Synto has no visibility into this. You are responsible for ensuring any content you send complies with GDPR, CCPA, or other applicable regulations.

Provider privacy policies: [OpenAI](https://openai.com/policies/privacy-policy/) · [Google AI](https://ai.google.dev/gemini-api/terms) · [xAI](https://x.ai/legal/privacy-policy/)

---

## Setup

1. Clone or download this repository
2. Install and build: `npm install && npm run build`
3. Open `chrome://extensions` → enable **Developer mode**
4. Click **Load unpacked** → choose the `dist/` folder (inside this repo)
5. Use the Synto icon to open the side panel; open **Options** (gear) to add an API key

### API Keys

| Provider      | Model              | Where to get a key                                                                  |
| ------------- | ------------------ | ----------------------------------------------------------------------------------- |
| OpenAI        | `gpt-4o-mini`      | [platform.openai.com](https://platform.openai.com/api-keys)                         |
| Google Gemini | `gemini-2.0-flash` | [aistudio.google.com](https://aistudio.google.com/app/apikey) (free tier available) |
| Grok (xAI)    | `grok-3-mini`      | [console.x.ai](https://console.x.ai/)                                               |

---

## Project Structure

**Best-practice layout:** all source lives in `src/`; `npm run build` produces `dist/`. You load `dist/` in Chrome (Load unpacked). The repo root stays source + tooling only; the extension artifact is only in `dist/`.

```
synto/
├── manifest.json         # Manifest (copied into dist/)
├── package.json          # Dependencies & scripts
├── src/                  # Source — edit only here
│   ├── background/       # Service worker
│   ├── content/          # Content script (bundled to dist/content/content.js)
│   ├── popup/            # Side panel UI
│   ├── options/          # Options page
│   ├── shared/           # constants.ts, storage.ts
│   └── types/            # Type declarations
├── scripts/build.js      # Build: src/ + icons/ → dist/
├── icons/                # Extension icons
└── dist/                 # Built extension — load this folder in Chrome
```

---

## Design Constraints

- **No backend** — all processing is in-browser
- **No user accounts** — no registration, no login
- **No tracking** — no analytics, no telemetry
- **ES modules + single build step** — `npm run build` bundles the content script and copies assets to `dist/`
- **Manifest V3** — service worker, side panel API

---

## License

MIT — free to use, modify, and redistribute. Attribution required: the original copyright notice must be included in all copies or substantial portions. See [LICENSE](LICENSE) for details.
