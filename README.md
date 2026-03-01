# <img src="docs/icon128.png" width="36" alt="" valign="middle" /> Synto

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge)](LICENSE) ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![Google Chrome](https://img.shields.io/badge/Google%20Chrome-4285F4?style=for-the-badge&logo=GoogleChrome&logoColor=white)

Turn any web page into clean Markdown, choose a prompt template, and talk to ChatGPT, Gemini, or Grok from a Chrome side panel. Works on Jira, GitHub, Reddit, Amazon, and anything you can open. No backend, no accounts. Your API keys stay on your device.

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

Templates are fully customizable. You can edit them or add your own in Settings.

---

## Quick Install

1. [Download synto.zip](https://github.com/artttj/synto/releases/latest) and unzip it
2. Open `chrome://extensions`, turn on Developer mode, click Load unpacked, and select the `synto/` folder
3. Click the Synto icon, then the gear, then AI Connections. Add at least one API key and Save

You need an API key from one of these:

| Provider | Get a key |
| --- | --- |
| OpenAI | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| Google Gemini | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) |
| Grok (xAI) | [console.x.ai](https://console.x.ai/) |

---

If you're tired of copy-pasting pages into ChatGPT and typing "summarize this," Synto cuts that loop. You clip the page, pick a template, and ask. Built for engineers, PMs, and founders who want to get to the answer without the prep.

- [Why Synto?](#why-synto)
- [Templates](#template-library)
- [Features](#features)
- [Workflow Examples](#workflow-examples)
- [Privacy & Data](#privacy--data)
- [Setup](#setup)

---

## Why Synto?

- Works on any page: Jira, GitHub, GitLab, Bitbucket, Reddit, news, docs. If it opens in Chrome, Synto can clip it.
- Templates by intent: prompts for analysis, decisions, and action items. You can change them or add your own.
- Selection-aware: highlight the text you care about and Synto sends only that, not the whole page.
- Multi-AI: ChatGPT, Gemini, and Grok in one panel. Switch between them in one click.
- No background processes, no telemetry. [Open source](https://github.com/artttj/synto).

---

## Before & After

Without Synto: copy a 200-comment Jira ticket, paste into ChatGPT, type "summarize this," get a generic paragraph that misses the technical details.

With Synto: open the side panel, click Understand, pick Ticket, click Ask ChatGPT. You get a structured brief like this:

```
## Summary
Auth service timeout caused by Redis connection pool exhaustion.

## Acceptance Criteria
1. Pool size configurable via env var.
2. Graceful degradation (queueing) when pool is full.
3. Load test at 500 RPS passes.

## Risks & Mitigations
- Increasing pool size may exhaust Redis server connections → cap at 80% of Redis maxclients.
- Queue depth needs a hard limit → reject with 503 above threshold.

## Tasks
- Spike connection pooling library options · backend · M
- Check current Redis maxclients value · devops · S
```

"Ask" streams the response in the panel. "Copy Markdown" copies the prompt to your clipboard for Claude, ChatGPT web, or any other tool.

---

## Template Library

11 built-in templates, grouped by intent. Each supports `{content}`, `{selection}`, `{title}`, and `{url}` placeholders.

| Category | Templates (button label) | Purpose |
| --- | --- | --- |
| Understand | Brief, Ticket, Code Review | Key points, conclusions, technical risks |
| Decide | Decision, Feature | Trade-offs and a clear recommendation |
| Act | Actions, Risks, Recommend | Turn discussions into tasks and surface blockers |
| Compose | Reply, Rewrite, Email | Professional replies or rewrites |

You can add or edit templates in Settings. Use them for research summaries, social posts, recipes, Reddit threads, or anything you need.

---

## Features

### Smart Extraction

Synto goes for the main content and skips the rest.

- Any page: Jira, GitHub, GitLab, Bitbucket, Reddit, Amazon, news, docs. If it opens in Chrome, Synto clips it.
- Semantic selectors: targets `<article>`, `<main>`, `#issue-content` (Jira), `.js-discussion` (GitHub), `#pullrequest-diff` (Bitbucket), `.diff-files-holder` (GitLab), `#centerCol` (Amazon). Skips nav, footers, ads, and banners.
- Clean Markdown: HTML converted to normalised GFM via [Turndown](https://github.com/mixmark-io/turndown). Diff tables show up as readable `<pre>` blocks.
- Selection-aware: highlight text before opening Synto and only that is sent. Press Ctrl+A (⌘A) to select the whole page. Useful for lazy-loaded pages like Bitbucket diffs — scroll to the bottom first to load all content, then select all, then open Synto.

### Integrated Experience

Everything lives in a persistent side panel. No tab switching, no lost context.

- Multi-model: stream from GPT-4o-mini, Gemini 2.0 Flash, or Grok-3-mini with full follow-up conversation.
- Live preview: switch between the Content tab (extracted Markdown) and the Prompt tab (final merged string). A token counter warns you when you're near model limits.
- Two output modes: "Ask" streams in the panel. "Copy Markdown" (or "Copy Prompt") puts the prompt on your clipboard for Claude, ChatGPT web, or anything else.

### Keyboard Shortcuts

| Action | macOS | Windows / Linux |
| --- | --- | --- |
| Open Synto | ⌥⇧C | Alt+Shift+C |
| Ask AI (panel focused) | ⌥⇧↩ | Alt+Shift+Enter |

---

## Workflow Examples

### Engineering: Code review

1. Open a GitHub PR with 40+ review comments
2. Open Synto, click Understand, pick Code Review
3. Click Ask ChatGPT. You get a structured brief: what changed, who's blocking, what needs fixing
4. Ask follow-up questions in the panel

### Engineering: Bitbucket code review

Bitbucket loads diff sections as you scroll, so auto-extraction only sees what's on screen. Workaround:

1. Open the PR, go to Files changed, scroll to the bottom so all files load
2. Press Ctrl+A (⌘A on Mac) to select the page
3. Open Synto, click Understand, pick Code Review, click Ask AI

Synto uses your selection instead of re-extracting.

### Shopping: compare products and pick one

Smart Choice uses a weighted scorecard to rank options. It works best when you have multiple items to compare.

1. Open an Amazon search results page, or select content from a few product pages with Ctrl+A
2. Open Synto, click Act, pick Recommend
3. Click Ask AI. You get a scored comparison table and a clear recommendation on which to pick

### Writing: draft a reply

1. Open a long email thread, GitHub issue, or message
2. Optionally highlight the part you're replying to
3. Open Synto, click Compose, pick Reply
4. Click Ask ChatGPT for a reply you can send as-is

### Support: get up to speed on a ticket

1. Open a long Zendesk, Intercom, or GitHub issue thread
2. Open Synto, click Understand, pick Ticket
3. Click Ask ChatGPT for a summary of the problem, what's been tried, and current status
4. Ask follow-ups without re-reading the whole thread

---

## Privacy & Data

- Local only: API keys live in `chrome.storage.local`. They are not synced or sent to any server.
- Direct connection: page content goes from your browser to the AI provider. Synto never sees it.
- No analytics, no telemetry, no accounts.
- Open source: [full code on GitHub](https://github.com/artttj/synto).

Provider policies: [OpenAI](https://openai.com/policies/privacy-policy/), [Google AI](https://ai.google.dev/gemini-api/terms), [xAI](https://x.ai/legal/privacy-policy/).

---

## Setup

### Build from source

1. `git clone https://github.com/artttj/synto.git && cd synto`
2. `npm install && npm run build`
3. Open `chrome://extensions`, turn on Developer mode, click Load unpacked, and select the `dist/` folder
4. Click the Synto icon, then AI Connections. Paste your API key and Save

Load the `dist/` folder (the build output), not the project root.

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

MIT. You can use and modify it. Keep the original copyright notice in all copies or substantial portions. See [LICENSE](LICENSE) for details.
