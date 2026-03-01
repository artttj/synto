# Synto

**Clip any web page to Markdown, apply a prompt template, and send to ChatGPT, Gemini, or Grok for instant AI briefs. No backend — API keys stay on your device.**

<table>
  <tr>
    <td width="50%"><img src="docs/synto_1.png" alt="Synto demo 1" width="100%" /></td>
    <td width="50%"><img src="docs/synto_2.png" alt="Synto demo 2" width="100%" /></td>
  </tr>
</table>

Built for **engineers, PMs, and founders** who need to skip the copy-paste-summarize loop and get straight to actionable insights.

- [Features](#features)
- [Templates](#template-library)
- [Privacy](#privacy--data)
- [Setup](#setup)

No backend. No accounts. No tracking. Fully client-side.

---

## The Problem vs. The Solution

**Before:** You copy a messy 200-comment Jira ticket, paste it into ChatGPT, type "summarize this", and get a paragraph that misses all the technical nuances.

**After:** Open Synto, select **Ticket Analysis**, click **Ask ChatGPT**, and get the analysis streamed directly in the sidebar:

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

Or click **Copy Markdown** to paste the formatted prompt into Claude, Gemini, or any other tool you already use.

---

## Template Library

Templates are grouped by intent and support `{content}`, `{selection}`, `{title}`, and `{url}` placeholders.

| Category | Templates | Purpose |
| --- | --- | --- |
| **Understand** | Structured Brief, Ticket Analysis, PR Review | Identify key points, conclusions, and technical risks. |
| **Decide** | Decision Brief, Feature Request Analysis | Weigh trade-offs and define a recommendation. |
| **Act** | Extract Actions, Risks & Blockers, Smart Choice | Turn discussions into tasks and surface blockers. |
| **Compose** | Draft Reply, Rewrite Comment, Email Helper | Generate professional responses or polished rewrites. |

*Custom templates can be added in the **Options** menu.*

---

## Features

### Smart Extraction

- **Semantic focus:** targets `<article>`, `<main>`, `#issue-content` (Jira), `.js-discussion` (GitHub), `#pullrequest-diff` (Bitbucket), `.diff-files-holder` (GitLab), and more
- **Clean Markdown:** strips navigation, footers, ads, and banners via [Turndown](https://github.com/mixmark-io/turndown) + GFM tables/code blocks; diff tables converted to readable `<pre>` blocks
- **Selection awareness:** highlight text before opening the panel and Synto uses that as `{selection}`

### Integrated Experience

- **Native side panel:** stays open as you navigate — no tab switching, no lost conversation
- **Multi-model AI:** stream responses from **GPT-4o-mini**, **Gemini 2.0 Flash**, or **Grok-3-mini** directly in the panel, with full follow-up conversation
- **Live preview:** toggle between the **Content tab** (raw extracted Markdown) and **Prompt tab** (final merged string), with a token counter that warns as you approach model limits
- **Copy Markdown:** copies the formatted prompt to clipboard to use in Claude, ChatGPT web, or any other tool

### Keyboard Shortcuts

- `⌥ ⇧ C` — open the side panel; when focused, copies preview content to clipboard
- `⌥ ⇧ ↩` — trigger the Ask AI command

---

## Workflow Examples

### Engineering: PR review in 30 seconds

1. Open a GitHub PR with 40+ review comments
2. Open Synto → select **PR Review**
3. Click **Ask ChatGPT** → get a structured brief: what changed, who is blocking, what they want fixed
4. Ask follow-up questions directly in the panel

### Product: Jira ticket into a shareable brief

1. Open a Jira ticket with discussion
2. Open Synto → select **Ticket Analysis**
3. Click **Ask ChatGPT** to get the analysis in the panel, or **Copy Markdown** to paste the prompt into Claude Code or another tool

### Decision: evaluate a feature request

1. Open the GitHub issue or internal doc
2. Open Synto → select **Feature Request Analysis**
3. Click **Ask ChatGPT** → get problem framing, trade-offs, and alternatives

---

## Privacy & Data

- **Local only:** API keys are stored in `chrome.storage.local` — never synced, never sent to any external server
- **Direct connection:** page content goes straight from your browser to the AI provider; Synto has no visibility into it
- **Zero tracking:** no analytics, no telemetry, no accounts

Provider privacy policies: [OpenAI](https://openai.com/policies/privacy-policy/) · [Google AI](https://ai.google.dev/gemini-api/terms) · [xAI](https://x.ai/legal/privacy-policy/)

---

## Setup

1. Clone or download this repository
2. Run `npm install && npm run build`
3. Open `chrome://extensions` → enable **Developer mode**
4. Click **Load unpacked** → select the `dist/` folder
5. Open **Options** (gear icon) to add an API key

### API Keys

| Provider | Model | Where to get a key |
| --- | --- | --- |
| OpenAI | `gpt-4o-mini` | [platform.openai.com](https://platform.openai.com/api-keys) |
| Google Gemini | `gemini-2.0-flash` | [aistudio.google.com](https://aistudio.google.com/app/apikey) (free tier available) |
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
