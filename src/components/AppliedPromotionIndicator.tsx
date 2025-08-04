import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon, XMarkIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useHistory } from 'react-router-dom';
import { usePromotion } from '../contexts/PromotionContext';

interface AppliedPromotionIndicatorProps {
  className?: string;
  showNavigateButton?: boolean;
}

export const AppliedPromotionIndicator: React.FC<AppliedPromotionIndicatorProps> = ({ 
  className = '', 
  showNavigateButton = true 
}) => {
  const { appliedPromotion, removePromotion, getDiscountText } = usePromotion();
  const history = useHistory();

  if (!appliedPromotion) return null;

  const handleNavigateToMenu = () => {
    history.push('/menu');
  };

  const handleNavigateToOrder = () => {
    history.push('/order');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className={`bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm rounded-2xl p-4 border border-orange-500/30 ${className}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-white truncate">{appliedPromotion.promotion.title}</h3>
                <div className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0">
                  {getDiscountText(appliedPromotion.promotion)}
                </div>
              </div>
              <p className="text-xs text-orange-200 line-clamp-1">
                {appliedPromotion.promotion.description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-3">
            {showNavigateButton && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleNavigateToMenu}
                className="bg-orange-500/20 text-orange-300 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-orange-500/30 transition-colors flex items-center gap-1"
              >
                В меню
                <ArrowRightIcon className="w-3 h-3" />
              </motion.button>
            )}
            
            <button
              onClick={removePromotion}
              className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center hover:bg-orange-500/30 transition-colors flex-shrink-0"
            >
              <XMarkIcon className="w-4 h-4 text-orange-400" />
            </button>
          </div>
        </div>

        {/* Дополнительная информация */}
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-orange-300">
            Скидка: {appliedPromotion.discountAmount}₸
          </span>
          <span className="text-orange-300">
            Применена: {appliedPromotion.appliedAt.toLocaleTimeString()}
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
