import { useTranslation } from "react-i18next";
import { ChevronDown, Globe } from "lucide-react";
import React, { useState } from "react";
const LanguageSwitcher = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { i18n } = useTranslation();
    const languages = [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'ru', name: 'Русский', flag: '🇷🇺' },
        { code: 'kz', name: 'Қазақ', flag: '🇰🇿' },
    ];
    const handleLanguageChange = (lang) => {
        i18n.changeLanguage(lang.code); // глобально меняет язык
        setIsOpen(false);
    };
    const currentLang = (i18n.language || "en").toUpperCase();
    return (<div className="relative">
      <button aria-haspopup="listbox" aria-expanded={isOpen} onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl group">
        <Globe className="w-4 h-4 text-white/90 group-hover:text-white transition-colors"/>
        <span className="text-white/90 group-hover:text-white font-medium text-sm transition-colors">
          {currentLang}
        </span>
        <ChevronDown className={`w-4 h-4 text-white/70 transition-all duration-300 ${isOpen ? 'rotate-180' : ''}`}/>
      </button>

      {isOpen && (<>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} tabIndex={-1} aria-label="Close language menu"/>
          <div className="absolute right-0 top-full mt-2 z-50">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100/50 overflow-hidden min-w-[180px] animate-in fade-in slide-in-from-top-2 duration-200" role="listbox">
              {languages.map((lang, index) => (<button key={lang.code} onClick={() => handleLanguageChange(lang)} className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-green-50 transition-all duration-200 ${currentLang === lang.code.toUpperCase() ? 'bg-green-50 text-green-700' : 'text-gray-700'} ${index === 0 ? '' : 'border-t border-gray-100/50'}`} role="option" aria-selected={currentLang === lang.code.toUpperCase()}>
                  <span className="text-lg">{lang.flag}</span>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">{lang.name}</div>
                    <div className="text-xs text-gray-500">{lang.code.toUpperCase()}</div>
                  </div>
                  {currentLang === lang.code.toUpperCase() && (<div className="w-2 h-2 bg-green-500 rounded-full"></div>)}
                </button>))}
            </div>
          </div>
        </>)}
    </div>);
};
export default LanguageSwitcher;
