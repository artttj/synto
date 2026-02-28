# AI Page Clipper

A Chrome extension that turns any web page into structured, AI-ready analysis in seconds.

Built for **engineers, PMs, and founders** who spend too much time manually copying content into AI chat windows and reformatting the output.

No backend. No accounts. No tracking. Fully client-side.

---

## What It Does

AI Page Clipper is not a summarizer. It is a **structured thinking layer** between raw web content and your AI of choice.

It extracts the meaningful content from a page, applies an opinionated structured template, and sends it directly to ChatGPT, Gemini, or Grok — producing output organized around decisions, arguments, risks, and next steps rather than a paragraph summary.

---

## Before / After

**Before:** You copy a 200-comment Jira ticket, paste it into ChatGPT, type "summarize this", and get a paragraph that tells you nothing actionable.

**After:** You open AI Page Clipper, select "Ticket Analysis", click "Run with ChatGPT", and get:

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

## Dependencies
- Redis 6.2+ required for client-side tracking
- DevOps must update production Redis maxclients config

## Next Steps
1. @backend-team: spike connection pooling library options
2. @devops: get current Redis maxclients value
3. Add ticket to sprint for next Monday
```

---

## Templates

Templates are grouped by use case. Each produces structured output with clear section headings.

### General
| Template | Purpose |
|---|---|
| **Clean Copy** | Raw markdown extraction, no template applied |
| **Structured Brief** | Default. Problem → Arguments → Decisions → Open Questions → Risks |
| **Article Analysis** | Thesis, key points, evidence, conclusions, critical take |
| **Dietetic Menu** | Nutrition-optimized dish selection from restaurant menus |

### Engineering
| Template | Purpose |
|---|---|
| **Decision Brief** | Context → Options → Arguments → Decision → Rationale → Trade-offs |
| **PR Review Summary** | What it does, requested changes, concerns, blockers, status |
| **Ticket Analysis** | Summary, problem statement, acceptance criteria, risks, next steps |
| **Extract Action Items** | Committed tasks, implied next steps, blockers, decisions needed |

### Product
| Template | Purpose |
|---|---|
| **Feature Request Analysis** | The real problem, who's affected, trade-offs, alternatives, priority signals |
| **User Feedback Synthesis** | Dominant themes, sentiment, pain points, feature requests, recommended actions |

### Community
| Template | Purpose |
|---|---|
| **Debate Map** | Central question, positions A/B, strongest arguments, common ground, status |
| **Rewrite Comment** | Rewrites a comment to be clearer and more professional |

All templates support `{content}`, `{selection}`, `{title}`, `{url}` placeholders. Custom templates can be created in Options.

---

## Workflow Examples

### Engineering: PR review in 30 seconds
1. Open a GitHub PR with 40+ review comments
2. Open AI Page Clipper → select **PR Review Summary**
3. Click **Run with ChatGPT**
4. Get a structured brief: what changed, who is blocking, what they want fixed

### Product: Jira ticket into a decision-ready brief
1. Open a Jira ticket with discussion
2. Open AI Page Clipper → select **Ticket Analysis**
3. Click **Copy Prompt** → paste into your PM tool or share with team

### Community: Map a Reddit debate
1. Expand comments on a Reddit thread
2. Open AI Page Clipper → select **Debate Map**
3. Click **Run with ChatGPT**
4. Get: central question, sides, strongest arguments, common ground

### Multi-source: Compare two approaches
1. Open 3 browser tabs with competing approaches (blog posts, issues, docs)
2. Open AI Page Clipper → enable **Merge tabs**
3. Select the tabs you want, choose **Decision Brief**
4. Run — the merged content includes all sources with clear separation

---

## Features

### Smart Extraction
- Prioritizes semantic content: `<article>`, `<main>`, `[role=main]`, `#centerCol` (Amazon), `.js-discussion` (GitHub), `#issue-content` (Jira)
- Strips navigation, footers, sidebars, cookie banners, ads, Amazon carousels, floating widgets
- If you **select text** before opening the popup, selection is extracted as content — use `{selection}` in templates
- Converts HTML to clean, normalized Markdown via [Turndown](https://github.com/mixmark-io/turndown) + GFM tables/code

### Source References
Enable the **Source refs** toggle to prepend `@author:` labels to comment threads before extraction. The AI can then reference authors by name in its output:

> _"@alex raised concerns about the connection pool size. @maintainer confirmed this is the root cause (#12)."_

### Multi-Tab Merge
Enable **Merge tabs** to combine content from multiple open tabs into a single prompt. Each source is clearly labeled:

```
## Source 1: GitHub Issue #1234

## Source 2: Notion Doc — Architecture Decision Record

## Source 3: Stack Overflow — Redis connection pooling
```

Use with the **Decision Brief** or **Debate Map** templates for cross-source synthesis.

### Three Actions
- **Copy Markdown** — raw extracted content, no template
- **Copy Prompt** — full template with content filled in, ready to paste anywhere
- **Run with ChatGPT / Gemini / Grok** — streams the response directly in the popup

### Token Estimate
Color-coded token estimate (green < 4k / yellow < 16k / red 16k+) with a warning when approaching your selected model's limit.

### Keyboard Shortcuts
- `Alt+Shift+C` — open popup / copy prompt (within popup)
- `Alt+Shift+Enter` — run template (within popup)

---

## Setup

1. Clone or download this repository
2. Open `chrome://extensions`
3. Enable **Developer mode**
4. Click **Load unpacked** → select the project folder
5. Open **Options** (gear icon) and add your API key for your preferred provider

### API Keys
| Provider | Model | Where to get a key |
|---|---|---|
| OpenAI | `gpt-4o-mini` | platform.openai.com |
| Google Gemini | `gemini-2.0-flash` | aistudio.google.com (free tier available) |
| Grok (xAI) | `grok-3-mini` | console.x.ai |

Keys are stored in `chrome.storage.local` — device-only, never synced, never sent anywhere except the selected provider's API endpoint.

---

## Project Structure

```
ai-page-clipper/
├── manifest.json
├── background/
│   └── service-worker.js       # Seeds default templates on install
├── content/
│   └── content.js              # Extraction pipeline (selection → smart extract → Turndown)
├── popup/
│   ├── popup.html
│   ├── popup.css
│   └── popup.js                # Main UI, streaming, merge mode
├── options/
│   ├── options.html
│   ├── options.css
│   └── options.js              # Settings, API keys, template CRUD
├── shared/
│   ├── constants.js            # Templates, storage keys, token thresholds
│   └── storage.js              # Typed storage helpers
└── lib/
    ├── turndown.js
    └── turndown-plugin-gfm.js
```

---

## Design Constraints

- **No backend** — all processing is in-browser
- **No user accounts** — no registration, no login
- **No tracking** — no analytics, no telemetry
- **Vanilla JS only** — no build step, no bundler, no framework
- **Manifest V3** — uses service worker, not background page

---

## Success Criteria

- A 50-comment Jira ticket → structured decision brief in under 10 seconds
- A 200-reply Reddit thread → clear debate map with positions and strongest arguments
- A GitHub PR discussion → requested changes list with file and function references
- It feels like a thinking assistant, not a copy utility
- It is meaningfully faster than manually copying content into an AI chat window
