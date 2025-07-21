import React from 'react';
import { motion } from 'framer-motion';
import { ClockIcon, CheckCircleIcon, BellAlertIcon, CheckIcon } from '@heroicons/react/24/outline';

type OrderStatus = 'pending' | 'accepted' | 'ready' | 'completed';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  showText?: boolean;
}

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, showText = true }) => {
  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return {
          icon: ClockIcon,
          text: 'Ожидание',
          color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
          iconColor: 'text-yellow-500'
        };
      case 'accepted':
        return {
          icon: CheckCircleIcon,
          text: 'Принят',
          color: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
          iconColor: 'text-blue-500'
        };
      case 'ready':
        return {
          icon: BellAlertIcon,
          text: 'Готов',
          color: 'bg-green-500/20 text-green-500 border-green-500/30',
          iconColor: 'text-green-500'
        };
      case 'completed':
        return {
          icon: CheckIcon,
          text: 'Выдан',
          color: 'bg-gray-500/20 text-gray-500 border-gray-500/30',
          iconColor: 'text-gray-500'
        };
      default:
        return {
          icon: ClockIcon,
          text: 'Неизвестно',
          color: 'bg-zinc-700 text-zinc-300',
          iconColor: 'text-zinc-300'
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium ${config.color}`}
    >
      <Icon className={`w-4 h-4 ${config.iconColor}`} />
      {showText && <span>{config.text}</span>}
    </motion.div>
  );
};

export default OrderStatusBadge;
