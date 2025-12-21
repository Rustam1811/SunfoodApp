import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import { logger } from './lib/logger';

// Trainer OS v1: Load translations from public/locales via HTTP backend
if (!i18n.isInitialized) {
  i18n
    .use(HttpBackend)
    .use(initReactI18next)
    .init({
      backend: {
        loadPath: '/locales/{{lng}}/translation.json',
      },
      supportedLngs: ['ru', 'en', 'kz'],
      lng: 'ru',
      fallbackLng: 'ru',
      debug: false,
      interpolation: { escapeValue: false },
      keySeparator: '.',
      ns: ['translation'],
      defaultNS: 'translation',
    })
    .then(() => {
      logger.debug('i18n initialized', { languages: ['ru', 'en', 'kz'] });
    })
    .catch((error) => {
      logger.error('Failed to initialize i18n', error);
    });
}

export default i18n;
