// content.js — Selection → Smart Extraction pipeline (v2)
// Load order: turndown.js, turndown-plugin-gfm.js, content.js

(function () {
  "use strict";

  const MSG_EXTRACT = "EXTRACT_CONTENT";

  // ─── Strip selectors ────────────────────────────────────────────────────────
  // Elements removed from the clone before Turndown runs.

  const STRIP_SELECTORS = [
    // Always-noise
    "script", "style", "noscript", "iframe", "canvas",
    // Layout regions
    "nav", "footer", "aside",
    // Interactive chrome (forms, inputs — not buttons, which may carry labels)
    "form", "input", "select",
    // ARIA structural roles
    "[role='navigation']", "[role='banner']", "[role='contentinfo']",
    "[role='complementary']", "[role='toolbar']", "[role='menu']",
    "[role='menubar']", "[role='menuitem']", "[role='dialog']",
    "[role='alertdialog']", "[role='tooltip']", "[role='status']",
    // Browser-injected widgets
    "#LanguageMenu", "[id^='Microsoft_Translator']",
    "[class*='VIpgJd']",
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
    // Floating / sticky overlays (modals, chat widgets, banners)
    "[class*='intercom']", "[class*='helpscout']", "[class*='drift-']",
    "[id*='hubspot']", "[class*='chat-widget']",
    // Amazon-specific noise
    "#navFooter", "#rhf", "#nav-belt", "#nav-top",
    "[id*='-sims-']",
    ".a-carousel-container",
    "[data-component-type='s-search-results']",
    // YouTube sidebar / related
    "#related", "#secondary",
  ].join(",");

  // ─── Comment thread detection ────────────────────────────────────────────────
  // Used for source anchoring: annotate comment containers with their author.

  const COMMENT_CONTAINER_SELECTORS = [
    // Generic class-name patterns (broadest net)
    '[class*="comment"]:not([class*="comment-count"]):not([class*="no-comment"])',
    '[class*="Comment"]:not([class*="CommentCount"])',
    '[class*="reply"]:not([class*="reply-count"])',
    // Hacker News
    ".comtr",
    // GitHub PR / Issues
    ".review-comment", ".timeline-comment",
    // Stack Overflow / Stack Exchange
    ".answer", ".comment",
    // Reddit (new and old)
    ".thing.comment",
  ].join(",");

  const AUTHOR_INNER_SELECTORS = [
    "[data-author]",
    ".author",
    ".comment-author",
    ".author-link",
    ".username",
    ".user-name",
    // Hacker News
    ".hnuser",
    // Reddit (new)
    "[data-testid*='comment_author']",
    // Generic fallback: a link pointing to a user profile
    "a[href*='/user/']",
    "a[href*='/u/']",
    "a[href*='/users/']",
    "a[href*='/profile/']",
  ];

  // ─── Main content selectors ──────────────────────────────────────────────────
  // Tried in order; first match with enough text wins.

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
    // GitHub discussions / PR
    ".js-discussion",
    ".repository-content",
    // Jira
    "#issue-content",
    // Amazon product
    "#centerCol",
    "#dp",
    "#ppd",
  ];

  // ─── Message listener ────────────────────────────────────────────────────────

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type !== MSG_EXTRACT) return;

    try {
      const result = extractContent(message.mode ?? "markdown", {
        sourceAnchoring: !!message.sourceAnchoring,
      });
      sendResponse(result);
    } catch (err) {
      sendResponse({ success: false, error: err.message });
    }

    return true;
  });

  // ─── Dispatcher ──────────────────────────────────────────────────────────────

  function extractContent(mode, opts) {
    if (mode === "html") {
      return {
        success: true,
        mode: "html",
        content: document.documentElement.outerHTML,
        title: document.title,
        url: location.href,
      };
    }

    // Capture user selection first; if substantial, it becomes the primary content.
    const selectionText = captureSelection();

    if (selectionText) {
      return {
        success: true,
        mode: "markdown",
        source: "selection",
        content: selectionText,
        selection: selectionText,
        title: document.title,
        url: location.href,
        excerpt: "", byline: "", siteName: "",
      };
    }

    return extractBody(opts);
  }

  // ─── Selection ───────────────────────────────────────────────────────────────

  function captureSelection() {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) return "";

    const container = document.createElement("div");
    for (let i = 0; i < sel.rangeCount; i++) {
      container.appendChild(sel.getRangeAt(i).cloneContents());
    }

    const html = container.innerHTML.trim();
    if (!html) return "";

    const md = toMarkdown(html);
    return md.trim().length >= 10 ? md : "";
  }

  // ─── Body extraction ─────────────────────────────────────────────────────────

  function extractBody(opts) {
    const mainEl = findMainContent();
    const root   = mainEl ?? document.body;

    const clone = root.cloneNode(true);

    // Annotate comment authors BEFORE stripping (author els may be in stripped nodes).
    if (opts.sourceAnchoring) {
      annotateAuthors(clone);
    }

    clone.querySelectorAll(STRIP_SELECTORS).forEach((el) => el.remove());

    let markdown = toMarkdown(clone.innerHTML);

    // Retry with full body if the narrowed element yielded too little.
    if ((!markdown || markdown.trim().length < 20) && mainEl) {
      const bodyClone = document.body.cloneNode(true);
      if (opts.sourceAnchoring) annotateAuthors(bodyClone);
      bodyClone.querySelectorAll(STRIP_SELECTORS).forEach((el) => el.remove());
      markdown = toMarkdown(bodyClone.innerHTML);
    }

    if (!markdown || markdown.trim().length < 20) {
      return {
        success: false,
        error: "No meaningful content detected on this page. Try selecting text manually before clipping.",
        title: document.title,
        url: location.href,
      };
    }

    return {
      success: true,
      mode: "markdown",
      source: mainEl ? "article" : "body",
      content: markdown,
      selection: "",
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

  // ─── Source anchoring ────────────────────────────────────────────────────────
  // Prepend "@author:" labels to comment containers in the clone so Turndown
  // preserves author attribution in the markdown output.

  function annotateAuthors(rootClone) {
    let containers;
    try {
      containers = rootClone.querySelectorAll(COMMENT_CONTAINER_SELECTORS);
    } catch (_) {
      return; // selector may be invalid on some pages
    }

    const annotated = new WeakSet();

    containers.forEach((commentEl) => {
      if (annotated.has(commentEl)) return;

      // Find the author element — must belong to THIS comment, not a nested one.
      let authorName = "";
      for (const aSel of AUTHOR_INNER_SELECTORS) {
        let authorEl;
        try { authorEl = commentEl.querySelector(aSel); } catch (_) { continue; }
        if (!authorEl) continue;

        // Ensure the found author element is not inside a deeper nested comment.
        const nestedParent = authorEl.parentElement?.closest(COMMENT_CONTAINER_SELECTORS);
        if (nestedParent && nestedParent !== commentEl) continue;

        const raw = (authorEl.getAttribute("data-author") || authorEl.textContent || "").trim();
        if (raw && raw.length < 80) {
          authorName = raw;
          break;
        }
      }

      if (!authorName) return;
      annotated.add(commentEl);

      // Escape to prevent HTML injection via author names.
      const safe = authorName
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

      const badge = document.createElement("p");
      badge.innerHTML = `<strong>@${safe}:</strong>`;
      badge.className = "apc-author-badge";
      commentEl.insertBefore(badge, commentEl.firstChild);
    });
  }

  // ─── HTML → Markdown ─────────────────────────────────────────────────────────

  function toMarkdown(html) {
    const td = new TurndownService({
      headingStyle:     "atx",
      hr:               "---",
      bulletListMarker: "-",
      codeBlockStyle:   "fenced",
      fence:            "```",
      emDelimiter:      "_",
      strongDelimiter:  "**",
      linkStyle:        "inlined",
    });

    if (typeof turndownPluginGfm !== "undefined") {
      td.use(turndownPluginGfm.gfm);
    }

    td.keep(["sup", "sub", "mark"]);

    // Images → alt text only (no CDN URLs or JWT thumbnails).
    td.addRule("img-to-alt", {
      filter: "img",
      replacement: (_content, node) => {
        const alt = (node.getAttribute("alt") || "").trim();
        if (!alt || /^:[a-z_]+:$/.test(alt)) return "";
        return `[${alt}]`;
      },
    });

    // Fragment-only anchors → plain text.
    td.addRule("anchor-only-links", {
      filter: (node) =>
        node.nodeName === "A" &&
        (node.getAttribute("href") || "").startsWith("#"),
      replacement: (_content, node) => node.textContent.trim(),
    });

    // Author badge paragraphs → preserve as-is (Turndown handles <strong> fine).

    const raw = td.turndown(html);

    return raw
      .replace(/^-\s*$/gm, "")           // empty list bullets
      .replace(/^\s*\[?\s*\]?\s*$/gm, "") // empty checkbox lines
      .replace(/\n{3,}/g, "\n\n")         // 3+ blank lines → 2
      .trim();
  }
})();
