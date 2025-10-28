import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useCart } from '../../../src/contexts/CartContext';
import { drinkCategories } from '../../../src/pages/menu/data/drinksData';
import { foodCategories } from '../../../src/pages/menu/data/foodData';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { PremiumMenu } from '../../../src/features/menu/premium/PremiumMenu';
import { useTranslation } from 'react-i18next';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const humanize = (key: string) => key.split('.').pop()?.replace(/_/g,' ') || key;
const CURRENCY = '₸';

// Normalize phone number: 8xxx or +7xxx -> +7xxx
const normalizePhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, ''); // Remove all non-digits
  if (cleaned.startsWith('8') && cleaned.length === 11) {
    return '+7' + cleaned.substring(1);
  }
  if (cleaned.startsWith('7') && cleaned.length === 11) {
    return '+' + cleaned;
  }
  return phone;
};

const getMilkLabel = (key: string | undefined) => {
  const labels: Record<string, string> = {
    regular: '🥛 Обычное',
    oat: '🌾 Овсяное',
    almond: '🌰 Миндальное',
    coconut: '🥥 Кокосовое',
    lactosefree: '🥛 Безлактозное',
  };
  return labels[key || ''] || key || '';
};

export default function PosMenuPage() {
  const { items: cartItems, dispatch } = useCart();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'drinks' | 'food'>('drinks');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderNumber, setOrderNumber] = useState<number | null>(null);
  
  // Customer linking
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [showCustomerInput, setShowCustomerInput] = useState(false);
  const [scanningQR, setScanningQR] = useState(false);
  const [customerLinked, setCustomerLinked] = useState(false);
  const [customerBonus, setCustomerBonus] = useState(0);
  const [loadingBonus, setLoadingBonus] = useState(false);
  const [useBonuses, setUseBonuses] = useState(false);
  const [bonusError, setBonusError] = useState<string | null>(null);
  
  // Fetch customer bonus when phone is entered (live search)
  useEffect(() => {
    const fetchBonus = async () => {
      // Требуем минимум 10 цифр для поиска
      if (!customerPhone || customerPhone.replace(/\D/g, '').length < 10) {
        setCustomerBonus(0);
        setCustomerName('');
        setBonusError(null);
        return;
      }
      
      setLoadingBonus(true);
      setBonusError(null);
      
      try {
        const normalized = normalizePhone(customerPhone);
        console.log('🔍 POS - Поиск клиента в Firestore:');
        console.log('   Введено:', customerPhone);
        console.log('   Нормализовано:', normalized);
        
        // ПРЯМОЙ ПОИСК В FIRESTORE
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('phone', '==', normalized), limit(1));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          console.log('   ❌ Клиент не найден');
          setBonusError('Клиент не найден');
          setCustomerBonus(0);
          setCustomerName('');
          setLoadingBonus(false);
          return;
        }
        
        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();
        const userId = userDoc.id;
        
        console.log('   ✅ Пользователь найден:', userData.name || userData.displayName);
        
        // Получаем бонусы
        const bonusPoints = userData.bonusPoints || 0;
        
        setCustomerBonus(bonusPoints);
        setCustomerName(userData.displayName || userData.name || '');
        setBonusError(null);
        console.log('   💰 Бонусы:', bonusPoints);
      } catch (error) {
        console.error('❌ Ошибка загрузки:', error);
        setBonusError('Ошибка загрузки данных');
        setCustomerBonus(0);
        setCustomerName('');
      } finally {
        setLoadingBonus(false);
      }
    };
    
    // Debounce: ждём 500мс после последнего изменения
    const timeoutId = setTimeout(fetchBonus, 500);
    return () => clearTimeout(timeoutId);
  }, [customerPhone]);
  
  const drinksItems = useMemo(() => 
    drinkCategories.flatMap(cat =>
      cat.products.map(p => {
        const rawName = t(p.name);
        const name = rawName === p.name ? humanize(p.name) : rawName;
        return { 
          id: p.id, 
          name, 
          price: p.price, 
          image: p.image, 
          energy: p.energy, 
          protein: p.protein, 
          fat: p.fat, 
          carbs: p.carbs, 
          badges: p.badges?.map(b => ({ type: b, label: b })) || [], 
          categoryId: cat.id 
        };
      })
    ),
    [t]
  );
  
  const drinksCategories = useMemo(() => 
    drinkCategories.map(c => { 
      const raw = t(c.title); 
      const label = raw === c.title ? humanize(c.title) : raw; 
      return { key: String(c.id), label }; 
    }),
    [t]
  );

  const foodItems = useMemo(() => 
    foodCategories.flatMap(cat =>
      cat.products.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.image,
        energy: p.energy,
        protein: p.protein,
        fat: p.fat,
        carbs: p.carbs,
        badges: p.badges?.map(b => ({ type: b, label: b })) || [],
        categoryId: cat.id
      }))
    ),
    []
  );

  const foodCategoriesFormatted = useMemo(() =>
    foodCategories.map(c => ({
      key: String(c.id),
      label: c.title
    })),
    []
  );

  const handleRemoveFromCart = useCallback(
    (id: string) => {
      dispatch({ type: 'REMOVE_ITEM', payload: { id } });
    },
    [dispatch]
  );

  const handleQuantityChange = useCallback(
    (id: string, delta: number) => {
      if (delta > 0) {
        dispatch({ type: 'INCREASE_QUANTITY', payload: id });
      } else {
        dispatch({ type: 'DECREASE_QUANTITY', payload: id });
      }
    },
    [dispatch]
  );

  const total = useMemo(() => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [cartItems]);

  const handleCheckout = useCallback(async () => {
    if (cartItems.length === 0) return;
    
    const normalizedPhone = customerPhone ? normalizePhone(customerPhone) : null;
    const bonusToUse = useBonuses ? customerBonus : 0;
    const finalTotal = Math.max(0, total - bonusToUse);
    
    try {
      const response = await fetch('/api/orders?action=create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            sizeKey: item.sizeKey,
            milkKey: item.milkKey,
            syrupKey: item.syrupKey,
          })),
          total: finalTotal,
          userPhone: normalizedPhone,
          customerName: customerName || null,
          bonusUsed: bonusToUse,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(payload.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      if (result.ok) {
        setOrderNumber(result.orderNumber);
        setShowSuccessModal(true);
        dispatch({ type: 'CLEAR_CART' });
        // Очищаем данные клиента после успешного заказа
        setCustomerPhone('');
        setCustomerName('');
        setCustomerLinked(false);
        setShowCustomerInput(false);
        setCustomerBonus(0);
        setUseBonuses(false);
      } else {
        throw new Error(result.error || 'Не удалось оформить заказ');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
      alert(`Ошибка оформления заказа: ${message}`);
    }
  }, [cartItems, dispatch, total, customerPhone, customerName, customerBonus, useBonuses]);
  
  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-b from-slate-100 via-slate-100 to-white">
      {/* Main menu area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header with tabs */}
        <div className="border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">Меню POS</h1>
                <p className="text-sm text-slate-500">Интерфейс как в клиентском приложении</p>
              </div>
              <div className="inline-flex rounded-full bg-slate-100/80 p-1 text-sm font-medium shadow-inner">
                <button
                  onClick={() => setActiveTab('drinks')}
                  className={`rounded-full px-5 py-2 transition ${
                    activeTab === 'drinks' ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  🥤 Напитки
                </button>
                <button
                  onClick={() => setActiveTab('food')}
                  className={`rounded-full px-5 py-2 transition ${
                    activeTab === 'food' ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  🍽️ Еда
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* PremiumMenu with mobile-sized centered modal */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'drinks' ? (
            <PremiumMenu items={drinksItems} categories={drinksCategories} type="drinks" />
          ) : (
            <PremiumMenu items={foodItems} categories={foodCategoriesFormatted} type="food" />
          )}
        </div>
      </div>

      {/* Cart sidebar */}
      <div className="hidden w-[320px] flex-col border-l border-slate-200 bg-white lg:flex">
        <div className="border-b border-slate-200 px-4 py-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <ShoppingCartIcon className="h-5 w-5" />
              Корзина
            </h2>
            <span className="text-xs text-slate-500">{cartItems.length} шт</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          {cartItems.length === 0 ? (
            <div className="flex h-full w-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/60 text-xs text-slate-500">
              Пусто
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-start gap-2">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="h-10 w-10 flex-shrink-0 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                      <span className="text-xl">☕</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900 text-sm leading-tight">{item.name}</div>
                    <div className="mt-1 text-xs text-slate-600 space-y-0.5">
                      {item.sizeKey && <div>Размер: {item.sizeKey.toUpperCase()}</div>}
                      {item.milkKey && item.milkKey !== 'regular' && <div>{getMilkLabel(item.milkKey)}</div>}
                      {item.syrupKey && item.syrupKey !== '' && (
                        <div className="text-xs">
                          Сиропы: {item.syrupKey.split('+').map(s => humanize(s)).join(', ')}
                        </div>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(item.id, -1)}
                        className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm w-6 h-6 flex items-center justify-center font-medium"
                      >
                        −
                      </button>
                      <span className="w-5 text-center text-sm font-semibold text-slate-900">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(item.id, 1)}
                        className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm w-6 h-6 flex items-center justify-center font-medium"
                      >
                        +
                      </button>
                      <div className="ml-auto text-sm font-bold text-slate-900">
                        {item.price * item.quantity} ₸
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFromCart(item.id)}
                      className="mt-1.5 text-xs text-red-600 hover:underline font-medium"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 px-4 py-3">
          {/* Customer linking section */}
          {!customerLinked ? (
            <div className="mb-3 space-y-2">
              {!showCustomerInput ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCustomerInput(true)}
                    className="flex-1 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
                  >
                    📱 Добавить клиента
                  </button>
                  <button
                    type="button"
                    onClick={() => setScanningQR(true)}
                    className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
                    title="Сканировать QR-код"
                  >
                    📷
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type="tel"
                      placeholder="+7 (___) ___-__-__"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none pr-16"
                    />
                    {loadingBonus && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  
                  {/* Live bonus display */}
                  {customerPhone.length >= 10 && !loadingBonus && (
                    <div className="rounded-lg border-2 px-3 py-2" style={{
                      borderColor: bonusError ? '#fee2e2' : customerBonus > 0 ? '#d4edda' : '#e2e8f0',
                      backgroundColor: bonusError ? '#fef2f2' : customerBonus > 0 ? '#f0fdf4' : '#f8fafc'
                    }}>
                      {bonusError ? (
                        <div className="text-xs text-red-600">
                          ⚠️ {bonusError}
                        </div>
                      ) : customerBonus > 0 ? (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-green-900">
                              ✓ Клиент найден{customerName && `: ${customerName}`}
                            </span>
                            <span className="text-xs font-bold text-green-700">
                              🎁 {customerBonus} ₸
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-600">
                          ℹ️ Новый клиент - бонусов нет
                        </div>
                      )}
                    </div>
                  )}
                  
                  <input
                    type="text"
                    placeholder="Имя клиента (опционально)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (customerPhone.trim()) {
                          setCustomerLinked(true);
                        }
                      }}
                      disabled={!customerPhone.trim()}
                      className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                    >
                      ✓ Привязать
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCustomerInput(false);
                        setCustomerPhone('');
                        setCustomerName('');
                      }}
                      className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mb-3 space-y-2">
              <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2.5 border border-green-200">
                <div className="flex-1">
                  <div className="text-sm font-semibold text-green-900">
                    ✓ {customerName || customerPhone}
                  </div>
                  <div className="text-xs text-green-700">
                    {customerName && customerPhone ? customerPhone : 'Клиент привязан'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCustomerLinked(false);
                    setCustomerPhone('');
                    setCustomerName('');
                    setCustomerBonus(0);
                    setUseBonuses(false);
                  }}
                  className="ml-2 text-xs font-medium text-green-700 hover:text-green-900 transition"
                >
                  Отвязать
                </button>
              </div>
              
              {loadingBonus ? (
                <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600 border border-slate-100 text-center">
                  Загрузка бонусов...
                </div>
              ) : customerBonus > 0 ? (
                <div className="space-y-2">
                  <div className="rounded-lg bg-amber-50 px-3 py-2.5 border border-amber-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-xs font-medium text-amber-900">
                          🎁 Доступно бонусов: {customerBonus} ₸
                        </div>
                        <div className="text-xs text-amber-700 mt-0.5">
                          Можно использовать все или ничего
                        </div>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={useBonuses}
                          onChange={(e) => setUseBonuses(e.target.checked)}
                          className="w-4 h-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                        />
                        <span className="text-xs font-semibold text-amber-900">
                          Использовать
                        </span>
                      </label>
                    </div>
                  </div>
                  {useBonuses && (
                    <div className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700 border border-blue-100">
                      💰 Будет списано: {customerBonus} ₸ | К оплате: {Math.max(0, total - customerBonus)} ₸
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700 border border-blue-100">
                  🎁 После принятия заказа клиенту начислятся бонусы (1% от суммы)
                </div>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-between text-base font-semibold text-slate-900 mb-3">
            <span>Итого:</span>
            <div className="text-right">
              {useBonuses && customerBonus > 0 ? (
                <>
                  <div className="text-xs text-slate-500 line-through font-normal">{total} {CURRENCY}</div>
                  <div className="text-green-600">{Math.max(0, total - customerBonus)} {CURRENCY}</div>
                </>
              ) : (
                <span>{total} {CURRENCY}</span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleCheckout}
            disabled={cartItems.length === 0}
            className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Оформить заказ
          </button>
        </div>
      </div>

      {/* Success modal */}
      <AnimatePresence>
        {showSuccessModal && orderNumber && (
          <>
            <motion.div
              className="fixed inset-0 z-[999] bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSuccessModal(false)}
            />
            <motion.div
              className="fixed left-1/2 top-1/2 z-[1000] w-[min(400px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-8 text-center shadow-2xl ring-1 ring-slate-900/5"
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-2xl text-green-600">
                ✓
              </div>
              <h3 className="text-xl font-bold text-slate-900">Заказ оформлен!</h3>
              <p className="mt-2 text-sm text-slate-500">
                Номер заказа <span className="font-semibold text-slate-900">#{orderNumber}</span>
              </p>
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800"
              >
                Готово
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* QR Scanner Modal */}
      <AnimatePresence>
        {scanningQR && (
          <>
            <motion.div
              className="fixed inset-0 z-[999] bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setScanningQR(false)}
            />
            <motion.div
              className="fixed left-1/2 top-1/2 z-[1000] w-[min(400px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-900/5"
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              <h3 className="text-lg font-bold text-slate-900 mb-4">Сканировать QR-код клиента</h3>
              <div className="mb-4 aspect-square rounded-2xl bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300">
                <div className="text-center">
                  <div className="text-6xl mb-2">📷</div>
                  <p className="text-sm text-slate-600">Направьте камеру на QR-код</p>
                  <p className="text-xs text-slate-500 mt-1">из приложения клиента</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-slate-500 text-center">
                  Или введите номер телефона вручную:
                </p>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="+7 (___) ___-__-__"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none pr-16"
                  />
                  {loadingBonus && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                
                {/* Live bonus display in QR modal */}
                {customerPhone.length >= 10 && !loadingBonus && (
                  <div className="rounded-lg border-2 px-3 py-2" style={{
                    borderColor: bonusError ? '#fee2e2' : customerBonus > 0 ? '#d4edda' : '#e2e8f0',
                    backgroundColor: bonusError ? '#fef2f2' : customerBonus > 0 ? '#f0fdf4' : '#f8fafc'
                  }}>
                    {bonusError ? (
                      <div className="text-xs text-red-600">
                        ⚠️ {bonusError}
                      </div>
                    ) : customerBonus > 0 ? (
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-green-900">
                          ✓ Клиент найден{customerName && `: ${customerName}`}
                        </span>
                        <span className="text-xs font-bold text-green-700">
                          🎁 {customerBonus} ₸
                        </span>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-600">
                        ℹ️ Новый клиент - бонусов нет
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (customerPhone.trim()) {
                        setCustomerLinked(true);
                        setScanningQR(false);
                      }
                    }}
                    disabled={!customerPhone.trim()}
                    className="flex-1 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                  >
                    Продолжить
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setScanningQR(false);
                      setCustomerPhone('');
                    }}
                    className="rounded-lg bg-slate-100 px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
