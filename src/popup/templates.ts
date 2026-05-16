/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 */

import { type Template, saveSettings, rememberTemplateUsage, getRememberedTemplateId } from '../shared/storage';
import { resolveLocalized } from '../shared/library';
import { tOpt } from '../shared/i18n';
import { state, type ExtractedContent } from './state';
import { refs } from './dom';
import { updatePreviewText, updateTokenDisplay, setPreviewOpen } from './preview';
import { detectTemplateId } from './site-detect';


export function applyTemplate(extracted: ExtractedContent, templateId: string | null): string {
  const template = state.templates.find((tpl) => tpl.id === templateId);
  if (!template || !extracted) return '';

  const tplExt = template as Template & { useFullContent?: boolean };
  const useFullContent = tplExt.useFullContent === true;

  const content = extracted.content ?? '';
  const sel = useFullContent ? content : (extracted.selection ?? content);
  const category = state.detectedCategory ?? 'auto';

  const promptValue = typeof template.prompt === 'string'
    ? template.prompt
    : resolveLocalized(template.prompt, state.language || 'en');

  return promptValue
    .replace(/\{content\}/g, content)
    .replace(/\{selection\}/g, sel)
    .replace(/\{title\}/g, extracted.title ?? '')
    .replace(/\{url\}/g, extracted.url ?? '')
    .replace(/\{siteName\}/g, extracted.siteName ?? '')
    .replace(/\{category\}/g, category);
}


export function applyTemplateAndUpdate(): void {
  if (!state.extracted) return;

  state.finalText = applyTemplate(state.extracted, state.selectedTemplateId);
  updateTokenDisplay(state.finalText);
  refs.btnProcess!.disabled = false;
  updatePreviewText();

  if (refs.previewPanel!.classList.contains('hidden')) {
    setPreviewOpen(true);
  }
}


let switchDebounce: ReturnType<typeof setTimeout> | null = null;


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
  renderTemplateCards();
}

export async function selectTemplateForUrl(url?: string): Promise<void> {
  const selectedTemplateId = state.selectedTemplateId;

  const detected = detectTemplateId(url, state.templates, state.extracted?.pageSignals);
  state.detectedCategory = detected?.category;

  const templateId = await getRememberedTemplateId(url, state.templates, selectedTemplateId ?? undefined, detected);
  if (state.selectedTemplateId !== selectedTemplateId) return;
  if (!templateId || templateId === state.selectedTemplateId) return;

  state.selectedTemplateId = templateId;
}

function buildCard(tpl: Template): HTMLButtonElement {
  const locale = state.language || 'en';
  const resolvedName = typeof tpl.name === 'string' ? tpl.name : resolveLocalized(tpl.name, locale);
  const displayLabel = tOpt('template_label_' + tpl.id) ?? tpl.label ?? resolvedName;
  const displayName  = tOpt('template_name_'  + tpl.id) ?? resolvedName;

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
  return btn;
}

function renderTemplateCards(): void {
  const container = refs.templateCards!;
  container.replaceChildren(...state.templates.map(buildCard));
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


function selectCard(templateId: string): void {
  if (templateId === state.selectedTemplateId) return;

  state.selectedTemplateId = templateId;
  void rememberTemplateUsage(state.extracted?.url, templateId);
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


export function wireTemplateUI(): void {
  refs.templateCards!.addEventListener('click', (e) => {
    const card = (e.target as HTMLElement).closest<HTMLElement>('.template-card');
    if (!card?.dataset.id) return;
    selectCard(card.dataset.id);
  });

  refs.templateCards!.addEventListener('keydown', handleCardKeydown);

  refs.btnTemplatesManage?.addEventListener('click', () => {
    void chrome.tabs.create({ url: chrome.runtime.getURL('options/options.html') + '#prompt-library' });
  });
}
