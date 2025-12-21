/**
 * MealCard - Premium Meal Card Component
 *
 * Displays a meal slot with photo, macros, and log status.
 * Supports planned kcal, adjusted kcal, and logged entry.
 *
 * @module ui/nutrition/MealCard
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  CheckCircleIcon,
  CameraIcon,
  PencilIcon,
} from '@heroicons/react/24/solid';
import type { MealPlan } from '../../services/nutritionV2Service';

// ============================================================================
// Types
// ============================================================================

interface MealCardProps {
  meal: MealPlan;
  onAddMeal: (mealType: string) => void;
  onEditMeal?: (mealType: string) => void;
}

// ============================================================================
// Helpers
// ============================================================================

const triggerHaptic = (type: 'light' | 'medium' = 'light') => {
  if ('vibrate' in navigator) {
    navigator.vibrate(type === 'light' ? 10 : 25);
  }
};

const getMealIcon = (mealType: string): string => {
  switch (mealType) {
    case 'breakfast':
      return '🍳';
    case 'lunch':
      return '🥗';
    case 'dinner':
      return '🍽️';
    case 'snack':
      return '🥜';
    default:
      return '🍴';
  }
};

const getMealTimeHint = (mealType: string): string => {
  switch (mealType) {
    case 'breakfast':
      return '7:00 - 9:00';
    case 'lunch':
      return '12:00 - 14:00';
    case 'dinner':
      return '18:00 - 20:00';
    case 'snack':
      return 'Anytime';
    default:
      return '';
  }
};

// ============================================================================
// Logged Meal Card
// ============================================================================

interface LoggedMealCardProps {
  meal: MealPlan;
  onEdit?: () => void;
}

const LoggedMealCard: React.FC<LoggedMealCardProps> = ({ meal, onEdit }) => {
  const entry = meal.logEntry!;
  const macros = entry.macros;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="
        relative overflow-hidden
        rounded-2xl
        bg-emerald-500/10
        border border-emerald-500/30
        p-4
      "
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{getMealIcon(meal.mealType)}</span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-white">{meal.label}</h3>
              <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xs text-white/40">{getMealTimeHint(meal.mealType)}</p>
          </div>
        </div>

        {onEdit && (
          <motion.button
            onClick={onEdit}
            whileTap={{ scale: 0.92 }}
            className="
              w-8 h-8 rounded-full
              bg-white/5 border border-white/10
              flex items-center justify-center
              text-white/50 hover:text-white
              transition-colors
            "
          >
            <PencilIcon className="w-4 h-4" />
          </motion.button>
        )}
      </div>

      {/* Photo + Macros */}
      <div className="flex gap-4">
        {entry.photoUrl && (
          <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
            <img
              src={entry.photoUrl}
              alt={meal.label}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex-1 grid grid-cols-2 gap-2">
          <div className="text-center p-2 rounded-lg bg-white/5">
            <p className="text-lg font-semibold text-white tabular-nums">{macros.kcal}</p>
            <p className="text-xs text-white/40">kcal</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-white/5">
            <p className="text-lg font-semibold text-emerald-400 tabular-nums">{macros.protein}g</p>
            <p className="text-xs text-white/40">protein</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-white/5">
            <p className="text-lg font-semibold text-amber-400 tabular-nums">{macros.fat}g</p>
            <p className="text-xs text-white/40">fat</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-white/5">
            <p className="text-lg font-semibold text-purple-400 tabular-nums">{macros.carbs}g</p>
            <p className="text-xs text-white/40">carbs</p>
          </div>
        </div>
      </div>

      {/* Notes */}
      {entry.notes && (
        <p className="mt-3 text-sm text-white/50 truncate">{entry.notes}</p>
      )}
    </motion.div>
  );
};

// ============================================================================
// Pending Meal Card
// ============================================================================

interface PendingMealCardProps {
  meal: MealPlan;
  onAdd: () => void;
}

const PendingMealCard: React.FC<PendingMealCardProps> = ({ meal, onAdd }) => {
  const showAdjusted = meal.adjustedKcal !== meal.plannedKcal;

  return (
    <motion.button
      onClick={() => {
        triggerHaptic('light');
        onAdd();
      }}
      whileTap={{ scale: 0.98 }}
      className="
        w-full text-left
        relative overflow-hidden
        rounded-2xl
        bg-white/5
        border border-white/10
        p-4
        transition-all duration-200
        hover:bg-white/10
        hover:border-white/20
      "
    >
      {/* Grain texture */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{getMealIcon(meal.mealType)}</span>
          <div>
            <h3 className="font-medium text-white">{meal.label}</h3>
            <p className="text-xs text-white/40">{getMealTimeHint(meal.mealType)}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Target kcal */}
          <div className="text-right">
            <p className="text-lg font-semibold tabular-nums text-white">
              {meal.adjustedKcal}
              <span className="text-sm text-white/40 ml-1">kcal</span>
            </p>
            {showAdjusted && (
              <p className="text-xs text-white/30 line-through">{meal.plannedKcal} kcal</p>
            )}
          </div>

          {/* Add button */}
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <PlusIcon className="w-5 h-5 text-white/70" />
          </div>
        </div>
      </div>
    </motion.button>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const MealCard: React.FC<MealCardProps> = ({ meal, onAddMeal, onEditMeal }) => {
  if (meal.isLogged && meal.logEntry) {
    return (
      <LoggedMealCard
        meal={meal}
        onEdit={onEditMeal ? () => onEditMeal(meal.mealType) : undefined}
      />
    );
  }

  return <PendingMealCard meal={meal} onAdd={() => onAddMeal(meal.mealType)} />;
};

export default MealCard;
