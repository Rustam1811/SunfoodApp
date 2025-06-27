import React, { useState, useCallback, useMemo, useEffect, useReducer } from "react";
import { IonPage, IonContent } from "@ionic/react";
import { drinkCategories, Product } from "./data/drinksData";
import {
  FiAward, FiStar, FiRepeat, FiCoffee, FiZap, FiChevronsRight, FiHeart, FiX, FiPlus, FiMinus, FiChevronLeft, FiChevronRight
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

// MOCKS & CONST
const mockUser = { name: "Алекс", loyaltyPoints: 145, levelProgress: 75 };

const mockForYouItems = [
  { type: 'repeat', title: "Ваш обычный", product: drinkCategories[0].products[0] },
  { type: 'recommendation', title: "Попробуйте это", product: drinkCategories[1].products[1] },
  { type: 'seasonal', title: "Сезонное предложение", product: drinkCategories[2].products[0], special: "Клубничный" },
  { type: 'contextual', title: new Date().getHours() < 12 ? "Утренний заряд" : "Послеобеденный чилл", product: drinkCategories[0].products[1] }
];

const SIZES = [
  { key: "tall", label: "S", ml: 250, priceMultiplier: 1 },
  { key: "grande", label: "M", ml: 350, priceMultiplier: 1.2 },
  { key: "venti", label: "L", ml: 450, priceMultiplier: 1.4 }
];

const MILKS = [
  { key: "regular", name: "Обычное", icon: "🥛" },
  { key: "coconut", name: "Кокосовое", icon: "🥥" },
  { key: "almond", name: "Миндальное", icon: "🌰" }
];

const SYRUPS = [
  { key: "none", name: "Без сиропа", price: 0, icon: "🚫" },
  { key: "vanilla", name: "Ваниль", price: 50, icon: "🍦" },
  { key: "caramel", name: "Карамель", price: 50, icon: "🍯" },
  { key: "choco", name: "Шоколад", price: 50, icon: "🍫" }
];

const PAIRING = [
  { name: "Овсянка с клубникой", price: 1200, image: "/menu/strawberry-oats.jpg" },
  { name: "Чиа-пудинг", price: 1300, image: "/menu/chia-pudding.jpg" },
  { name: "Маффин банан", price: 850, image: "/menu/banana-muffin.jpg" }
];

// Скелетон
const ProductSkeleton = () => (
  <div className="aspect-[3/4] bg-gray-200 dark:bg-slate-800 rounded-3xl animate-pulse p-4 flex flex-col justify-end" />
);

// ForYou карточка
const ForYouCard = ({ item, onClick }) => {
  const icons = {
    repeat: <FiRepeat className="text-blue-500" />,
    recommendation: <FiStar className="text-yellow-500" />,
    seasonal: <FiZap className="text-purple-500" />,
    contextual: <FiCoffee className="text-orange-500" />
  };
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className="flex-shrink-0 w-40 h-48 mr-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg rounded-2xl shadow-lg relative p-3 flex flex-col justify-between cursor-pointer"
      onClick={() => onClick(item.product)}
    >
      <div className="flex items-center gap-2">{icons[item.type]}
        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{item.title}</span>
      </div>
      <div>
        <img src={item.product.image} className="w-24 h-24 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-xl" />
        <p className="font-semibold text-sm text-center truncate">{item.special} {item.product.name}</p>
      </div>
      <div className="w-full h-8 bg-black/5 dark:bg-white/5 rounded-lg flex items-center justify-center font-bold text-xs">
        Заказать <FiChevronsRight />
      </div>
    </motion.div>
  );
};

// Карточка продукта
const ProductCard = ({ product, onClick, isFavorite, onFav }) => (
  <motion.div
    whileTap={{ scale: 0.97 }}
    layout
    className="relative flex flex-col items-center bg-white/95 dark:bg-slate-900/90 rounded-3xl shadow-2xl cursor-pointer p-4 min-h-[230px] group transition-all hover:scale-105"
    onClick={() => onClick(product)}
  >
    <motion.img src={product.image} alt={product.name} className="w-32 h-32 mb-2 drop-shadow-2xl -mt-10" layoutId={`img-${product.id}`} />
    <motion.button
      onClick={e => onFav(e, product.id)}
      className="absolute top-4 right-4 z-20 w-8 h-8 bg-white/80 dark:bg-slate-700/70 rounded-full flex items-center justify-center shadow"
      whileTap={{ scale: 1.2, rotate: [0, -12, 9, -4, 0] }}
      style={{ cursor: "pointer" }}
    >
      <FiHeart
        size={18}
        className={isFavorite ? "text-red-500 fill-current animate-bounce" : "text-gray-400"}
        fill={isFavorite ? "#ef4444" : "none"}
      />
    </motion.button>
    <h3 className="font-bold text-base text-gray-900 dark:text-white text-center line-clamp-2">{product.name}</h3>
    <div className="flex justify-center items-baseline gap-1 mt-1">
      <span className="text-xl font-black text-orange-500">{product.price}</span>
      <span className="text-base text-orange-300">₸</span>
    </div>
  </motion.div>
);

// Модалка-премиум stepper
function calcPrice(product, state) {
  const base = Number(product.price);
  const sizeMultiplier = state.size.priceMultiplier;
  const syrup = SYRUPS.find(s => s.key === state.syrup)?.price || 0;
  return Math.round((base + syrup) * sizeMultiplier * state.quantity);
}

const STEPS = [
  { key: "size", label: "Размер" },
  { key: "milk", label: "Молоко" },
  { key: "syrup", label: "Сироп" }
];

const ProductConfigurator = ({ product, onClose, onAddToCart }) => {
  const initialState = {
    step: 0,
    size: SIZES[1],
    milk: MILKS[0].key,
    syrup: SYRUPS[0].key,
    quantity: 1
  };
  const [state, dispatch] = useReducer((st, act) => {
    switch (act.type) {
      case "STEP": return { ...st, step: act.to };
      case "SET_SIZE": return { ...st, size: act.size };
      case "SET_MILK": return { ...st, milk: act.milk };
      case "SET_SYRUP": return { ...st, syrup: act.syrup };
      case "SET_Q": return { ...st, quantity: Math.max(1, st.quantity + act.delta) };
      default: return st;
    }
  }, initialState);

  const price = calcPrice(product, state);
  const progress = ((state.step + 1) / STEPS.length) * 100;

  return (
    <AnimatePresence>
      {product && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 z-[90] backdrop-blur-xl"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 40 }}
            className="fixed left-0 right-0 bottom-0 z-[100] mx-auto max-w-lg pointer-events-auto"
          >
            <div className="relative rounded-t-3xl bg-white/95 dark:bg-slate-900/95 shadow-2xl backdrop-blur-2xl overflow-visible pt-8 pb-3 px-5 border-t border-white/20 dark:border-slate-700/40">
              {/* Progress bar */}
              <div className="absolute left-0 top-0 w-full h-2 rounded-t-3xl overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-400 via-amber-500 to-pink-500 transition-all duration-300"
                  style={{ width: `${progress}%` }} />
              </div>
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-5 right-5 bg-black/40 dark:bg-white/10 rounded-full p-2 z-10 shadow-lg backdrop-blur-md"
              >
                <FiX size={22} className="text-white drop-shadow" />
              </button>
              {/* 3D Cup */}
              <motion.div
                className="flex flex-col items-center justify-center"
                initial={{ scale: 0.8, y: 40, rotate: 4 }}
                animate={{ scale: 1, y: 0, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 26, delay: 0.08 }}
              >
                <motion.img
                  src={product.image}
                  alt={product.name}
                  className="w-36 h-36 mb-1 drop-shadow-2xl rounded-full border-8 border-white/60 dark:border-slate-900/60"
                  style={{
                    filter: "drop-shadow(0 8px 36px rgba(255,174,66,0.3))"
                  }}
                  initial={{ scale: 0.8, rotate: -7 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.35, delay: 0.15 }}
                />
                <div className="text-xs text-orange-500 font-bold uppercase tracking-widest mt-2 mb-1">{product.tagline || "Новый хит"}</div>
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-2">{product.name}</h2>
                <div className="text-gray-600 dark:text-gray-300 text-sm mb-2">{product.description}</div>
              </motion.div>
              {/* Stepper chips */}
              <div className="flex justify-center gap-2 mt-2 mb-4">
                {STEPS.map((step, idx) => (
                  <button
                    key={step.key}
                    className={`transition-all px-3 py-1 rounded-xl text-xs font-bold
                      ${state.step === idx
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg scale-105"
                        : "bg-gray-200/80 dark:bg-slate-700/50 text-gray-800 dark:text-gray-200"
                      }`}
                    onClick={() => dispatch({ type: "STEP", to: idx })}
                  >
                    {step.label}
                  </button>
                ))}
              </div>
              {/* Steps */}
              <div className="relative min-h-[60px] mb-2 flex flex-col items-center justify-center">
                {state.step === 0 && (
                  <motion.div
                    key="size"
                    initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -60, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex gap-4"
                  >
                    {SIZES.map(size => (
                      <button
                        key={size.key}
                        onClick={() => dispatch({ type: "SET_SIZE", size })}
                        className={`flex flex-col items-center py-2 px-3 rounded-xl border-2 transition-all
                          ${state.size.key === size.key
                            ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white border-orange-500 shadow-lg scale-110"
                            : "bg-gray-200/80 dark:bg-slate-700/60 text-gray-900 dark:text-white border-transparent"
                          }`}
                      >
                        <span className="text-2xl font-black">{size.label}</span>
                        <span className="text-xs opacity-70">{size.ml} мл</span>
                      </button>
                    ))}
                  </motion.div>
                )}
                {state.step === 1 && (
                  <motion.div
                    key="milk"
                    initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -60, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex gap-4"
                  >
                    {MILKS.map(milk => (
                      <button
                        key={milk.key}
                        onClick={() => dispatch({ type: "SET_MILK", milk: milk.key })}
                        className={`flex flex-col items-center py-2 px-3 rounded-xl border-2 transition-all
                          ${state.milk === milk.key
                            ? "bg-blue-500 text-white border-blue-500 shadow-lg scale-110"
                            : "bg-gray-200/80 dark:bg-slate-700/60 text-gray-900 dark:text-white border-transparent"
                          }`}
                      >
                        <span className="text-lg">{milk.icon}</span>
                        <span className="text-xs">{milk.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
                {state.step === 2 && (
                  <motion.div
                    key="syrup"
                    initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -60, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex gap-4"
                  >
                    {SYRUPS.map(syrup => (
                      <button
                        key={syrup.key}
                        onClick={() => dispatch({ type: "SET_SYRUP", syrup: syrup.key })}
                        className={`flex flex-col items-center py-2 px-3 rounded-xl border-2 transition-all
                          ${state.syrup === syrup.key
                            ? "bg-purple-500 text-white border-purple-500 shadow-lg scale-110"
                            : "bg-gray-200/80 dark:bg-slate-700/60 text-gray-900 dark:text-white border-transparent"
                          }`}
                      >
                        <span className="text-lg">{syrup.icon}</span>
                        <span className="text-xs">{syrup.name}</span>
                        {syrup.price > 0 && <span className="text-[10px] opacity-70">+{syrup.price}₸</span>}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
              {/* Step navigation */}
              <div className="flex justify-between items-center mt-2 mb-3">
                <button
                  disabled={state.step === 0}
                  className="w-10 h-10 flex items-center justify-center rounded-full transition text-gray-400 bg-white/50 hover:bg-orange-100 disabled:opacity-30"
                  onClick={() => dispatch({ type: "STEP", to: state.step - 1 })}
                >
                  <FiChevronLeft size={22} />
                </button>
                <span className="font-bold text-orange-500 text-sm">{STEPS[state.step].label}</span>
                <button
                  disabled={state.step === STEPS.length - 1}
                  className="w-10 h-10 flex items-center justify-center rounded-full transition text-gray-400 bg-white/50 hover:bg-orange-100 disabled:opacity-30"
                  onClick={() => dispatch({ type: "STEP", to: state.step + 1 })}
                >
                  <FiChevronRight size={22} />
                </button>
              </div>
              {/* Nutrition info — mini bars */}
              <div className="flex justify-center gap-6 mb-4 mt-3">
                <div className="flex flex-col items-center">
                  <span className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">⚡</span>
                  <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">157 ккал</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">💪</span>
                  <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">7,7 г</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center text-pink-500 font-bold text-xs">🍫</span>
                  <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">8,4 г</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-xs">🌾</span>
                  <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">11,9 г</span>
                </div>
              </div>
              {/* Pairing food */}
              <div className="mb-4">
                <h4 className="text-xs font-bold text-gray-500 mb-1">Вместе вкуснее</h4>
                <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                  {PAIRING.map(item => (
                    <div key={item.name} className="min-w-[120px] bg-white/90 dark:bg-slate-900/90 rounded-xl p-2 flex flex-col items-center shadow transition-all hover:scale-105">
                      <img src={item.image} alt={item.name} className="w-14 h-14 object-contain mb-1 rounded-xl" />
                      <div className="text-xs font-semibold text-center">{item.name}</div>
                      <div className="font-bold text-orange-500 text-sm">{item.price} ₸</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Quantity + add */}
              <div className="flex justify-between items-center gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <button
                    className="w-9 h-9 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center text-orange-500 text-xl font-black"
                    onClick={() => dispatch({ type: "SET_Q", delta: -1 })}
                    disabled={state.quantity <= 1}
                  >
                    <FiMinus />
                  </button>
                  <span className="w-8 text-center text-lg font-bold">{state.quantity}</span>
                  <button
                    className="w-9 h-9 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center text-orange-500 text-xl font-black"
                    onClick={() => dispatch({ type: "SET_Q", delta: 1 })}
                  >
                    <FiPlus />
                  </button>
                </div>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { onAddToCart({ ...product, ...state, totalPrice: price }); onClose(); }}
                  className="flex-1 py-4 ml-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full shadow-xl text-white font-extrabold text-lg text-center hover:scale-105 transition-all"
                  style={{ minWidth: 160 }}
                  aria-label="Добавить"
                >
                  <motion.span
                    initial={{ opacity: 0.7, scale: 1 }}
                    animate={{ opacity: 1, scale: [1, 1.08, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5, repeatType: "loop" }}
                  >
                    Добавить за {price} ₸
                  </motion.span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// MAIN COMPONENT
const Drinks = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategoryIdx, setSelectedCategoryIdx] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [animateToCart, setAnimateToCart] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const categories = useMemo(() => drinkCategories, []);
  const products = useMemo(() => categories[selectedCategoryIdx]?.products || [], [categories, selectedCategoryIdx]);

  const handleFav = useCallback((e, id) => {
    e.stopPropagation();
    setFavorites(prev => {
      const set = new Set(prev);
      set.has(id) ? set.delete(id) : set.add(id);
      return set;
    });
  }, []);

  return (
    <IonPage>
      <IonContent className="bg-[#181412] min-h-screen" fullscreen>
        {/* HEADER */}
        <header className="p-5 pb-0">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Привет, {mockUser.name}!</h1>
          <div className="flex items-center gap-3 mt-2">
            <FiAward className="text-yellow-500 w-5 h-5" />
            <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{mockUser.loyaltyPoints} баллов</span>
            <div className="flex-1 h-2 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-amber-400 to-orange-500" style={{ width: `${mockUser.levelProgress}%` }} />
            </div>
          </div>
        </header>
        {/* "ДЛЯ ВАС" */}
        <section className="py-3">
          <h2 className="px-5 text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">Специально для вас</h2>
          <div className="flex overflow-x-auto scrollbar-hide px-5">
            {isLoading
              ? Array(4).fill(0).map((_, i) => <div key={i} className="flex-shrink-0 w-40 h-48 mr-4 bg-gray-200 dark:bg-slate-800 rounded-2xl animate-pulse" />)
              : mockForYouItems.map((item, i) => <ForYouCard key={i} item={item} onClick={setSelectedProduct} />)
            }
          </div>
        </section>
        {/* КАТЕГОРИИ */}
        <nav className="relative z-10 px-5 pt-2 pb-4 flex gap-3 overflow-x-auto scrollbar-hide">
          {categories.map((cat, idx) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryIdx(idx)}
              className={`rounded-2xl px-6 py-2 font-bold transition-all text-base
                ${selectedCategoryIdx === idx ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg scale-105" : "bg-white/80 dark:bg-black/40 text-gray-800 dark:text-gray-200"}`}
            >
              {cat.title}
            </button>
          ))}
        </nav>
        {/* МЕНЮ */}
        <section className="p-5 pt-1">
          <div className="mt-3 grid grid-cols-2 gap-5">
            {isLoading
              ? Array(6).fill(0).map((_, i) => <ProductSkeleton key={i} />)
              : products.map((p, i) => (
                <ProductCard key={p.id} product={p} onClick={setSelectedProduct}
                  isFavorite={favorites.has(p.id)} onFav={handleFav}
                />
              ))}
          </div>
        </section>
        {/* МОДАЛКА + "FLY TO CART" */}
        <AnimatePresence>
          {selectedProduct && (
            <ProductConfigurator
              product={selectedProduct}
              onClose={() => setSelectedProduct(null)}
              onAddToCart={(item) => {
                setAnimateToCart(item);
                setTimeout(() => setAnimateToCart(null), 700);
              }}
            />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {animateToCart && (
            <motion.div
              className="fixed top-1/2 left-1/2 z-[999] pointer-events-none"
              initial={{ x: "-50%", y: "-50%" }}
              layoutId="cart-icon"
              transition={{ duration: 0.7, type: 'spring', stiffness: 100 }}
              onAnimationComplete={() => setAnimateToCart(null)}
            >
              <img src={animateToCart.image} className="w-20 h-20" />
            </motion.div>
          )}
        </AnimatePresence>
      </IonContent>
    </IonPage>
  );
};

export default Drinks;
