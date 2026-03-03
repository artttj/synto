/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */

const en: Record<string, string> = {
  // Popup — static
  popup_preview:          'Preview',
  popup_content_tab:      'Content',
  popup_prompt_tab:       'Prompt',
  popup_refresh_content:  'Refresh content',
  popup_near_limit:       'Near limit',
  popup_chat_placeholder: 'Ask a follow-up\u2026',
  popup_no_key_prefix:    'No API key set. Add it in\u00a0',
  popup_options_link:     'Options',
  popup_no_key_suffix:    '.',

  // Popup — dynamic (used via t() in JS)
  popup_copy_markdown:   'Copy Markdown',
  popup_copy_prompt:     'Copy Prompt',
  popup_copied:          'Copied!',
  popup_ask_chatgpt:     'Ask ChatGPT',
  popup_ask_gemini:      'Ask Gemini',
  popup_ask_grok:        'Ask Grok',
  popup_ask_ai:          'Ask AI',
  popup_asking:          'Asking\u2026',
  popup_export_chat:     'Export .md',
  popup_pin:             'Pin template',
  popup_history_restore: 'Previous conversation on this page',
  popup_history_yes:     'Restore',
  popup_history_dismiss: 'Dismiss',

  // Options — sidebar
  options_brand_sub:    'Settings',
  options_nav_general:  'General',
  options_nav_ai:       'AI Connections',
  options_nav_library:  'Prompt Library',
  options_nav_help:     'Help',
  options_nav_about:    'About',

  // Options — General tab
  options_general_heading:       'General',
  options_general_desc:          'Configure default behaviour when the extension opens.',
  options_default_template:      'Default Template',
  options_default_template_desc: 'Pre-selected prompt when the popup opens',
  options_ai_provider:           'AI Provider',
  options_ai_provider_desc:      'Which service runs the analysis',
  options_theme:                 'Theme',
  options_theme_desc:            'Interface colour scheme',
  options_theme_dark:            'Dark',
  options_theme_light:           'Light',
  options_language:              'Language',
  options_language_desc:         'Interface language',
  options_save:                  'Save Settings',
  options_saved:                 '\u2713 Saved',
  options_system_prompt:         'System Prompt',
  options_system_prompt_desc:    'Prepended to every request. Leave blank to skip.',
  options_system_prompt_placeholder: 'You are a helpful assistant\u2026',

  // Options — AI Connections tab
  options_ai_heading: 'AI Connections',
  options_ai_desc:    'API keys are stored locally on your device and are never transmitted by this extension.',

  // Options — Prompt Library tab
  options_library_heading:    'Prompt Library',
  options_library_desc:       'Browse, search, and manage your prompt templates.',
  options_search_placeholder: 'Search templates\u2026',

  // Options — Help tab
  options_help_heading: 'Help',
  options_help_desc:    'How Synto works and keyboard shortcuts.',

  // Options — About tab
  options_about_heading: 'About Synto',

  // Options — template list
  options_builtin:                    'built-in',
  options_new_template:               'New Template',
  options_new_template_title:         'Add new template',
  options_edit_template:              'Edit Template',
  options_new_category:               'New category\u2026',
  options_delete:                     'Delete',
  options_edit:                       'Edit',
  options_cancel:                     'Cancel',
  options_save_template:              'Save Template',
  options_template_name_placeholder:  'Template name',
  options_template_prompt_placeholder:'Write your prompt here\u2026',
  options_delete_confirm:             'Delete this template?',
  options_no_results:                 'No templates yet.',
  options_no_results_search:          'No templates matching\u00a0"{q}"',

  // Status badges
  status_connected:       'Connected',
  status_not_configured:  'Not Configured',

  // Errors
  error_no_key_openai: 'No OpenAI API key. Add it in Options.',
  error_no_key_gemini: 'No Gemini API key. Add it in Options.',
  error_no_key_grok:   'No Grok API key. Add it in Options.',

  // Template categories
  category_understand: 'Understand',
  category_decide:     'Decide',
  category_act:        'Act',
  category_compose:    'Compose',
  category_custom:     'Custom',
  category_pinned:     'Pinned',

  // Template labels (short button text)
  'template_label_eng-ticket-analysis':       'Ticket',
  'template_label_eng-pr-review':             'Code Review',
  'template_label_understand-structured-brief':'Brief',
  'template_label_decide-brief':              'Decision',
  'template_label_decide-feature-request':    'Feature',
  'template_label_eng-action-items':          'Actions',
  'template_label_extract-risks-blockers':    'Risks',
  'template_label_lifestyle-smart-choice':    'Recommend',
  'template_label_write-compose-answer':      'Reply',
  'template_label_community-rewrite-comment': 'Rewrite',
  'template_label_write-email-helper':        'Email',

  // Template names (full)
  'template_name_eng-ticket-analysis':        'Ticket Analysis',
  'template_name_eng-pr-review':              'PR Review',
  'template_name_understand-structured-brief':'Structured Brief',
  'template_name_decide-brief':               'Decision Brief',
  'template_name_decide-feature-request':     'Feature Request Analysis',
  'template_name_eng-action-items':           'Extract Actions',
  'template_name_extract-risks-blockers':     'Risks & Blockers',
  'template_name_lifestyle-smart-choice':     'Smart Choice',
  'template_name_write-compose-answer':       'Draft Reply',
  'template_name_community-rewrite-comment':  'Rewrite Comment',
  'template_name_write-email-helper':         'Email Helper',
};

export default en;
