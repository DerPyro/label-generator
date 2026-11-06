import { english } from './translations.js';

export const LANGUAGE_KEY = 'label-generator-v3-language';
export function detectLanguage(languages = []) {
  for (const value of languages) {
    const language = String(value).toLowerCase().split(/[-_]/)[0];
    if (language === 'de' || language === 'en') return language;
  }
  return 'en';
}
function initialLanguage() {
  if (typeof document === 'undefined') return 'de';
  try {
    const saved = globalThis.localStorage?.getItem(LANGUAGE_KEY);
    if (saved === 'de' || saved === 'en') return saved;
  } catch { /* Language selection also works without storage. */ }
  return globalThis.navigator ? detectLanguage(navigator.languages?.length ? navigator.languages : [navigator.language]) : 'de';
}
let language = initialLanguage();
export const getLanguage = () => language;
export const locale = () => language === 'de' ? 'de-DE' : 'en-GB';
const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const patterns = Object.entries(english).filter(([source]) => /\{\d+\}/.test(source)).map(([source, target]) => {
  const parameters = [...source.matchAll(/\{(\d+)\}/g)].map(match => Number(match[1]));
  return { source, expression: new RegExp('^' + source.split(/\{\d+\}/).map(escapeRegex).join('([\\s\\S]*?)') + '$'), target, parameters };
});

/** Translate explicit UI messages only. Interpolated user data is never retranslated. */
export function t(message) {
  if (typeof message !== 'string' || language === 'de') return message;
  if (Object.hasOwn(english, message)) return english[message];
  const trimmed = message.trim();
  if (Object.hasOwn(english, trimmed)) return message.replace(trimmed, english[trimmed]);
  for (const { source, expression, target, parameters } of patterns) {
    const match = expression.exec(message);
    if (match) {
      const values = new Map(parameters.map((parameter, index) => [parameter, match[index + 1]]));
      if (['Druckbogen: {0}', 'Der gespeicherte Druckwarenkorb konnte nicht geladen werden: {0}', '{0} fehlt.', '{0} muss zwischen {1} und {2} liegen.'].includes(source)) values.set(0,t(values.get(0)));
      return target.replace(/\{(\d+)\}/g, (_, index) => values.get(Number(index)) ?? '');
    }
  }
  return message;
}

export function layerLabel(label) {
  const match = /^(.*) · Stufe (\d+)\/(\d+)$/.exec(label);
  return match ? t(match[1]) + t(' · Stufe ' + match[2] + '/' + match[3]) : t(label);
}

export function setLanguage(value) {
  if (!['de', 'en'].includes(value)) throw Error('Unsupported language');
  language = value;
  try { if (typeof document !== 'undefined') globalThis.localStorage?.setItem(LANGUAGE_KEY, value); } catch { /* Optional persistence. */ }
}

/** Register the original static copy once; dynamic controls are translated by their renderers. */
export function mountLanguageControl(onChange) {
  const texts = [], attributes = [];
  const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.textContent.trim() && !node.parentElement.closest('script,style,[data-language-control]')) texts.push([node, node.textContent]);
  }
  for (const element of document.querySelectorAll('[placeholder],[aria-label],[title]')) {
    for (const name of ['placeholder', 'aria-label', 'title']) if (element.hasAttribute(name)) attributes.push([element, name, element.getAttribute(name)]);
  }
  const button = document.querySelector('#language-toggle');
  function apply() {
    document.documentElement.lang = language;
    for (const [node, source] of texts) if (node.isConnected) node.textContent = t(source);
    for (const [element, name, source] of attributes) if (element.isConnected && element !== button) element.setAttribute(name, t(source));
    button.textContent = language === 'de' ? 'English' : 'Deutsch';
    button.lang = language === 'de' ? 'en' : 'de';
    button.setAttribute('aria-label', language === 'de' ? 'Switch to English' : 'Auf Deutsch wechseln');
    button.title = button.getAttribute('aria-label');
  }
  button.addEventListener('click', () => { setLanguage(language === 'de' ? 'en' : 'de'); apply(); onChange(); });
  apply();
  return apply;
}
