# <img src="docs/icon128.png" width="36" alt="" valign="middle" /> Synto

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge)](LICENSE) ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![Google Chrome](https://img.shields.io/badge/Google%20Chrome-4285F4?style=for-the-badge&logo=GoogleChrome&logoColor=white)

**Why Synto?**

You control what gets sent. Select text or clip a section. Only that content goes to the model.

Structured results, not generic chat. Ticket briefs, PR reviews, action items, decision briefs, ready to use.

Your provider, your key. OpenAI, Gemini, or Grok. You choose the model and pay them directly.

No relay server. Content goes straight from your browser to the AI provider. No backend, no tracking.

More precise than tools like Gemini in Chrome. Instead of summarizing the whole page, Synto focuses on exactly what you select and returns structured, actionable output.

<table>
  <tr>
    <td width="33%" align="center"><img src="docs/synto_2.png" alt="Best pick from Amazon listings" width="100%" /><br/><sub><b>Clip any page to Markdown — paste into any LLM or chat in the sidebar</b></sub></td>
    <td width="33%" align="center"><img src="docs/synto_3.png" alt="Review a GitHub pull request" width="100%" /><br/><sub><b>Get a structured PR review with changes, concerns and next steps</b></sub></td>
    <td width="33%" align="center"><img src="docs/synto_4.png" alt="Best dish from a restaurant menu" width="100%" /><br/><sub><b>Open any restaurant menu and ask what's worth ordering</b></sub></td>
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

## Languages

The UI supports English and German. Switch in Settings → General → Language. The choice is stored per browser profile and applies instantly.

Template prompts sent to AI are always in English regardless of the selected language.

---

## Keyboard Shortcuts

| Action | macOS | Windows / Linux |
| --- | --- | --- |
| Open Synto | ⌥⇧C | Alt+Shift+C |
| Ask AI (panel focused) | ⌥⇧↩ | Alt+Shift+Enter |

---

## Workflow Examples

### Review a PR without reading every comment

1. Open a PR with 20 files changed, 50 inline comments, no summary
2. Open Synto, click Understand, pick Code Review
3. Ask AI: you get what changed, what reviewers flagged, and what blocks merge
4. Ask follow-ups in the panel without switching tabs

### Catch up on an email thread and draft a reply

1. Open a long email thread in Gmail or any webmail
2. Highlight the last few messages you actually need to respond to
3. Open Synto, click Compose, pick Reply
4. Ask AI: you get a draft that fits the thread context, ready to send or tweak

### Decode a ticket before picking it up

1. Open a Jira or Linear ticket with 40 comments, 3 linked issues, and no clear scope
2. Open Synto, click Understand, pick Ticket
3. Ask AI: you get the problem, acceptance criteria, open questions, and the next step

### Surface action items from a meeting doc

1. Open a Confluence page, Notion doc, or shared meeting notes
2. Open Synto, click Act, pick Actions
3. Ask AI: you get a task list with owners and blockers pulled from the text

### Compare products and pick one

1. Open a search results page or press ⌘A across a few product pages
2. Open Synto, click Act, pick Recommend
3. Ask AI: you get a scored comparison and a single clear pick

### Pick a dish from a restaurant menu

1. Open any restaurant menu page
2. Open Synto, click Act, pick Recommend
3. Ask AI: you get the top picks with a reason — or ask for something specific like low carb, best value, or good for sharing

### Decide whether a movie is worth watching

1. Open any IMDb movie page
2. Open Synto, click Act, pick Recommend
3. Ask AI: you get a quick verdict — what it's about, who it's for, and whether it's worth your time

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

### API Keys

| Provider | Model | Where to get a key |
| --- | --- | --- |
| OpenAI | `gpt-4o-mini` | [platform.openai.com](https://platform.openai.com/api-keys) |
| Google Gemini | `gemini-2.0-flash` | [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| Grok (xAI) | `grok-3-mini` | [console.x.ai](https://console.x.ai/) |

---

## License

MIT. You can use and modify it. Keep the original copyright notice in all copies or substantial portions. See [LICENSE](LICENSE) for details.
