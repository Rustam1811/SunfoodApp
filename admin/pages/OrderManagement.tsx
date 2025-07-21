import React, { useState, useEffect } from 'react';
import { 
    CheckCircleIcon, 
    ClockIcon, 
    BellIcon,
    QrCodeIcon,
    EyeIcon 
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface Order {
    id: string;
    items: any[];
    amount: number;
    status: 'pending' | 'accepted' | 'ready' | 'completed';
    date: string;
    customerName?: string;
    bonusUsed?: number;
}

const OrderManagement: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'pending' | 'accepted' | 'ready'>('pending');

    useEffect(() => {
        fetchOrders();
        // Обновляем заказы каждые 5 секунд
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await fetch('/api/orders?admin=true');
            if (response.ok) {
                const data = await response.json();
                setOrders(data.orders || []);
            }
        } catch (error) {
            console.error('Ошибка загрузки заказов:', error);
        }
    };

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        setLoading(true);
        try {
            const response = await fetch('/api/orders', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, status: newStatus })
            });
            
            if (response.ok) {
                await fetchOrders(); // Обновляем список
            }
        } catch (error) {
            console.error('Ошибка обновления статуса:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
            case 'accepted': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
            case 'ready': return 'bg-green-500/20 text-green-500 border-green-500/30';
            case 'completed': return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
            default: return 'bg-zinc-700 text-zinc-300';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending': return 'Новый заказ';
            case 'accepted': return 'В процессе';
            case 'ready': return 'Готов';
            case 'completed': return 'Выдан';
            default: return status;
        }
    };

    const filteredOrders = orders.filter(order => order.status === activeTab);

    return (
        <div className="p-6 bg-zinc-900 min-h-screen text-white">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">Управление заказами</h1>
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <ClockIcon className="w-4 h-4" />
                        Автообновление каждые 5 сек
                    </div>
                </div>

                {/* Вкладки статусов */}
                <div className="flex gap-4 mb-6">
                    {(['pending', 'accepted', 'ready'] as const).map(status => {
                        const count = orders.filter(o => o.status === status).length;
                        return (
                            <button
                                key={status}
                                onClick={() => setActiveTab(status)}
                                className={`px-4 py-2 rounded-lg border transition-all ${
                                    activeTab === status 
                                        ? 'bg-amber-500/20 text-amber-500 border-amber-500/50' 
                                        : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700'
                                }`}
                            >
                                {getStatusText(status)} ({count})
                            </button>
                        );
                    })}
                </div>

                {/* Список заказов */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-4"
                    >
                        {filteredOrders.length === 0 ? (
                            <div className="text-center text-zinc-400 py-12">
                                <BellIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>Нет заказов со статусом "{getStatusText(activeTab)}"</p>
                            </div>
                        ) : (
                            filteredOrders.map(order => (
                                <motion.div
                                    key={order.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-zinc-800 rounded-xl p-6 border border-zinc-700"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold">Заказ #{order.id.slice(-6)}</h3>
                                            <p className="text-sm text-zinc-400">
                                                {new Date(order.date).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-lg border text-sm font-medium ${getStatusColor(order.status)}`}>
                                            {getStatusText(order.status)}
                                        </div>
                                    </div>

                                    {/* Детали заказа */}
                                    <div className="mb-4">
                                        <h4 className="text-sm font-medium text-zinc-300 mb-2">Позиции:</h4>
                                        <div className="space-y-1">
                                            {order.items.map((item, index) => (
                                                <div key={index} className="flex justify-between text-sm">
                                                    <span>{item.name} × {item.quantity}</span>
                                                    <span>{item.price * item.quantity} ₸</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="border-t border-zinc-700 mt-2 pt-2 flex justify-between font-bold">
                                            <span>Итого:</span>
                                            <span>{order.amount} ₸</span>
                                        </div>
                                        {order.bonusUsed && order.bonusUsed > 0 && (
                                            <div className="text-sm text-orange-400 mt-1">
                                                Использовано бонусов: -{order.bonusUsed} ₸
                                            </div>
                                        )}
                                    </div>

                                    {/* Кнопки действий */}
                                    <div className="flex gap-3">
                                        {order.status === 'pending' && (
                                            <button
                                                onClick={() => updateOrderStatus(order.id, 'accepted')}
                                                disabled={loading}
                                                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                                            >
                                                <CheckCircleIcon className="w-5 h-5 inline mr-2" />
                                                Принять заказ
                                            </button>
                                        )}
                                        {order.status === 'accepted' && (
                                            <button
                                                onClick={() => updateOrderStatus(order.id, 'ready')}
                                                disabled={loading}
                                                className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                                            >
                                                <BellIcon className="w-5 h-5 inline mr-2" />
                                                Заказ готов
                                            </button>
                                        )}
                                        {order.status === 'ready' && (
                                            <div className="flex-1 space-y-2">
                                                <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-3 text-center">
                                                    <QrCodeIcon className="w-8 h-8 mx-auto mb-1 text-amber-500" />
                                                    <div className="text-amber-400 font-bold">QR: {order.id.slice(-4)}</div>
                                                    <div className="text-xs text-amber-300">Код для выдачи</div>
                                                </div>
                                                <button
                                                    onClick={() => updateOrderStatus(order.id, 'completed')}
                                                    disabled={loading}
                                                    className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                                                >
                                                    <EyeIcon className="w-5 h-5 inline mr-2" />
                                                    Заказ выдан
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default OrderManagement;
