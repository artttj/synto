# <img src="docs/icon128.png" width="36" alt="" valign="middle" /> Synto

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge)](LICENSE) ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![Google Chrome](https://img.shields.io/badge/Google%20Chrome-4285F4?style=for-the-badge&logo=GoogleChrome&logoColor=white)

## Stop fighting with messy web pages.

Synto is a simple browser extension that bridges the gap between the web and your favorite AI. It cuts out the "copy-paste loop" and helps you get structured work done without the clutter.

- **Clean Markdown, instantly.** Turn messy websites into structured text you can use immediately. No more fixing weird formatting or broken tables.
- **Focus on what matters.** Built-in browser AIs often get distracted by the whole page. Synto sends only what you select, so the answers stay sharp and relevant.
- **Made for work, not just chat.** Skip the back-and-forth. Go straight to PR reviews, ticket briefs, or task lists that are ready to drop into your workflow.
- **Your keys, your price.** Connect your own OpenAI, Gemini, or Grok keys. You pay the provider directly—no markups, no middleman fees, and no "pro" subscriptions.
- **Privacy by design.** Synto has no backend. Your data goes straight from your browser to the AI provider. No tracking, no storage, and no one else watching your prompts.

<table>
  <tr>
    <td width="33%" align="center"><img src="docs/synto_2.png" alt="Best pick from Amazon listings" width="100%" /><br/><sub><b>Clip any page to Markdown — paste into any LLM or chat in the sidebar</b></sub></td>
    <td width="33%" align="center"><img src="docs/synto_3.png" alt="Review a GitHub pull request" width="100%" /><br/><sub><b>Get a structured PR review with changes, concerns and next steps</b></sub></td>
    <td width="33%" align="center"><img src="docs/synto_4.png" alt="Best dish from a restaurant menu" width="100%" /><br/><sub><b>Open any restaurant menu and ask what's worth ordering</b></sub></td>
  </tr>
</table>

---

## Quick Start

1. **Download:** [Get synto.zip](https://github.com/artttj/synto/releases/latest) and unzip it.
2. **Install:** Open `chrome://extensions`, turn on **Developer mode**, click **Load unpacked**, and select the `synto/` folder.
3. **Connect:** Click the Synto icon → Gear icon → **AI Connections**. Add your API key and save.

| Provider | Get a key |
| --- | --- |
| OpenAI | [platform.openai.com](https://platform.openai.com/api-keys) |
| Google Gemini | [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| Grok (xAI) | [console.x.ai](https://console.x.ai/) |

---

## Real-World Workflows

### 🛠️ For Developers

- **Review PRs:** Get a summary of changes and technical risks on a heavy GitHub PR without reading every single comment.
- **Decode Tickets:** Turn a Jira or Linear ticket with dozens of comments into a clear list of requirements and open questions.

### ✍️ For Productivity

- **Draft Replies:** Highlight an email thread and generate a response that actually makes sense in context.
- **Find Action Items:** Turn long meeting notes or Notion docs into a simple list of tasks and owners.

### 🍱 For Daily Life

- **Pick a Dish:** Open a restaurant menu and ask for the "top picks" or something specific like "best value" or "low carb."
- **Compare Products:** Highlight a few product pages and get a scored comparison to help you choose.
- **Decide on a Movie:** Open an IMDb page and get a quick verdict on whether it's worth your time.

---

## Template Library

Synto comes with 11 built-in templates. You can fully customize these or build your own in Settings using placeholders: `{content}`, `{selection}`, `{title}`, and `{url}`.

| Category | Purpose |
| --- | --- |
| **Understand** | Key points, ticket briefs, and code reviews. |
| **Decide** | Trade-offs, feature checks, and recommendations. |
| **Act** | Task lists, risk assessments, and blockers. |
| **Compose** | Professional emails, replies, and rewrites. |

---

## Languages

The UI supports **English** and **German**. Switch in Settings → General → Language. The choice is stored per browser profile and applies instantly.

Template prompts sent to AI are always in English regardless of the selected language.

---

## Keyboard Shortcuts

| Action | macOS | Windows / Linux |
| --- | --- | --- |
| Open Synto | ⌥⇧C | Alt+Shift+C |
| Ask AI (panel focused) | ⌥⇧↩ | Alt+Shift+Enter |

---

## Privacy & Security

- **Local Only:** Your API keys stay on your computer (`chrome.storage.local`). They are never synced or sent to any server.
- **Direct Connection:** Your data travels directly from your browser to your AI provider. Synto never sees your prompts.
- **Open Source:** The [full code is on GitHub](https://github.com/artttj/synto) for you to audit.

Provider policies: [OpenAI](https://openai.com/policies/privacy-policy/), [Google AI](https://ai.google.dev/gemini-api/terms), [xAI](https://x.ai/legal/privacy-policy/).

---

## Developer Setup

1. `git clone https://github.com/artttj/synto.git && cd synto`
2. `npm install && npm run build`
3. Load the `dist/` folder as an unpacked extension in Chrome.

---

## License

MIT. You can use and modify it. Keep the original copyright notice in all copies or substantial portions. See [LICENSE](LICENSE) for details.
