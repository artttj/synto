// content.js — Selection → Body (Turndown) pipeline
// Load order: turndown.js, turndown-plugin-gfm.js, content.js

(function () {
  "use strict";

  const MSG_EXTRACT = "EXTRACT_CONTENT";

  // Elements removed from the clone before Turndown runs.
  const STRIP_SELECTORS = [
    // Always-noise
    "script", "style", "noscript", "iframe", "svg", "canvas",
    // Layout regions
    "nav", "header", "footer", "aside",
    // Interactive chrome (buttons, forms, inputs)
    "button", "form", "input", "textarea", "select",
    // ARIA roles that are purely structural / interactive
    "[role='navigation']", "[role='banner']", "[role='contentinfo']",
    "[role='complementary']", "[role='toolbar']", "[role='menu']",
    "[role='menubar']", "[role='menuitem']", "[role='dialog']",
    "[role='alertdialog']", "[role='tooltip']", "[role='status']",
    // Hidden from screen-readers → hidden from us
    "[aria-hidden='true']",
    // Browser-injected widgets (Bing Translator, etc.)
    "#LanguageMenu", "[id^='Microsoft_Translator']",
    "[class*='VIpgJd']",   // Google Translate injected elements
    // Consent / cookie banners
    "#onetrust-banner-sdk", "#onetrust-consent-sdk",
    "[id='CybotCookiebotDialog']", "[id='cookie-law-info-bar']",
    "[id='cookie-notice']", "[id='cookie-banner']",
    "[id='gdpr-banner']", "[id='consent-banner']",
    "[class*='cookie-banner']", "[class*='cookie-notice']", "[class*='cookie-bar']",
    "[class*='gdpr-banner']", "[class*='cc-window']",
    // Newsletter / email capture
    "[class*='newsletter-signup']", "[class*='newsletter-block']", "[id*='newsletter']",
    // Social sharing widgets
    "[class*='social-share']", "[class*='share-buttons']", "[class*='share-bar']",
    // Ads and sponsored content
    "[id^='google_ads_']", "ins.adsbygoogle",
    "[class*='advertisement']", "[class*='sponsored-content']",
    // Amazon-specific noise
    "#navFooter", "#rhf", "#nav-belt", "#nav-top",
    "[id*='-sims-']",              // "similar items" carousels
    ".a-carousel-container",       // generic Amazon carousels
    "[data-component-type='s-search-results']",
  ].join(",");

  // Semantic content containers — tried in order, first with enough text wins.
  const MAIN_SELECTORS = [
    "article",
    "[role='main']",
    "main",
    "#main-content",
    "#content",
    "#article-body",
    "#story",
    "#post-content",
    "#entry-content",
    ".post-body",
    "#centerCol",   // Amazon product center column
    "#dp",          // Amazon product detail page
    "#ppd",         // Amazon product page (alternate)
  ];

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type !== MSG_EXTRACT) return;

    try {
      const result = extractContent(message.mode ?? "markdown");
      sendResponse(result);
    } catch (err) {
      sendResponse({ success: false, error: err.message });
    }

    return true;
  });

  // ─── Main dispatcher ──────────────────────────────────────────────────────

  function extractContent(mode) {
    if (mode === "html") {
      return {
        success: true,
        mode: "html",
        content: document.documentElement.outerHTML,
        title: document.title,
        url: location.href,
      };
    }

    const selectionResult = trySelection();
    if (selectionResult) return selectionResult;

    return extractBody();
  }

  // ─── Selection ────────────────────────────────────────────────────────────

  function trySelection() {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) return null;

    const container = document.createElement("div");
    for (let i = 0; i < sel.rangeCount; i++) {
      container.appendChild(sel.getRangeAt(i).cloneContents());
    }

    const html = container.innerHTML.trim();
    if (!html) return null;

    const markdown = toMarkdown(html);
    if (markdown.trim().length < 10) return null;

    return {
      success: true,
      mode: "markdown",
      source: "selection",
      content: markdown,
      title: document.title,
      url: location.href,
      excerpt: "", byline: "", siteName: "",
    };
  }

  // ─── Body extraction ──────────────────────────────────────────────────────

  function extractBody() {
    // Narrow to semantic main content first; fall back to full body.
    const mainEl = findMainContent();
    const root = mainEl ?? document.body;

    const clone = root.cloneNode(true);
    clone.querySelectorAll(STRIP_SELECTORS).forEach((el) => el.remove());
    let markdown = toMarkdown(clone.innerHTML);

    // If narrowed element yielded nothing, retry with full body.
    if ((!markdown || markdown.trim().length < 20) && mainEl) {
      const bodyClone = document.body.cloneNode(true);
      bodyClone.querySelectorAll(STRIP_SELECTORS).forEach((el) => el.remove());
      markdown = toMarkdown(bodyClone.innerHTML);
    }

    if (!markdown || markdown.trim().length < 20) {
      return {
        success: false,
        error: "Page body appears empty. Try Raw HTML mode.",
        title: document.title,
        url: location.href,
      };
    }

    return {
      success: true,
      mode: "markdown",
      source: mainEl ? "article" : "body",
      content: markdown,
      title: document.title,
      url: location.href,
      excerpt: "", byline: "", siteName: "",
    };
  }

  function findMainContent() {
    for (const sel of MAIN_SELECTORS) {
      const el = document.querySelector(sel);
      if (el && el.textContent.trim().length > 150) return el;
    }
    return null;
  }

  // ─── HTML → Markdown ──────────────────────────────────────────────────────

  function toMarkdown(html) {
    const td = new TurndownService({
      headingStyle: "atx",
      hr: "---",
      bulletListMarker: "-",
      codeBlockStyle: "fenced",
      fence: "```",
      emDelimiter: "_",
      strongDelimiter: "**",
      linkStyle: "inlined",
    });

    if (typeof turndownPluginGfm !== "undefined") {
      td.use(turndownPluginGfm.gfm);
    }

    td.keep(["sup", "sub", "mark"]);

    // Images → alt text only (drops emoji CDN URLs, attachment JWT thumbnails)
    td.addRule("img-to-alt", {
      filter: "img",
      replacement: (_content, node) => {
        const alt = (node.getAttribute("alt") || "").trim();
        // Skip decorative/empty alt and short emoji shortcodes like ":thumbsup:"
        if (!alt || /^:[a-z_]+:$/.test(alt)) return "";
        return `[${alt}]`;
      },
    });

    // Pure anchor links (#fragment) → just their text, no link markup
    td.addRule("anchor-only-links", {
      filter: (node) =>
        node.nodeName === "A" &&
        (node.getAttribute("href") || "").startsWith("#"),
      replacement: (_content, node) => node.textContent.trim(),
    });

    // Collapse whitespace-only list items that Turndown emits as stray bullets
    const raw = td.turndown(html);

    return raw
      .replace(/^-\s*$/gm, "")          // empty list bullets
      .replace(/^\s*\[?\s*\]?\s*$/gm, "") // empty checkbox/bracket lines
      .replace(/\n{3,}/g, "\n\n")        // 3+ blank lines → 2
      .trim();
  }
})();
