import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ru from './pages/menu/locales/ru.json';
import en from './pages/menu/locales/en.json';
import kz from './pages/menu/locales/kz.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ru: { translation: ru },
      en: { translation: en },
      kz: { translation: kz },
    },
    lng: 'ru',
    fallbackLng: 'ru',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
