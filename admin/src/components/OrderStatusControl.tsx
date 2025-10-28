import React, { useContext } from 'react';
import { UserContext } from '@/contexts/UserContext';
import { 
  OrderStatus, 
  OrderType,
  getNextStatus,
  isFinalStatus,
} from '@/types/orderStatus';
import { orderStatusService } from '@/services/orderStatusService';

interface OrderStatusControlProps {
  orderId: string;
  currentStatus: OrderStatus;
  orderType: OrderType;
  courierId?: string;
  onStatusChanged?: () => void;
}

/**
 * Компактный компонент управления статусом заказа
 * Минималистичная тёмная кнопка
 */
export const OrderStatusControl: React.FC<OrderStatusControlProps> = ({
  orderId,
  currentStatus,
  orderType,
  courierId,
  onStatusChanged,
}) => {
  const { user } = useContext(UserContext);
  const [loading, setLoading] = React.useState(false);
  
  const nextStatus = getNextStatus(currentStatus, orderType);
  const isFinal = isFinalStatus(currentStatus);
  
  const handleStatusChange = async () => {
    if (!nextStatus || !user) return;
    
    setLoading(true);
    
    try {
      let result;
      
      switch (nextStatus) {
        case OrderStatus.ACCEPTED:
          result = await orderStatusService.acceptOrder(orderId, user.uid, user.email || '');
          break;
          
        case OrderStatus.PREPARING:
          result = await orderStatusService.startPreparing(orderId, user.uid, user.email || '');
          break;
          
        case OrderStatus.READY:
          result = await orderStatusService.markReady(orderId, user.uid, user.email || '');
          break;
          
        case OrderStatus.COMPLETED:
          result = await orderStatusService.completePickup(orderId, user.uid, user.email || '');
          break;
          
        default:
          result = { success: false, error: 'Неизвестный статус' };
      }
      
      if (result.success) {
        onStatusChanged?.();
      } else {
        alert(`Ошибка: ${result.error}`);
      }
      
    } catch (error) {
      console.error('Ошибка смены статуса:', error);
      alert('Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };
  
  const getButtonText = () => {
    switch (nextStatus) {
      case OrderStatus.ACCEPTED:
        return 'Принять';
      case OrderStatus.PREPARING:
        return 'В работу';
      case OrderStatus.READY:
        return 'Готово';
      case OrderStatus.COMPLETED:
        return 'Выдано';
      default:
        return 'Далее';
    }
  };
  
  const getButtonColors = () => {
    if (loading) {
      return 'bg-slate-200 text-slate-500 shadow-md';
    }
    // Все кнопки темные
    return 'bg-slate-900 hover:bg-slate-950 shadow-xl shadow-slate-900/40 hover:shadow-2xl hover:shadow-slate-900/50';
  };
  
  if (isFinal || !nextStatus) {
    return null;
  }
  
  return (
    <button
      onClick={handleStatusChange}
      disabled={loading}
      className={`
        px-5 py-2.5 rounded-xl text-sm font-black transition-all duration-200
        text-white transform hover:scale-105 active:scale-95
        disabled:cursor-not-allowed disabled:hover:scale-100
        ${getButtonColors()}
      `}
    >
      {loading ? 'Обновление...' : getButtonText()}
    </button>
  );
};
