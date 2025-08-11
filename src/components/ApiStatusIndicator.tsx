// 🎯 Компонент для отображения статуса API подключения
import React from 'react';
import { motion } from 'framer-motion';
import { 
  CloudIcon, 
  ComputerDesktopIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import { useEnvironment } from '../services/apiConfig';

export const ApiStatusIndicator: React.FC = () => {
  const { isDev, isProd, isLocal, usingFirebase, apiBaseUrl } = useEnvironment();

  const getStatusInfo = () => {
    if (usingFirebase) {
      return {
        icon: CloudIcon,
        status: 'Firebase Functions',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      };
    } else {
      return {
        icon: ComputerDesktopIcon,
        status: 'Local Development',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      };
    }
  };

  const statusInfo = getStatusInfo();
  const Icon = statusInfo.icon;

  if (isProd) return null; // Не показываем в продакшене

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`fixed top-4 right-4 z-50 p-3 rounded-lg border ${statusInfo.bgColor} ${statusInfo.borderColor} shadow-lg`}
    >
      {/* <div className="flex items-center space-x-2">
        <Icon className={`w-5 h-5 ${statusInfo.color}`} />
        <div>
          <div className={`text-sm font-medium ${statusInfo.color}`}>
            {statusInfo.status}
          </div>
          <div className="text-xs text-gray-600">
            {apiBaseUrl}
          </div>
        </div>
      </div> */}
    </motion.div>
  );
};
