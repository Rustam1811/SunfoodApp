/**
 * Delivery Management Page - Simplified
 * 
 * Just shows delivery orders from Firestore
 * Courier assignment will be handled by external service (Wolt/Yandex/Indriver)
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TruckIcon,
  MapPinIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

type DeliveryStatus = 
  | 'pending' | 'preparing' | 'ready' | 'assigned' 
  | 'picked_up' | 'on_the_way' | 'delivered' | 'cancelled';

interface DeliveryOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  address: {
    street: string;
    apartment?: string;
  };
  amount: number;
  status: DeliveryStatus;
  createdAt: number;
}

const STATUS_LABELS: Record<DeliveryStatus, string> = {
  pending: 'Принят',
  preparing: 'Готовится',
  ready: 'Готов',
  assigned: 'Назначен',
  picked_up: 'Забран',
  on_the_way: 'В пути',
  delivered: 'Доставлен',
  cancelled: 'Отменен',
};

const STATUS_COLORS: Record<DeliveryStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  preparing: 'bg-blue-100 text-blue-800',
  ready: 'bg-green-100 text-green-800',
  assigned: 'bg-indigo-100 text-indigo-800',
  picked_up: 'bg-purple-100 text-purple-800',
  on_the_way: 'bg-orange-100 text-orange-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
};

const DeliveryManagement: React.FC = () => {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Real-time Firestore subscription
  useEffect(() => {
    const ordersRef = collection(db, 'orders');
    
    // ЛОГИКА КАК В GLOVO:
    // Показываем только заказы на доставку которые ГОТОВЫ к отправке
    // (бариста сделал READY) и еще не доставлены
    const q = query(
      ordersRef,
      where('type', '==', 'delivery'),
      // Можно использовать один из вариантов:
      // 1. Показывать только готовые и в процессе доставки
      // where('status', 'in', ['READY', 'ASSIGNED', 'PICKED_UP', 'ON_THE_WAY', 'DELIVERED']),
      // 2. ИЛИ просто все доставки и фильтровать на клиенте
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders: DeliveryOrder[] = snapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            orderNumber: data.orderNumber || data.orderNumberDisplay || `#${doc.id.slice(-6)}`,
            customerName: data.customerName || 'Клиент',
            customerPhone: data.customerPhone || data.phone || '',
            address: {
              street: data.address?.street || data.deliveryAddress || '',
              apartment: data.address?.apartment,
            },
            amount: data.total || data.amount || 0,
            status: mapFirestoreStatus(data.status),
            createdAt: data.createdAt?.toMillis?.() || Date.now(),
          };
        })
        // ФИЛЬТР: Показываем только готовые к доставке (READY и дальше)
        .filter(order => ['ready', 'assigned', 'picked_up', 'on_the_way', 'delivered'].includes(order.status));
      
      console.log(`📦 Loaded ${fetchedOrders.length} delivery orders (READY and later)`);
      setOrders(fetchedOrders);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching delivery orders:', error);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);
  
  const mapFirestoreStatus = (status: string): DeliveryStatus => {
    // Нормализация: uppercase для совместимости
    const normalized = status?.toUpperCase() || 'NEW';
    const mapping: Record<string, DeliveryStatus> = {
      'NEW': 'pending',
      'ACCEPTED': 'preparing',
      'PREPARING': 'preparing',
      'READY': 'ready',
      'ASSIGNED': 'assigned',
      'PICKED_UP': 'picked_up',
      'ON_THE_WAY': 'on_the_way',
      'DELIVERED': 'delivered',
      'COMPLETED': 'delivered',
      'CANCELLED': 'cancelled',
    };
    return mapping[normalized] || 'pending';
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4" />
          <div className="text-gray-600">Загрузка доставок...</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Управление доставкой</h1>
          <p className="text-gray-600">
            Всего доставок: {orders.length}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            💡 Назначение курьеров через Wolt/Yandex/Indriver
          </p>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TruckIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
                <div className="text-sm text-gray-600">Всего заказов</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <MapPinIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'on_the_way').length}
                </div>
                <div className="text-sm text-gray-600">В пути</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TruckIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'ready').length}
                </div>
                <div className="text-sm text-gray-600">Готов к отправке</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <TruckIcon className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'delivered').length}
                </div>
                <div className="text-sm text-gray-600">Доставлено</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <TruckIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Нет заказов на доставку</h3>
            <p className="text-gray-600">Заказы появятся здесь автоматически</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Заказ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Клиент
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Адрес
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Сумма
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Статус
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleString('ru-RU', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.customerName}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <PhoneIcon className="w-3 h-3" />
                          {order.customerPhone}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{order.address.street}</div>
                        {order.address.apartment && (
                          <div className="text-xs text-gray-500">Кв. {order.address.apartment}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{order.amount} ₸</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                          {STATUS_LABELS[order.status]}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryManagement;
