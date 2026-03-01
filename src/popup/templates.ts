/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */

import { TEMPLATE_CATEGORIES } from '../shared/constants';
import { type Template, saveSettings } from '../shared/storage';
import { state, type ExtractedContent } from './state';
import { refs } from './dom';
import { updatePreviewText, updateTokenDisplay, setPreviewOpen } from './preview';


export function applyTemplate(extracted: ExtractedContent, templateId: string | null): string {
  const template = state.templates.find((t) => t.id === templateId);
  if (!template || !extracted) return '';

  const sel = extracted.selection ?? extracted.content ?? '';
  return template.prompt
    .replace(/\{content\}/g, extracted.content ?? '')
    .replace(/\{selection\}/g, sel)
    .replace(/\{title\}/g, extracted.title ?? '')
    .replace(/\{url\}/g, extracted.url ?? '')
    .replace(/\{excerpt\}/g, extracted.excerpt ?? '')
    .replace(/\{byline\}/g, extracted.byline ?? '')
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
  for (const t of state.templates) {
    if (t.category && !known.has(t.category)) extra.add(t.category);
  }
  return [...TEMPLATE_CATEGORIES, ...[...extra].sort()];
}

function getTemplatesForIntent(intent: string): Template[] {
  return state.templates.filter((t) => t.category === intent);
}

function deriveActiveIntent(): string {
  if (state.selectedTemplateId) {
    const tpl = state.templates.find((t) => t.id === state.selectedTemplateId);
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
    btn.textContent = intent;
    container.appendChild(btn);
  }
}

function renderTemplateCards(): void {
  const container = refs.templateCards!;
  container.innerHTML = '';

  for (const t of getTemplatesForIntent(activeIntent)) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('role', 'option');
    btn.setAttribute('aria-selected', String(t.id === state.selectedTemplateId));
    btn.setAttribute('tabindex', t.id === state.selectedTemplateId ? '0' : '-1');
    btn.setAttribute('aria-label', t.name);
    btn.title = t.name;
    btn.className = 'template-card' + (t.id === state.selectedTemplateId ? ' selected' : '');
    btn.dataset.id = t.id;
    btn.textContent = t.label ?? t.name;
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
  const targetId = saved && templates.find((t) => t.id === saved)
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

  // Debounce save + apply to prevent rapid-fire calls on quick switching
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


export function wireTemplateUI(): void {
  refs.intentTabs!.addEventListener('click', (e) => {
    const tab = (e.target as HTMLElement).closest<HTMLElement>('.intent-tab');
    if (!tab?.dataset.intent) return;
    switchIntent(tab.dataset.intent);
  });

  refs.templateCards!.addEventListener('click', (e) => {
    const card = (e.target as HTMLElement).closest<HTMLElement>('.template-card');
    if (!card?.dataset.id) return;
    selectCard(card.dataset.id);
  });

  refs.templateCards!.addEventListener('keydown', handleCardKeydown);
}
