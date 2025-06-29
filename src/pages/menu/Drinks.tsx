import React, { useState, useCallback, useMemo, useEffect, useReducer } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiStar, FiRepeat, FiZap, FiCoffee, FiHeart, FiX, FiPlus, FiMinus, FiShoppingCart } from "react-icons/fi";

export interface Product {
  id: number; name: string; description: string; price: number; image: string; tagline?: string;
}
export const drinkCategories = [
  {
    id: "classic", title: "Классика", products: [
      { id: 1, name: 'Эспрессо', description: 'Крепкий и насыщенный эспрессо из 100% арабики.', price: 890, image: '/images/espresso.png', tagline: "Чистая энергия" },
      { id: 2, name: 'Американо', description: 'Классический американо на основе нашего фирменного эспрессо.', price: 990, image: '/images/americano.png', tagline: "Проверенный временем" },
    ]
  },
  {
    id: "milk", title: "Молочные", products: [
      { id: 3, name: 'Капучино', description: 'Идеальный баланс эспрессо, молока и нежной молочной пены.', price: 1290, image: '/images/cappuccino.png', tagline: "Идеальный баланс" },
      { id: 4, name: 'Латте', description: 'Нежный молочный напиток с шёлковой текстурой для ценителей мягкого вкуса.', price: 1290, image: '/images/latte.png', tagline: "Молочная нежность" },
    ]
  },
  {
    id: "special", title: "Авторские", products: [
      { id: 5, name: 'Раф "Цитрус"', description: 'Сливочный раф с яркими нотками свежей апельсиновой цедры.', price: 1590, image: '/images/raf.png', tagline: "Новый хит" },
      { id: 6, name: 'Бамбл Кофе', description: 'Освежающий микс эспрессо и апельсинового сока.', price: 1490, image: '/images/bumble.png', tagline: "Летний вайб" },
    ]
  }
];
const mockUser = { name: "Алекс" };
const mockForYouItems = [
  { type: 'repeat', title: "Ваш обычный", product: drinkCategories[0].products[1] },
  { type: 'recommendation', title: "Попробуйте хит", product: drinkCategories[2].products[0] },
  { type: 'seasonal', title: "Сезонное предложение", product: drinkCategories[1].products[0], special: "Кленовый" },
];
const SIZES = [
  { key: "S", label: "S", ml: 250, priceMultiplier: 1 },
  { key: "M", label: "M", ml: 350, priceMultiplier: 1.2 },
  { key: "L", label: "L", ml: 450, priceMultiplier: 1.4 }
];
const MILKS = [{ key: "regular", name: "Обычное" }, { key: "coconut", name: "Кокосовое" }, { key: "almond", name: "Миндальное" }];
const SYRUPS = [{ key: "none", name: "Без сиропа", price: 0 }, { key: "vanilla", name: "Ваниль", price: 50 }, { key: "caramel", name: "Карамель", price: 50 }];
const PAIRING = [
  { name: "Круассан", price: 750, image: "/images/croissant.png" },
  { name: "Чиа-пудинг", price: 1300, image: "/images/chia.png" },
  { name: "Маффин", price: 850, image: "/images/muffin.png" }
];

const ProductSkeleton = () => (
  <div className="h-[260px] bg-slate-200 rounded-3xl animate-pulse" />
);

const CategoryTab = ({ title, isActive, onClick }) => (
  <motion.button
    onClick={onClick}
    className="relative px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex-shrink-0"
  >
    <span className={`relative z-10 transition-colors ${isActive ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}>{title}</span>
    {isActive && (
      <motion.div
        layoutId="category-highlight"
        className="absolute inset-0 bg-white rounded-lg shadow-md z-0"
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
      />
    )}
  </motion.button>
);

const ProductCard = ({ product, onSelect, onFav, isFavorite }) => (
  <motion.div
    layout
    variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }}
    onClick={() => onSelect(product)}
    className="relative group cursor-pointer"
  >
    <div className="absolute top-3 right-3 z-10">
      <motion.button onClick={(e) => { e.stopPropagation(); onFav(product.id); }} whileTap={{ scale: 1.3 }}
        className="w-9 h-9 rounded-full flex items-center justify-center bg-white/60 backdrop-blur-md shadow-sm">
        <FiHeart size={18} className="transition-all" style={{ color: isFavorite ? '#ef4444' : '#9ca3af', fill: isFavorite ? '#ef4444' : 'none' }} />
      </motion.button>
    </div>
    <div className="bg-white rounded-3xl p-4 pt-20 text-center shadow-lg transition-shadow group-hover:shadow-xl">
      <motion.img layoutId={`product-image-${product.id}`} src={product.image} alt={product.name}
        className="w-32 h-32 absolute top-0 left-1/2 -translate-x-1/2 drop-shadow-lg group-hover:scale-105 transition-transform" />
      <h3 className="font-bold text-base text-slate-800 line-clamp-2 h-12">{product.name}</h3>
      <p className="text-xl font-black text-slate-900 mt-2">{product.price} ₸</p>
    </div>
  </motion.div>
);

const OptionButton = ({ children, isActive, onClick }) => (
  <button onClick={onClick}
    className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border-2 ${isActive ? 'bg-slate-800 text-white border-slate-800 shadow-md scale-105' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'}`}>
    {children}
  </button>
);

const ProductConfigurator = ({ product, onClose, onAddToCart }) => {
  const initialState = { sizeKey: "M", milkKey: "regular", syrupKey: "none", quantity: 1 };
  const reducer = (state, action) => {
    switch (action.type) {
      case "SET_OPTION": return { ...state, [action.field]: action.key };
      case "SET_QUANTITY": return { ...state, quantity: Math.max(1, state.quantity + action.delta) };
      default: return state;
    }
  };
  const [state, dispatch] = useReducer(reducer, initialState);

  const calcPrice = useCallback(() => {
    if (!product) return 0;
    const size = SIZES.find(s => s.key === state.sizeKey);
    const syrup = SYRUPS.find(s => s.key === state.syrupKey);
    return Math.round((product.price * (size?.priceMultiplier || 1) + (syrup?.price || 0)) * state.quantity);
  }, [product, state]);

  const totalPrice = calcPrice();
  const handleAddToCart = () => { onAddToCart({ productId: product.id, name: product.name, ...state, totalPrice }); onClose(); };

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 400, damping: 45 }}
        className="relative z-10 w-full bg-slate-100 rounded-t-3xl flex flex-col max-h-[90vh]"
      >
        <header className="flex-shrink-0 p-4 pt-6 text-center relative border-b border-slate-200">
          <motion.img layoutId={`product-image-${product.id}`} src={product.image} alt={product.name}
            className="w-40 h-40 mx-auto -mt-24 drop-shadow-2xl" />
          <h2 className="text-3xl font-extrabold text-slate-900 mt-4">{product.name}</h2>
          <p className="text-sm text-slate-500 mt-2 px-4">{product.description}</p>
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-slate-200/80 hover:bg-slate-300"><FiX size={20} className="text-slate-600" /></button>
        </header>

        {/* ✨ ИСПРАВЛЕНО: Этот блок теперь прокручивается и имеет отступ снизу */}
        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-5 pb-24">
          <div className="grid grid-cols-3 gap-3">
            {SIZES.map(size =>
              <button key={size.key} onClick={() => dispatch({ type: 'SET_OPTION', field: 'sizeKey', key: size.key })}
                className={`py-2 rounded-xl border-2 transition-all ${state.sizeKey === size.key ? 'bg-slate-800 text-white border-slate-800 shadow-lg' : 'bg-white text-slate-800 border-slate-200'}`}>
                <span className="text-2xl font-black">{size.label}</span>
                <span className="block text-xs opacity-70">{size.ml} мл</span>
              </button>
            )}
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800">Добавки</h4>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {MILKS.map(milk => <OptionButton key={milk.key} isActive={state.milkKey === milk.key} onClick={() => dispatch({ type: 'SET_OPTION', field: 'milkKey', key: milk.key })}>{milk.name}</OptionButton>)}
              {SYRUPS.map(syrup => <OptionButton key={syrup.key} isActive={state.syrupKey === syrup.key} onClick={() => dispatch({ type: 'SET_OPTION', field: 'syrupKey', key: syrup.key })}>{syrup.name} {syrup.price > 0 && `+${syrup.price}₸`}</OptionButton>)}
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800">Вместе вкуснее</h4>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {PAIRING.map(item => (
                <div key={item.name} className="flex-shrink-0 w-28 bg-white rounded-xl p-2 text-center shadow-sm border border-slate-200">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-contain mx-auto rounded-lg mb-1" />
                  <p className="text-xs font-semibold text-slate-700">{item.name}</p>
                  <p className="text-sm font-bold text-slate-800">+{item.price} ₸</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 p-1 bg-slate-200 rounded-xl">
              <button onClick={() => dispatch({ type: 'SET_QUANTITY', delta: -1 })} className="p-2 text-slate-600 disabled:opacity-40" disabled={state.quantity <= 1}><FiMinus size={18} /></button>
              <span className="w-8 text-center text-lg font-bold text-slate-900">{state.quantity}</span>
              <button onClick={() => dispatch({ type: 'SET_QUANTITY', delta: 1 })} className="p-2 text-slate-600"><FiPlus size={18} /></button>
              <motion.button onClick={handleAddToCart} whileTap={{ scale: 0.97 }}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-base font-bold py-4 rounded-xl shadow-lg shadow-orange-500/20">
                Добавить за {totalPrice} ₸
              </motion.button>
            </div>

          </div>
        </div>

        <footer className="flex-shrink-0 p-4 pt-3 bg-white/80 backdrop-blur-md border-t border-slate-200/80 flex items-center gap-4 pb-8">

        </footer>
      </motion.div>
    </div>
  );
};

export default function AiryDrinksMenuV2() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategoryIdx, setSelectedCategoryIdx] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const products = useMemo(() => drinkCategories[selectedCategoryIdx]?.products || [], [selectedCategoryIdx]);
  const handleToggleFavorite = useCallback((productId: number) => {
    setFavorites(prev => {
      const newFavs = new Set(prev);
      if (newFavs.has(productId)) { newFavs.delete(productId); }
      else { newFavs.add(productId); }
      return newFavs;
    });
  }, []);
  const handleAddToCart = (item: any) => { setCart(prevCart => [...prevCart, item]); };

  return (
    <div className="bg-slate-100 min-h-screen font-sans text-slate-900">
      <header className="p-5">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-extrabold">Привет, {mockUser.name}!</h1>
          <button className="relative p-2">
            <FiShoppingCart size={24} className="text-slate-500" />
            <AnimatePresence>
              {cart.length > 0 && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 w-5 h-5 text-xs bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                  {cart.length}
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </header>

      <main>
        {/* ✨ ПЕРЕРАБОТАНЫ: Вкладки категорий */}
        <nav className="sticky top-0 bg-slate-100/80 backdrop-blur-md z-10 px-5 py-3">
          <div className="p-1 bg-slate-200/70 rounded-xl flex items-center justify-start gap-1 overflow-x-auto">
            {drinkCategories.map((cat, idx) => (
              <CategoryTab key={cat.id} title={cat.title} isActive={selectedCategoryIdx === idx} onClick={() => setSelectedCategoryIdx(idx)} />
            ))}
          </div>
        </nav>

        <motion.section
          className="p-5 grid grid-cols-2 gap-x-5 gap-y-16 mt-2"
          variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
          initial="hidden"
          animate="visible"
        >
          {isLoading
            ? Array(4).fill(0).map((_, i) => <ProductSkeleton key={i} />)
            : products.map(p => (
              <ProductCard key={p.id} product={p} onSelect={setSelectedProduct} onFav={handleToggleFavorite} isFavorite={favorites.has(p.id)} />
            ))
          }
        </motion.section>
      </main>

      <AnimatePresence>
        {selectedProduct && <ProductConfigurator product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={handleAddToCart} />}
      </AnimatePresence>
    </div>
  );
}