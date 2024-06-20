import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import deTranslation from './de/translations.json';
import enTranslation from './en/translations.json';

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
  },
});

export default i18next;
