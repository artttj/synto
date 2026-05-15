# Popup Polish Release - Design Spec

**Date:** 2026-05-15
**Status:** Draft
**Scope:** Tight UX fixes for template clarity, remembered selection, provider status, insert undo, and extension icon consistency

## Goal

Reduce daily friction in the Synto popup without adding a larger workflow system. This release keeps the current popup structure and storage model, then improves the places where users lose context or confidence:

- unclear Audit naming
- oversized template category captions
- repeated manual template switching
- provider failures that are only visible after a failed Ask
- insert mistakes with no undo path
- Chrome extension icon still using the old manifest image

## Out Of Scope

- `.synto` template export or import
- one-click template sharing links
- page-type detection such as GitHub PR, Jira, restaurant menu, or product page
- proactive provider health probes
- settings toggles for these behaviors
- restructuring the popup or options page

## Approved Behavior

### SEO Audit Naming

The SEO-focused audit template must be obvious wherever users choose or browse templates.

- The top category tab should be concise and fit with the rest of the row.
- The specific template should read as `SEO Audit`, not just `Audit`.
- Built-in template IDs stay unchanged so existing saved templates and history keep working.
- The change is a label/localization update, not a storage migration.

### Concise Category Bar

The category bar should show short task buckets:

- `Understand`
- `Decide`
- `Compose`
- `Brief`
- `Review`
- `SEO`

The row should not horizontally scroll in normal popup widths. Tabs should share the available width and truncate only as a last resort.

### Last-Used Template

Synto should remember the last selected template per hostname, with a global fallback.

Selection order when the popup has a page URL:

1. Last template used for the page hostname.
2. Configured default template.
3. Global last-used template.
4. First available template.

If a stored template ID no longer exists, Synto skips it and tries the next fallback.

When a user selects a template, Synto stores:

- the selected template for the current hostname, when a hostname exists
- the selected template as the global last-used fallback

Storage should use `chrome.storage.local`, because this is device-local behavior and should not overwrite sync settings.

### Passive Provider Health

Provider health is based only on real Ask calls. Synto must not send separate test requests.

Stored status per provider:

- `ok`
- `no_key`
- `rate_limited`
- `error`

Each status includes a timestamp and may include a short message. Missing-key checks record `no_key`. HTTP 429 records `rate_limited`. Other request failures record `error`. A completed provider response records `ok`.

The UI should show this status as a small passive indicator near existing provider controls, without blocking the Ask flow.

### Undo Insert

When Synto inserts an AI response into a page input, it should keep one undo snapshot.

Before mutating the target, the content script stores:

- target element reference
- previous value or content
- previous selection or cursor state when available

After insertion, the page toast shows `Inserted` and an `Undo` action for a short timeout. Clicking Undo restores the previous field state and dispatches `input` and `change` events so framework-managed fields update.

Only the latest insert can be undone. The snapshot expires after the toast timeout or after another insert.

### Extension Icon Consistency

Chrome uses manifest PNG icons for the extension management page and toolbar. The sidebar and options header use `icons/logo.png`.

The manifest PNG icons should be regenerated from the current `icons/logo.png` so Chrome settings and the in-extension header show the same visual identity.

## Data Model

Add local storage keys:

```ts
TEMPLATE_USAGE: 'apc_template_usage'
PROVIDER_HEALTH: 'apc_provider_health'
```

Template usage shape:

```ts
interface TemplateUsage {
  globalTemplateId?: string;
  byHost: Record<string, string>;
}
```

Provider health shape:

```ts
type ProviderHealthStatus = 'ok' | 'no_key' | 'rate_limited' | 'error';

interface ProviderHealthEntry {
  status: ProviderHealthStatus;
  ts: number;
  message?: string;
}

type ProviderHealth = Record<string, ProviderHealthEntry>;
```

## Implementation Notes

### Storage Helpers

Add helpers in `src/shared/storage.ts`:

- `getTemplateUsage()`
- `saveTemplateUsage()`
- `rememberTemplateUsage(url, templateId)`
- `getRememberedTemplateId(url, templates, defaultTemplateId)`
- `getProviderHealth()`
- `saveProviderHealth(provider, entry)`

The selection helper should parse hostnames with `URL` and fall back cleanly for restricted or missing URLs.

### Popup Template Flow

The popup already stores selected template state in `src/popup/templates.ts`. Persist template usage from the existing selection path so click and keyboard selection behave the same.

Initial selection should happen after extraction when the current page URL is known. If extraction is unavailable, keep the current default behavior.

### Provider Flow

Update `src/popup/chat.ts` around provider dispatch:

- record `no_key` before returning for missing key states
- record `ok` after a provider stream completes
- record `rate_limited` for 429 failures
- record `error` for other failures

Keep the stored message short enough to fit in a compact UI.

### Insert Flow

Keep undo logic inside `src/content/main.ts`, because it owns the page DOM mutation.

For text inputs and textareas, restore `value`, `selectionStart`, and `selectionEnd`. For contenteditable elements, restore text content or the previous range if a simple range snapshot is practical. The first implementation can restore text content for contenteditable fields as long as it still fires the expected events.

### Icons

Regenerate `icons/icon16.png`, `icons/icon48.png`, and `icons/icon128.png` from `icons/logo.png`. The manifest paths do not need to change.

## Tests And Verification

Required checks before completion:

- `npm run typecheck`
- `npm run test`
- `npm run build`
- browser check of the built popup

Focused coverage:

- category labels render short names and do not create horizontal overflow
- SEO Audit label appears in template UI
- remembered template selection prefers hostname match over configured default
- missing or deleted remembered template falls back safely
- provider health records `ok`, `no_key`, `rate_limited`, and `error`
- insert undo restores the previous field value for normal inputs

## Risks

- Last-used template selection must not fight the configured default before a page URL is known.
- Provider status must not imply a fresh provider check. It is a last-known status only.
- Undo insert must not attempt to support every complex editor in the first pass. Native inputs, textareas, and simple contenteditable fields are enough for this release.
