import React, { useState } from 'react';
import Drinks from './Drinks';
import Eats from './Eats';
import { useLanguage } from '../../contexts/LanguageContext';
const Menu = () => {
    const [tab, setTab] = useState('drinks');
    const { language, setLanguage } = useLanguage();
    return (<div className="min-h-screen bg-coffee-cream">
      {/* Header + Language Switch */}
      <header className="bg-coffee-dark p-4 shadow flex justify-between items-center">
        <h1 className="text-2xl font-display text-white">Меню</h1>
        <select value={language} onChange={e => setLanguage(e.target.value)} className="bg-white text-coffee-dark rounded-full px-3 py-1">
          <option value="ru">RU</option>
          <option value="kz">KZ</option>
          <option value="en">EN</option>
        </select>
      </header>

      {/* Tabs */}
      <nav className="bg-coffee-charcoal flex gap-6 px-4 py-3">
        <button onClick={() => setTab('drinks')} className={`px-4 py-2 rounded-full font-semibold transition ${tab === 'drinks'
            ? 'bg-white text-coffee-dark shadow-lg scale-105'
            : 'text-gray-400'}`}>
          {language === 'en'
            ? 'Drinks'
            : language === 'kz'
                ? 'Ішу сусындар'
                : 'Напитки'}
        </button>
        <button onClick={() => setTab('eats')} className={`px-4 py-2 rounded-full font-semibold transition ${tab === 'eats'
            ? 'bg-white text-coffee-dark shadow-lg scale-105'
            : 'text-gray-400'}`}>
          {language === 'en'
            ? 'Eats'
            : language === 'kz'
                ? 'Жеңіл тағамдар'
                : 'Выпечка и Завтраки'}
        </button>
      </nav>

      {/* Content */}
      <main className="px-4 overflow-auto">
        {tab === 'drinks' ? <Drinks /> : <Eats />}
      </main>
    </div>);
};
export default Menu;
