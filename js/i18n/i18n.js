/**
 * i18n — 国际化管理（支持科学版/营销版切换）
 */
import zh from './zh.js';
import en from './en.js';
import zhMarketing from './zh-marketing.js';
import enMarketing from './en-marketing.js';

const packs = {
  zh, en,
  'zh-marketing': zhMarketing,
  'en-marketing': enMarketing
};

let currentLang = 'zh';
let currentEdition = 'science'; // 'science' | 'marketing'
const listeners = [];
const editionListeners = [];

export function getLang() { return currentLang; }
export function getEdition() { return currentEdition; }
export function isMarketing() { return currentEdition === 'marketing'; }

export function setLang(lang) {
  if (lang !== 'zh' && lang !== 'en') return;
  currentLang = lang;
  localStorage.setItem('bb-lang', lang);
  listeners.forEach(fn => fn(lang));
}

export function setEdition(edition) {
  if (edition !== 'science' && edition !== 'marketing') return;
  currentEdition = edition;
  localStorage.setItem('bb-edition', edition);
  editionListeners.forEach(fn => fn(edition));
  // Also trigger lang listeners to refresh UI
  listeners.forEach(fn => fn(currentLang));
}

export function t(key) {
  // Marketing edition: try marketing pack first, fallback to base
  if (currentEdition === 'marketing') {
    const mpack = packs[currentLang + '-marketing'];
    if (mpack && mpack[key]) return mpack[key];
  }
  return packs[currentLang]?.[key] || packs.zh[key] || key;
}

export function onLangChange(fn) {
  listeners.push(fn);
}

export function onEditionChange(fn) {
  editionListeners.push(fn);
}

// Restore saved preferences
const savedLang = localStorage.getItem('bb-lang');
if (savedLang && (savedLang === 'zh' || savedLang === 'en')) currentLang = savedLang;

const savedEdition = localStorage.getItem('bb-edition');
if (savedEdition && (savedEdition === 'science' || savedEdition === 'marketing')) currentEdition = savedEdition;

// URL param override
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('edition') === 'marketing') currentEdition = 'marketing';
if (urlParams.get('edition') === 'science') currentEdition = 'science';
