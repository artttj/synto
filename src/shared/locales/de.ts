/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */

const de: Record<string, string> = {
  // Popup — static
  popup_preview:          'Vorschau',
  popup_content_tab:      'Inhalt',
  popup_prompt_tab:       'Prompt',
  popup_refresh_content:  'Inhalt aktualisieren',
  popup_near_limit:       'Fast am Limit',
  popup_chat_placeholder: 'Nachfrage stellen\u2026',
  popup_no_key_prefix:    'Kein API-Schl\u00fcssel. In den\u00a0',
  popup_options_link:     'Einstellungen',
  popup_no_key_suffix:    '\u00a0hinzuf\u00fcgen.',

  // Popup — dynamic
  popup_copy_markdown:   'Markdown kopieren',
  popup_copy_prompt:     'Prompt kopieren',
  popup_copied:          'Kopiert!',
  popup_ask_chatgpt:     'ChatGPT fragen',
  popup_ask_gemini:      'Gemini fragen',
  popup_ask_grok:        'Grok fragen',
  popup_ask_ai:          'KI fragen',
  popup_asking:          'Anfrage l\u00e4uft\u2026',
  popup_export_chat:     'Als .md exportieren',
  popup_pin:             'Template anpinnen',
  popup_history_restore: 'Vorherige Unterhaltung auf dieser Seite',
  popup_history_yes:     'Wiederherstellen',
  popup_history_dismiss: 'Schlie\u00dfen',

  // Options — sidebar
  options_brand_sub:    'Einstellungen',
  options_nav_general:  'Allgemein',
  options_nav_ai:       'AI-Verbindungen',
  options_nav_library:  'Prompt-Bibliothek',
  options_nav_help:     'Hilfe',
  options_nav_about:    '\u00dcber',

  // Options — General tab
  options_general_heading:       'Allgemein',
  options_general_desc:          'Standardverhalten beim \u00d6ffnen der Erweiterung festlegen.',
  options_default_template:      'Standard-Template',
  options_default_template_desc: 'Vorausgew\u00e4hlter Prompt beim \u00d6ffnen',
  options_ai_provider:           'AI-Anbieter',
  options_ai_provider_desc:      'Welcher Dienst die Analyse durchf\u00fchrt',
  options_theme:                 'Theme',
  options_theme_desc:            'Farbschema der Oberfl\u00e4che',
  options_theme_dark:            'Dunkel',
  options_theme_light:           'Hell',
  options_language:              'Sprache',
  options_language_desc:         'Sprache der Benutzeroberfl\u00e4che',
  options_save:                  'Einstellungen speichern',
  options_saved:                 '\u2713 Gespeichert',
  options_system_prompt:         'System-Prompt',
  options_system_prompt_desc:    'Wird jeder Anfrage vorangestellt. Leer lassen zum \u00dcberspringen.',
  options_system_prompt_placeholder: 'Du bist ein hilfreicher Assistent\u2026',

  // Options — AI Connections tab
  options_ai_heading: 'AI-Verbindungen',
  options_ai_desc:    'API-Schl\u00fcssel werden lokal auf Ihrem Ger\u00e4t gespeichert und nie \u00fcbertragen.',

  // Options — Prompt Library tab
  options_library_heading:    'Prompt-Bibliothek',
  options_library_desc:       'Prompt-Templates durchsuchen und verwalten.',
  options_search_placeholder: 'Templates suchen\u2026',

  // Options — Help tab
  options_help_heading: 'Hilfe',
  options_help_desc:    'So funktioniert Synto und Tastaturk\u00fcrzel.',

  // Options — About tab
  options_about_heading: '\u00dcber Synto',

  // Options — template list
  options_builtin:                    'integriert',
  options_new_template:               'Neues Template',
  options_new_template_title:         'Neues Template hinzuf\u00fcgen',
  options_edit_template:              'Template bearbeiten',
  options_new_category:               'Neue Kategorie\u2026',
  options_delete:                     'L\u00f6schen',
  options_edit:                       'Bearbeiten',
  options_cancel:                     'Abbrechen',
  options_save_template:              'Template speichern',
  options_template_name_placeholder:  'Template-Name',
  options_template_prompt_placeholder:'Prompt hier eingeben\u2026',
  options_delete_confirm:             'Dieses Template l\u00f6schen?',
  options_no_results:                 'Keine Templates vorhanden.',
  options_no_results_search:          'Keine Templates f\u00fcr\u00a0"{q}"',

  // Status badges
  status_connected:       'Verbunden',
  status_not_configured:  'Nicht konfiguriert',

  // Errors
  error_no_key_openai: 'Kein OpenAI API-Schl\u00fcssel. Unter Einstellungen hinzuf\u00fcgen.',
  error_no_key_gemini: 'Kein Gemini API-Schl\u00fcssel. Unter Einstellungen hinzuf\u00fcgen.',
  error_no_key_grok:   'Kein Grok API-Schl\u00fcssel. Unter Einstellungen hinzuf\u00fcgen.',

  // Template categories
  category_understand: 'Verstehen',
  category_decide:     'Entscheiden',
  category_act:        'Handeln',
  category_compose:    'Verfassen',
  category_custom:     'Benutzerdefiniert',
  category_pinned:     'Angeheftet',

  // Template labels (short button text)
  'template_label_eng-ticket-analysis':       'Ticket',
  'template_label_eng-pr-review':             'Code Review',
  'template_label_understand-structured-brief':'Briefing',
  'template_label_decide-brief':              'Entscheidung',
  'template_label_decide-feature-request':    'Feature',
  'template_label_eng-action-items':          'Aktionen',
  'template_label_extract-risks-blockers':    'Risiken',
  'template_label_lifestyle-smart-choice':    'Empfehlung',
  'template_label_write-compose-answer':      'Antwort',
  'template_label_community-rewrite-comment': 'Umschreiben',
  'template_label_write-email-helper':        'E-Mail',

  // Template names (full)
  'template_name_eng-ticket-analysis':        'Ticket-Analyse',
  'template_name_eng-pr-review':              'PR Review',
  'template_name_understand-structured-brief':'Strukturiertes Briefing',
  'template_name_decide-brief':               'Entscheidungshilfe',
  'template_name_decide-feature-request':     'Feature-Anfrage-Analyse',
  'template_name_eng-action-items':           'Aktionen extrahieren',
  'template_name_extract-risks-blockers':     'Risiken & Blocker',
  'template_name_lifestyle-smart-choice':     'Beste Wahl',
  'template_name_write-compose-answer':       'Antwort entwerfen',
  'template_name_community-rewrite-comment':  'Kommentar umschreiben',
  'template_name_write-email-helper':         'E-Mail-Assistent',
};

export default de;
