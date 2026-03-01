# <img src="docs/icon128.png" width="36" alt="" valign="middle" /> Synto

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge)](LICENSE) ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![Google Chrome](https://img.shields.io/badge/Google%20Chrome-4285F4?style=for-the-badge&logo=GoogleChrome&logoColor=white)

Clip any web page to clean Markdown, pick a prompt template, and ask ChatGPT, Gemini, or Grok — all from a Chrome side panel. Works on Jira, GitHub, Reddit, Amazon, and any page you can open. No backend. No accounts. API keys stay on your device.

<table>
  <tr>
    <td width="50%" align="center"><img src="docs/synto_1.png" alt="Clip any page to Markdown" width="100%" /><br/><sub><b>Clip any page to Markdown and paste into Claude, ChatGPT, or any AI tool</b></sub></td>
    <td width="50%" align="center"><img src="docs/synto_2.png" alt="Best pick from Amazon listings" width="100%" /><br/><sub><b>Or ask right in the sidebar, no copy-paste needed</b></sub></td>
  </tr>
  <tr>
    <td width="50%" align="center"><img src="docs/synto_3.png" alt="Review a GitHub pull request" width="100%" /><br/><sub><b>Get a structured PR review with changes, concerns and next steps</b></sub></td>
    <td width="50%" align="center"><img src="docs/synto_4.png" alt="Best dish from a restaurant menu" width="100%" /><br/><sub><b>Open any restaurant menu and ask what's worth ordering</b></sub></td>
  </tr>
</table>

> Templates are fully customizable — your imagination is the only limit.

---

## ⚡ Quick Install

1. [📦 Download synto.zip](https://github.com/artttj/synto/releases/latest) and unzip it
2. Open `chrome://extensions` → enable **Developer mode** → **Load unpacked** → select the `synto/` folder
3. Click the **Synto** icon → gear icon ⚙️ → **AI Connections** → add at least one API key → **Save**

You'll need an API key from one of these providers:

| Provider | Get a key |
| --- | --- |
| OpenAI | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| Google Gemini | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) |
| Grok (xAI) | [console.x.ai](https://console.x.ai/) |

---

Built for **engineers, PMs, and founders** who are tired of the copy-paste-summarize loop — skip the prep work and get straight to insights you can act on.

- [Why Synto?](#why-synto)
- [Templates](#template-library)
- [Features](#features)
- [Workflow Examples](#workflow-examples)
- [Privacy & Data](#privacy--data)
- [Setup](#setup)

---

## Why Synto?

- **Works on any page** — Jira, GitHub, GitLab, Bitbucket, Reddit, news articles, docs, or any page you can open in Chrome
- **Templates by intent** — structured prompts for analysis, decisions, and action items; fully customizable
- **Selection-aware** — highlight just the text you care about; Synto sends that instead of the whole page
- **Multi-AI** — ChatGPT, Gemini, and Grok in one panel, switchable in seconds
- **Lightweight and transparent** — no background processes, no telemetry, no surprises; [open source](https://github.com/artttj/synto)

---

## Before & After

**Without Synto:** Copy a 200-comment Jira ticket, paste into ChatGPT, type "summarize this", get a generic paragraph that misses the technical nuances.

**With Synto:** Open the side panel → **Ticket Analysis** → **Ask ChatGPT** → structured brief in seconds:

```
## Summary
Auth service timeout caused by Redis connection pool exhaustion.

## Acceptance Criteria
- Pool size configurable via env var.
- Graceful degradation (queueing) when pool is full.
- Load test at 500 RPS passes.

## Risks & Edge Cases
- Increasing pool size may exhaust Redis server connections.
- Queue depth needs a cap to avoid memory growth.

## Next Steps
1. @backend: Spike connection pooling library options.
2. @devops: Check current Redis maxclients value.
```

**Ask** streams the response in-panel. **Copy Markdown** copies the prompt to clipboard for Claude, ChatGPT web, or any other tool.

---

## Template Library

11 built-in templates, grouped by intent. Every template supports `{content}`, `{selection}`, `{title}`, and `{url}` placeholders.

| Category | Templates | Purpose |
| --- | --- | --- |
| **Understand** | Structured Brief · Ticket Analysis · PR Review | Surface key points, conclusions, and technical risks |
| **Decide** | Decision Brief · Feature Request Analysis | Weigh trade-offs and define a recommendation |
| **Act** | Extract Actions · Risks & Blockers · Smart Choice | Turn discussions into tasks and surface blockers |
| **Compose** | Draft Reply · Rewrite Comment · Email Helper | Generate professional responses or polished rewrites |

> **Custom templates:** write any prompt for any purpose — summarising research papers, drafting social posts, extracting recipes, analysing Reddit debates, rewriting a highlighted comment. Edit in **Options → Templates**.

---

## Features

### Smart Extraction

Synto targets the real content and ignores everything else.

- **Any page** — Jira, GitHub, GitLab, Bitbucket, Reddit, Amazon, news, docs; if it opens in Chrome, Synto clips it
- **Semantic selectors** — targets `<article>`, `<main>`, `#issue-content` (Jira), `.js-discussion` (GitHub), `#pullrequest-diff` (Bitbucket), `.diff-files-holder` (GitLab), `#centerCol` (Amazon); skips nav, footers, ads, and banners
- **Clean Markdown** — converts HTML to normalised GFM via [Turndown](https://github.com/mixmark-io/turndown); diff tables rendered as readable `<pre>` blocks
- **Selection-aware** — highlight any text before opening Synto; only that selection is sent
- **Selection mode** — press Ctrl+A (⌘A) to select the whole page, or highlight any section; Synto sends that instead of auto-extracting. Ideal for lazy-loaded pages (Bitbucket diffs, long feeds) — scroll through first, select all, then open Synto

### Integrated Experience

Everything stays in a persistent side panel — no tab switching, no lost context.

- **Multi-model** — stream responses from GPT-4o-mini, Gemini 2.0 Flash, or Grok-3-mini with full follow-up conversation
- **Live preview** — toggle between the **Content tab** (extracted Markdown) and **Prompt tab** (final merged string); token counter warns as you approach model limits
- **Two output modes** — **Ask** streams in-panel; **Copy Markdown** (or **Copy Prompt**) sends to clipboard for Claude, ChatGPT web, or any other tool

### ⌨️ Keyboard Shortcuts

| Action | macOS | Windows / Linux |
| --- | --- | --- |
| Open Synto | ⌥⇧C | Alt+Shift+C |
| Ask AI (panel focused) | ⌥⇧↩ | Alt+Shift+Enter |

---

## Workflow Examples

### Engineering: PR review in 30 seconds

1. Open a GitHub PR with 40+ review comments
2. Open Synto → select **PR Review**
3. Click **Ask ChatGPT** → get a structured brief: what changed, who is blocking, what needs fixing
4. Ask follow-up questions directly in the panel

### Engineering: Bitbucket PR diff review

Bitbucket loads diff sections lazily as you scroll, so auto-extraction only gets the visible slice. Workaround:

1. Open the PR → **Files changed** tab → scroll to the bottom to load all files
2. Press **Ctrl+A** (⌘A on Mac) to select everything on the page
3. Open Synto → select **PR Review** → click **Ask AI**

Synto detects the selection and sends it instead of re-extracting the page.

### Shopping: pick the right product

1. Open any product page or Amazon listing
2. Open Synto → select **Smart Choice**
3. Click **Ask ChatGPT** → get pros, cons, who it's for, and a clear verdict

### Writing: draft a reply in seconds

1. Open a long email thread, GitHub issue, or any message
2. Optionally highlight just the part you're replying to
3. Open Synto → select **Draft Reply**
4. Click **Ask ChatGPT** → get a ready-to-send reply

### Support: get up to speed on a ticket thread

1. Open a long Zendesk, Intercom, or GitHub issue thread
2. Open Synto → select **Ticket Analysis**
3. Click **Ask ChatGPT** → get a summary of the problem, what's been tried, and the current status
4. Ask follow-up questions without re-reading the whole thread

---

## 🔒 Privacy & Data

- **Local only** — API keys stored in `chrome.storage.local`; never synced, never sent to any server
- **Direct connection** — page content goes straight from your browser to the AI provider; Synto never sees it
- **Zero tracking** — no analytics, no telemetry, no accounts
- **Open source** — every line of code is [readable on GitHub](https://github.com/artttj/synto)

Provider policies: [OpenAI](https://openai.com/policies/privacy-policy/) · [Google AI](https://ai.google.dev/gemini-api/terms) · [xAI](https://x.ai/legal/privacy-policy/)

---

## Setup

### Build from source

1. `git clone https://github.com/artttj/synto.git && cd synto`
2. `npm install && npm run build`
3. Open `chrome://extensions` → enable **Developer mode** → **Load unpacked** → select the `dist/` folder
4. Click the **Synto** icon → ⚙️ **AI Connections** → paste your API key → **Save**

> Select the `dist/` folder (build output), not the project root.

### API Keys

| Provider | Model | Where to get a key |
| --- | --- | --- |
| OpenAI | `gpt-4o-mini` | [platform.openai.com](https://platform.openai.com/api-keys) |
| Google Gemini | `gemini-2.0-flash` | [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| Grok (xAI) | `grok-3-mini` | [console.x.ai](https://console.x.ai/) |

### Project Structure

```
synto/
├── manifest.json         # Manifest V3 (copied into dist/)
├── src/
│   ├── background/       # Service worker
│   ├── content/          # Extraction logic
│   ├── popup/            # Sidebar UI & chat
│   ├── options/          # Options page
│   └── shared/           # Storage & constants
├── scripts/build.js      # Build pipeline: src/ + icons/ → dist/
└── dist/                 # Load this folder into Chrome
```

---

## License

**MIT** — free to use and modify. Attribution required: include the original copyright notice in all copies or substantial portions. See [LICENSE](LICENSE) for details.
