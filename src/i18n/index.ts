import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import nb from './locales/nb.json';
import en from './locales/en.json';
import se from './locales/se.json';
import sma from './locales/sma.json';
import smj from './locales/smj.json';

// IETF BCP 47 standard språkkoder
export const SUPPORTED_LANGUAGES = [
  { code: 'nb', name: 'Norsk (Bokmål)', nativeName: 'Norsk', flag: '🇳🇴' },
  { code: 'se', name: 'Nordsamisk', nativeName: 'Davvisámegiella', flag: '🏳️' },
  { code: 'sma', name: 'Sørsamisk', nativeName: 'Åarjelsaemien', flag: '🏳️' },
  { code: 'smj', name: 'Lulesamisk', nativeName: 'Julevsámegiella', flag: '🏳️' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' }
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code'];

const savedUiLang = typeof window !== 'undefined' ? localStorage.getItem('ui_language') : null;

i18n.use(initReactI18next).init({
  resources: {
    nb: { translation: nb },
    en: { translation: en },
    se: { translation: se },
    sma: { translation: sma },
    smj: { translation: smj }
  },
  lng: savedUiLang || 'nb',
  fallbackLng: 'nb',
  interpolation: {
    escapeValue: false
  }
});

export function setUiLanguage(lang: LanguageCode) {
  i18n.changeLanguage(lang);
  if (typeof window !== 'undefined') {
    localStorage.setItem('ui_language', lang);
  }
}

export default i18n;
