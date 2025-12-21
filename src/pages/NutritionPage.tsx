/**
 * Nutrition Page - Trainer OS (Client)
 * 
 * Client does NOT calculate, client checks off.
 * - Today: Breakfast ✔/⏳, Lunch ✔/⏳, Dinner ✔/⏳
 * - Water: +1 glass counter
 * - Week: Swipe between days (minimal numbers)
 * 
 * Macros (KBJU) - visible to coach, optional for client.
 * 
 * @module pages/Nutrition
 */

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { CheckIcon, PlusIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../auth/AuthContextV2';
import {
  subscribeTodayCheckmarks,
  toggleMealCheckmark,
  addWaterGlass,
  getCurrentNutritionPlan,
  type NutritionCheckmark,
  type DayMeals,
  type DayOfWeek,
} from '../services/nutritionService';

// ============================================================================
// Types
// ============================================================================

type MealType = 'breakfast' | 'lunch' | 'dinner';

interface MealNames {
  breakfast: string;
  lunch: string;
  dinner: string;
}

const MEAL_NAMES: MealNames = {
  breakfast: 'Завтрак',
  lunch: 'Обед',
  dinner: 'Ужин',
};

const DAYS_RU: Record<DayOfWeek, string> = {
  monday: 'Пн',
  tuesday: 'Вт',
  wednesday: 'Ср',
  thursday: 'Чт',
  friday: 'Пт',
  saturday: 'Сб',
  sunday: 'Вс',
};

// ============================================================================
// Meal Check Item
// ============================================================================

interface MealCheckProps {
  meal: MealType;
  name: string;
  description?: string;
  checked: boolean;
  onToggle: () => void;
}

const MealCheck: React.FC<MealCheckProps> = ({
  meal,
  name,
  description,
  checked,
  onToggle,
}) => (
  <motion.button
    onClick={onToggle}
    whileTap={{ scale: 0.98 }}
    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
      checked ? 'bg-tr-success/10' : 'bg-tr-elevated'
    }`}
  >
    {/* Checkbox */}
    <div
      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
        checked
          ? 'bg-tr-success'
          : 'border-2 border-tr-border'
      }`}
    >
      {checked && <CheckIcon className="w-4 h-4 text-white" />}
    </div>

    {/* Meal info */}
    <div className="flex-1 text-left">
      <p className={`text-base font-medium ${checked ? 'text-tr-success' : 'text-tr-text'}`}>
        {name}
      </p>
      {description && (
        <p className="text-tr-text-muted text-sm mt-0.5 line-clamp-1">
          {description}
        </p>
      )}
    </div>
  </motion.button>
);

// ============================================================================
// Water Counter
// ============================================================================

interface WaterCounterProps {
  count: number;
  target?: number;
  onAdd: () => void;
}

const WaterCounter: React.FC<WaterCounterProps> = ({ 
  count, 
  target = 8, 
  onAdd 
}) => {
  const progress = Math.min(count / target, 1);
  
  return (
    <div className="bg-tr-elevated rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-tr-text-muted text-xs uppercase tracking-wider mb-1">
            Вода
          </p>
          <p className="text-2xl font-bold text-tr-text">
            {count} <span className="text-tr-text-muted text-base font-normal">/ {target}</span>
          </p>
        </div>
        
        <motion.button
          onClick={onAdd}
          whileTap={{ scale: 0.95 }}
          disabled={count >= target}
          className="w-14 h-14 rounded-full flex items-center justify-center disabled:opacity-40"
          style={{
            background: count >= target 
              ? 'var(--tr-success)' 
              : 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
          }}
        >
          {count >= target ? (
            <CheckIcon className="w-6 h-6 text-white" />
          ) : (
            <PlusIcon className="w-6 h-6 text-white" />
          )}
        </motion.button>
      </div>
      
      {/* Progress bar */}
      <div className="h-2 bg-tr-border-subtle rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ type: 'spring', stiffness: 100 }}
          className="h-full rounded-full"
          style={{
            background: count >= target
              ? 'var(--tr-success)'
              : 'linear-gradient(90deg, #3B82F6 0%, #60A5FA 100%)',
          }}
        />
      </div>
      
      {/* Glasses indicator */}
      <div className="flex justify-between mt-3">
        {Array.from({ length: target }, (_, i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              i < count ? 'bg-blue-400' : 'bg-tr-border-subtle'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// Week Day Selector
// ============================================================================

interface WeekSelectorProps {
  selectedDay: DayOfWeek;
  onSelect: (day: DayOfWeek) => void;
  today: DayOfWeek;
}

const WeekSelector: React.FC<WeekSelectorProps> = ({
  selectedDay,
  onSelect,
  today,
}) => {
  const days: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  return (
    <div className="flex justify-between px-2">
      {days.map((day) => {
        const isSelected = day === selectedDay;
        const isToday = day === today;
        
        return (
          <button
            key={day}
            onClick={() => onSelect(day)}
            className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all ${
              isSelected 
                ? 'bg-tr-accent text-white' 
                : isToday
                  ? 'text-tr-accent'
                  : 'text-tr-text-muted'
            }`}
          >
            <span className="text-xs font-medium">
              {DAYS_RU[day]}
            </span>
          </button>
        );
      })}
    </div>
  );
};

// ============================================================================
// Loading Skeleton
// ============================================================================

const LoadingSkeleton: React.FC = () => (
  <div className="px-6 pt-8 animate-pulse">
    <div className="h-6 w-32 bg-tr-elevated rounded mb-8" />
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-20 bg-tr-elevated rounded-2xl" />
      ))}
    </div>
    <div className="h-32 bg-tr-elevated rounded-2xl mt-6" />
  </div>
);

// ============================================================================
// Main Component
// ============================================================================

const NutritionPage: React.FC = () => {
  const { user } = useAuth();
  
  const [checkmarks, setCheckmarks] = useState<NutritionCheckmark | null>(null);
  const [plan, setPlan] = useState<Record<DayOfWeek, DayMeals> | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(() => {
    const day = new Date().getDay();
    const dayMap: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return dayMap[day];
  });
  
  const today: DayOfWeek = (() => {
    const day = new Date().getDay();
    const dayMap: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return dayMap[day];
  })();

  // Load plan
  useEffect(() => {
    if (!user?.id) return;
    
    const loadPlan = async () => {
      const nutritionPlan = await getCurrentNutritionPlan(user.id);
      if (nutritionPlan) {
        setPlan(nutritionPlan.days);
      }
    };
    
    loadPlan();
  }, [user?.id]);

  // Subscribe to checkmarks
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = subscribeTodayCheckmarks(user.id, (data) => {
      setCheckmarks(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.id]);

  // Toggle meal
  const handleToggleMeal = useCallback(async (meal: MealType) => {
    if (!user?.id || !checkmarks) return;
    
    const newValue = !checkmarks[meal];
    
    // Optimistic update
    setCheckmarks(prev => prev ? { ...prev, [meal]: newValue } : null);
    
    try {
      await toggleMealCheckmark(user.id, meal, newValue);
    } catch (error) {
      // Revert on error
      setCheckmarks(prev => prev ? { ...prev, [meal]: !newValue } : null);
      console.error('Failed to toggle meal:', error);
    }
  }, [user?.id, checkmarks]);

  // Add water
  const handleAddWater = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const newCount = await addWaterGlass(user.id);
      setCheckmarks(prev => prev ? { ...prev, waterGlasses: newCount } : null);
    } catch (error) {
      console.error('Failed to add water:', error);
    }
  }, [user?.id]);

  // Get today's meals
  const todayMeals = plan?.[selectedDay];
  const isViewingToday = selectedDay === today;

  if (loading) {
    return (
      <div className="min-h-screen bg-tr-base safe-area-inset-top">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tr-base safe-area-inset-top pb-24">
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-tr-text">
          Питание
        </h1>
      </div>

      {/* Week selector */}
      <div className="px-4 pb-6">
        <WeekSelector
          selectedDay={selectedDay}
          onSelect={setSelectedDay}
          today={today}
        />
      </div>

      {/* Day content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedDay}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="px-6"
        >
          {/* Meals */}
          <div className="space-y-3">
            {(['breakfast', 'lunch', 'dinner'] as MealType[]).map((meal) => (
              <MealCheck
                key={meal}
                meal={meal}
                name={MEAL_NAMES[meal]}
                description={todayMeals?.[meal]?.name}
                checked={isViewingToday ? (checkmarks?.[meal] ?? false) : false}
                onToggle={() => isViewingToday && handleToggleMeal(meal)}
              />
            ))}
          </div>

          {/* Water - only show for today */}
          {isViewingToday && (
            <div className="mt-6">
              <WaterCounter
                count={checkmarks?.waterGlasses ?? 0}
                target={8}
                onAdd={handleAddWater}
              />
            </div>
          )}

          {/* Not today hint */}
          {!isViewingToday && (
            <div className="mt-8 text-center">
              <p className="text-tr-text-muted text-sm">
                Отметки доступны только для сегодня
              </p>
            </div>
          )}

          {/* No plan hint */}
          {!plan && (
            <div className="mt-8 text-center">
              <p className="text-tr-text-muted text-sm">
                План питания пока не назначен
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default NutritionPage;
