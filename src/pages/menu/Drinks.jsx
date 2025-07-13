import React, { useState, useCallback, useMemo, useEffect, useReducer } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon, ShoppingCartIcon, HeartIcon, LanguageIcon } from "@heroicons/react/24/outline";
import { HeartIcon as SolidHeartIcon } from "@heroicons/react/24/solid";
import { drinkCategories } from "../menu/data/drinksData";
// Импорт переводов из папки locales
import ruTranslations from "./locales/ru.json";
import enTranslations from "./locales/en.json";
import kzTranslations from "./locales/kz.json";
const mockUser = { name: "Алекс" };
// Объект переводов
const translations = {
    ru: ruTranslations,
    en: enTranslations,
    kz: kzTranslations
};
const languages = [
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'kz', name: 'Қазақша', flag: '🇰🇿' }
];
const SIZES = [
    { key: "S", label: "S", ml: 250, priceMultiplier: 1 },
    { key: "M", label: "M", ml: 350, priceMultiplier: 1.2 },
    { key: "L", label: "L", ml: 450, priceMultiplier: 1.4 }
];
const MILKS = [
    { key: "none", name: "Без молока", price: 0, image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200&h=200&fit=crop" },
    { key: "regular", name: "Молоко", price: 0, image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200&h=200&fit=crop" },
    { key: "lactose_free", name: "Молоко безлактозное", price: 400, image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200&h=200&fit=crop" },
    { key: "almond", name: "Молоко миндальное", price: 450, image: "https://images.unsplash.com/photo-1569478412303-6f566ac41a37?w=200&h=200&fit=crop" },
    { key: "coconut", name: "Молоко кокосовое", price: 450, image: "https://images.unsplash.com/photo-1520869562399-e772f042f422?w=200&h=200&fit=crop" },
    { key: "banana", name: "Молоко банановое", price: 450, image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&h=200&fit=crop" },
    { key: "oat", name: "Молоко овсяное", price: 300, image: "https://images.unsplash.com/photo-1600623560792-d0b2d4e30b91?w=200&h=200&fit=crop" }
];
const SYRUPS = [
    { key: "none", name: "Без сиропа", price: 0, image: "https://images.unsplash.com/photo-1587736174440-ddbf2b6a3b4b?w=200&h=200&fit=crop" },
    { key: "vanilla", name: "Сироп ванильный", price: 200, image: "https://images.unsplash.com/photo-1587736174440-ddbf2b6a3b4b?w=200&h=200&fit=crop" },
    { key: "chestnut", name: "Сироп каштановый", price: 200, image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop" },
    { key: "cherry", name: "Сироп вишнёвый ликёр", price: 200, image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=200&h=200&fit=crop" },
    { key: "plum", name: "Сироп сливочный", price: 200, image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&h=200&fit=crop" },
    { key: "caramel", name: "Сироп карамельный", price: 200, image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=200&h=200&fit=crop" },
    { key: "coconut_syrup", name: "Сироп кокосовый", price: 200, image: "https://images.unsplash.com/photo-1520869562399-e772f042f422?w=200&h=200&fit=crop" },
    { key: "mint", name: "Сироп мятный", price: 200, image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop" },
    { key: "banana_syrup", name: "Сироп банановый", price: 200, image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&h=200&fit=crop" }
];
const SUGAR = [
    { key: "none", name: "Без сахара" },
    { key: "regular", name: "Обычный сахар" },
    { key: "brown", name: "Коричневый сахар" },
];
const ADDON_TABS = [
    { key: 'milk', label: 'Молоко', options: MILKS },
    { key: 'syrup', label: 'Сиропы', options: SYRUPS },
    { key: 'sugar', label: 'Сахар', options: SUGAR }
    // Можешь добавить: toppings, sugar и т.д.
];
const OptionButton = ({ isActive, onClick, children }) => (<button onClick={onClick} className={`px-4 py-2 rounded-lg font-semibold transition-colors ${isActive ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}>
        {children}
    </button>);
const ProductSkeleton = () => (<div className="h-[260px] bg-slate-200 rounded-3xl animate-pulse"/>);
const LanguageSelector = ({ currentLanguage, onLanguageChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (<div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 p-2 rounded-lg bg-white/60 backdrop-blur-md shadow-sm hover:bg-white/80 transition-colors">
                <LanguageIcon className="h-5 w-5 text-slate-600"/>
                <span className="text-sm font-medium text-slate-700">
                    {languages.find(lang => lang.code === currentLanguage)?.flag}
                </span>
            </button>

            <AnimatePresence>
                {isOpen && (<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-12 right-0 bg-white rounded-lg shadow-lg border border-slate-200 py-2 min-w-[120px] z-50">
                        {languages.map((lang) => (<button key={lang.code} onClick={() => {
                    onLanguageChange(lang.code);
                    setIsOpen(false);
                }} className={`w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 ${currentLanguage === lang.code ? 'bg-slate-100' : ''}`}>
                                <span>{lang.flag}</span>
                                <span className="text-sm">{lang.name}</span>
                            </button>))}
                    </motion.div>)}
            </AnimatePresence>
        </div>);
};
const CategoryTab = ({ title, isActive, onClick, t }) => (<motion.button onClick={onClick} className="relative px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex-shrink-0">
        <span className={`relative z-10 transition-colors ${isActive ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}>
            {t(title)}
        </span>
        {isActive && (<motion.div layoutId="category-highlight" className="absolute inset-0 bg-white rounded-lg shadow-md z-0" transition={{ type: 'spring', stiffness: 350, damping: 30 }}/>)}
    </motion.button>);
const ProductCard = ({ product, onSelect, onFav, isFavorite, t }) => (<motion.div layout variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }} onClick={() => onSelect(product)} className="relative group cursor-pointer">
        <div className="absolute top-3 right-3 z-10">
            <motion.button onClick={(e) => { e.stopPropagation(); onFav(product.id); }} whileTap={{ scale: 1.3 }} className="w-9 h-9 rounded-full flex items-center justify-center bg-white/60 backdrop-blur-md shadow-sm">
                {isFavorite ? (<SolidHeartIcon className="w-5 h-5 text-red-500"/>) : (<HeartIcon className="w-5 h-5 text-slate-400"/>)}
            </motion.button>
        </div>
        <div className="bg-white rounded-3xl p-4 pt-28 text-center shadow-lg transition-shadow group-hover:shadow-xl">
            <motion.img layoutId={`product-image-${product.id}`} src={product.image} alt={t(product.name)} className="w-32 h-32 absolute top-0 left-1/2 -translate-x-1/2 drop-shadow-lg group-hover:scale-105 transition-transform"/>
            <h3 className="font-bold text-base text-slate-800 line-clamp-2 h-12">{t(product.name)}</h3>
            <p className="text-xl font-black text-slate-900 mt-2">{product.price} ₸</p>
        </div>
    </motion.div>);
const ProductConfigurator = ({ product, onClose, onAddToCart, t }) => {
    const initialState = { sizeKey: "M", milkKey: "regular", syrupKey: "none", quantity: 1 };
    const [activeAddonTab, setActiveAddonTab] = useState(null);
    const reducer = (state, action) => {
        switch (action.type) {
            case "SET_OPTION": return { ...state, [action.field]: action.key };
            case "SET_QUANTITY": return { ...state, quantity: Math.max(1, state.quantity + action.delta) };
            default: return state;
        }
    };
    const [state, dispatch] = useReducer(reducer, initialState);
    const calcPrice = useCallback(() => {
        if (!product)
            return 0;
        const size = SIZES.find(s => s.key === state.sizeKey);
        const syrup = SYRUPS.find(s => s.key === state.syrupKey);
        return Math.round((product.price * (size?.priceMultiplier || 1) + (syrup?.price || 0)) * state.quantity);
    }, [product, state]);
    const totalPrice = calcPrice();
    const handleAddToCart = () => {
        onAddToCart({
            productId: product.id,
            name: t(product.name),
            ...state,
            totalPrice
        });
        onClose();
    };
    if (!product)
        return null;
    return (<div className="fixed inset-0 z-50 flex items-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/50 backdrop-blur-sm"/>

            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 400, damping: 45 }} className="relative z-10 w-full bg-slate-100 rounded-t-3xl flex flex-col max-h-[90vh]">
                <header className="flex-shrink-0 p-4 pt-6 text-center relative border-b border-slate-200">
                    <motion.img layoutId={`product-image-${product.id}`} src={product.image} alt={t(product.name)} className="w-40 h-40 mx-auto -mt-24 drop-shadow-2xl"/>
                    <h2 className="text-3xl font-extrabold text-slate-900 mt-4">{t(product.name)}</h2>
                    <p className="text-sm text-slate-500 mt-2 px-4">{t(product.description)}</p>
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-slate-200/80 hover:bg-slate-300">
                        <XMarkIcon className="h-5 w-5 text-slate-600"/>
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto px-6 py-2 space-y-5 pb-24">
                    <div className="space-y-3">
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {ADDON_TABS.map(tab => (<button key={tab.key} onClick={() => setActiveAddonTab(tab.key)} className={`px-4 py-2 rounded-xl font-semibold transition-all ${activeAddonTab === tab.key
                ? 'bg-white text-slate-900 shadow border border-slate-300'
                : 'bg-slate-100 text-slate-500'}`}>
                                    {tab.label}
                                </button>))}
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {ADDON_TABS.find(t => t.key === activeAddonTab)?.options.map(opt => (<OptionButton key={opt.key} isActive={state[`${activeAddonTab}Key`] === opt.key} onClick={() => dispatch({
                type: 'SET_OPTION',
                field: `${activeAddonTab}Key`,
                key: opt.key
            })}>
                                    {opt.name} {'price' in opt && opt.price ? `+${opt.price}₸` : ''}
                                </OptionButton>))}
                        </div>
                    </div>



                    <div className="space-y-3">
                        <h4 className="font-bold text-slate-800">{t('ui.together_better') || 'Вместе вкуснее'}</h4>
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {product.togetherBetter?.map(item => (<div key={item.id} className="flex-shrink-0 w-28 bg-white rounded-xl p-2 text-center shadow-sm border border-slate-200">
                                    <img src={item.image} alt={item.name} className="w-16 h-16 object-contain mx-auto rounded-lg mb-1"/>
                                    <p className="text-xs font-semibold text-slate-700">{item.name}</p>
                                </div>))}
                        </div>

                        <div className="flex items-center gap-2 p-1 bg-slate-200 rounded-full">
                            <div className="grid grid-cols-3 gap-3">
                                {SIZES.map(size => <button key={size.key} onClick={() => dispatch({ type: 'SET_OPTION', field: 'sizeKey', key: size.key })} className={`py-2 rounded-full border-2 transition-all ${state.sizeKey === size.key ? 'bg-slate-800 text-white border-slate-800 shadow-lg' : 'bg-white text-slate-800 border-slate-200'}`}>
                                        <span className="text-2xl font-black">{size.label}</span>
                                        <span className="block text-xs opacity-70">{size.ml} мл</span>
                                    </button>)}
                            </div>
                            <motion.button onClick={handleAddToCart} whileTap={{ scale: 0.97 }} className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-base font-bold py-4 rounded-xl shadow-lg shadow-orange-500/20">
                                {t('ui.add_for') || 'Добавить за'} {totalPrice} ₸
                            </motion.button>
                        </div>
                    </div>
                </div>

                <footer className="flex-shrink-0 p-4 pt-3 bg-white/80 backdrop-blur-md border-t border-slate-200/80 flex items-center gap-4 pb-8">
                </footer>
            </motion.div>
        </div>);
};
export default function Drinks() {
    const [currentLanguage, setCurrentLanguage] = useState('ru');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategoryIdx, setSelectedCategoryIdx] = useState(0);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [favorites, setFavorites] = useState(new Set());
    const [cart, setCart] = useState([]);
    // Функция перевода с использованием JSON файлов
    const t = useCallback((key) => {
        const keys = key.split('.');
        let value = translations[currentLanguage];
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            }
            else {
                return key; // Возвращаем ключ, если перевод не найден
            }
        }
        return typeof value === 'string' ? value : key;
    }, [currentLanguage]);
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);
    // Загрузка языка из localStorage при инициализации
    useEffect(() => {
        const savedLanguage = localStorage.getItem('language');
        if (savedLanguage && ['ru', 'en', 'kz'].includes(savedLanguage)) {
            setCurrentLanguage(savedLanguage);
        }
    }, []);
    const products = useMemo(() => drinkCategories[selectedCategoryIdx]?.products || [], [selectedCategoryIdx]);
    const handleToggleFavorite = useCallback((productId) => {
        setFavorites(prev => {
            const newFavs = new Set(prev);
            if (newFavs.has(productId)) {
                newFavs.delete(productId);
            }
            else {
                newFavs.add(productId);
            }
            return newFavs;
        });
    }, []);
    const handleAddToCart = (item) => {
        setCart(prevCart => [...prevCart, item]);
    };
    const handleLanguageChange = (langCode) => {
        setCurrentLanguage(langCode);
        localStorage.setItem('language', langCode);
    };
    return (<div className="bg-slate-100 min-h-screen font-sans text-slate-900">
            <header className="p-5">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-extrabold">{t('ui.hello') || 'Привет'}, {mockUser.name}!</h1>
                    <div className="flex items-center gap-3">
                        <LanguageSelector currentLanguage={currentLanguage} onLanguageChange={handleLanguageChange}/>
                        <button className="relative p-2">
                            <ShoppingCartIcon className="h-6 w-6 text-slate-500"/>
                            <AnimatePresence>
                                {cart.length > 0 && (<motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute -top-1 -right-1 w-5 h-5 text-xs bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                                        {cart.length}
                                    </motion.div>)}
                            </AnimatePresence>
                        </button>
                    </div>
                </div>
            </header>

            <main>
                <nav className="sticky top-0 bg-slate-100/80 backdrop-blur-md z-10 px-5 py-3">
                    <div className="p-1 bg-slate-200/70 rounded-xl flex items-center justify-start gap-1 overflow-x-auto">
                        {drinkCategories.map((cat, idx) => (<CategoryTab key={cat.id} title={cat.title} isActive={selectedCategoryIdx === idx} onClick={() => setSelectedCategoryIdx(idx)} t={t}/>))}
                    </div>
                </nav>

                <motion.section className="p-5 grid grid-cols-2 gap-x-5 gap-y-16 mt-2" variants={{ visible: { transition: { staggerChildren: 0.07 } } }} initial="hidden" animate="visible">
                    {isLoading
            ? Array(4).fill(0).map((_, i) => <ProductSkeleton key={i}/>)
            : products.map(p => (<ProductCard key={p.id} product={p} onSelect={setSelectedProduct} onFav={handleToggleFavorite} isFavorite={favorites.has(p.id)} t={t}/>))}
                </motion.section>
            </main>

            <AnimatePresence>
                {selectedProduct && (<ProductConfigurator product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={handleAddToCart} t={t}/>)}
            </AnimatePresence>
        </div>);
}
