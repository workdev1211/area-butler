import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import deTranslation from './de/translations.json';
import enTranslation from './en/translations.json';
import frTranslation from './fr/translations.json';
import itTranslation from './it/translations.json';
import esTranslation from './es/translations.json';
import nlTranslation from './nl/translations.json';

i18next.use(initReactI18next).init({
  lng: 'de', // for language switch
  debug: true,
  resources: {
    de: {
      translation: deTranslation,
    },
    en: {
      translation: enTranslation,
    },
    it: {
      translation: itTranslation,
    },
    nl: {
      translation: nlTranslation,
    },
    fr: {
      translation: frTranslation,
    },
    es: {
      translation: esTranslation,
    },
  },
});

export default i18next;
