import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getFirestore, collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { parseLoyaltyPayload } from '@/utils/parseLoyaltyPayload';

async function fetchLedger(uid: string) {
  const db = getFirestore();
  const col = collection(db, 'users', uid, 'ledger');
  const q = query(col, orderBy('ts', 'desc'), limit(5));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
}

async function callApi(path: string, body: unknown) {
  const base: string = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_BASE || '/api';
  const url = base.replace(/\/$/, '') + path;

  const { auth } = await import('@/lib/firebase');
  const token = await auth.currentUser?.getIdToken();

  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    let detail: unknown = null;
    try { detail = await res.json(); } catch {}
    const err = new Error(`API ${res.status}`) as Error & { status?: number; detail?: unknown };
    err.status = res.status; err.detail = detail; throw err;
  }
  return res.json();
}

type CartItem = { id: string; name: string; price: number; qty: number };

export default function PosPage() {
  // Корзина
  const [items, setItems] = useState<CartItem[]>([]);
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemPrice, setNewItemPrice] = useState<string>('');

  // Клиент (сканируется на этапе оплаты)
  const [targetUid, setTargetUid] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [balance, setBalance] = useState<number>(0);
  const [ledger, setLedger] = useState<Array<any>>([]);
  
  // Бонусы
  const [redeem, setRedeem] = useState<number>(0);

  // UI состояния
  const [scanning, setScanning] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [input, setInput] = useState<string>('');
  const [globalListen, setGlobalListen] = useState<boolean>(true);

  // Сканер камеры
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerControls = useRef<IScannerControls | null>(null);
  const hasScanned = useRef<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const toastTimer = useRef<number | null>(null);
  
  // Пистолет сканер
  const scanBufRef = useRef<string>('');
  const scanTimesRef = useRef<number[]>([]);
  const lastTimeRef = useRef<number>(0);
  const resetTimerRef = useRef<number | null>(null);

  // Итоговая сумма корзины
  const totalSum = useMemo(() => {
    return items.reduce((acc, it) => acc + it.price * it.qty, 0);
  }, [items]);

  // Максимум бонусов для списания (30%)
  const maxRedeem = useMemo(() => Math.floor(totalSum * 0.3), [totalSum]);

  // Начисление бонусов (1%)
  const accrueAmount = useMemo(() => Math.floor(totalSum * 0.01), [totalSum]);

  // Финальная сумма с учетом бонусов
  const finalSum = useMemo(() => Math.max(0, totalSum - redeem), [totalSum, redeem]);

  // Добавить товар в корзину
  const addItem = useCallback(() => {
    const name = newItemName.trim();
    const price = Number(newItemPrice);
    if (!name || price <= 0) return;
    
    const existing = items.find(it => it.name === name && it.price === price);
    if (existing) {
      setItems(items.map(it => 
        it.id === existing.id ? { ...it, qty: it.qty + 1 } : it
      ));
    } else {
      setItems([...items, { id: uuidv4(), name, price, qty: 1 }]);
    }
    
    setNewItemName('');
    setNewItemPrice('');
  }, [newItemName, newItemPrice, items]);

  // Добавить быструю сумму
  const addQuickAmount = useCallback((amount: number) => {
    setItems([...items, { id: uuidv4(), name: 'Товар', price: amount, qty: 1 }]);
  }, [items]);

  // Удалить товар
  const removeItem = useCallback((id: string) => {
    setItems(items.filter(it => it.id !== id));
  }, [items]);

  // Изменить количество
  const changeQty = useCallback((id: string, delta: number) => {
    setItems(items.map(it => {
      if (it.id !== id) return it;
      const newQty = it.qty + delta;
      return newQty > 0 ? { ...it, qty: newQty } : it;
    }).filter(it => it.qty > 0));
  }, [items]);

  // Очистить корзину
  const clearCart = useCallback(() => {
    setItems([]);
    setRedeem(0);
  }, []);

  // Обработка штрих-кода товара (добавляет в корзину)
  const handleProductBarcode = useCallback((barcode: string) => {
    // Простая логика: пытаемся извлечь цену из штрих-кода
    // Если это штрих-код формата EAN-13, последние цифры могут быть ценой
    // Для примера: если штрих-код содержит "1000", "2000" и т.д., используем это
    
    let price = 0;
    let name = 'Товар';
    
    // Попытка определить цену из штрих-кода
    const priceMatch = barcode.match(/(\d{4})$/); // последние 4 цифры
    if (priceMatch) {
      price = parseInt(priceMatch[1]);
    }
    
    // Если цена не определена, используем дефолт
    if (price === 0) {
      price = 1000; // дефолтная цена
      name = `Товар (${barcode.substring(0, 8)})`;
    } else {
      name = `Товар (${barcode.substring(0, 8)})`;
    }
    
    // Проверяем, есть ли такой товар уже
    const existing = items.find(it => it.name === name);
    if (existing) {
      setItems(items.map(it => 
        it.id === existing.id ? { ...it, qty: it.qty + 1 } : it
      ));
    } else {
      setItems([...items, { id: uuidv4(), name, price, qty: 1 }]);
    }
    
    setToast(`Добавлен: ${name} — ${price}₸`);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 1500);
  }, [items]);

  // Сканировать клиента (вызывается на этапе оплаты)
  const handleScanCustomer = useCallback(async (override?: string) => {
    setError(null);
    const raw = (typeof override === 'string' ? override : input || '').trim();
    if (!raw) return;
    setLoading(true);
    try {
      const parsed = parseLoyaltyPayload(raw);
      if (!parsed) {
        throw Object.assign(new Error('Неподдерживаемый код'), { status: 400 });
      }
      const payload = parsed.uid || parsed.cardId || raw;
      
      // Поиск пользователя в Firestore напрямую
      const db = getFirestore();
      const usersRef = collection(db, 'users');
      
      // Сначала пробуем поиск по phone
      let userDoc: any = null;
      const phoneQuery = query(usersRef, where('phone', '==', payload));
      const phoneSnap = await getDocs(phoneQuery);
      
      if (!phoneSnap.empty) {
        userDoc = phoneSnap.docs[0];
      } else {
        // Если не нашли по phone, пробуем по cardId
        const cardQuery = query(usersRef, where('cardId', '==', payload));
        const cardSnap = await getDocs(cardQuery);
        if (!cardSnap.empty) {
          userDoc = cardSnap.docs[0];
        }
      }
      
      if (!userDoc) {
        throw Object.assign(new Error('Клиент не найден'), { status: 404 });
      }
      
      const uid = userDoc.id;
      const userData = userDoc.data();
      const name = userData.name || userData.displayName || 'Клиент';
      const phone = userData.phone || '';
      const apiBalance = userData.bonusPoints || 0;
      
      setTargetUid(uid);
      setCustomerName(name);
      setCustomerPhone(phone);
      setBalance(Number(apiBalance));
      const lg = await fetchLedger(uid);
      setLedger(lg);
      setInput('');
      
      setToast(`${name} (${phone || uid}), баланс: ${Number(apiBalance)}₸`);
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
      toastTimer.current = window.setTimeout(() => setToast(null), 2500);
    } catch (e: any) {
      const msg = e?.status === 400
        ? 'Неподдерживаемый код'
        : e?.status === 404
        ? 'Клиент не найден'
        : 'Ошибка сканирования';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [input]);

  // Подтверждение и оплата
  const doConfirm = useCallback(async () => {
    if (!targetUid) {
      setError('Сначала отсканируйте клиента');
      return;
    }
    if (items.length === 0) {
      setError('Корзина пуста');
      return;
    }
    
    setProcessing(true);
    setError(null);
    
    try {
      // Создаём заказ
      const orderData = {
        items: items.map(it => ({
          name: it.name,
          quantity: it.qty,
          price: it.price
        })),
        total: finalSum,
        userPhone: customerPhone,
        customerName: customerName,
        useBonuses: redeem > 0
      };
      
      const orderResp = await callApi('/api/orders?action=create', orderData);
      console.log('Order created:', orderResp);
      
      // Списываем бонусы если используются
      if (redeem > 0) {
        const redeemResp = await callApi('/pos/redeem', {
          uid: targetUid,
          amount: redeem
        });
        console.log('Redeem response:', redeemResp);
      }
      
      // Начисляем бонусы за покупку
      if (accrueAmount > 0) {
        const accrueResp = await callApi('/pos/accrue', {
          uid: targetUid,
          amount: accrueAmount,
          reason: 'Покупка в POS'
        });
        console.log('Accrue response:', accrueResp);
      }
      
      // Обновляем историю
      const lg = await fetchLedger(targetUid);
      setLedger(lg);
      
      // Обновляем баланс
      const newBalance = balance - redeem + accrueAmount;
      setBalance(newBalance);
      
      setToast(`✅ Оплата ${finalSum}₸ успешна!`);
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
      toastTimer.current = window.setTimeout(() => setToast(null), 3000);
      
      // Очищаем всё
      setTimeout(() => {
        setItems([]);
        setRedeem(0);
        setTargetUid(null);
        setCustomerName('');
        setCustomerPhone('');
        setBalance(0);
        setLedger([]);
      }, 1000);
      
    } catch (e: any) {
      const msg = e?.detail?.error || e.message || 'Ошибка операции';
      setError(msg);
    } finally {
      setProcessing(false);
    }
  }, [targetUid, items, redeem, accrueAmount, finalSum, balance, customerName, customerPhone]);

  // Camera scanner
  useEffect(() => {
    if (!scanning || !videoRef.current) {
      scannerControls.current?.stop();
      scannerControls.current = null;
      hasScanned.current = false;
      return;
    }

    const reader = new BrowserMultiFormatReader();
    hasScanned.current = false;

    reader.decodeFromVideoDevice(undefined, videoRef.current, (result, error, controls) => {
      if (!scannerControls.current) scannerControls.current = controls;
      if (result && !hasScanned.current) {
        hasScanned.current = true;
        const txt = result.getText();
        setInput(txt);
        controls.stop();
        setScanning(false);
        void handleScanCustomer(txt);
      }
    }).catch((err) => {
      console.warn('Decode error:', err);
    });

    return () => {
      scannerControls.current?.stop();
      scannerControls.current = null;
    };
  }, [scanning, handleScanCustomer]);

  // Pistol scanner global listener
  useEffect(() => {
    if (!globalListen) {
      if (resetTimerRef.current) window.clearTimeout(resetTimerRef.current);
      scanBufRef.current = '';
      scanTimesRef.current = [];
      lastTimeRef.current = 0;
      return;
    }

    const handleKey = (e: KeyboardEvent) => {
      const now = Date.now();
      if (e.key === 'Enter') {
        if (scanBufRef.current.trim().length > 0) {
          const val = scanBufRef.current.trim();
          scanBufRef.current = '';
          scanTimesRef.current = [];
          void handleScanCustomer(val);
        }
        return;
      }

      if (e.key.length === 1) {
        if (resetTimerRef.current) window.clearTimeout(resetTimerRef.current);
        resetTimerRef.current = window.setTimeout(() => {
          scanBufRef.current = '';
          scanTimesRef.current = [];
        }, 200);

        const delta = now - lastTimeRef.current;
        lastTimeRef.current = now;
        
        scanBufRef.current += e.key;
        if (delta > 0 && delta < 1000) {
          scanTimesRef.current.push(delta);
        }

        const rapidCount = scanTimesRef.current.filter(d => d <= 50).length;
        if (rapidCount >= 3) {
          // Pistol scanner detected
        }
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
      if (resetTimerRef.current) window.clearTimeout(resetTimerRef.current);
    };
  }, [globalListen, handleScanCustomer]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-100 to-white pb-20">
      <div className="px-4 py-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">POS-Терминал</h1>
          <p className="text-sm text-slate-600">Кассовая система для бариста</p>
        </div>

        {/* Toast */}
        {toast && (
          <div className="fixed top-4 right-4 z-50">
            <div className="bg-emerald-600 text-white px-6 py-3 rounded-3xl shadow-[0_16px_48px_-20px_rgba(0,0,0,0.45)] font-semibold">
              {toast}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-3xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Step 1: Корзина (доступна всегда) */}
        <div className="bg-white rounded-3xl shadow-[0_16px_48px_-20px_rgba(0,0,0,0.35)] p-4 mb-4">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Шаг 1: Сканируйте товары</h2>
          
          {/* Quick amounts */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => addQuickAmount(1000)}
              className="flex-1 px-4 py-3 bg-slate-900 text-white rounded-2xl font-semibold shadow-[0_14px_36px_-14px_rgba(0,0,0,0.55)] hover:bg-slate-800"
            >
              1000₸
            </button>
            <button
              onClick={() => addQuickAmount(2000)}
              className="flex-1 px-4 py-3 bg-slate-900 text-white rounded-2xl font-semibold shadow-[0_14px_36px_-14px_rgba(0,0,0,0.55)] hover:bg-slate-800"
            >
              2000₸
            </button>
            <button
              onClick={() => addQuickAmount(3000)}
              className="flex-1 px-4 py-3 bg-slate-900 text-white rounded-2xl font-semibold shadow-[0_14px_36px_-14px_rgba(0,0,0,0.55)] hover:bg-slate-800"
            >
              3000₸
            </button>
          </div>

          {/* Manual add */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Название товара"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addItem()}
              className="flex-1 px-4 py-3 rounded-3xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Цена"
              value={newItemPrice}
              onChange={(e) => setNewItemPrice(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addItem()}
              className="w-32 px-4 py-3 rounded-3xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
            <button
              onClick={addItem}
              className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-semibold hover:bg-slate-800"
            >
              Добавить
            </button>
          </div>

          {/* Cart items */}
          <div className="space-y-2 mb-4">
            {items.length === 0 ? (
              <div className="text-center py-8 text-slate-500">Корзина пуста</div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-slate-50 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="font-medium text-slate-900">{item.name}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => changeQty(item.id, -1)}
                        className="w-6 h-6 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center text-sm"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.qty}</span>
                      <button
                        onClick={() => changeQty(item.id, 1)}
                        className="w-6 h-6 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-900 font-bold">{item.price * item.qty}₸</span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 hover:text-red-700 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {items.length > 0 && (
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={clearCart}
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                Очистить корзину
              </button>
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold text-slate-900">Итого:</span>
                <span className="text-2xl font-extrabold text-slate-900">{totalSum}₸</span>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Сканирование клиента (только когда есть товары) */}
        {items.length > 0 && (
          <div className="bg-white rounded-3xl shadow-[0_16px_48px_-20px_rgba(0,0,0,0.35)] p-4 mb-4">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Шаг 2: Отсканируйте клиента</h2>
            
            <div className="flex gap-2 mb-3">
              <button
                className="px-4 py-2 rounded-2xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"
                onClick={() => setScanning(s => !s)}
              >
                {scanning ? 'Остановить сканер' : '📷 Сканировать камерой'}
              </button>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  className="accent-slate-900"
                  checked={globalListen}
                  onChange={(e) => setGlobalListen(e.target.checked)}
                />
                Слушать пистолет
              </label>
            </div>

            <div className="flex gap-2">
              <input
                className="flex-1 px-4 py-3 rounded-3xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                placeholder="UID или QR клиента"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                ref={inputRef}
                onKeyDown={(e) => e.key === 'Enter' && handleScanCustomer()}
              />
              <button
                className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700"
                onClick={() => handleScanCustomer()}
                disabled={loading}
              >
                {loading ? '...' : 'Найти'}
              </button>
            </div>

            {scanning && (
              <div className="mt-4 border rounded-3xl overflow-hidden relative">
                <video ref={videoRef} className="w-full h-[320px] object-cover bg-black" muted playsInline />
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-10 border-2 border-emerald-400/80 rounded-2xl" />
                </div>
                <div className="p-3 text-xs text-slate-600 bg-slate-50">
                  Наведите камеру на QR-код клиента
                </div>
              </div>
            )}

            {targetUid && (
              <div className="mt-4 p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Имя:</span>
                  <span className="font-bold text-slate-900">{customerName || 'Клиент'}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Телефон:</span>
                  <span className="font-bold text-slate-900">{customerPhone || '—'}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-emerald-200">
                  <span className="text-sm text-slate-600">Баланс бонусов:</span>
                  <span className="font-bold text-emerald-600">{balance}₸</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Бонусы и оплата (только когда клиент отсканирован) */}
        {targetUid && items.length > 0 && (
          <div className="bg-white rounded-3xl shadow-[0_16px_48px_-20px_rgba(0,0,0,0.35)] p-4">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Шаг 3: Бонусы и оплата</h2>
            
            {/* Redeem bonuses */}
            <div className="mb-4 p-4 bg-amber-50 rounded-2xl border border-amber-200">
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Списать бонусы (макс. {maxRedeem}₸ / 30%)
              </label>
              <div className="flex gap-2">
                <input
                  type="range"
                  min={0}
                  max={Math.min(balance, maxRedeem)}
                  value={redeem}
                  onChange={(e) => setRedeem(Number(e.target.value))}
                  className="flex-1"
                />
                <input
                  type="number"
                  min={0}
                  max={Math.min(balance, maxRedeem)}
                  value={redeem}
                  onChange={(e) => setRedeem(Math.min(Number(e.target.value), Math.min(balance, maxRedeem)))}
                  className="w-24 px-3 py-2 rounded-2xl border border-amber-300 bg-white text-right"
                />
              </div>
              <div className="mt-2 text-xs text-slate-600">
                Доступно: {balance}₸ | Можно использовать: {Math.min(balance, maxRedeem)}₸
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-2 mb-6 p-4 bg-slate-50 rounded-2xl">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Сумма покупки:</span>
                <span className="font-semibold text-slate-900">{totalSum}₸</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Списание бонусов:</span>
                <span className="font-semibold text-red-600">−{redeem}₸</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Начисление бонусов (1%):</span>
                <span className="font-semibold text-green-600">+{accrueAmount}₸</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between">
                <span className="font-bold text-slate-900">К оплате:</span>
                <span className="text-2xl font-extrabold text-slate-900">{finalSum}₸</span>
              </div>
            </div>

            {/* Confirm button */}
            <button
              onClick={doConfirm}
              disabled={processing}
              className="w-full px-6 py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-[0_14px_36px_-14px_rgba(0,0,0,0.55)] hover:bg-slate-800 disabled:opacity-50"
            >
              {processing ? 'Обработка...' : `Подтвердить оплату ${finalSum}₸`}
            </button>

            {/* Recent transactions */}
            {ledger.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Последние операции</h3>
                <div className="space-y-2">
                  {ledger.map((e) => (
                    <div key={e.id} className="flex items-center justify-between text-sm p-2 bg-slate-50 rounded-xl">
                      <span className="text-slate-600">{e.type}</span>
                      <span className={`font-semibold ${e.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {e.amount > 0 ? '+' : ''}{e.amount}₸
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
