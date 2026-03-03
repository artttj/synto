/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */

import { TEMPLATE_CATEGORIES } from '../shared/constants';
import { type Template, saveSettings } from '../shared/storage';
import { t } from '../shared/i18n';
import { state, type ExtractedContent } from './state';
import { refs } from './dom';
import { updatePreviewText, updateTokenDisplay, setPreviewOpen } from './preview';

const PINNED_INTENT = '__pinned__';


export function applyTemplate(extracted: ExtractedContent, templateId: string | null): string {
  const template = state.templates.find((tpl) => tpl.id === templateId);
  if (!template || !extracted) return '';

  const sel = extracted.selection ?? extracted.content ?? '';
  return template.prompt
    .replace(/\{content\}/g, extracted.content ?? '')
    .replace(/\{selection\}/g, sel)
    .replace(/\{title\}/g, extracted.title ?? '')
    .replace(/\{url\}/g, extracted.url ?? '')
    .replace(/\{siteName\}/g, extracted.siteName ?? '');
}


export function applyTemplateAndUpdate(): void {
  if (!state.extracted) return;

  state.finalText = applyTemplate(state.extracted, state.selectedTemplateId);
  updateTokenDisplay(state.finalText);
  refs.btnCopyMd!.disabled = false;
  refs.btnProcess!.disabled = false;
  updatePreviewText();

  if (refs.previewPanel!.classList.contains('hidden')) {
    refs.previewPanel!.classList.remove('hidden');
    setPreviewOpen(true);
  }
}


let activeIntent: string = TEMPLATE_CATEGORIES[0];
const intentSelection: Record<string, string> = {};
let switchDebounce: ReturnType<typeof setTimeout> | null = null;


function getIntentList(): string[] {
  const known = new Set(TEMPLATE_CATEGORIES);
  const extra = new Set<string>();
  for (const tpl of state.templates) {
    if (tpl.category && !known.has(tpl.category)) extra.add(tpl.category);
  }
  const list = [...TEMPLATE_CATEGORIES, ...[...extra].sort()];
  if (state.pinnedIds.length > 0) list.unshift(PINNED_INTENT);
  return list;
}

function getTemplatesForIntent(intent: string): Template[] {
  if (intent === PINNED_INTENT) {
    return state.pinnedIds
      .map((id) => state.templates.find((t) => t.id === id))
      .filter((t): t is Template => t !== undefined);
  }
  const list = state.templates.filter((tpl) => tpl.category === intent);
  list.sort((a, b) => {
    const aPinned = state.pinnedIds.includes(a.id) ? 0 : 1;
    const bPinned = state.pinnedIds.includes(b.id) ? 0 : 1;
    return aPinned - bPinned;
  });
  return list;
}

function deriveActiveIntent(): string {
  if (state.selectedTemplateId) {
    const tpl = state.templates.find((tpl) => tpl.id === state.selectedTemplateId);
    if (tpl?.category) {
      const list = getIntentList();
      if (list.includes(tpl.category)) return tpl.category;
    }
  }
  const saved = localStorage.getItem('synto_intent');
  const list = getIntentList();
  if (saved && list.includes(saved)) return saved;
  return list[0] ?? TEMPLATE_CATEGORIES[0];
}

function withPreviewFade(fn: () => void): void {
  const text = refs.previewText;
  if (!text || refs.previewPanel!.classList.contains('hidden')) {
    fn();
    return;
  }
  text.classList.add('fading');
  setTimeout(() => {
    fn();
    text.classList.remove('fading');
  }, 90);
}


export function renderTemplateUI(): void {
  activeIntent = deriveActiveIntent();
  intentSelection[activeIntent] = state.selectedTemplateId ?? '';
  renderIntentTabs();
  renderTemplateCards();
}

function renderIntentTabs(): void {
  const container = refs.intentTabs!;
  container.innerHTML = '';

  for (const intent of getIntentList()) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('role', 'tab');
    btn.className = 'intent-tab' + (intent === activeIntent ? ' active' : '');
    btn.setAttribute('aria-selected', String(intent === activeIntent));
    btn.dataset.intent = intent;
    if (intent === PINNED_INTENT) {
      btn.textContent = t('category_pinned') || 'Pinned';
    } else {
      btn.textContent = t('category_' + intent.toLowerCase()) || intent;
    }
    container.appendChild(btn);
  }
}

function makePinButton(tplId: string): HTMLButtonElement {
  const pinned = state.pinnedIds.includes(tplId);
  const pinBtn = document.createElement('button');
  pinBtn.type = 'button';
  pinBtn.className = 'card-pin-btn' + (pinned ? ' pinned' : '');
  pinBtn.title = t('popup_pin') || 'Pin template';
  pinBtn.setAttribute('aria-label', t('popup_pin') || 'Pin template');
  pinBtn.setAttribute('aria-pressed', String(pinned));
  pinBtn.innerHTML = pinned
    ? `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
  return pinBtn;
}


function renderTemplateCards(): void {
  const container = refs.templateCards!;
  container.innerHTML = '';

  for (const tpl of getTemplatesForIntent(activeIntent)) {
    const displayLabel = t('template_label_' + tpl.id) ?? tpl.label ?? tpl.name;
    const displayName  = t('template_name_'  + tpl.id) ?? tpl.name;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('role', 'option');
    btn.setAttribute('aria-selected', String(tpl.id === state.selectedTemplateId));
    btn.setAttribute('tabindex', tpl.id === state.selectedTemplateId ? '0' : '-1');
    btn.setAttribute('aria-label', displayName);
    btn.title = displayName;
    btn.className = 'template-card' + (tpl.id === state.selectedTemplateId ? ' selected' : '');
    btn.dataset.id = tpl.id;
    btn.textContent = displayLabel;

    const pinBtn = makePinButton(tpl.id);
    btn.appendChild(pinBtn);

    container.appendChild(btn);
  }
}

function updateCardSelection(): void {
  const cards = refs.templateCards!.querySelectorAll<HTMLElement>('.template-card');
  for (const card of cards) {
    const selected = card.dataset.id === state.selectedTemplateId;
    card.classList.toggle('selected', selected);
    card.setAttribute('aria-selected', String(selected));
    card.setAttribute('tabindex', selected ? '0' : '-1');
  }
}

function updateTabActiveState(): void {
  const tabs = refs.intentTabs!.querySelectorAll<HTMLElement>('.intent-tab');
  for (const tab of tabs) {
    const active = tab.dataset.intent === activeIntent;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
  }
}


function switchIntent(intent: string): void {
  activeIntent = intent;
  localStorage.setItem('synto_intent', intent);

  const saved = intentSelection[intent] ?? localStorage.getItem('synto_intent_sel_' + intent);
  const templates = getTemplatesForIntent(intent);
  const targetId = saved && templates.find((tpl) => tpl.id === saved)
    ? saved
    : templates[0]?.id ?? null;

  if (targetId && targetId !== state.selectedTemplateId) {
    state.selectedTemplateId = targetId;
    void saveSettings({ defaultTemplateId: targetId });
    applyTemplateAndUpdate();
  }

  renderTemplateCards();
  updateTabActiveState();
}

function selectCard(templateId: string): void {
  if (templateId === state.selectedTemplateId) return;

  state.selectedTemplateId = templateId;
  intentSelection[activeIntent] = templateId;
  localStorage.setItem('synto_intent_sel_' + activeIntent, templateId);
  updateCardSelection();

  if (switchDebounce !== null) clearTimeout(switchDebounce);
  switchDebounce = setTimeout(() => {
    void saveSettings({ defaultTemplateId: templateId });
    withPreviewFade(() => applyTemplateAndUpdate());
    switchDebounce = null;
  }, 150);
}

function handleCardKeydown(e: KeyboardEvent): void {
  const cards = Array.from(
    refs.templateCards!.querySelectorAll<HTMLElement>('.template-card')
  );
  if (!cards.length) return;

  const idx = cards.indexOf(document.activeElement as HTMLElement);

  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    e.preventDefault();
    cards[(idx + 1) % cards.length].focus();
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    e.preventDefault();
    cards[(idx - 1 + cards.length) % cards.length].focus();
  } else if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    const focused = document.activeElement as HTMLElement;
    if (focused.dataset.id) selectCard(focused.dataset.id);
  }
}


function togglePin(tplId: string): void {
  const idx = state.pinnedIds.indexOf(tplId);
  if (idx === -1) {
    state.pinnedIds = [...state.pinnedIds, tplId];
  } else {
    state.pinnedIds = state.pinnedIds.filter((id) => id !== tplId);
  }
  void saveSettings({ pinnedTemplateIds: state.pinnedIds });
  renderTemplateUI();
}


export function wireTemplateUI(): void {
  refs.intentTabs!.addEventListener('click', (e) => {
    const tab = (e.target as HTMLElement).closest<HTMLElement>('.intent-tab');
    if (!tab?.dataset.intent) return;
    switchIntent(tab.dataset.intent);
  });

  refs.templateCards!.addEventListener('click', (e) => {
    const pinBtn = (e.target as HTMLElement).closest<HTMLElement>('.card-pin-btn');
    if (pinBtn) {
      e.stopPropagation();
      const card = pinBtn.closest<HTMLElement>('.template-card');
      if (card?.dataset.id) togglePin(card.dataset.id);
      return;
    }
    const card = (e.target as HTMLElement).closest<HTMLElement>('.template-card');
    if (!card?.dataset.id) return;
    selectCard(card.dataset.id);
  });

  refs.templateCards!.addEventListener('keydown', handleCardKeydown);
}
