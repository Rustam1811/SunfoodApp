import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircleIcon,
  TruckIcon,
  ClockIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { UserContext } from '@/contexts/UserContext';
import { 
  OrderStatus, 
  OrderType,
  ORDER_STATUS_META,
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
 * Компонент управления статусом заказа
 * 
 * Отображает текущий статус и кнопку для перехода на следующий
 * Учитывает роль пользователя и тип заказа
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
  
  const statusMeta = ORDER_STATUS_META[currentStatus];
  const nextStatus = getNextStatus(currentStatus, orderType);
  const nextStatusMeta = nextStatus ? ORDER_STATUS_META[nextStatus] : null;
  
  const isDelivery = orderType === OrderType.DELIVERY;
  const isFinal = isFinalStatus(currentStatus);
  
  /**
   * Обработка смены статуса
   */
  const handleStatusChange = async () => {
    if (!nextStatus || !user) return;
    
    setLoading(true);
    
    try {
      let result;
      
      // Используем специфичные методы сервиса
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
          
        case OrderStatus.PICKED_UP:
          if (!courierId) {
            alert('Ошибка: курьер не назначен');
            return;
          }
          result = await orderStatusService.markPickedUp(orderId, courierId, user.email || '');
          break;
          
        case OrderStatus.ON_THE_WAY:
          if (!courierId) {
            alert('Ошибка: курьер не назначен');
            return;
          }
          result = await orderStatusService.markOnTheWay(orderId, courierId, user.email || '');
          break;
          
        case OrderStatus.DELIVERED:
          if (!courierId) {
            alert('Ошибка: курьер не назначен');
            return;
          }
          result = await orderStatusService.markDelivered(orderId, courierId, user.email || '');
          break;
          
        case OrderStatus.COMPLETED:
          result = await orderStatusService.completePickup(orderId, user.uid, user.email || '');
          break;
          
        default:
          result = { success: false, error: 'Неизвестный статус' };
      }
      
      if (result.success) {
        if (result.notificationSent) {
          console.log('✅ Уведомление клиенту отправлено');
        }
        onStatusChanged?.();
      } else {
        alert(`Ошибка: ${result.error}`);
      }
      
    } catch (error) {
      console.error('Ошибка смены статуса:', error);
      alert('Произошла ошибка при обновлении статуса');
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Иконка для статуса
   */
  const getStatusIcon = () => {
    switch (currentStatus) {
      case OrderStatus.NEW:
      case OrderStatus.ACCEPTED:
        return <ClockIcon className="w-5 h-5" />;
      case OrderStatus.PREPARING:
        return <span className="text-xl">{statusMeta.icon}</span>;
      case OrderStatus.READY:
        return <CheckCircleIcon className="w-5 h-5" />;
      case OrderStatus.ASSIGNED:
      case OrderStatus.PICKED_UP:
      case OrderStatus.ON_THE_WAY:
        return <TruckIcon className="w-5 h-5" />;
      case OrderStatus.DELIVERED:
      case OrderStatus.COMPLETED:
        return <MapPinIcon className="w-5 h-5" />;
      default:
        return null;
    }
  };
  
  /**
   * Цвет для статуса
   */
  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200',
      cyan: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      red: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[color] || colors.blue;
  };
  
  /**
   * Текст кнопки для следующего статуса
   */
  const getButtonText = () => {
    if (!nextStatusMeta) return '';
    
    switch (nextStatus) {
      case OrderStatus.ACCEPTED:
        return '✅ Принять заказ';
      case OrderStatus.PREPARING:
        return '👨‍🍳 Начать готовку';
      case OrderStatus.READY:
        return '✨ Готов';
      case OrderStatus.PICKED_UP:
        return '📦 Забрал заказ';
      case OrderStatus.ON_THE_WAY:
        return '🛵 В пути';
      case OrderStatus.DELIVERED:
        return '🎉 Доставлено';
      case OrderStatus.COMPLETED:
        return '✅ Завершить';
      default:
        return `→ ${nextStatusMeta.label}`;
    }
  };
  
  return (
    <div className="flex items-center gap-3">
      {/* Текущий статус */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getColorClasses(statusMeta.color)}`}
      >
        {getStatusIcon()}
        <span className="font-medium text-sm">{statusMeta.label}</span>
      </motion.div>
      
      {/* Стрелка и след. статус */}
      {!isFinal && nextStatus && nextStatusMeta && (
        <>
          <span className="text-gray-400">→</span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStatusChange}
            disabled={loading}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
              transition-all duration-200
              ${loading 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm hover:shadow-md'
              }
            `}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Обновление...</span>
              </>
            ) : (
              <span>{getButtonText()}</span>
            )}
          </motion.button>
        </>
      )}
      
      {/* Финальный статус */}
      {isFinal && (
        <span className="text-xs text-gray-500">
          {currentStatus === OrderStatus.CANCELLED ? 'Отменён' : 'Завершено'}
        </span>
      )}
      
      {/* Бейдж доставки */}
      {isDelivery && (
        <div className="ml-auto">
          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full border border-purple-200">
            🚚 Доставка
          </span>
        </div>
      )}
    </div>
  );
};
