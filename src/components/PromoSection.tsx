import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TagIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { usePromo } from '../contexts/PromoContext';
import { Promo } from '../../admin/types/promo';

/**
 * Компонент для отображения активных акций на главной странице
 */
const PromoSection: React.FC = () => {
  const { activePromos, loading } = usePromo();
  const [visiblePromos, setVisiblePromos] = useState<Promo[]>([]);

  useEffect(() => {
    // Показываем только акции, которые должны отображаться на главной
    setVisiblePromos(activePromos.filter(p => p.showOnHome));
  }, [activePromos]);

  if (loading || visiblePromos.length === 0) {
    return null;
  }

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <TagIcon className="w-6 h-6 text-yellow-500" />
        <h2 className="text-2xl font-extrabold text-slate-900">Активные акции</h2>
      </div>

      <div className="space-y-4">
        {visiblePromos.map((promo, index) => (
          <motion.div
            key={promo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-5 border-2 border-yellow-400 shadow-lg"
          >
            {/* Бейдж */}
            {promo.badge && (
              <div className="inline-block bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-2">
                {promo.badge}
              </div>
            )}

            {/* Заголовок */}
            <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-yellow-600" />
              {promo.title}
            </h3>

            {/* Описание */}
            <p className="text-gray-700 mb-3">{promo.description}</p>

            {/* Краткое описание условий */}
            <div className="flex flex-wrap gap-2 mb-3">
              {promo.conditions.map((condition, idx) => {
                let label = '';
                if (condition.type === 'time_range' && condition.timeRange) {
                  label = `⏰ ${condition.timeRange.start} - ${condition.timeRange.end}`;
                } else if (condition.type === 'day_of_week' && condition.daysOfWeek) {
                  const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
                  label = `📅 ${condition.daysOfWeek.map(d => days[d]).join(', ')}`;
                } else if (condition.type === 'min_cart_value') {
                  label = `💰 От ${condition.minValue}₸`;
                }

                return label ? (
                  <span
                    key={idx}
                    className="text-xs bg-white/70 text-gray-700 px-3 py-1 rounded-full font-medium"
                  >
                    {label}
                  </span>
                ) : null;
              })}
            </div>

            {/* Награды */}
            <div className="flex flex-wrap gap-2">
              {promo.rewards.map((reward, idx) => {
                let label = '';
                if (reward.type === 'percentage_discount') {
                  label = `🎁 Скидка ${reward.value}%`;
                } else if (reward.type === 'fixed_discount') {
                  label = `🎁 Скидка ${reward.value}₸`;
                } else if (reward.type === 'buy_x_get_y' && reward.buyXGetY) {
                  label = `🎁 ${reward.buyXGetY.buyQuantity} + ${reward.buyXGetY.getQuantity} бесплатно`;
                } else if (reward.type === 'bonus_points') {
                  label = `⭐ +${reward.value} баллов`;
                }

                return label ? (
                  <span
                    key={idx}
                    className="text-xs bg-yellow-500 text-white px-3 py-1 rounded-full font-bold"
                  >
                    {label}
                  </span>
                ) : null;
              })}
            </div>

            {/* Изображение если есть */}
            {promo.imageUrl && (
              <div className="mt-4">
                <img
                  src={promo.imageUrl}
                  alt={promo.title}
                  className="w-full h-32 object-cover rounded-xl"
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default PromoSection;
