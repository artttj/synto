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

**After:** You open Synto, select "Ticket Analysis", click "Ask ChatGPT", and get:

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

Templates are grouped by use case. Each produces structured output with clear section headings.

### General
| Template | Purpose |
|---|---|
| **Clean Copy** | Raw markdown extraction, no template applied |
| **Structured Brief** | Problem → Arguments → Decisions → Open Questions → Risks |
| **Article Analysis** | Thesis, key points, evidence, conclusions, critical take |

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
2. Open Synto → select **PR Review Summary**
3. Click **Ask ChatGPT**
4. Get a structured brief: what changed, who is blocking, what they want fixed
5. Ask follow-up questions directly in the panel

### Product: Jira ticket into a decision-ready brief
1. Open a Jira ticket with discussion
2. Open Synto → select **Ticket Analysis**
3. Click **Copy Markdown** → paste into your PM tool or share with team

### Community: Map a Reddit debate
1. Expand comments on a Reddit thread
2. Open Synto → select **Debate Map**
3. Click **Ask ChatGPT**
4. Get: central question, sides, strongest arguments, common ground

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
- Ask ChatGPT (gpt-4o-mini), Gemini (gemini-2.0-flash), or Grok (grok-3-mini)
- Streamed responses rendered directly in the panel
- Full follow-up conversation with context preserved

### Preview
- **Content tab** — shows the extracted Markdown before any template is applied
- **Prompt tab** — shows the final prompt with template merged in
- Token count badge with colour coding (muted → yellow → red as you approach limits)

### Token Estimate
Estimates token count and warns when approaching the selected model's context limit.

### Keyboard Shortcuts
- `Alt+Shift+C` — copy current tab content
- `Alt+Shift+Enter` — trigger Ask AI

---

## Privacy & Data

API keys are stored in `chrome.storage.local` — device-only, never synced, never sent anywhere by this extension.

When you use **Ask ChatGPT**, **Ask Gemini**, or **Ask Grok**, page content is transmitted directly from your browser to the selected provider. Synto has no visibility into this. You are responsible for ensuring any content you send complies with GDPR, CCPA, or other applicable regulations.

Provider privacy policies: [OpenAI](https://openai.com/policies/privacy-policy/) · [Google AI](https://ai.google.dev/gemini-api/terms) · [xAI](https://x.ai/legal/privacy-policy/)

---

## Setup

1. Clone or download this repository
2. Open `chrome://extensions`
3. Enable **Developer mode**
4. Click **Load unpacked** → select the project folder
5. Click the Synto icon in the toolbar to open the side panel
6. Open **Options** (gear icon) and add your API key for your preferred provider

### API Keys
| Provider | Model | Where to get a key |
|---|---|---|
| OpenAI | `gpt-4o-mini` | [platform.openai.com](https://platform.openai.com/api-keys) |
| Google Gemini | `gemini-2.0-flash` | [aistudio.google.com](https://aistudio.google.com/app/apikey) (free tier available) |
| Grok (xAI) | `grok-3-mini` | [console.x.ai](https://console.x.ai/) |

---

## Project Structure

```
synto/
├── manifest.json
├── background/
│   └── service-worker.js       # Seeds default templates, registers side panel behaviour
├── content/
│   └── content.js              # Extraction pipeline (selection → smart extract → Turndown)
├── popup/
│   ├── popup.html              # Side panel UI
│   ├── popup.css
│   └── popup.js                # Main UI logic, streaming, conversation history
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
- **Manifest V3** — service worker, side panel API
