import { useLanguage } from '../contexts/LanguageContext';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex gap-2 mb-4">
      <button
        onClick={() => setLanguage('ru')}
        className={`p-2 rounded ${language === 'ru' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
      >
        Рус
      </button>
      <button
        onClick={() => setLanguage('kz')}
        className={`p-2 rounded ${language === 'kz' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
      >
        Каз
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`p-2 rounded ${language === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
      >
        Eng
      </button>
    </div>
  );
};

export default LanguageSwitcher;
