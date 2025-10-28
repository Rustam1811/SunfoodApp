import React, { useState, useEffect } from 'react';
import {
  CheckCircleIcon,
  ClockIcon,
  BellIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  PrinterIcon,
} from '@heroicons/react/24/outline';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { 
  formatOrderItemModifiers, 
  getOrderDisplayNumber 
} from '../utils/orderLocalization';
import { OrderStatusControl } from '@/components/OrderStatusControl';
import { OrderStatus, OrderType } from '@/types/orderStatus';

interface OrderItem { 
  name: string; 
  quantity: number; 
  price: number; 
  sizeKey?: string; 
  milkKey?: string; 
  syrupKey?: string;
  temperatureKey?: string;
  intensityKey?: string;
}

interface Order {
  id: string;
  orderNumberDisplay?: string;
  items: OrderItem[];
  amount: number;
  status: 'pending' | 'accepted' | 'ready' | 'completed' | 'preparing';
  date: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  bonusUsed?: number;
  deliveryType?: 'pickup' | 'delivery';
}

const mapToOrderStatus = (status: string): OrderStatus => {
  const mapping: Record<string, OrderStatus> = {
    'pending': OrderStatus.NEW,
    'accepted': OrderStatus.ACCEPTED,
    'preparing': OrderStatus.PREPARING,
    'ready': OrderStatus.READY,
    'completed': OrderStatus.COMPLETED,
  };
  return mapping[status] || OrderStatus.NEW;
};

const mapToOrderType = (deliveryType?: 'pickup' | 'delivery'): OrderType => {
  return deliveryType === 'delivery' ? OrderType.DELIVERY : OrderType.PICKUP;
};

// Компонент таймера времени заказа
const OrderTimer: React.FC<{ orderDate: string }> = ({ orderDate }) => {
  const [elapsed, setElapsed] = useState('');
  
  useEffect(() => {
    const updateElapsed = () => {
      const now = new Date().getTime();
      const orderTime = new Date(orderDate).getTime();
      const diffMs = now - orderTime;
      
      const minutes = Math.floor(diffMs / 60000);
      const hours = Math.floor(minutes / 60);
      
      if (hours > 0) {
        setElapsed(`${hours}ч ${minutes % 60}м`);
      } else {
        setElapsed(`${minutes}м`);
      }
    };
    
    updateElapsed();
    const interval = setInterval(updateElapsed, 60000); // Обновляем каждую минуту
    
    return () => clearInterval(interval);
  }, [orderDate]);
  
  const getColorClass = () => {
    const minutes = Math.floor((new Date().getTime() - new Date(orderDate).getTime()) / 60000);
    if (minutes > 30) return 'text-red-600 bg-red-50';
    if (minutes > 15) return 'text-orange-600 bg-orange-50';
    return 'text-slate-600 bg-slate-50';
  };
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold ${getColorClass()}`}>
      <ClockIcon className="w-3.5 h-3.5" />
      {elapsed}
    </span>
  );
};

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'accepted' | 'ready'>('pending');
  const [refreshing, setRefreshing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [previousOrderCount, setPreviousOrderCount] = useState(0);

  // Звук для нового заказа
  const playNotificationSound = () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Приятный двойной звук уведомления
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn('Cannot play notification sound:', error);
    }
  };

  // Real-time Firestore subscription
  useEffect(() => {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders: Order[] = snapshot.docs
        .map(doc => {
          const data = doc.data();
          const createdAt = data.createdAt instanceof Timestamp 
            ? data.createdAt.toDate().toISOString()
            : (data.date || new Date().toISOString());
          
          return {
            id: doc.id,
            orderNumberDisplay: data.orderNumber || data.orderNumberDisplay || `#${doc.id.slice(-6)}`,
            items: (data.items || []).map((it: Record<string, unknown>) => ({
              name: it.name as string || '',
              quantity: it.quantity as number || 0,
              price: it.price as number || 0,
              sizeKey: it.sizeKey as string | undefined,
              milkKey: it.milkKey as string | undefined,
              syrupKey: it.syrupKey as string | undefined,
              temperatureKey: it.temperatureKey as string | undefined,
              intensityKey: it.intensityKey as string | undefined,
            })),
            amount: data.total || data.amount || 0,
            status: mapFirestoreToLegacyStatus(data.status),
            date: createdAt,
            customerName: data.customerName || 'Клиент',
            customerPhone: data.customerPhone || data.phone || '',
            customerEmail: data.customerEmail || data.email || '',
            bonusUsed: data.bonusUsed || 0,
            deliveryType: data.type || data.deliveryType || 'pickup',
          };
        })
        .filter(order => {
          const status = order.status.toLowerCase();
          return status === 'pending' || status === 'accepted' || status === 'preparing' || status === 'ready';
        });
      
      // Проверка на новые заказы и воспроизведение звука
      const newOrderCount = fetchedOrders.filter(o => o.status === 'pending').length;
      if (previousOrderCount > 0 && newOrderCount > previousOrderCount) {
        playNotificationSound();
      }
      setPreviousOrderCount(newOrderCount);
      
      setOrders(fetchedOrders);
      setApiError(null);
    }, (error) => {
      console.error('Error fetching orders:', error);
      setApiError('Ошибка загрузки заказов из Firestore');
    });
    
    return () => unsubscribe();
  }, [previousOrderCount]);
  
  const mapFirestoreToLegacyStatus = (status: string): Order['status'] => {
    const normalized = status?.toUpperCase() || 'NEW';
    const mapping: Record<string, Order['status']> = {
      'NEW': 'pending',
      'ACCEPTED': 'accepted',
      'PREPARING': 'preparing',
      'READY': 'ready',
      'COMPLETED': 'completed',
    };
    return mapping[normalized] || 'pending';
  };

  const handleManualRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  // Печать чека
  const printReceipt = (order: Order) => {
    const printWindow = window.open('', '', 'width=300,height=600');
    if (!printWindow) return;
    
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Чек #${getOrderDisplayNumber(order)}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: monospace; font-size: 12px; padding: 20px; max-width: 300px; }
          .header { text-align: center; margin-bottom: 20px; font-weight: bold; font-size: 14px; }
          .divider { border-bottom: 1px dashed #000; margin: 10px 0; }
          .row { display: flex; justify-content: space-between; margin: 5px 0; }
          .item { margin: 8px 0; }
          .item-name { font-weight: bold; }
          .item-details { font-size: 10px; color: #666; margin-left: 10px; }
          .total { font-size: 16px; font-weight: bold; margin-top: 15px; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">COFFEE ADDICT</div>
        <div class="divider"></div>
        <div class="row">
          <span>Заказ:</span>
          <span><strong>#${getOrderDisplayNumber(order)}</strong></span>
        </div>
        <div class="row">
          <span>Дата:</span>
          <span>${new Date(order.date).toLocaleString('ru-RU')}</span>
        </div>
        ${order.customerName && order.customerName !== 'Клиент' ? `
        <div class="row">
          <span>Клиент:</span>
          <span>${order.customerName}</span>
        </div>` : ''}
        ${order.customerPhone ? `
        <div class="row">
          <span>Телефон:</span>
          <span>${order.customerPhone}</span>
        </div>` : ''}
        <div class="divider"></div>
        ${order.items.map(item => `
          <div class="item">
            <div class="item-name">${item.quantity}× ${item.name}</div>
            ${formatOrderItemModifiers(item) ? `<div class="item-details">${formatOrderItemModifiers(item)}</div>` : ''}
            <div class="row">
              <span></span>
              <span>${item.price * item.quantity}₸</span>
            </div>
          </div>
        `).join('')}
        <div class="divider"></div>
        ${order.bonusUsed ? `
        <div class="row">
          <span>Бонусы:</span>
          <span>-${order.bonusUsed}₸</span>
        </div>` : ''}
        <div class="row total">
          <span>ИТОГО:</span>
          <span>${order.amount}₸</span>
        </div>
        <div class="divider"></div>
        <div style="text-align: center; margin-top: 20px; font-size: 10px;">
          Спасибо за заказ!<br/>
          Приходите еще ☕
        </div>
        <script>
          window.onload = () => {
            window.print();
            setTimeout(() => window.close(), 100);
          };
        </script>
      </body>
      </html>
    `;
    
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'accepted': return 'bg-slate-200 text-slate-900 border-slate-400';
      case 'ready': return 'bg-slate-800 text-white border-slate-900';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <ClockIcon className="w-4 h-4" />;
      case 'accepted': return <CheckCircleIcon className="w-4 h-4" />;
      case 'ready': return <BellIcon className="w-4 h-4" />;
      default: return <ClockIcon className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Новый';
      case 'accepted': return 'В работе';
      case 'ready': return 'Готов';
      default: return status;
    }
  };

  // Фильтрация по табу и поисковому запросу
  const filteredOrders = orders
    .filter(order => order.status === activeTab)
    .filter(order => {
      if (!searchQuery.trim()) return true;
      
      const query = searchQuery.toLowerCase();
      const orderNumber = getOrderDisplayNumber(order).toLowerCase();
      const customerName = (order.customerName || '').toLowerCase();
      const customerPhone = (order.customerPhone || '').toLowerCase();
      const customerEmail = (order.customerEmail || '').toLowerCase();
      
      return (
        orderNumber.includes(query) ||
        customerName.includes(query) ||
        customerPhone.includes(query) ||
        customerEmail.includes(query)
      );
    });

  return (
    <div className="min-h-screen pb-20 bg-slate-50">
      {apiError && (
        <div className="bg-red-600 text-white p-4 text-center text-sm font-medium shadow-2xl">
          {apiError}
        </div>
      )}
      
      <div className="px-4 py-6 max-w-7xl mx-auto">
        {/* Header - минимализм */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
              Заказы
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/80"></div>
              <p className="text-sm font-medium text-slate-500">Real-time</p>
            </div>
          </div>
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="p-4 bg-white text-slate-900 rounded-2xl hover:bg-slate-50 transition-all duration-200 disabled:opacity-50 shadow-xl hover:shadow-2xl disabled:hover:shadow-xl border border-slate-200"
          >
            <ArrowPathIcon className={`w-6 h-6 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Поиск */}
        <div className="mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по номеру, имени, телефону, email..."
              className="w-full pl-12 pr-12 py-3.5 bg-white border-2 border-slate-200 rounded-2xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 shadow-lg transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-slate-500" />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="mt-2 text-xs text-slate-500 font-medium">
              Найдено: {filteredOrders.length} {filteredOrders.length === 1 ? 'заказ' : 'заказов'}
            </p>
          )}
        </div>

        {/* Tabs - темные */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {(['pending', 'accepted', 'ready'] as const).map((status) => {
            const count = orders.filter((o) => o.status === status).length;
            const isActive = activeTab === status;
            
            return (
              <button
                key={status}
                onClick={() => setActiveTab(status)}
                className={`flex-shrink-0 px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/40'
                    : 'bg-white text-slate-700 shadow-lg hover:shadow-xl'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`${isActive ? 'scale-110' : ''} transition-transform`}>
                    {getStatusIcon(status)}
                  </span>
                  <span>{getStatusText(status)}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    isActive 
                      ? 'bg-white/20 backdrop-blur-sm' 
                      : 'bg-slate-100'
                  }`}>
                    {count}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Orders - luxury тени */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredOrders.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-white rounded-3xl shadow-2xl">
              <div className="bg-slate-50 w-20 h-20 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-inner">
                <BellIcon className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-base font-bold text-slate-900">Нет заказов</p>
              <p className="text-sm text-slate-500 mt-1">Ожидаем новые заказы...</p>
            </div>
          ) : (
            filteredOrders.map((order, index) => {
              const isNew = order.status === 'pending';
              return (
                <div
                  key={order.id}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className={`bg-white rounded-3xl p-5 transition-all duration-300 hover:scale-[1.02] animate-fadeIn ${
                    isNew 
                      ? 'shadow-2xl ring-2 ring-slate-300 hover:shadow-slate-900/20' 
                      : 'shadow-xl hover:shadow-2xl'
                  }`}
                >
                {/* Заголовок с таймером */}
                <div className="flex items-start justify-between mb-4 pb-4 border-b-2 border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-2xl font-black text-slate-900">
                        #{getOrderDisplayNumber(order)}
                      </h3>
                      <OrderTimer orderDate={order.date} />
                    </div>
                    <p className="text-xs text-slate-500 font-semibold">
                      {new Date(order.date).toLocaleString('ru-RU', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className={`px-4 py-1.5 rounded-xl text-xs font-bold shadow-lg ${getStatusColor(order.status)}`}>
                      <div className="flex items-center gap-1.5">
                        {getStatusIcon(order.status)}
                        <span>{getStatusText(order.status)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => printReceipt(order)}
                      className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors group"
                      title="Печать чека"
                    >
                      <PrinterIcon className="w-4 h-4 text-slate-600 group-hover:text-slate-900" />
                    </button>
                  </div>
                </div>

                {/* Информация о клиенте */}
                <div className="mb-4 pb-4 border-b border-slate-100 space-y-2">
                  {order.customerName && order.customerName !== 'Клиент' && (
                    <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl">
                      <span className="text-lg">👤</span>
                      <span className="text-sm text-slate-900 font-bold">{order.customerName}</span>
                    </div>
                  )}
                  
                  {order.customerEmail && (
                    <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl">
                      <span className="text-lg">✉️</span>
                      <a 
                        href={`mailto:${order.customerEmail}`}
                        className="text-sm text-slate-900 font-semibold hover:text-slate-600 transition-colors"
                      >
                        {order.customerEmail}
                      </a>
                    </div>
                  )}
                  
                  {order.customerPhone && (
                    <a 
                      href={`tel:${order.customerPhone}`} 
                      className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-sm text-slate-900 font-bold transition-all shadow-sm hover:shadow-md"
                    >
                      <span className="text-lg">📞</span>
                      {order.customerPhone}
                    </a>
                  )}
                </div>

                {/* Товары - чистый список */}
                <div className="space-y-2.5 mb-5">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors shadow-sm">
                      <div className="flex-1">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-slate-900 text-white text-xs font-black shadow-md">
                            {item.quantity}
                          </span>
                          {item.name}
                        </div>
                        {formatOrderItemModifiers(item) && (
                          <div className="text-slate-500 text-xs font-medium ml-8 mt-1">
                            {formatOrderItemModifiers(item)}
                          </div>
                        )}
                      </div>
                      <div className="text-slate-900 font-black ml-3 text-base">
                        {item.price ? `${item.price * item.quantity}₸` : '—'}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Итого - премиум */}
                <div className="flex items-center justify-between pt-4 border-t-2 border-slate-100">
                  <div className="text-xl font-black text-slate-900">
                    {order.amount}₸
                    {order.bonusUsed ? (
                      <span className="text-sm font-bold text-green-600 ml-2">
                        −{order.bonusUsed}₸ 🎁
                      </span>
                    ) : null}
                  </div>
                  <OrderStatusControl
                    orderId={order.id}
                    currentStatus={mapToOrderStatus(order.status)}
                    orderType={mapToOrderType(order.deliveryType)}
                  />
                </div>
              </div>
            );
          })
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;
