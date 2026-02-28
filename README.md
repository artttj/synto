# AI Page Clipper

A Chrome extension that turns any webpage into clean, LLM-ready Markdown — and lets you ask ChatGPT, Gemini, or Grok about it without leaving the tab.

## Features

- **Smart extraction** — prioritises semantic content (`<article>`, `<main>`, `[role="main"]`, Amazon's `#centerCol`, etc.) before falling back to full-body stripping; Turndown produces clean GFM Markdown
- **Selection mode** — select text on the page first and it clips exactly that, ignoring everything else
- **Noise removal** — strips nav, ads, cookie banners, GDPR prompts, social share widgets, Amazon carousels, and other boilerplate before conversion
- **Prompt templates** — 5 built-in templates; create unlimited custom ones with `{content}`, `{title}`, `{url}`, `{excerpt}`, `{byline}` placeholders
- **Token estimation** — live `~N tokens` count (green < 4k, yellow < 16k, red ≥ 16k)
- **AI chat** — stream responses from **ChatGPT** (gpt-4o-mini), **Gemini** (gemini-2.0-flash), or **Grok** (grok-3-mini) directly in the popup
- **Keyboard shortcut** — `Alt+Shift+C` opens the popup from any page
- **Dark / light theme** — persisted per-device

---

## Installation

1. Clone or download this repo
2. Open Chrome and navigate to `chrome://extensions`
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked** and select the `ai-page-clipper/` directory
5. The extension icon appears in your toolbar

---

## Usage

1. Navigate to any article, ticket, thread, or documentation page
2. Click the AI Page Clipper icon (or press `Alt+Shift+C`)
3. Select a template from the dropdown
4. Click **Copy to Clipboard** — paste into your LLM chat
5. Or click **Ask ChatGPT / Ask Gemini / Ask Grok** to get a streamed response right in the popup

**Preview** — click "Preview ▾" to inspect the extracted Markdown before copying.

---

## Template Variables

| Variable | Value |
|---|---|
| `{content}` | Extracted page body (Markdown) |
| `{title}` | Page title |
| `{url}` | Current page URL |
| `{excerpt}` | Auto-detected excerpt (if available) |
| `{byline}` | Author byline (if available) |
| `{siteName}` | Site name (if available) |

---

## Built-in Templates

| Name | Purpose |
|---|---|
| **Clean Copy** | Raw `{content}` passthrough — no wrapper |
| **Rewrite Comment** | Rewrite the clipped text to be clearer and more professional |
| **Summarize Thread** | TL;DR + decisions + open questions + participants |
| **Ticket Analysis** | Summary, problem, risks, dependencies, next steps |
| **Article Analysis** | Thesis + key points + conclusions |

Manage templates at **Options** (gear icon) → **Prompt Templates**.

---

## AI Providers

All keys are stored in `chrome.storage.local` — on-device only, never synced to Google.

| Provider | Model | Key source |
|---|---|---|
| OpenAI (ChatGPT) | `gpt-4o-mini` | platform.openai.com |
| Gemini (Google) | `gemini-2.0-flash` | aistudio.google.com |
| Grok (xAI) | `grok-3-mini` | console.x.ai |

Set your preferred provider in **Options → Default Settings**, then add the corresponding API key in the provider's section.

---

## Keyboard Shortcut

Default: `Alt+Shift+C` — opens the popup on the active tab.

To customise: `chrome://extensions/shortcuts`

---

## Options Page

Access via the ⚙ gear icon in the popup, or `chrome://extensions` → AI Page Clipper → Details → Extension options.

- Set default template
- Choose AI provider (OpenAI / Gemini / Grok)
- Add / clear API keys
- Toggle dark / light theme
- Create, edit, and delete custom templates

---

## Project Structure

```
ai-page-clipper/
├── manifest.json
├── icons/                    # 16, 48, 128px PNGs
├── lib/                      # Vendored — no build step
│   ├── turndown.js           # mixmark-io/turndown 7.2.0
│   └── turndown-plugin-gfm.js
├── shared/
│   ├── constants.js          # STORAGE_KEYS, DEFAULT_TEMPLATES, estimateTokens()
│   └── storage.js            # chrome.storage wrappers for settings + API keys
├── background/
│   └── service-worker.js     # Seeds default templates on first install
├── content/
│   └── content.js            # DOM extraction → Turndown pipeline
├── popup/
│   ├── popup.html
│   ├── popup.css
│   └── popup.js              # Extract → template → copy / AI stream
└── options/
    ├── options.html
    ├── options.css
    └── options.js            # Settings, API keys, template CRUD
```

---

## Privacy

- API keys are stored in `chrome.storage.local` — device-only, never synced
- Page content is sent to the AI provider you choose only when you click the Ask button
- No analytics, no backend, no tracking of any kind
