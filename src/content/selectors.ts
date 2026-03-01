export const MSG_EXTRACT = 'EXTRACT_CONTENT';

export const STRIP_SELECTORS = [
  'script', 'style', 'noscript', 'iframe', 'canvas',
  'nav', 'footer', 'aside',
  'form', 'input', 'select',
  "[role='navigation']", "[role='banner']", "[role='contentinfo']",
  "[role='complementary']", "[role='toolbar']", "[role='menu']",
  "[role='menubar']", "[role='menuitem']", "[role='dialog']",
  "[role='alertdialog']", "[role='tooltip']", "[role='status']",
  '#LanguageMenu', "[id^='Microsoft_Translator']", "[class*='VIpgJd']",
  '#onetrust-banner-sdk', '#onetrust-consent-sdk',
  "[id='CybotCookiebotDialog']", "[id='cookie-law-info-bar']",
  "[id='cookie-notice']", "[id='cookie-banner']",
  "[id='gdpr-banner']", "[id='consent-banner']",
  "[class*='cookie-banner']", "[class*='cookie-notice']", "[class*='cookie-bar']",
  "[class*='gdpr-banner']", "[class*='cc-window']",
  "[class*='newsletter-signup']", "[class*='newsletter-block']", "[id*='newsletter']",
  "[class*='social-share']", "[class*='share-buttons']", "[class*='share-bar']",
  "[id^='google_ads_']", 'ins.adsbygoogle',
  "[class*='advertisement']", "[class*='sponsored-content']",
  "[class*='intercom']", "[class*='helpscout']", "[class*='drift-']",
  "[id*='hubspot']", "[class*='chat-widget']",
  '#navFooter', '#rhf', '#nav-belt', '#nav-top',
  "[id*='-sims-']", '.a-carousel-container',
  "[data-component-type='s-search-results']",
  '#related', '#secondary',
  '.pull-request-overview', "[data-qa='pr-sidebar']", "[data-testid='pullrequest-sidebar']",
  '.diff-tree-list', '.review-bar-component',
].join(',');

// Tried in order; first match with enough text wins.
export const MAIN_SELECTORS = [
  'article', "[role='main']", 'main',
  '#main-content', '#content', '#article-body', '#story',
  '#post-content', '#entry-content', '.post-body',
  '.js-discussion', '.repository-content',
  '#issue-content',
  '#pullrequest-diff', "[data-qa='pr-diff']", "[data-testid='pullrequest-diff']",
  '.diff-container',
  '.diff-files-holder', '.files-changed-inner', '.merge-request-tabs-content',
  '#centerCol', '#dp', '#ppd',
];
